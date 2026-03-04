import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider } from "../../context/BooksContext";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import Dashboard from "../../pages/Dashboard";
import ProtectedRoute from "../../routes/ProtectedRoute";

// mock Navbar
vi.mock("../../components/navigation/NavBar", () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

// create simple mock functions
const mockLogin = vi.fn();
const mockRegister = vi.fn();

// mock useAuth hook
vi.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      deleteAccount: vi.fn(),
    }),
  };
});

// mock BooksContext
vi.mock("../../context/BooksContext", () => ({
  BooksProvider: ({ children }) => <div>{children}</div>,
  useBooks: () => ({
    getUserSavedBooks: vi.fn().mockReturnValue([]),
  }),
}));

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute = "/") => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <BooksProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Login />} />
            </Routes>
          </BooksProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
  };

  test("redirects from root to login page", async () => {
    renderWithRouter("/");

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  test("navigates from login to register page", async () => {
    renderWithRouter("/login");

    const signUpLink = screen.getByRole("link", { name: "Sign up" });
    fireEvent.click(signUpLink);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Sign up" }),
      ).toBeInTheDocument();
    });
  });

  test("navigates from register to login page", async () => {
    renderWithRouter("/register");

    const loginLink = screen.getByRole("link", { name: "Login" });
    fireEvent.click(loginLink);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Login" }),
      ).toBeInTheDocument();
    });
  });

  test("login form calls login function with credentials", async () => {
    renderWithRouter("/login");

    // find and fill login form
    const usernameInput = screen.getByLabelText(/email or username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
  });

  test("register form calls register function with credentials", async () => {
    renderWithRouter("/register");

    // find and fill registration form
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    fireEvent.change(emailInput, { target: { value: "new@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmInput, { target: { value: "Password123" } });
    fireEvent.click(submitButton);

    expect(mockRegister).toHaveBeenCalled();
  });

  test("protected route redirects unauthenticated user to login", async () => {
    renderWithRouter("/dashboard");

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });
});
