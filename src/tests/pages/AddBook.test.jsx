import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AddBook from "../../pages/AddBook";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider, useBooks } from "../../context/BooksContext";

// mock Navbar
vi.mock("../../components/navigation/NavBar", () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

// mock search results
const mockSearchResults = [
  {
    id: "1",
    volumeInfo: {
      title: "React Book",
      authors: ["Author One"],
      description: "This is a great book about React.",
      imageLinks: {
        thumbnail: "https://example.com/cover.jpg",
      },
    },
  },
  {
    id: "2",
    volumeInfo: {
      title: "JavaScript Book",
      authors: ["Author Two"],
      description: "Learn JavaScript in depth.",
      imageLinks: {},
    },
  },
];

// create a mock implementation that can be overridden in tests
let mockSearchBooks = vi.fn().mockResolvedValue(mockSearchResults);
let mockSaveBook = vi.fn();
let mockIsBookSaved = vi.fn().mockReturnValue(false);
let mockLoading = false;
let mockError = null;
let mockSearchResultsData = mockSearchResults;

// mock the useBooks hook with a function that returns the current mock values
vi.mock("../../context/BooksContext", async () => {
  const actual = await vi.importActual("../../context/BooksContext");
  return {
    ...actual,
    useBooks: () => ({
      searchBooks: mockSearchBooks,
      searchResults: mockSearchResultsData,
      saveBook: mockSaveBook,
      isBookSaved: mockIsBookSaved,
      loading: mockLoading,
      error: mockError,
    }),
  };
});

// mock user data
const mockUser = {
  id: "1",
  username: "testuser",
  email: "test@test.com",
};

describe("AddBook", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("currentUser", JSON.stringify(mockUser));

    // reset all mocks to default values
    mockSearchBooks = vi.fn().mockResolvedValue(mockSearchResults);
    mockSaveBook = vi.fn();
    mockIsBookSaved = vi.fn().mockReturnValue(false);
    mockLoading = false;
    mockError = null;
    mockSearchResultsData = mockSearchResults;

    vi.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>
            <AddBook />
          </BooksProvider>
        </AuthProvider>
      </BrowserRouter>,
    );
  };

  test("renders search form", () => {
    renderWithProviders();

    expect(
      screen.getByPlaceholderText("Search by title or author"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByText("Add / Search Books")).toBeInTheDocument();
  });

  test("performs search when form is submitted", async () => {
    renderWithProviders();

    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "React" } });
    fireEvent.click(searchButton);

    expect(mockSearchBooks).toHaveBeenCalledWith("React");
  });

  test("displays search results", async () => {
    renderWithProviders();

    // trigger search
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "React" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("React Book")).toBeInTheDocument();
      expect(screen.getByText("Author One")).toBeInTheDocument();
      expect(screen.getByText("JavaScript Book")).toBeInTheDocument();
      expect(screen.getByText("Author Two")).toBeInTheDocument();
    });
  });

  test("allows selecting status before saving", async () => {
    renderWithProviders();

    // trigger search
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "React" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("React Book")).toBeInTheDocument();
    });

    // find status dropdown for first book
    const statusSelects = screen.getAllByRole("combobox");

    // change status to "reading"
    fireEvent.change(statusSelects[0], { target: { value: "reading" } });
    expect(statusSelects[0].value).toBe("reading");

    // change status to "completed"
    fireEvent.change(statusSelects[0], { target: { value: "completed" } });
    expect(statusSelects[0].value).toBe("completed");
  });

  test("save book button adds book to collection", async () => {
    renderWithProviders();

    // trigger search
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "React" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("React Book")).toBeInTheDocument();
    });

    // find and click "Add to My List" button
    const addButtons = screen.getAllByRole("button", {
      name: "Add to My List",
    });
    fireEvent.click(addButtons[0]);

    expect(mockSaveBook).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "1",
        title: "React Book",
        authors: ["Author One"],
        status: "wishlist", // default status
      }),
    );
  });

  test("disables add button if book is already saved", async () => {
    // override isBookSaved mock for this test
    mockIsBookSaved = vi.fn().mockImplementation((id) => id === "1");

    renderWithProviders();

    // trigger search
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "React" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("React Book")).toBeInTheDocument();
    });

    // find add buttons
    const addButtons = screen.getAllByRole("button", {
      name: /Add to My List|Added/,
    });

    // first book should be disabled with "Added" text
    expect(addButtons[0]).toBeDisabled();
    expect(addButtons[0]).toHaveTextContent("Added");

    // second book should be enabled
    expect(addButtons[1]).not.toBeDisabled();
    expect(addButtons[1]).toHaveTextContent("Add to My List");
  });

  test("shows loading state during search", async () => {
    // override loading mock for this test
    mockLoading = true;

    renderWithProviders();

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  test("shows error message when search fails", async () => {
    // override error mock for this test
    mockError = "Failed to fetch books";

    renderWithProviders();

    expect(screen.getByText("Failed to fetch books")).toBeInTheDocument();
  });

  test("displays placeholder when no book cover image", async () => {
    renderWithProviders();

    // trigger search
    const searchInput = screen.getByPlaceholderText(
      "Search by title or author",
    );
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.change(searchInput, { target: { value: "React" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      // the second book has no image, so it should show placeholder
      const placeholders = document.querySelectorAll(".cover-placeholder");
      expect(placeholders.length).toBeGreaterThan(0);
    });
  });

  test("handles empty search query", () => {
    renderWithProviders();
    const searchButton = screen.getByRole("button", { name: "Search" });
    fireEvent.click(searchButton);
    // should not crash, search function shouldn't be called with empty query
    expect(mockSearchBooks).not.toHaveBeenCalled();
  });
});
