// src/pages/QuestionViewer.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X } from "lucide-react";

export default function QuestionViewer() {
  const { id: quizId } = useParams(); // e.g. "maths"
  const nav = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  // quiz object comes from QuizIntro via nav state
  const initialQuiz = location?.state?.quiz || null;

  const [quiz] = useState(initialQuiz);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remaining, setRemaining] = useState(undefined);
  const startAt = useRef(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----- timer -----
  useEffect(() => {
    if (!quiz) return;
    const secs = (quiz.timeLimit || 0) * 60;
    setRemaining(Number.isFinite(secs) && secs > 0 ? secs : undefined);
    startAt.current = Date.now();
  }, [quiz]);

  // Prevent tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Prevent browser back button
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      setShowExitModal(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleConfirmExit = () => {
    nav('/', { replace: true });
  };

  useEffect(() => {
    if (typeof remaining !== "number") return;
    if (remaining <= 0) {
      doSubmit(true);
      return;
    }
    const t = setTimeout(() => setRemaining((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  // ----- helpers -----
  function setAnswer(question, value) {
    // allow id === 0, only block null / undefined
    if (!question || question.id == null) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function next() {
    if (quiz && idx < (quiz.questions?.length || 0) - 1) {
      setIdx((i) => i + 1);
    }
  }

  function prev() {
    if (idx > 0) setIdx((i) => i - 1);
  }

  function goToQuestion(i) {
    if (!quiz) return;
    if (i >= 0 && i < quiz.questions.length) {
      setIdx(i);
    }
  }

  function fmtSeconds(s) {
    if (typeof s !== "number") return "∞";
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  }

  async function doSubmit(auto = false) {
    // Prevent duplicate submissions
    if (isSubmitting) {
      if (!auto) {
        alert("Submission in progress... Please wait.");
      }
      return;
    }

    setIsSubmitting(true);

    const elapsed = startAt.current
      ? Math.round((Date.now() - startAt.current) / 1000)
      : 0;

    const answeredCount = Object.values(answers).filter((v) => {
      if (v == null) return false;
      if (typeof v === "string") return v.trim() !== "";
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;

    // Save submission to Firestore
    try {
      if (user && quiz?.id) {
        console.log("Saving submission for quiz:", quiz.id);
        
        // Save submission
        await addDoc(collection(db, "submissions"), {
          quizId: quiz.id,
          studentId: user.uid,
          studentName: profile
            ? `${profile.firstName} ${profile.lastName}`
            : user.displayName || user.email,
          studentEmail: user.email,
          answers: answers,
          submittedAt: serverTimestamp(),
          graded: false,
          score: null,
          timeTaken: elapsed,
          autoSubmitted: auto,
        });
        console.log("Submission saved successfully");

        // Record attempt in quizAttempts collection
        await addDoc(collection(db, "quizAttempts"), {
          quizId: quiz.id,
          userId: user.uid,
          attemptedAt: serverTimestamp(),
          timeTaken: elapsed,
        });
        console.log("Attempt recorded successfully");
      } else {
        console.warn("Cannot save submission: User or Quiz ID missing", {
          user,
          quizId: quiz?.id,
        });
      }
    } catch (error) {
      console.error("Error saving submission:", error);
      setIsSubmitting(false);
      alert("Failed to submit quiz. Please try again.");
      return;
    }

    // Navigate to results page
    nav(`/result/${quiz?.id || quizId}`, {
      state: {
        title: quiz?.title,
        total: quiz?.questions?.length || 0,
        answered: answeredCount,
        elapsedSeconds: elapsed,
        autoSubmitted: auto,
      },
    });
  }

  // ----- guards -----
  if (!quiz) {
    return (
      <div style={{ padding: "24px", color: "#b91c1c" }}>
        Quiz data is missing. Please start the quiz from the selection page.
      </div>
    );
  }

  // 🔑 Make sure EVERY question has an id.
  // If id is missing, we fall back to its index (as a string).
  const rawQuestions = quiz.questions || [];
  const questions = rawQuestions.map((q, i) =>
    q && q.id == null ? { ...q, id: i.toString() } : q
  );

  const total = questions.length;
  const q = questions[idx] || {};
  const progressPct = total ? Math.round(((idx + 1) / total) * 100) : 0;

  // Build set of attempted question IDs (all as strings)
  const attemptedIds = new Set(
    Object.entries(answers)
      .filter(([, v]) => {
        if (v == null) return false;
        if (typeof v === "string") return v.trim() !== "";
        if (Array.isArray(v)) return v.length > 0;
        return true;
      })
      .map(([k]) => String(k))
  );

  // ---------- UI ----------
  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "40px 0",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            padding: "32px 40px 40px",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <button 
                 onClick={() => setShowExitModal(true)}
                 style={{
                   background: '#fee2e2',
                   border: 'none',
                   cursor: 'pointer',
                   color: '#ef4444',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   width: '32px',
                   height: '32px',
                   borderRadius: '8px',
                   marginTop: '4px'
                 }}
                 title="Quit Quiz"
               >
                 <X size={20} />
               </button>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  {quiz.title || "Quiz"}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    borderBottom: "3px solid #a855f7",
                    paddingBottom: "6px",
                    display: "inline-block",
                    minWidth: "140px",
                  }}
                >
                  Question {idx + 1} / {total}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <span role="img" aria-label="timer">
                ⏱
              </span>
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  fontWeight: 500,
                }}
              >
                {fmtSeconds(remaining)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ margin: "12px 0 28px" }}>
            <div
              style={{
                height: "8px",
                borderRadius: "999px",
                background: "#f3e8ff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#ec4899,#a855f7)",
                  transition: "width 0.25s ease-out",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "4px",
                textAlign: "right",
              }}
            >
              {progressPct}%
            </div>
          </div>

          {/* Question + answer area */}
          <div
            style={{
              marginTop: "24px",
              borderRadius: "16px",
              background: "#faf5ff",
              padding: "24px 28px",
              minHeight: "160px",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: "18px",
                marginBottom: "18px",
                textAlign: "center",
              }}
            >
              {q.questionText || q.text || "Question text missing"}
            </div>

            {/* Answer controls */}
            {q.type === "MCQ" ? (
              <div
                style={{
                  maxWidth: "480px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {(q.options || q.choices || []).map((opt, i) => {
                  const value = typeof opt === "string" ? opt : String(opt);
                  const checked = (answers[q.id] || "") === value;
                  return (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "999px",
                        border: checked
                          ? "2px solid #ec4899"
                          : "1px solid #e5e7eb",
                        background: checked ? "#fee2e2" : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={checked}
                        onChange={() => setAnswer(q, value)}
                      />
                      <span>{value}</span>
                    </label>
                  );
                })}
              </div>
            ) : q.type === "CHECKBOX" ? (
              <div
                style={{
                  maxWidth: "480px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {(q.options || q.choices || []).map((opt, i) => {
                  const value = typeof opt === "string" ? opt : String(opt);
                  const selectedAnswers = answers[q.id] || [];
                  const checked = Array.isArray(selectedAnswers)
                    ? selectedAnswers.includes(value)
                    : false;

                  return (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "999px",
                        border: checked
                          ? "2px solid #ec4899"
                          : "1px solid #e5e7eb",
                        background: checked ? "#fee2e2" : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          let newAnswers;
                          if (e.target.checked) {
                            // Add to array
                            newAnswers = Array.isArray(selectedAnswers)
                              ? [...selectedAnswers, value]
                              : [value];
                          } else {
                            // Remove from array
                            newAnswers = Array.isArray(selectedAnswers)
                              ? selectedAnswers.filter((v) => v !== value)
                              : [];
                          }
                          setAnswer(q, newAnswers);
                        }}
                      />
                      <span>{value}</span>
                    </label>
                  );
                })}
              </div>
            ) : q.type === "TF" || q.type === "TRUE_FALSE" ? (
              <div
                style={{
                  maxWidth: "320px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {["True", "False"].map((value) => {
                  const checked = (answers[q.id] || "") === value;
                  return (
                    <label
                      key={value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "999px",
                        border: checked
                          ? "2px solid #ec4899"
                          : "1px solid #e5e7eb",
                        background: checked ? "#fee2e2" : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={checked}
                        onChange={() => setAnswer(q, value)}
                      />
                      <span>{value}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div style={{ maxWidth: "520px", margin: "0 auto" }}>
                <textarea
                  rows={4}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    padding: "10px 12px",
                    resize: "vertical",
                  }}
                  placeholder="Type your answer here…"
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q, e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Prev / Next / Submit */}
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={prev}
              disabled={idx === 0}
              style={{
                padding: "10px 24px",
                borderRadius: "999px",
                border: "1px solid #e5e7eb",
                background: idx === 0 ? "#f9fafb" : "#ffffff",
                color: idx === 0 ? "#d1d5db" : "#111827",
                cursor: idx === 0 ? "default" : "pointer",
                fontSize: "14px",
              }}
            >
              ← Previous
            </button>

            {idx < total - 1 ? (
              <button
                onClick={next}
                style={{
                  padding: "10px 32px",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(90deg, rgba(236,72,153,1), rgba(168,85,247,1))",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => doSubmit(false)}
                disabled={isSubmitting}
                style={{
                  padding: "10px 32px",
                  borderRadius: "999px",
                  border: "none",
                  background: isSubmitting
                    ? "#d1d5db"
                    : "linear-gradient(90deg, rgba(34,197,94,1), rgba(59,130,246,1))",
                  color: "#ffffff",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>

          {/* Question progress list */}
          <div
            style={{
              marginTop: "32px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
            }}
          >
            {/* header row: title + legend on right */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Questions Progress
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "12px",
                  color: "#6b7280",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "999px",
                      background: "#22c55e",
                    }}
                  />
                  Attempted
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "999px",
                      background: "#9ca3af",
                    }}
                  />
                  Unattempted
                </span>
              </div>
            </div>

            {/* grid of questions */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: "8px 40px",
                fontSize: "14px",
              }}
            >
              {questions.map((qItem, i) => {
                const isCurrent = i === idx;

                const qId =
                  qItem && qItem.id != null ? String(qItem.id) : String(i);

                const isAttempted = attemptedIds.has(qId);

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToQuestion(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: isCurrent ? "#111827" : "#4b5563",
                      fontWeight: isCurrent ? 600 : 400,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "999px",
                        background: isAttempted ? "#22c55e" : "#9ca3af",
                      }}
                    />
                    <span>Question {i + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exit Confirmation Modal */}
          {showExitModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ marginTop: 0, color: '#1f2937', fontSize: '18px', fontWeight: 600 }}>Exit Quiz?</h3>
                <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: 1.5 }}>
                  Are you sure you want to leave? Your attempt will be voided and will not be saved.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={() => setShowExitModal(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      background: 'white',
                      color: '#374151',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmExit}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#ef4444',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Exit Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
