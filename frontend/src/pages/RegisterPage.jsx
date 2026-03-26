import { useNavigate } from "react-router-dom";

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Register</h2>

      <button onClick={() => {
        onRegister({
          name: "test",
          email: "test@test.com",
          phone: "123",
          password: "123"
        });
      }}>
        Register Dummy
      </button>

      <button onClick={() => navigate("/login")}>Back to Login</button>
    </div>
  );
}