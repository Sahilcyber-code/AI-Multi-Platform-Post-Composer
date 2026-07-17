import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [localError, setLocalError] = useState('');

  const { forgotPassword, error, clearError, loading } = useAuth();

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    setResetLink('');

    if (!email) {
      setLocalError('Please enter your email.');
      return;
    }

    const res = await forgotPassword(email);
    if (res.success) {
      setSuccessMsg('A password reset link has been generated.');
      if (res.token) {
        // Expose simulated link in UI for developer convenience
        setResetLink(`/reset-password?token=${res.token}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="section-heading auth-header">
          <div>
            <p className="eyebrow">Recover Password</p>
            <h2>Forgot Password</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {localError && <div className="auth-error">{localError}</div>}
          {error && <div className="auth-error">{error}</div>}
          
          {successMsg && (
            <div className="auth-success">
              <p>{successMsg}</p>
              {resetLink && (
                <div className="dev-sandbox-link">
                  <p><strong>Dev Sandbox Helper:</strong></p>
                  <Link to={resetLink} className="publish-btn auth-submit-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', marginTop: '10px' }}>
                    Click here to Reset Password
                  </Link>
                </div>
              )}
            </div>
          )}

          {!successMsg && (
            <>
              <p className="auth-instruction">
                Enter your email address and we'll log a password reset link to the console for you.
              </p>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="publish-btn auth-submit-btn" disabled={loading}>
                {loading ? 'Sending request...' : 'Send Reset Link'}
              </button>
            </>
          )}
        </form>

        <div className="auth-footer">
          Remember your password? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
