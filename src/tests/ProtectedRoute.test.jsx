// tests protected routes by verifying redirect behavior and authenticated access
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";
import { waitFor } from "@testing-library/react";

// helper to render components with auth & router
function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthProvider>,
  );
}

// login page used to inspect redirect state
function LoginPage() {
  const location = useLocation();

  return (
    <div>
      <h1>Login Page</h1>
      <div data-testid="from">{location.state?.from || "no redirect"}</div>
    </div>
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("redirects unauthenticated users to login", async () => {
    await renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: "/protected" },
    );

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  test("renders children when user is authenticated", async () => {
    localStorage.setItem("authToken", "mock_token");
    localStorage.setItem("username", "testuser");

    await renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { route: "/protected" },
    );

    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
  });

  test("passes original route in location state when redirecting", async () => {
    await renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
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
