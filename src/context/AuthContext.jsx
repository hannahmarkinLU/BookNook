import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  // Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");

    if (token && username) {
      setUser({ username, token });
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);

    // simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockToken = `mock_jwt_${Date.now()}`;

    const userData = {
      username,
      token: mockToken,
    };

    setUser(userData);
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("username", username);

    setLoading(false);
    return userData;
  };

  const register = async (username, password) => {
    setLoading(true);

    // simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    const mockToken = `mock_jwt_${Date.now()}`;

    const userData = {
      username,
      token: mockToken,
    };

    setUser(userData);
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("username", username);

    setLoading(false);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
