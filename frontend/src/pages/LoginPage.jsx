import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin, error }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div>
      <h2>Login</h2>

      {error && <p>{error}</p>}

      <form onSubmit={submit}>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

        <button type="submit">Login</button>
      </form>

      <button onClick={() => navigate("/register")}>Register</button>
      <button onClick={() => navigate("/forgot")}>Forgot</button>
    </div>
  );
}