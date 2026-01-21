import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import TestAuthConsumer from "./utils/TestAuthConsumer";

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithAuth = () => {
    return render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );
  };

  test("user is not authenticated by default", async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });
  });

  test("login authenticates user and stores data", async () => {
    renderWithAuth();

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated",
      );
    });

    expect(screen.getByTestId("username")).toHaveTextContent("testuser");
    expect(localStorage.getItem("authToken")).toBeTruthy();
    expect(localStorage.getItem("username")).toBe("testuser");
  });

  test("register authenticates new user", async () => {
    renderWithAuth();

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated",
      );
    });

    expect(screen.getByTestId("username")).toHaveTextContent("newuser");
  });

  test("logout clears user and localStorage", async () => {
    renderWithAuth();

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated",
      );
    });

    fireEvent.click(screen.getByText("Logout"));

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not Authenticated",
    );
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("username")).toBeNull();
  });

  test("restores user from localStorage on refresh", async () => {
    localStorage.setItem("authToken", "mock_token");
    localStorage.setItem("username", "persistedUser");

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated",
      );
    });

    expect(screen.getByTestId("username")).toHaveTextContent("persistedUser");
  });
});
