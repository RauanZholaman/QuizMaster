import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const { user, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const doLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="MyNavbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="QuizMaster Logo" className="logo-image" />
          <span className="logo-text">QuizMaster</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          {!user && (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Signup</Link>
            </>
          )}
          {user && role === "educator" && (
            <>
              <Link to="/create-quiz" className="nav-link">Create Quiz</Link>
              <Link to="/question-bank" className="nav-link">Question Bank</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </>
          )}
          {user && role === "student" && (
            <Link to="/take-quiz" className="nav-link">Take Quiz</Link>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="navbar-right">
          {user ? (
            <>
              <div className="user-info">
                <User size={18} />
                <span className="user-email">{user.email}</span>
                {role && <span className="user-role-badge">{role}</span>}
              </div>
              <button onClick={doLogout} className="logout-button">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="not-signed-in">
              <User size={16} />
              <span>Not signed in</span>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>Home</Link>
          {!user && (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={toggleMenu}>Login</Link>
              <Link to="/signup" className="mobile-nav-link" onClick={toggleMenu}>Signup</Link>
            </>
          )}
          {user && role === "educator" && (
            <>
              <Link to="/create-quiz" className="mobile-nav-link" onClick={toggleMenu}>Create Quiz</Link>
              <Link to="/question-bank" className="mobile-nav-link" onClick={toggleMenu}>Question Bank</Link>
              <Link to="/dashboard" className="mobile-nav-link" onClick={toggleMenu}>Dashboard</Link>
            </>
          )}
          {user && role === "student" && (
            <Link to="/take-quiz" className="mobile-nav-link" onClick={toggleMenu}>Take Quiz</Link>
          )}
        </div>
      )}
    </nav>
  );
}