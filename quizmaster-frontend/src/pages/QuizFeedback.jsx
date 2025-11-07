import { useLocation, useNavigate } from "react-router-dom";

export default function QuizFeedback() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const quizNumber = ""; // to be loaded from Firebase later
  const quizName = "";   // to be loaded from Firebase later
  // Only show totals when scores are provided; denominator left blank until DB
  const scores = state?.scores || null;
  const earned = scores
    ? Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : undefined;
  const studentName = "";
  const submittedDate = "";

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
        <h3 style={{ margin: "8px 0 16px" }}>Feedback</h3>

        {(earned != null) && (
          <div style={{ marginBottom: 12, fontWeight: 600 }}>
            Total Score: {earned} /
          </div>
        )}

        <textarea
          placeholder=""
          style={{
            width: "100%",
            background: "#ede7f6",
            border: "1px solid #c9c1dc",
            borderRadius: 10,
            padding: 16,
            minHeight: 140,
            outline: "none",
            resize: "vertical",
          }}
        />
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button style={pillButton} onClick={() => navigate(-1)}>Save and Exit</button>
        <button style={pillButton} onClick={() => navigate(-1)}>Publish Feedback</button>
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
