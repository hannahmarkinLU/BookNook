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

  test("handles login with invalid credentials", async () => {
    // create a user with known credentials
    const users = {
      "test-id": {
        id: "test-id",
        username: "validuser",
        email: "valid@test.com",
        password: "correctpassword",
      },
    };
    localStorage.setItem("users", JSON.stringify(users));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });

    // enter wrong password
    fireEvent.change(screen.getByTestId("login-username"), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByTestId("login-password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-error")).toBeInTheDocument();
      expect(screen.getByTestId("auth-error")).toHaveTextContent(
        "Incorrect password",
      );
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });
  });

  test("prevents registration with existing username", async () => {
    // create an existing user
    const users = {
      "existing-id": {
        id: "existing-id",
        username: "existinguser",
        email: "existing@test.com",
        password: "password123",
      },
    };
    localStorage.setItem("users", JSON.stringify(users));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });

    // try to register with same username
    fireEvent.change(screen.getByTestId("register-username"), {
      target: { value: "existinguser" },
    });
    fireEvent.change(screen.getByTestId("register-email"), {
      target: { value: "different@test.com" },
    });
    fireEvent.change(screen.getByTestId("register-password"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByTestId("register-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-error")).toBeInTheDocument();
      expect(screen.getByTestId("auth-error")).toHaveTextContent(
        "already taken",
      );
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });
  });

  test("prevents registration with existing email", async () => {
    // create an existing user
    const users = {
      "existing-id": {
        id: "existing-id",
        username: "existinguser",
        email: "existing@test.com",
        password: "password123",
      },
    };
    localStorage.setItem("users", JSON.stringify(users));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });

    // try to register with same email
    fireEvent.change(screen.getByTestId("register-username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByTestId("register-email"), {
      target: { value: "existing@test.com" },
    });
    fireEvent.change(screen.getByTestId("register-password"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByTestId("register-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-error")).toBeInTheDocument();
      // check for the actual error message from AuthContext
      expect(screen.getByTestId("auth-error")).toHaveTextContent(
        "Registration failed. Please try again.",
      );
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });
  });

  test("validates password strength during registration", async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated",
      );
    });

    // try to register with weak password
    fireEvent.change(screen.getByTestId("register-username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByTestId("register-email"), {
      target: { value: "new@test.com" },
    });
    fireEvent.change(screen.getByTestId("register-password"), {
      target: { value: "weak" },
    });
    fireEvent.click(screen.getByTestId("register-btn"));

    // registration should fail, should still be unauthenticated
    await waitFor(
      () => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent(
          "Not Authenticated",
        );
      },
      { timeout: 2000 },
    );

    // test passes if we stay unauthenticated
    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not Authenticated",
    );
  });
});
