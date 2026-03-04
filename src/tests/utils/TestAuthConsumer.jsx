import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function TestAuthConsumer() {
  const { user, login, register, logout, loading, error } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLogin = async () => {
    try {
      setLocalError(null);
      await login(loginUsername || "testuser", loginPassword || "password123");
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      setLocalError(null);
      await register(
        registerUsername || "newuser",
        registerEmail || "newuser@test.com",
        registerPassword || "Password123",
      );
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div>
      <div data-testid="auth-status">
        {user ? "Authenticated" : "Not Authenticated"}
      </div>
      {user && <div data-testid="username">{user.username}</div>}
      {loading && <div data-testid="loading">Loading...</div>}
      {localError && <div data-testid="error">{localError}</div>}
      {error && <div data-testid="auth-error">{error}</div>}

      {/* login inputs */}
      <input
        data-testid="login-username"
        placeholder="Username"
        value={loginUsername}
        onChange={(e) => setLoginUsername(e.target.value)}
      />
      <input
        data-testid="login-password"
        placeholder="Password"
        type="password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
      />
      <button onClick={handleLogin} data-testid="login-btn">
        Login
      </button>

      {/* register inputs */}
      <input
        data-testid="register-username"
        placeholder="Username"
        value={registerUsername}
        onChange={(e) => setRegisterUsername(e.target.value)}
      />
      <input
        data-testid="register-email"
        placeholder="Email"
        value={registerEmail}
        onChange={(e) => setRegisterEmail(e.target.value)}
      />
      <input
        data-testid="register-password"
        placeholder="Password"
        type="password"
        value={registerPassword}
        onChange={(e) => setRegisterPassword(e.target.value)}
      />
      <button onClick={handleRegister} data-testid="register-btn">
        Register
      </button>

      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default TestAuthConsumer;
