import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Profile from "../../pages/Profile";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider } from "../../context/BooksContext";

// mock Navbar
vi.mock("../../components/navigation/NavBar", () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

// mock navigate function
const mockNavigate = vi.fn();

// mock useNavigate hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock user data
const mockUser = {
  id: "user-123",
  username: "testuser",
  email: "test@test.com",
  createdAt: "2024-01-01T00:00:00.000Z",
};

// mock books data for stats
const mockBooks = [
  {
    id: "1",
    title: "Book 1",
    status: "reading",
    rating: 4,
    review: "Good book",
  },
  {
    id: "2",
    title: "Book 2",
    status: "completed",
    rating: 5,
    review: "Excellent",
  },
  { id: "3", title: "Book 3", status: "wishlist", rating: 0, review: "" },
  { id: "4", title: "Book 4", status: "reading", rating: 3, review: "Okay" },
  { id: "5", title: "Book 5", status: "completed", rating: 0, review: "" },
];

// create mutable mock variables
let mockGetUserSavedBooks = vi.fn().mockReturnValue(mockBooks);
let mockLogout = vi.fn();
let mockDeleteAccount = vi.fn();

// mock useAuth hook
vi.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      logout: mockLogout,
      deleteAccount: mockDeleteAccount,
      loading: false,
    }),
  };
});

// mock useBooks hook
vi.mock("../../context/BooksContext", () => ({
  BooksProvider: ({ children }) => <div>{children}</div>,
  useBooks: () => ({
    getUserSavedBooks: mockGetUserSavedBooks,
  }),
}));

describe("Profile", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("currentUser", JSON.stringify(mockUser));

    // reset mocks
    mockGetUserSavedBooks = vi.fn().mockReturnValue(mockBooks);
    mockLogout = vi.fn();
    mockDeleteAccount = vi.fn();
    mockNavigate.mockClear();

    vi.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>
            <Profile />
          </BooksProvider>
        </AuthProvider>
      </BrowserRouter>,
    );
  };

  test("renders user profile information", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@test.com")).toBeInTheDocument();
    });

    // avatar should show first letter of username
    const avatar = screen.getByText("T");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass("avatar-placeholder");
  });

  test("displays correct reading statistics", async () => {
    renderWithProviders();

    await waitFor(() => {
      // total books: 5
      expect(screen.getByText("5")).toBeInTheDocument();

      // currently reading: 2, use getAllByText and check count
      const twos = screen.getAllByText("2");
      expect(twos.length).toBe(2); // one for reading, one for completed

      // completed: 2, already counted above

      // wishlist: 1
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  test("displays additional statistics correctly", async () => {
    renderWithProviders();

    await waitFor(() => {
      // books with reviews: 3 (book 1, book 2, book 4)
      const threes = screen.getAllByText("3");
      expect(threes.length).toBe(2); // one for reviews, one for ratings

      // average rating: 4.0
      expect(screen.getByText("4.0")).toBeInTheDocument();
    });
  });

  test("handles logout button click", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole("button", { name: "Logout" });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("shows delete confirmation modal when delete button is clicked", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "Delete Account" });
    fireEvent.click(deleteButton);

    // modal should appear, use getAllByText and check the heading specifically
    await waitFor(() => {
      const deleteHeadings = screen.getAllByText("Delete Account");
      expect(deleteHeadings.length).toBe(2); // one button, one modal heading
      expect(
        screen.getByRole("heading", { name: "Delete Account" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete your account/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Yes, Delete Account" }),
      ).toBeInTheDocument();
    });
  });

  test("cancels account deletion when cancel button is clicked", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    // open modal
    const deleteButton = screen.getByRole("button", { name: "Delete Account" });
    fireEvent.click(deleteButton);

    // wait for modal to appear
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Delete Account" }),
      ).toBeInTheDocument();
    });

    // click cancel
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    // modal heading should disappear
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Delete Account" }),
      ).not.toBeInTheDocument();
    });

    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  test("confirms account deletion when confirm button is clicked", async () => {
    // mock successful deletion
    mockDeleteAccount.mockResolvedValue();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    // open modal
    const deleteButton = screen.getByRole("button", { name: "Delete Account" });
    fireEvent.click(deleteButton);

    // wait for modal to appear
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Delete Account" }),
      ).toBeInTheDocument();
    });

    // click confirm
    const confirmButton = screen.getByRole("button", {
      name: "Yes, Delete Account",
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("shows loading state on delete button when deleting", async () => {
    // mock deletion that takes time
    mockDeleteAccount.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    // open modal
    const deleteButton = screen.getByRole("button", { name: "Delete Account" });
    fireEvent.click(deleteButton);

    // wait for modal to appear
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Delete Account" }),
      ).toBeInTheDocument();
    });

    // click confirm
    const confirmButton = screen.getByRole("button", {
      name: "Yes, Delete Account",
    });
    fireEvent.click(confirmButton);

    // both the main delete button and the confirm button show "Deleting..."
    await waitFor(() => {
      const deletingButtons = screen.getAllByRole("button", {
        name: "Deleting...",
      });
      expect(deletingButtons.length).toBe(2); // main delete button + confirm button
      expect(deletingButtons[0]).toBeDisabled();
      expect(deletingButtons[1]).toBeDisabled();
    });
  });

  test("handles delete account error gracefully", async () => {
    // mock console.error
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // mock deletion that fails
    mockDeleteAccount.mockRejectedValue(new Error("Delete failed"));

    // mock alert
    const mockAlert = vi.fn();
    window.alert = mockAlert;

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    // open modal
    const deleteButton = screen.getByRole("button", { name: "Delete Account" });
    fireEvent.click(deleteButton);

    // wait for modal to appear
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Delete Account" }),
      ).toBeInTheDocument();
    });

    // click confirm
    const confirmButton = screen.getByRole("button", {
      name: "Yes, Delete Account",
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Failed to delete account. Please try again.",
      );
    });

    // modal should close
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Delete Account" }),
      ).not.toBeInTheDocument();
    });

    mockConsoleError.mockRestore();
  });

  test("shows N/A for average rating when no books have ratings", async () => {
    // override with books that have no ratings
    const booksWithoutRatings = [
      { id: "1", title: "Book 1", status: "reading", rating: 0, review: "" },
      { id: "2", title: "Book 2", status: "completed", rating: 0, review: "" },
    ];
    mockGetUserSavedBooks = vi.fn().mockReturnValue(booksWithoutRatings);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });

  test("displays zero for all stats when user has no books", async () => {
    // override with empty books array
    mockGetUserSavedBooks = vi.fn().mockReturnValue([]);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    // reading stats should show zeros
    expect(screen.getByText("Total Books")).toBeInTheDocument();
    expect(screen.getByText("Currently Reading")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Want to Read")).toBeInTheDocument();

    // the zeros are there (multiple is fine)
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);

    // additional stats
    expect(screen.getByText("Books with Reviews:")).toBeInTheDocument();
    expect(screen.getByText("Books with Ratings:")).toBeInTheDocument();
    expect(screen.getByText("Average Rating:")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  test("logout button is enabled and clickable", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole("button", { name: "Logout" });
    expect(logoutButton).not.toBeDisabled();
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  test("delete button is enabled and clickable", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "Delete Account" });
    expect(deleteButton).not.toBeDisabled();
    fireEvent.click(deleteButton);

    // modal heading should appear
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Delete Account" }),
      ).toBeInTheDocument();
    });
  });
});
