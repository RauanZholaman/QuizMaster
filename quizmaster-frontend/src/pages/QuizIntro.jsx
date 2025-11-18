// src/pages/QuizIntro.jsx
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function QuizIntro() {
  const { id: subjectId } = useParams(); // e.g. "maths"
  const nav = useNavigate();
  const location = useLocation();

  // Get quiz object directly from navigation state
  const quiz = location.state?.quiz || null;
  const subjectFromState = location.state?.subject || "";
  const category = location.state?.category || "";

  // nice display subject
  const niceSubject =
    subjectFromState ||
    (subjectId === "maths"
      ? "Maths"
      : subjectId.charAt(0).toUpperCase() + subjectId.slice(1));

  const [err] = useState(null);

  // If no quiz was passed, show error
  if (!quiz) {
    return <div className="p-6 text-red-600">Error: Quiz data not found. Please select a quiz from the quiz selection page.</div>;
  }

  const questionCount = quiz?.questions?.length ?? 0;
  const timeLimitMins = quiz?.timeLimit ?? 10;
  const titleText = quiz.title || category || niceSubject || "Quiz";

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* title */}
      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "24px" }}>
        {titleText}
      </h1>

      {/* instructions header */}
      <div
        style={{
          background: "#f2d7f3",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "24px",
        }}
      >
        Instructions
      </div>

      {/* info box */}
      <div
        style={{
          background: "#f2d7f3",
          borderRadius: "8px",
          padding: "32px 40px",
          fontSize: "18px",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          Questions :{" "}
          <span style={{ fontWeight: "700" }}>{questionCount} qus</span>
        </div>
        <div>
          Time limit :{" "}
          <span style={{ fontWeight: "700" }}>{timeLimitMins} mins</span>
        </div>
      </div>

      {/* note */}
      <p style={{ marginBottom: "32px", fontSize: "14px" }}>
        Note: The quiz auto-submits after the time limit, even if all questions
        aren’t done.
      </p>

      {/* start button */}
      <button
        onClick={() =>
          nav(`/quiz/${subjectId}`, {
            state: {
              quiz,
              subject: niceSubject,
              category,
            },
          })
        }
        style={{
          padding: "12px 32px",
          borderRadius: "999px",
          border: "none",
          background: "#f9a7c1",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Start Quiz
      </button>
    </div>
  );
}
