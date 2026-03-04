import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  sanitizeInput,
} from "../utils/security";
import { getCSRFToken, validateCSRFToken } from "../utils/csrf"; // Add this import
import "../styles/pages.css";

function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [csrfToken] = useState(getCSRFToken()); // Add this

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Get CSRF token from form
    const formData = new FormData(e.target);
    const submittedToken = formData.get("_csrf");

    // Validate CSRF token
    if (!validateCSRFToken(submittedToken)) {
      setError("Security validation failed. Please refresh the page.");
      return;
    }

    // sanitize all inputs
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    // validate
    if (!validateUsername(sanitizedUsername)) {
      setError("Username must be 3-20 characters (letters, numbers, _, -)");
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(sanitizedPassword)) {
      setError(
        "Password must be at least 8 characters with letters and numbers",
      );
      return;
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(sanitizedUsername, sanitizedEmail, sanitizedPassword);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account");
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
        <input type="hidden" name="_csrf" value={csrfToken} />{" "}
        {/* Add this hidden input */}
        <h2>Sign up</h2>
        {error && <p className="auth-error">{error}</p>}
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p className="auth-switch">Already have an account?</p>
        <Link to="/login" className="secondary-button">
          Login
        </Link>
      </form>
    </div>
  );
}

export default Register;
