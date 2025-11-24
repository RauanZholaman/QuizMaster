// src/pages/ResultPage.jsx
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

  const quizTitle = s.title || `Quiz ${id}`;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        background: "#fdf2ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "28px",
          }}
        >
          {quizTitle}
        </h1>

        {/* Main card */}
        <div
          style={{
            background: "#f3d9f5",
            borderRadius: "24px",
            padding: "40px 32px",
            marginBottom: "32px",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
          }}
        >
          <p
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            You have submitted{s.autoSubmitted ? " (time up)" : ""}!
          </p>

          <p
            style={{
              fontSize: "16px",
              marginBottom: "12px",
            }}
          >
            You answered{" "}
            <span style={{ fontWeight: 600 }}>{s.answered ?? "-"}</span> of{" "}
            <span style={{ fontWeight: 600 }}>{s.total ?? "-"}</span> questions
            in{" "}
            <span style={{ fontWeight: 600 }}>{fmt(s.elapsedSeconds)}</span>.
          </p>

          {s.autoSubmitted && (
            <p
              style={{
                fontSize: "14px",
                color: "#b91c1c",
                marginBottom: "8px",
              }}
            >
              Your quiz was auto-submitted because the timer ran out.
            </p>
          )}

          <p style={{ fontSize: "16px" }}>
            Click{" "}
            <span
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={(e) => {
                e.preventDefault();
                // 🔗 Go to the student's results page
                nav("/my-results");
              }}
            >
              here
            </span>{" "}
            to view your grading &amp; feedback.
          </p>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => nav("/")}
            style={{
              padding: "12px 32px",
              borderRadius: "999px",
              border: "none",
              background: "#fec7f0",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            Back to QuizMaster
          </button>

          <button
            type="button"
            onClick={() => nav("/quizzes")}
            style={{
              padding: "12px 32px",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
            }}
          >
            Take New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
