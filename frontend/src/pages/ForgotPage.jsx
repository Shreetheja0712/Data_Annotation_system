import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";

export default function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div className="auth-shell">
      <AuthPanel />
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-title">Reset password</div>
          <div className="auth-subtitle">We'll send a link to your email</div>

          {sent ? (
            <div className="alert alert-info">
              If that email exists, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="fp-note">Enter your registered email address and we'll send you a password reset link.</p>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary">Send Reset Link</button>
            </form>
          )}

          <div className="auth-switch">
            <button className="link-btn" onClick={() => navigate("/login")}>← Back to Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
