import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// UI-only mock grading page. Questions are placeholders until DB is ready.
export default function GradeQuiz() {
  const navigate = useNavigate();
  // Until DB is wired, keep values empty but show header labels
  const studentName = "";
  const submittedDate = "";
  // Quiz number and name will be loaded from Firebase later
  const quizNumber = "";
  const quizName = "";
  // Mock one question shape to match the screenshot layout; duplicate to simulate multiple
  const questions = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      title: `Q${i + 1}.`,
      prompt: "", // blank until questions exist in DB
      studentAnswer: "", // blank placeholder
      // maxScore intentionally omitted until available from DB
    })),
  []);

  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState({});

  const q = questions[index];

  const setScore = (val) => {
    // keep only non-negative numeric; do not clamp to a max (unknown until DB)
    const n = Math.max(0, Number(val) || 0);
    setScores((s) => ({ ...s, [q.id]: n }));
  };

  const next = () => {
    if (index < questions.length - 1) setIndex(index + 1);
    else navigate("/grade/feedback", { state: { scores } });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
  <h1 style={{ textAlign: "center", margin: "8px 0 16px" }}>Quiz {quizNumber} : {quizName}</h1>

      <div
        style={{
          background: "#e8def8",
          borderRadius: 10,
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div><b>Student Name:</b> {studentName}</div>
        <div><b>Submitted:</b> {submittedDate}</div>
      </div>

      <section style={{ marginTop: 24 }}>
        <h3 style={{ margin: "8px 0 16px" }}>Questions</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <div style={{ fontWeight: 600 }}>{q.title}</div>
          <div style={{ color: "#333" }}>{q.prompt}</div>
        </div>

        <div
          style={{
            marginTop: 16,
            background: "#ede7f6",
            border: "1px solid #c9c1dc",
            borderRadius: 10,
            padding: 16,
            minHeight: 140,
          }}
        >
          {q.studentAnswer}
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Score:</span>
            <input
              value={scores[q.id] ?? ""}
              onChange={(e) => setScore(e.target.value)}
              style={{ width: 60, padding: 6, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <span>/</span>
          </div>

          <div style={{ color: "#444" }}>Total: {Object.values(scores).reduce((a, b) => a + (Number(b) || 0), 0)} /</div>
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button
          style={pillButton}
          onClick={() => navigate(-1)}
        >
          Save and Exit
        </button>
        <button style={pillButton} onClick={next}>Next</button>
      </div>
    </div>
  );
}

const pillButton = {
  padding: "10px 18px",
  background: "#e8def8",
  border: "1px solid #c9c1dc",
  borderRadius: 20,
  cursor: "pointer",
};
