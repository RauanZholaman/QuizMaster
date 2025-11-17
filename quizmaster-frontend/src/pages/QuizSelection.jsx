// src/pages/QuizSelection.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function QuizSelection() {
  const nav = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // Top-level subjects (your 3x3 pastel cards)
  const subjects = [
    { id: "data-structures", title: "Data Structures", color: "#E9DAF7" },
    { id: "maths", title: "Maths", color: "#E6E8EB" },
    { id: "programming", title: "Programming", color: "#F7C9CB" },
    {
      id: "oop",
      title: "Object Oriented Programming",
      color: "#EEE6AD",
    },
    { id: "web", title: "Web Development", color: "#C9D5FF" },
    {
      id: "dbms",
      title: "Database Management",
      color: "#F1E1F5",
    },
    { id: "networking", title: "Networking", color: "#F4C2C2" },
    { id: "python", title: "Python", color: "#E6E8EB" },
    { id: "java", title: "Java", color: "#EEE6AD" },
  ];

  // Subtopics per subject – for now we only really use Maths in the demo
  const subjectTopics = {
    maths: ["Algebra", "Calculus", "Statistics"],
    // you can fill others later if needed
    "data-structures": ["Arrays", "Linked Lists", "Trees"],
    programming: ["Basics", "Control Flow", "Functions"],
    oop: ["Classes", "Inheritance", "Polymorphism"],
    web: ["HTML & CSS", "JavaScript", "React"],
    dbms: ["SQL Basics", "Joins", "Indexes"],
    networking: ["OSI Model", "IP Addressing", "Routing"],
    python: ["Syntax", "Data Types", "Libraries"],
    java: ["Syntax", "OOP in Java", "Collections"],
  };

  const page = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 24px",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "32px",
    justifyItems: "center",
  };

  const card = (bg) => ({
    width: "320px",
    height: "160px",
    background: bg,
    borderRadius: "20px",
    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "#111",
    fontSize: "20px",
    fontWeight: 600,
    transition: "transform .18s ease, box-shadow .18s ease",
    cursor: "pointer",
  });

  const hover = {
    transform: "translateY(-4px)",
    boxShadow: "0 14px 24px rgba(0,0,0,0.12)",
  };

  const topicGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "32px",
    justifyItems: "center",
    marginTop: "40px",
  };

  const topicCard = {
    width: "320px",
    height: "160px",
    background: "#CBE39A", // light green like your screenshot
    borderRadius: "20px",
    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "#111",
    fontSize: "20px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .18s ease, box-shadow .18s ease",
  };

  // If a subject is selected, show the second-level screen
  if (selectedSubjectId) {
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    const topics = subjectTopics[selectedSubjectId] || [];

    return (
      <div style={page}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          Quiz Taking / Quiz Selections / {subject?.title}
        </h1>

        <button
          onClick={() => setSelectedSubjectId(null)}
          style={{
            marginTop: 8,
            marginBottom: 24,
            border: "none",
            background: "transparent",
            color: "#555",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Back to all subjects
        </button>

        <div style={topicGrid}>
          {topics.map((topic) => (
            <div
              key={topic}
              style={topicCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hover)}
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, {
                  transform: "none",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
                })
              }
              onClick={() =>
                nav(`/quiz/${selectedSubjectId}/intro`, {
                  state: {
                    subject: subject?.title || "",
                    category: topic,
                  },
                })
              }
            >
              {topic}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: show main subject list
  return (
    <div style={page}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>
        Quiz Taking / Quiz Selections
      </h1>

      <div style={grid}>
        {subjects.map((s) => (
          <div
            key={s.id}
            style={card(s.color)}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, hover)}
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, {
                transform: "none",
                boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
              })
            }
            onClick={() => setSelectedSubjectId(s.id)}
          >
            {s.title}
          </div>
        ))}
      </div>
    </div>
  );
}
