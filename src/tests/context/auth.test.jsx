import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider } from "../../context/BooksContext";
import TestAuthConsumer from "../utils/TestAuthConsumer";

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithAuth = () => {
    return render(
      <AuthProvider>
        <BooksProvider>
          <TestAuthConsumer />
        </BooksProvider>
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

    // wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated",
      );
    });

    // check for username
    expect(screen.getByTestId("username")).toHaveTextContent("testuser");

    // check localStorage, entire user object stored under 'currentUser'
    await waitFor(() => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      expect(currentUser).toBeTruthy();
      expect(currentUser.username).toBe("testuser");
      expect(currentUser.email).toBe("test@test.com");
    });
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

    // first login
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated",
      );
    });

    // then logout
    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });

    // username should not be visible
    expect(screen.queryByTestId("username")).not.toBeInTheDocument();

    // check localStorage is cleared
    expect(localStorage.getItem("currentUser")).toBeNull();
  });

  test("restores user from localStorage on refresh", async () => {
    // create a proper user object as it would be stored
    const persistedUser = {
      id: "test-id",
      username: "persistedUser",
      email: "persisted@test.com",
      password: "password",
      createdAt: new Date().toISOString(),
    };

    // set localStorage with correct key and format
    localStorage.setItem("currentUser", JSON.stringify(persistedUser));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated",
      );
    });

    expect(screen.getByTestId("username")).toHaveTextContent("persistedUser");
  });
});
