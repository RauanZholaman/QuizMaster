import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ResultPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const s = location?.state || {};

  function fmt(n) {
    if (n === undefined || n === null) return "-";
    const m = Math.floor(n / 60).toString().padStart(2, "0");
    const sec = Math.floor(n % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">Results</h1>
      <div className="rounded-2xl border p-4 space-y-1">
        <div className="font-medium">{s.title || `Quiz ${id}`}</div>
        <div>Total questions: {s.total ?? "-"}</div>
        <div>Answered: {s.answered ?? "-"}</div>
        <div>Time taken: {fmt(s.elapsedSeconds)}</div>
        {s.autoSubmitted ? <div className="text-red-600">Auto-submitted (time up)</div> : null}
      </div>
      <button className="px-4 py-2 rounded-xl border" onClick={() => nav("/quizzes")}>
        Back to Quizzes
      </button>
    </div>
  );
}
