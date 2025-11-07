import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { listPublishedQuizzes } from "../api";

export default function QuestionViewer() {
  const { id: quizId } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const initialQuiz = location?.state?.quiz || null;

  const [quiz, setQuiz] = useState(initialQuiz);
  const [loading, setLoading] = useState(!initialQuiz);
  const [err, setErr] = useState(null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remaining, setRemaining] = useState(undefined);
  const startAt = useRef(null);

  useEffect(() => {
    if (quiz || !quizId) return;
    (async () => {
      try {
        const data = await listPublishedQuizzes();
        const found = (Array.isArray(data) ? data : []).find((q) => q.id === quizId) || null;
        if (!found) throw new Error("Quiz not found or not published");
        setQuiz(found);
      } catch (e) {
        setErr(e?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    })();
  }, [quiz, quizId]);

  useEffect(() => {
    if (!quiz) return;
    const secs = (quiz.timeLimit || 0) * 60;
    setRemaining(Number.isFinite(secs) && secs > 0 ? secs : undefined);
    startAt.current = Date.now();
  }, [quiz]);

  useEffect(() => {
    if (typeof remaining !== "number") return;
    if (remaining <= 0) {
      doSubmit(true);
      return;
    }
    const t = setTimeout(() => setRemaining((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  function setAnswer(question, value) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }
  function next() { if (quiz && idx < quiz.questions.length - 1) setIdx((i) => i + 1); }
  function prev() { if (idx > 0) setIdx((i) => i - 1); }

  function fmtSeconds(s) {
    if (typeof s !== "number") return "∞";
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function doSubmit(auto = false) {
    const elapsed = startAt.current ? Math.round((Date.now() - startAt.current) / 1000) : 0;
    nav(`/result/${quizId}`, {
      state: {
        title: quiz?.title,
        total: quiz?.questions?.length || 0,
        answered: Object.keys(answers).length,
        elapsedSeconds: elapsed,
        autoSubmitted: auto,
      },
    });
  }

  if (loading) return <div className="p-6">Loading quiz…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!quiz) return <div className="p-6">Quiz not found.</div>;

  const total = quiz.questions.length;
  const q = quiz.questions[idx] || {};
  const progress = total ? Math.round(((idx + 1) / total) * 100) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">{quiz.title}</div>
          <div className="text-sm opacity-70">Question {idx + 1} / {total}</div>
        </div>
        <div className="px-3 py-1 rounded-full border text-sm">⏱ {fmtSeconds(remaining)}</div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-black" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-2xl border shadow p-4">
        <div className="font-medium mb-3">{q.questionText}</div>

        {q.type === "MCQ" ? (
          <div className="space-y-2">
            {(q.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={(answers[q.id] || "") === opt}
                  onChange={() => setAnswer(q, opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="w-full rounded border p-2"
            rows={4}
            placeholder="Type your answer…"
            value={answers[q.id] || ""}
            onChange={(e) => setAnswer(q, e.target.value)}
          />
        )}
      </div>

      <div className="flex justify-between">
        <button className="px-4 py-2 rounded-xl border disabled:opacity-50" onClick={prev} disabled={idx === 0}>
          ← Previous
        </button>
        {idx < total - 1 ? (
          <button className="px-4 py-2 rounded-xl border" onClick={next}>
            Next →
          </button>
        ) : (
          <button className="px-4 py-2 rounded-xl border bg-black text-white" onClick={() => doSubmit(false)}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
