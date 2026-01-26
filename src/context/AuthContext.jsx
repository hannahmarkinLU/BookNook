import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getUsers,
  createUser,
  findUserByLogin,
} from "../utils/storage";

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

  // restore session
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // login with email OR username
  const login = async (loginValue, password) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const foundUser = findUserByLogin(loginValue);

    if (!foundUser || foundUser.password !== password) {
      setLoading(false);
      throw new Error("Invalid credentials");
    }

    setUser(foundUser);
    setCurrentUser(foundUser);
    setLoading(false);

    return foundUser;
  };

  // register with username + email
  const register = async (username, email, password) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const users = getUsers();

    const usernameTaken = Object.values(users).some(
      (u) => u.username === username,
    );
    const emailTaken = Object.values(users).some((u) => u.email === email);

    if (usernameTaken) {
      setLoading(false);
      throw new Error("Username already taken");
    }

    if (emailTaken) {
      setLoading(false);
      throw new Error("Email already in use");
    }

    const newUser = createUser({ username, email, password });

    setUser(newUser);
    setCurrentUser(newUser);
    setLoading(false);

    return newUser;
  };

  const logout = () => {
    setUser(null);
    clearCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
