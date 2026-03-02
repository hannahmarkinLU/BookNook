import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function TestAuthConsumer() {
  const { user, login, register, logout, loading, error } = useAuth();
  const [localError, setLocalError] = useState(null);

  const handleLogin = async () => {
    try {
      setLocalError(null);
      // for test user, use username as login value
      await login("testuser", "password123");
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      setLocalError(null);
      // use the register function with email
      await register("newuser", "newuser@test.com", "Password123");
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
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default TestAuthConsumer;
