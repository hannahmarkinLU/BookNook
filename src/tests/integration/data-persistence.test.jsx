import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider } from "../../context/BooksContext";
import Dashboard from "../../pages/Dashboard";
import ProtectedRoute from "../../routes/ProtectedRoute";

// mock Navbar
vi.mock("../../components/navigation/NavBar", () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

// mock BookGrid
vi.mock("../../components/books/BookGrid", () => ({
  default: ({ books }) => (
    <div data-testid="mock-book-grid">
      {books.map((book) => (
        <div key={book.id} data-testid={`saved-book-${book.id}`}>
          {book.title} - {book.status}
        </div>
      ))}
      <div data-testid="books-count">Total: {books.length}</div>
    </div>
  ),
}));

// mock user data
const mockUser = {
  id: "user-123",
  username: "testuser",
  email: "test@test.com",
};

// create mutable mock variables
let mockGetUserSavedBooks = vi.fn();

// mock useBooks hook with mutable implementation
vi.mock("../../context/BooksContext", () => ({
  BooksProvider: ({ children }) => <div>{children}</div>,
  useBooks: () => ({
    getUserSavedBooks: mockGetUserSavedBooks,
    searchBooks: vi.fn(),
    searchResults: [],
    saveBook: vi.fn(),
    removeBook: vi.fn(),
    updateBook: vi.fn(),
    isBookSaved: vi.fn(),
    loading: false,
    error: null,
  }),
}));

// mock useAuth hook
vi.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      deleteAccount: vi.fn(),
    }),
  };
});

describe("Data Persistence", () => {
  // clean up after each test to prevent multiple renders
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute = "/dashboard") => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <BooksProvider>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BooksProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
  };

  test("loads books from localStorage when app starts", async () => {
    // set up mock return value
    mockGetUserSavedBooks.mockReturnValue([
      {
        id: "book-1",
        title: "Existing Book 1",
        authors: ["Author One"],
        status: "reading",
      },
      {
        id: "book-2",
        title: "Existing Book 2",
        authors: ["Author Two"],
        status: "completed",
      },
    ]);

    renderWithRouter("/dashboard");

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // check if books are displayed
    expect(screen.getByTestId("saved-book-book-1")).toBeInTheDocument();
    expect(screen.getByTestId("saved-book-book-2")).toBeInTheDocument();
    expect(screen.getByText("Existing Book 1 - reading")).toBeInTheDocument();
    expect(screen.getByText("Existing Book 2 - completed")).toBeInTheDocument();
    expect(screen.getByText("Total: 2")).toBeInTheDocument();
  });

  test("maintains book status across sessions", async () => {
    // set up mock with different statuses
    mockGetUserSavedBooks.mockReturnValue([
      {
        id: "book-1",
        title: "Reading Book",
        authors: ["Author One"],
        status: "reading",
      },
      {
        id: "book-2",
        title: "Completed Book",
        authors: ["Author Two"],
        status: "completed",
      },
      {
        id: "book-3",
        title: "Wishlist Book",
        authors: ["Author Three"],
        status: "wishlist",
      },
    ]);

    renderWithRouter("/dashboard");

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // check that statuses are preserved
    expect(screen.getByText("Reading Book - reading")).toBeInTheDocument();
    expect(screen.getByText("Completed Book - completed")).toBeInTheDocument();
    expect(screen.getByText("Wishlist Book - wishlist")).toBeInTheDocument();

    // check total books
    expect(screen.getByText("Total: 3")).toBeInTheDocument();
  });

  test("handles empty localStorage gracefully", async () => {
    // set up mock to return empty array
    mockGetUserSavedBooks.mockReturnValue([]);

    renderWithRouter("/dashboard");

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // should show empty state
    expect(screen.getByText("Total: 0")).toBeInTheDocument();

    // stats should all be zero
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });
});
