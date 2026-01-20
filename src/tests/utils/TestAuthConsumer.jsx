// dummy component for testing useAuth
import { useAuth } from "../../context/AuthContext";

export default function TestAuthConsumer() {
  const { user, login, register, logout, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </div>

      {user && <div data-testid="username">{user.username}</div>}

      <button onClick={() => login("testuser", "password")}>Login</button>
      <button onClick={() => register("newuser", "password")}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
