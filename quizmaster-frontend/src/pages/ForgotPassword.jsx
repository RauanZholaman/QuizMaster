// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail(''); // Clear the input
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
          <h2 className="auth-form-title">Forgot your password?</h2>
          
          <form onSubmit={handleSubmit}>
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

            {/* Success Message */}
            {success && (
              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                Password reset email sent! Check your inbox.
              </div>
            )}

            {/* Email Input */}
            <div className="form-group">
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Reset Password Button */}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login Link */}
          <Link to="/login" className="back-link">
            Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}