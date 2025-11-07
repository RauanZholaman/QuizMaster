// src/pages/Home.jsx
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen, FileText, BarChart3, PenTool, Trophy, TrendingUp } from "lucide-react";
import "./Home.css";

export default function Home() {
  const { user, role } = useAuth();
  
  // Get first name from email or use email
  const displayName = user?.email?.split('@')[0] || 'User';

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
    },
    {
      title: "Dashboard",
      description: "View student performance & analytics",
      icon: <BarChart3 size={32} />,
      link: "/dashboard",
      color: "#a78bfa"
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
    },
    {
      title: "Progress",
      description: "Track your learning journey",
      icon: <TrendingUp size={32} />,
      link: "",
      color: "#a78bfa"
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

      {/* Stats Section (Placeholder) */}
      <div className="stats-section">
        <h2 className="section-title">Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">
              {role === "educator" ? "Quizzes Created" : "Quizzes Taken"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">
              {role === "educator" ? "Total Students" : "Average Score"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">
              {role === "educator" ? "Questions Created" : "Completed"}
            </div>
          </div>
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