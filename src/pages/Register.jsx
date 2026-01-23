import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/pages.css";

function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(username, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account");
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
