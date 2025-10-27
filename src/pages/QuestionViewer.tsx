import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type Question =
  | { id: number; text: string; options: string[]; code?: string; short?: false }
  | { id: number; text: string; short: true; code?: string };

export default function QuestionViewer() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation() as {
    state?: { questionCount?: number; timeLimitSeconds?: number };
  };

  // demo 10 questions
  const questions: Question[] = useMemo(
    () => [
      { id: 1, text: "What will be the output of the following Python Code?", code: "x = 3\ny = 2\nprint(x + y)", options: ["7", "5", "3", "1"] },
      { id: 2, text: "Fill in the blank to print 'Hello World' in Python.", short: true },
      { id: 3, text: "Which keyword is used to create a function in Python?", options: ["def", "func", "lambda", "function"] },
      { id: 4, text: "2 + 2 = ?", options: ["3", "4", "5", "6"] },
      { id: 5, text: "Capital of Japan?", options: ["Seoul", "Tokyo", "Kyoto", "Osaka"] },
      { id: 6, text: "Earth is a ____.", options: ["star", "planet", "comet", "galaxy"] },
      { id: 7, text: "Function to print in Python is ____(\"Hello World\")", short: true },
      { id: 8, text: "HTTP status 200 indicates?", options: ["Not Found", "Server Error", "OK", "Redirect"] },
      { id: 9, text: "JS array length of []?", options: ["0", "1", "undefined", "NaN"] },
      { id: 10, text: "UI stands for?", options: ["User Internet", "Universal Input", "User Interface", "Unified Instance"] },
    ],
    []
  );

  // from PreQuiz (fallbacks if refreshed)
  const questionCount = location.state?.questionCount ?? questions.length;
  const timeLimitSeconds = location.state?.timeLimitSeconds ?? 15 * 60;

  // absolute deadline (survives refresh)
  const [expiresAt] = useState<number>(() => {
    const key = `quiz:${id}:expiresAt`;
    const saved = sessionStorage.getItem(key);
    if (saved) return parseInt(saved, 10);
    const t = Date.now() + timeLimitSeconds * 1000;
    sessionStorage.setItem(key, String(t));
    return t;
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const attempted = useMemo(
    () => questions.map((q) => answers[q.id] !== undefined && answers[q.id] !== ""),
    [answers, questions]
  );

  // countdown
  const [msLeft, setMsLeft] = useState(() => Math.max(0, expiresAt - Date.now()));
  useEffect(() => {
    const i = setInterval(() => setMsLeft(Math.max(0, expiresAt - Date.now())), 250);
    return () => clearInterval(i);
  }, [expiresAt]);
  useEffect(() => { if (msLeft === 0) handleSubmit(true); }, [msLeft]);

  function handleAnswer(val: string) {
    const q = questions[index];
    setAnswers((a) => ({ ...a, [q.id]: val }));
  }

  function handleSubmit(timedOut = false) {
    sessionStorage.removeItem(`quiz:${id}:expiresAt`);
    nav(`/feedback/${id}` + (timedOut ? "?timeout=1" : ""));
  }

  const q = questions[index];
  const { mm, ss } = fmt(msLeft);

  return (
    <div className="min-h-screen bg-white">
      {/* header + timer */}
      <div className="flex items-center justify-between px-6 pt-6">
        <h1 className="text-2xl font-bold">{`Quiz ${id}`}</h1>
        <div className="text-sm text-gray-700">Time Left: {mm}:{ss}</div>
      </div>

      <div className="px-6 mt-4 text-sm font-medium">Question {index + 1}</div>

      {/* question panel */}
      <div className="mx-6 mt-3 bg-white rounded-xl border shadow p-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <p className="text-center font-semibold mb-3">{q.text}</p>
          {q.code && <pre className="bg-gray-50 border rounded p-3 mb-3 text-sm whitespace-pre-wrap">{q.code}</pre>}
        </div>

        {/* grid with buttons under choices */}
        <div className="mt-6 grid grid-cols-12 gap-8">
          {/* Left: choices + nav */}
          <div className="col-span-5">
            <div className="text-sm mb-2">Choice of answers:</div>
            <div className="bg-[#f1e6f1] rounded p-4">
              {!("short" in q && q.short) ? (
                <ul className="space-y-3">
                  {("options" in q ? q.options : []).map((opt, i) => (
                    <li key={i}>
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswer(opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <input
                  className="border rounded px-3 py-2 w-56"
                  placeholder="Enter your answer"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                />
              )}
            </div>

            {/* buttons directly under choices */}
            <div className="flex items-center gap-6 justify-center mt-6">
              <button
                className="px-6 py-2 rounded-full border bg-[#e6d9f1] hover:bg-[#ddcff0] disabled:opacity-40"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                Previous
              </button>

              {index < questionCount - 1 ? (
                <button
                  className="px-6 py-2 rounded-full border bg-[#e6d9f1] hover:bg-[#ddcff0]"
                  onClick={() => setIndex((i) => Math.min(questionCount - 1, i + 1))}
                >
                  Next
                </button>
              ) : (
                <button
                  className="px-6 py-2 rounded-full border bg-pink-200 hover:bg-pink-300"
                  onClick={() => handleSubmit(false)}
                >
                  Submit
                </button>
              )}
            </div>
          </div>

          {/* Right placeholder (empty for now) */}
          <div className="col-span-7" />
        </div>
      </div>

      {/* ===== Progress area (two columns, no center label) ===== */}
      <div className="mt-8 px-6">
        {/* Top row: label on left, segmented legend on right */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs italic text-gray-600">Questions Progress</div>

          <div className="flex rounded-full overflow-hidden border">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-200">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
              <span className="text-sm">Attempted</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="text-sm">Unattempted</span>
            </div>
          </div>
        </div>

        {/* Two columns (Q1–Q5 left, Q6–Q10 right) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left column: Q1–Q5 */}
          <div className="space-y-2">
            {questions.slice(0, 5).map((qq, i) => {
              const idx = i;
              const isAttempted = attempted[idx];
              const isCurrent = idx === index;
              return (
                <div
                  key={qq.id}
                  className={`flex items-center gap-2 ${isAttempted ? "text-green-700" : "text-gray-700"}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isAttempted ? "bg-green-600" : "bg-gray-400"
                    }`}
                  />
                  <button
                    className={`${isCurrent ? "font-semibold underline" : ""}`}
                    onClick={() => setIndex(idx)}
                  >
                    Question {idx + 1}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right column: Q6–Q10 */}
          <div className="space-y-2">
            {questions.slice(5).map((qq, j) => {
              const idx = j + 5;
              const isAttempted = attempted[idx];
              const isCurrent = idx === index;
              return (
                <div
                  key={qq.id}
                  className={`flex items-center gap-2 ${isAttempted ? "text-green-700" : "text-gray-700"}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isAttempted ? "bg-green-600" : "bg-gray-400"
                    }`}
                  />
                  <button
                    className={`${isCurrent ? "font-semibold underline" : ""}`}
                    onClick={() => setIndex(idx)}
                  >
                    Question {idx + 1}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* ===== end progress area ===== */}
    </div>
  );
}

function fmt(ms: number) {
  const total = Math.ceil(ms / 1000);
  const mm = Math.floor(total / 60).toString().padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  return { mm, ss };
}
