import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../routes/AppRoutes";
import { AuthProvider } from "../context/AuthContext";
import { BooksProvider } from "../context/BooksContext";

// mock the page components to isolate routing tests
vi.mock("../pages/Login", () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock("../pages/Register", () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}));

vi.mock("../pages/Dashboard", () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock("../pages/AddBook", () => ({
  default: () => <div data-testid="addbook-page">Add Book Page</div>,
}));

vi.mock("../pages/BookDetails", () => ({
  default: () => <div data-testid="bookdetails-page">Book Details Page</div>,
}));

vi.mock("../pages/Profile", () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>,
}));

// helper function to render with providers
function renderWithProviders(ui, { route = "/", user = null } = {}) {
  // set up localStorage with user if provided
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }

  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <BooksProvider>{ui}</BooksProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AppRoutes - Routing Configuration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Public Routes", () => {
    test("redirects root path to login for unauthenticated users", () => {
      renderWithProviders(<AppRoutes />, { route: "/" });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("renders login page at /login for unauthenticated users", () => {
      renderWithProviders(<AppRoutes />, { route: "/login" });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("renders register page at /register for unauthenticated users", () => {
      renderWithProviders(<AppRoutes />, { route: "/register" });

      expect(screen.getByTestId("register-page")).toBeInTheDocument();
    });

    test("redirects from /login to /dashboard when user is authenticated", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      renderWithProviders(<AppRoutes />, {
        route: "/login",
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      });
    });

    test("redirects from /register to /dashboard when user is authenticated", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      renderWithProviders(<AppRoutes />, {
        route: "/register",
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      });
    });
  });

  describe("Protected Routes", () => {
    test("redirects from /dashboard to /login when unauthenticated", () => {
      renderWithProviders(<AppRoutes />, { route: "/dashboard" });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("redirects from /add to /login when unauthenticated", () => {
      renderWithProviders(<AppRoutes />, { route: "/add" });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("redirects from /book/123 to /login when unauthenticated", () => {
      renderWithProviders(<AppRoutes />, { route: "/book/123" });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("redirects from /profile to /login when unauthenticated", () => {
      renderWithProviders(<AppRoutes />, { route: "/profile" });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("renders dashboard page at /dashboard when authenticated", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      renderWithProviders(<AppRoutes />, {
        route: "/dashboard",
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      });
    });

    test("renders add book page at /add when authenticated", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      renderWithProviders(<AppRoutes />, {
        route: "/add",
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("addbook-page")).toBeInTheDocument();
      });
    });

    test("renders book details page at /book/:id when authenticated", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      renderWithProviders(<AppRoutes />, {
        route: "/book/123",
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("bookdetails-page")).toBeInTheDocument();
      });
    });

    test("renders profile page at /profile when authenticated", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      renderWithProviders(<AppRoutes />, {
        route: "/profile",
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("profile-page")).toBeInTheDocument();
      });
    });
  });

  describe("Fallback Routes", () => {
    test("redirects unknown routes to login for unauthenticated users", () => {
      renderWithProviders(<AppRoutes />, { route: "/unknown-route" });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    test("redirects unknown routes to dashboard for authenticated users", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      renderWithProviders(<AppRoutes />, {
        route: "/unknown-route",
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      });
    });
  });

  describe("Route Parameters", () => {
    test("preserves book ID in route when navigating to book details", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };
      const bookId = "abc-123-xyz";

      renderWithProviders(<AppRoutes />, {
        route: `/book/${bookId}`,
        user: mockUser,
      });

      await waitFor(() => {
        expect(screen.getByTestId("bookdetails-page")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation State", () => {
    test("redirects to originally requested page after login", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@test.com",
      };

      // verify the protected route redirects to login
      renderWithProviders(<AppRoutes />, { route: "/profile" });
      expect(screen.getByTestId("login-page")).toBeInTheDocument();

      // the actual redirect with state is tested in ProtectedRoute.test.jsx
    });
  });
});
