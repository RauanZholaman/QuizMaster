// src/pages/Home.jsx
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen, FileText, BarChart3, PenTool, Trophy } from "lucide-react";
import "./Home.css";

export default function Home() {
  const { user, role, profile } = useAuth();
  
  // Get first name from email or use email
  const displayName = profile?.firstName || user?.email?.split('@')[0] || 'User';

  // Quick action cards based on role
  const educatorActions = [
    {
      title: "Create Quiz",
      description: "Design a new quiz for your students",
      icon: <PenTool size={32} />,
      link: "/create-quiz",
      color: "#7c3aed"
    },
    {
      title: "Question Bank",
      description: "Manage your question library",
      icon: <BookOpen size={32} />,
      link: "/question-bank",
      color: "#8b5cf6"
    }
  ];

  const studentActions = [
    {
      title: "Take Quiz",
      description: "Start a new quiz assignment",
      icon: <FileText size={32} />,
      link: "/take-quiz",
      color: "#7c3aed"
    },
    {
      title: "My Results",
      description: "View your quiz scores",
      icon: <Trophy size={32} />,
      link: "",
      color: "#8b5cf6"
    }
  ];

  const actions = role === "educator" ? educatorActions : studentActions;

  return (
    <div className="home-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Welcome back, <span className="highlight">{displayName}</span>!
          </h1>
          <p className="welcome-subtitle">
            {role === "educator" 
              ? "Ready to create engaging quizzes for your students?"
              : "Ready to test your knowledge today?"}
          </p>
          <div className="role-badge">
            {role === "educator" ? "Educator" : "Student"}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-cards">
          {actions.map((action, index) => (
            <Link to={action.link} key={index} className="action-card">
              <div className="card-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <h3 className="card-title">{action.title}</h3>
              <p className="card-description">{action.description}</p>
              <div className="card-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p className="footer-title">Group B</p>
        <p className="footer-names">Ansar • Rauan • Jx • Chan • Thin • May</p>
        <p className="footer-year">© 2025 QuizMaster</p>
      </footer>
    </div>
  );
}