// src/pages/QuizIntro.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function QuizIntro() {
  const { id: subjectId } = useParams(); // e.g. "maths"
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch user's attempt count for this quiz
  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user || !quiz?.id) {
        setLoading(false);
        return;
      }

      try {
        const attemptsRef = collection(db, "quizAttempts");
        const q = query(
          attemptsRef,
          where("quizId", "==", quiz.id),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        setAttemptsUsed(snapshot.size);
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user, quiz]);

  // If no quiz was passed, show error
  if (!quiz) {
    return <div className="p-6 text-red-600">Error: Quiz data not found. Please select a quiz from the quiz selection page.</div>;
  }

  const questionCount = quiz?.questions?.length ?? 0;
  const timeLimitMins = quiz?.timeLimit ?? 10;
  const allowedAttempts = quiz?.allowedAttempts ?? 999; // Default to unlimited if not set
  const remainingAttempts = allowedAttempts - attemptsUsed;
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
        <div>
          Attempts :{" "}
          <span style={{ fontWeight: "700" }}>
            {loading ? "..." : `${remainingAttempts}/${allowedAttempts}`}
          </span>
        </div>
      </div>

      {/* Attempts warning/error */}
      {!loading && remainingAttempts <= 0 && (
        <div
          style={{
            background: "#fee2e2",
            border: "2px solid #ef4444",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            color: "#991b1b",
            fontWeight: "600",
          }}
        >
          You have used all {allowedAttempts} attempts for this quiz. No more attempts allowed.
        </div>
      )}
      {!loading && remainingAttempts > 0 && remainingAttempts <= 2 && (
        <div
          style={{
            background: "#fef3c7",
            border: "2px solid #f59e0b",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            color: "#92400e",
            fontWeight: "600",
          }}
        >
          Warning: You have only {remainingAttempts} attempt{remainingAttempts > 1 ? "s" : ""} remaining!
        </div>
      )}

      {/* note */}
      <p style={{ marginBottom: "32px", fontSize: "14px" }}>
        Note: The quiz auto-submits after the time limit, even if all questions
        aren’t done.
      </p>

      {/* start button */}
      <button
        onClick={() => {
          if (remainingAttempts <= 0) {
            alert("You have no attempts remaining for this quiz.");
            return;
          }
          nav(`/quiz/${subjectId}`, {
            state: {
              quiz,
              subject: niceSubject,
              category,
            },
          });
        }}
        disabled={loading || remainingAttempts <= 0}
        style={{
          padding: "12px 32px",
          borderRadius: "999px",
          border: "none",
          background: loading || remainingAttempts <= 0 ? "#d1d5db" : "#f9a7c1",
          fontSize: "16px",
          fontWeight: 600,
          cursor: loading || remainingAttempts <= 0 ? "not-allowed" : "pointer",
          opacity: loading || remainingAttempts <= 0 ? 0.6 : 1,
        }}
      >
        {loading ? "Loading..." : remainingAttempts <= 0 ? "No Attempts Left" : "Start Quiz"}
      </button>
    </div>
  );
}
