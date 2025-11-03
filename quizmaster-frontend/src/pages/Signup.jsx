// src/pages/Signup.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Mail, Lock, User } from "lucide-react";
import "./Auth.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [role, setRole] = useState("student");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErr('Passwords do not match!');
      return;
    }
    
    if (!acceptTerms) {
      setErr('Please accept the Terms of Use and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role, // "student" or "educator"
        createdAt: serverTimestamp(),
      });
      
      // Redirect happens automatically via ProtectedRoute when you hit "/"
      window.location.href = "/";
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Main Content */}
      <main className="auth-container with-bg">
        <div className="auth-card">
          <h2 className="auth-form-title">SIGN UP</h2>
          
          <form onSubmit={onSubmit}>
            {/* Error Message */}
            {err && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {err}
              </div>
            )}

            {/* First Name and Last Name Row */}
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  className="auth-input no-icon"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  className="auth-input no-icon"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  className="auth-input"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="auth-input"
                  disabled={loading}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="student">Student</option>
                  <option value="educator">Educator</option>
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  name="password"
                  className="auth-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="auth-input"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="acceptTerms"
                className="auth-checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="acceptTerms" className="checkbox-label">
                Accept the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </label>
            </div>

            {/* Sign Up Button */}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer Link */}
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}