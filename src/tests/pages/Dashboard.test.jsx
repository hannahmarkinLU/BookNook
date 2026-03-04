import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider } from "../../context/BooksContext";
import { useAuth } from "../../context/AuthContext";

// mock Navbar
vi.mock("../../components/navigation/NavBar", () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

// mock BookGrid
vi.mock("../../components/books/BookGrid", () => ({
  default: ({ books }) => (
    <div data-testid="mock-book-grid">
      Books: {books.length}
      {books.map((book) => (
        <div key={book.id} data-testid={`grid-book-${book.id}`}>
          {book.title}
        </div>
      ))}
    </div>
  ),
}));

// mock user data
const mockUser = {
  id: "1",
  username: "testuser",
  email: "test@test.com",
};

// mock books data
const mockBooks = [
  { id: "1", title: "Book 1", status: "reading", authors: ["Author 1"] },
  { id: "2", title: "Book 2", status: "completed", authors: ["Author 2"] },
  { id: "3", title: "Book 3", status: "wishlist", authors: ["Author 3"] },
  { id: "4", title: "Book 4", status: "reading", authors: ["Author 4"] },
];

// mock BooksContext
vi.mock("../../context/BooksContext", () => ({
  BooksProvider: ({ children }) => <div>{children}</div>,
  useBooks: () => ({
    getUserSavedBooks: () => mockBooks,
  }),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("currentUser", JSON.stringify(mockUser));
    vi.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>
            <Dashboard />
          </BooksProvider>
        </AuthProvider>
      </BrowserRouter>,
    );
  };

  test("renders welcome message with username", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(
        screen.getByText("testuser's Reading Dashboard"),
      ).toBeInTheDocument();
    });
  });

  test("displays correct total stats", async () => {
    renderWithProviders();

    await waitFor(() => {
      // total books: 4
      expect(screen.getByText("4")).toBeInTheDocument();

      // currently reading: 2
      expect(screen.getByText("2")).toBeInTheDocument();

      // completed: 1
      expect(screen.getByText("1")).toBeInTheDocument();

      // wishlist: 1
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  test("filters books by status", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // get status filter dropdown
    const statusFilter = screen.getByLabelText("Filter by Status");

    // filter by "reading"
    fireEvent.change(statusFilter, { target: { value: "reading" } });

    // BookGrid should receive filtered books (2 reading books)
    await waitFor(() => {
      expect(screen.getByText("Books: 2")).toBeInTheDocument();
    });

    // filter by "completed"
    fireEvent.change(statusFilter, { target: { value: "completed" } });

    await waitFor(() => {
      expect(screen.getByText("Books: 1")).toBeInTheDocument();
    });

    // filter by "wishlist"
    fireEvent.change(statusFilter, { target: { value: "wishlist" } });

    await waitFor(() => {
      expect(screen.getByText("Books: 1")).toBeInTheDocument();
    });
  });

  test("filters books by search query", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // get search input
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author...",
    );

    // search by title
    fireEvent.change(searchInput, { target: { value: "Book 1" } });

    await waitFor(() => {
      expect(screen.getByText("Books: 1")).toBeInTheDocument();
    });

    // search by author
    fireEvent.change(searchInput, { target: { value: "Author 2" } });

    await waitFor(() => {
      expect(screen.getByText("Books: 1")).toBeInTheDocument();
    });
  });

  test("combines status and search filters", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // filter by "reading" status
    const statusFilter = screen.getByLabelText("Filter by Status");
    fireEvent.change(statusFilter, { target: { value: "reading" } });

    // add search for "Book 1" (which is reading)
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author...",
    );
    fireEvent.change(searchInput, { target: { value: "Book 1" } });

    await waitFor(() => {
      expect(screen.getByText("Books: 1")).toBeInTheDocument();
    });
  });

  test("clear filters button resets both filters", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // apply filters
    const statusFilter = screen.getByLabelText("Filter by Status");
    fireEvent.change(statusFilter, { target: { value: "reading" } });

    const searchInput = screen.getByPlaceholderText(
      "Search by title or author...",
    );
    fireEvent.change(searchInput, { target: { value: "Book 1" } });

    // clear filters button should appear
    const clearButton = await screen.findByText("Clear Filters");
    expect(clearButton).toBeInTheDocument();

    // click clear button
    fireEvent.click(clearButton);

    // should show all books again
    await waitFor(() => {
      expect(screen.getByText("Books: 4")).toBeInTheDocument();
    });

    // filters should be reset
    expect(statusFilter.value).toBe("");
    expect(searchInput.value).toBe("");
  });

  test("shows empty state when no books match filters", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // search for non-existent book
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author...",
    );
    fireEvent.change(searchInput, { target: { value: "Nonexistent Book" } });

    // BookGrid should receive empty array
    await waitFor(() => {
      expect(screen.getByText("Books: 0")).toBeInTheDocument();
    });
  });
});
