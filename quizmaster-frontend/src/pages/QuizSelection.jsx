import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublishedQuizzes } from "../api";

export default function QuizSelection() {
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await listPublishedQuizzes();
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading quizzes…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!quizzes.length) return <div className="p-6">No published quizzes yet.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Choose a Quiz</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q) => (
          <button
            key={q.id}
            onClick={() => nav(`/quiz/${q.id}`, { state: { quiz: q } })}
            className="text-left rounded-2xl border shadow p-4 hover:shadow-md transition"
          >
            <div className="text-lg font-medium">{q.title}</div>
            {q.description ? (
              <div className="text-sm opacity-70 mt-1 line-clamp-2">{q.description}</div>
            ) : null}
            <div className="mt-3 flex items-center gap-3 text-sm opacity-80">
              <span>⏱ {q.timeLimit} min</span>
              <span>•</span>
              <span>{Array.isArray(q.questions) ? q.questions.length : 0} Qs</span>
              {q.category ? (
                <>
                  <span>•</span>
                  <span>{q.category}</span>
                </>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
