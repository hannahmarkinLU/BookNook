import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";
import { BooksProvider } from "../context/BooksContext";
import { waitFor } from "@testing-library/react";

// helper to render components with all providers
function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <AuthProvider>
      <BooksProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </BooksProvider>
    </AuthProvider>,
  );
}

// login page used to inspect redirect state
function LoginPage() {
  const location = useLocation();

  return (
    <div>
      <h1>Login Page</h1>
      <div data-testid="from">
        {location.state?.from?.pathname || "no redirect"}
      </div>
    </div>
  );
}

function ProtectedPage() {
  return <div>Protected Content</div>;
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("redirects unauthenticated users to login", async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: "/protected" },
    );

    // check if redirected to login
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  test("renders children when user is authenticated", async () => {
    // create and set proper user object
    const testUser = {
      id: "test-id",
      username: "testuser",
      email: "test@test.com",
      password: "password",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("currentUser", JSON.stringify(testUser));

    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
      </Routes>,
      { route: "/protected" },
    );

    // wait for ProtectedRoute to process auth state
    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  test("passes original route in location state when redirecting", async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: "/protected" },
    );

    expect(await screen.findByTestId("from")).toHaveTextContent("/protected");
  });
});
