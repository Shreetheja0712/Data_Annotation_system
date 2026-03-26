import { useNavigate } from "react-router-dom";

export default function ForgotPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Forgot Password</h2>

      <button onClick={() => navigate("/login")}>
        Back to Login
      </button>
    </div>
  );
}