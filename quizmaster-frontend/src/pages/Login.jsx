// src/pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Mail, Lock } from "lucide-react";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // After login, React Router will navigate based on ProtectedRoute
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
      <main className="auth-container">
        <div className="login-content">
          {/* Left Side - Login Form */}
          <div className="login-form-section">
            <h2 className="auth-form-title">LOGIN</h2>
            
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

              {/* Email Input */}
              <div className="form-group">
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginTop: '8px', marginBottom: '8px' }}>
                <Link to="/forgot-password" className="auth-link" style={{ fontSize: '14px' }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Remember Me Checkbox */}
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="checkbox-label">
                  Remember Me
                </label>
              </div>

              {/* Sign In Button */}
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Footer Link */}
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>

          {/* Logo - Illustration */}
          <div className="login-illustration">
            <img 
              src="/quizMasterLogo.png" 
              alt="Quiz illustration" 
              style={{ 
                width: '100%', 
                maxWidth: '500px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}