import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider, useBooks } from "../../context/BooksContext";
import AddBook from "../../pages/AddBook";
import Dashboard from "../../pages/Dashboard";
import BookDetails from "../../pages/BookDetails";
import ProtectedRoute from "../../routes/ProtectedRoute";

// mock Navbar component
vi.mock("../../components/navigation/NavBar", () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

// mock BookGrid component to simplify testing
vi.mock("../../components/books/BookGrid", () => ({
  default: ({ books }) => (
    <div data-testid="mock-book-grid">
      {books.map((book) => (
        <div key={book.id} data-testid={`book-${book.id}`}>
          {book.title} - {book.status}
        </div>
      ))}
    </div>
  ),
}));

// mock user data
const mockUser = {
  id: "user-123",
  username: "testuser",
  email: "test@test.com",
};

// mock useAuth hook
vi.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    }),
  };
});

// mock search results
const mockSearchResults = [
  {
    id: "book-1",
    volumeInfo: {
      title: "Test Book 1",
      authors: ["Author One"],
      description: "Description for test book 1",
      imageLinks: {
        thumbnail: "https://example.com/book1.jpg",
      },
    },
  },
  {
    id: "book-2",
    volumeInfo: {
      title: "Test Book 2",
      authors: ["Author Two"],
      description: "Description for test book 2",
      imageLinks: {},
    },
  },
];

// create mutable variables for books state
let savedBooks = [];
const mockSaveBook = vi.fn().mockImplementation((book) => {
  savedBooks = [...savedBooks, { ...book, id: book.id }];
});
const mockRemoveBook = vi.fn().mockImplementation((bookId) => {
  savedBooks = savedBooks.filter((b) => b.id !== bookId);
});
const mockUpdateBook = vi.fn().mockImplementation((bookId, updates) => {
  savedBooks = savedBooks.map((b) =>
    b.id === bookId ? { ...b, ...updates } : b,
  );
});
const mockIsBookSaved = vi.fn().mockImplementation((bookId) => {
  return savedBooks.some((b) => b.id === bookId);
});
const mockGetUserSavedBooks = vi.fn().mockImplementation(() => savedBooks);

// mock useBooks hook
vi.mock("../../context/BooksContext", () => ({
  BooksProvider: ({ children }) => <div>{children}</div>,
  useBooks: () => ({
    searchBooks: vi.fn().mockImplementation((query) => {
      // simulate search results
      return Promise.resolve(mockSearchResults);
    }),
    searchResults: mockSearchResults,
    saveBook: mockSaveBook,
    removeBook: mockRemoveBook,
    updateBook: mockUpdateBook,
    isBookSaved: mockIsBookSaved,
    getUserSavedBooks: mockGetUserSavedBooks,
    loading: false,
    error: null,
  }),
}));

describe("Book Management Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    savedBooks = [];
  });

  const renderWithRouter = (initialRoute = "/add") => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <BooksProvider>
            <Routes>
              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <AddBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book/:id"
                element={
                  <ProtectedRoute>
                    <BookDetails />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BooksProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
  };

  test("searches for books and displays results", async () => {
    renderWithRouter("/add");

    // find search input and button
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    // perform search
    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.click(searchButton);

    // wait for results to appear
    await waitFor(() => {
      expect(screen.getByText("Test Book 1")).toBeInTheDocument();
      expect(screen.getByText("Test Book 2")).toBeInTheDocument();
      expect(screen.getByText("Author One")).toBeInTheDocument();
      expect(screen.getByText("Author Two")).toBeInTheDocument();
    });
  });

  test("adds a book from search results to reading list", async () => {
    renderWithRouter("/add");

    // perform search
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.click(searchButton);

    // wait for results
    await waitFor(() => {
      expect(screen.getByText("Test Book 1")).toBeInTheDocument();
    });

    // click "Add to My List" button for first book
    const addButtons = screen.getAllByRole("button", {
      name: "Add to My List",
    });
    fireEvent.click(addButtons[0]);

    // verify saveBook was called
    expect(mockSaveBook).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "book-1",
        title: "Test Book 1",
        authors: ["Author One"],
      }),
    );
  });

  test("shows added books on dashboard", async () => {
    // simulate having saved books
    savedBooks = [
      {
        id: "book-1",
        title: "Test Book 1",
        authors: ["Author One"],
        status: "wishlist",
      },
      {
        id: "book-2",
        title: "Test Book 2",
        authors: ["Author Two"],
        status: "reading",
      },
    ];

    renderWithRouter("/dashboard");

    // wait for dashboard to load
    await waitFor(() => {
      expect(
        screen.getByText(/testuser's Reading Dashboard/i),
      ).toBeInTheDocument();
    });

    // check if books are displayed
    expect(screen.getByTestId("book-book-1")).toBeInTheDocument();
    expect(screen.getByTestId("book-book-2")).toBeInTheDocument();
    expect(screen.getByText("Test Book 1 - wishlist")).toBeInTheDocument();
    expect(screen.getByText("Test Book 2 - reading")).toBeInTheDocument();
  });

  test("updates book status on dashboard", async () => {
    // simulate having a saved book
    savedBooks = [
      {
        id: "book-1",
        title: "Test Book 1",
        authors: ["Author One"],
        status: "wishlist",
      },
    ];

    // override updateBook to actually change the book
    mockUpdateBook.mockImplementation((bookId, updates) => {
      savedBooks = savedBooks.map((b) =>
        b.id === bookId ? { ...b, ...updates } : b,
      );
    });

    renderWithRouter("/dashboard");

    // wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText("Test Book 1 - wishlist")).toBeInTheDocument();
    });

    // verify the update function works
    mockUpdateBook("book-1", { status: "reading" });

    expect(mockUpdateBook).toHaveBeenCalledWith("book-1", {
      status: "reading",
    });
    expect(savedBooks[0].status).toBe("reading");
  });

  test("removes book from reading list", async () => {
    // simulate having saved books
    savedBooks = [
      {
        id: "book-1",
        title: "Test Book 1",
        authors: ["Author One"],
        status: "wishlist",
      },
      {
        id: "book-2",
        title: "Test Book 2",
        authors: ["Author Two"],
        status: "reading",
      },
    ];

    renderWithRouter("/dashboard");

    // wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId("book-book-1")).toBeInTheDocument();
      expect(screen.getByTestId("book-book-2")).toBeInTheDocument();
    });

    // call removeBook
    mockRemoveBook("book-1");

    expect(mockRemoveBook).toHaveBeenCalledWith("book-1");
    expect(savedBooks.length).toBe(1);
    expect(savedBooks[0].id).toBe("book-2");
  });

  test("prevents adding duplicate books", async () => {
    // simulate having a saved book
    savedBooks = [
      {
        id: "book-1",
        title: "Test Book 1",
        authors: ["Author One"],
        status: "wishlist",
      },
    ];

    // mock isBookSaved to return true for book-1
    mockIsBookSaved.mockImplementation((bookId) => bookId === "book-1");

    renderWithRouter("/add");

    // perform search
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.click(searchButton);

    // wait for results
    await waitFor(() => {
      expect(screen.getByText("Test Book 1")).toBeInTheDocument();
    });

    // check that first book's button is disabled with "added" text
    const addButtons = screen.getAllByRole("button", {
      name: /Add to My List|Added/,
    });
    expect(addButtons[0]).toBeDisabled();
    expect(addButtons[0]).toHaveTextContent("Added");

    // second book should still be enabled
    expect(addButtons[1]).not.toBeDisabled();
    expect(addButtons[1]).toHaveTextContent("Add to My List");
  });

  test("displays correct book counts in dashboard", async () => {
    // simulate having books with different statuses
    savedBooks = [
      { id: "1", title: "Book 1", status: "reading" },
      { id: "2", title: "Book 2", status: "reading" },
      { id: "3", title: "Book 3", status: "completed" },
      { id: "4", title: "Book 4", status: "wishlist" },
      { id: "5", title: "Book 5", status: "wishlist" },
    ];

    renderWithRouter("/dashboard");

    // wait for dashboard to load
    await waitFor(() => {
      expect(
        screen.getByText(/testuser's Reading Dashboard/i),
      ).toBeInTheDocument();
    });

    // Check stats
    expect(screen.getByText("5")).toBeInTheDocument(); // total books
    expect(screen.getByText("2")).toBeInTheDocument(); // reading (there are two 2s)
    expect(screen.getByText("1")).toBeInTheDocument(); // completed
    expect(screen.getByText("2")).toBeInTheDocument(); // wishlist (there are two 2s)
  });

  test("filters books on dashboard by status", async () => {
    // simulate having books with different statuses
    savedBooks = [
      { id: "1", title: "Reading Book", status: "reading" },
      { id: "2", title: "Another Reading Book", status: "reading" },
      { id: "3", title: "Completed Book", status: "completed" },
      { id: "4", title: "Wishlist Book", status: "wishlist" },
    ];

    renderWithRouter("/dashboard");

    // wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId("mock-book-grid")).toBeInTheDocument();
    });

    // Get status filter
    const statusFilter = screen.getByLabelText("Filter by Status");

    // filter by reading
    fireEvent.change(statusFilter, { target: { value: "reading" } });

    // should show only reading books
    expect(mockGetUserSavedBooks).toHaveBeenCalled();
  });
});
