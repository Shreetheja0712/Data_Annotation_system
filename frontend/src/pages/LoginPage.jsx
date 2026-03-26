import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";

export default function LoginPage({ onLogin, error, info, setError, setInfo }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="auth-shell">
      <AuthPanel />
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-title">Welcome back</div>
          <div className="auth-subtitle">Sign in to continue to ProjectVault</div>

          {error && <div className="alert alert-error">{error}</div>}
          {info  && <div className="alert alert-info">{info}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError?.(""); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setError?.(""); }} />
            </div>
            <div className="forgot-row">
              <button type="button" className="link-btn" onClick={() => navigate("/forgot")}>Forgot password?</button>
            </div>
            <button type="submit" className="btn-primary">Sign In</button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <button className="link-btn" onClick={() => navigate("/register")}>Create one</button>
          </div>
        </div>
      </div>
    </div>
  );
}
