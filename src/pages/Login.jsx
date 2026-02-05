import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail,
  validateUsername,
  sanitizeInput,
} from "../utils/security";
import "../styles/pages.css";

function Login() {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // sanitize inputs
    const sanitizedLogin = sanitizeInput(loginValue);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedLogin.trim() || !sanitizedPassword.trim()) {
      setError("Please enter both email/username and password");
      return;
    }

    // basic validation
    const isEmail = validateEmail(sanitizedLogin);
    const isUsername = validateUsername(sanitizedLogin);

    if (!isEmail && !isUsername) {
      setError("Please enter a valid email or username");
      return;
    }

    try {
      await login(sanitizedLogin, sanitizedPassword);
      navigate(from, { replace: true });
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="logo">📖</div>
        <h1>BookNook</h1>
        <p>Track your reading journey</p>
      </header>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="auth-error">{error}</p>}

        <label>
          Email or Username
          <input
            type="text"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">New to BookNook?</p>

        <Link to="/register" className="secondary-button">
          Sign up
        </Link>
      </form>
    </div>
  );
}

export default Login;
