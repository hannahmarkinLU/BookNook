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
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();

  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // sanitize inputs
    const sanitizedLogin = sanitizeInput(loginValue);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedLogin.trim() || !sanitizedPassword.trim()) {
      setLocalError("Please enter both email/username and password");
      return;
    }

    // basic validation
    const isEmail = validateEmail(sanitizedLogin);
    const isUsername = validateUsername(sanitizedLogin);

    if (!isEmail && !isUsername) {
      setLocalError("Please enter a valid email or username");
      return;
    }

    try {
      await login(sanitizedLogin, sanitizedPassword);
      navigate(from, { replace: true });
    } catch (err) {
      console.log("Login error:", err.message);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <img
          src="/logo-auth.svg"
          alt="BookNook"
          className="auth-logo"
          style={{
            width: 100,
            height: 100,
            marginTop: "20px",
          }}
        />
        <h1>BookNook</h1>
        <p>Track your reading journey</p>
      </header>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {/* show context error and local error */}
        {(error || localError) && (
          <p className="auth-error">{error || localError}</p>
        )}

        <label>
          Email or Username
          <input
            type="text"
            value={loginValue}
            onChange={(e) => {
              setLoginValue(e.target.value);
              setLocalError("");
            }}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLocalError("");
            }}
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
