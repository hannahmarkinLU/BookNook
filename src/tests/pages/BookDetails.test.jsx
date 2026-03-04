import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookDetails from "../../pages/BookDetails";
import { AuthProvider } from "../../context/AuthContext";
import { BooksProvider } from "../../context/BooksContext";

// mock Navbar
vi.mock("../../components/navigation/NavBar", () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

// mock navigate function
const mockNavigate = vi.fn();

// mock useParams hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "book-123" }),
    useNavigate: () => mockNavigate,
  };
});

// mock book data
const mockBook = {
  id: "book-123",
  title: "Test Book Title",
  authors: ["Test Author"],
  description:
    "This is a long description that should be long enough to test the show more/show less functionality. It needs to be more than 300 characters to actually trigger the toggle button. Adding more text here to make sure we hit that limit. This should definitely be enough text now to exceed the 300 character limit that's set in the component.",
  thumbnail: "https://example.com/cover.jpg",
  status: "reading",
  rating: 4,
  review: "This is a great book!",
};

// create mutable mock variables
let mockGetUserSavedBooks = vi.fn().mockReturnValue([mockBook]);
let mockUpdateBook = vi.fn();

// mock useBooks hook
vi.mock("../../context/BooksContext", () => ({
  BooksProvider: ({ children }) => <div>{children}</div>,
  useBooks: () => ({
    getUserSavedBooks: mockGetUserSavedBooks,
    updateBook: mockUpdateBook,
  }),
}));

// mock user data
const mockUser = {
  id: "1",
  username: "testuser",
  email: "test@test.com",
};

describe("BookDetails", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("currentUser", JSON.stringify(mockUser));

    // Reset mocks
    mockGetUserSavedBooks = vi.fn().mockReturnValue([mockBook]);
    mockUpdateBook = vi.fn();
    mockNavigate.mockClear();

    vi.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>
            <BookDetails />
          </BooksProvider>
        </AuthProvider>
      </BrowserRouter>,
    );
  };

  test("renders book details when book is found", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    expect(screen.getByText("by Test Author")).toBeInTheDocument();
  });

  test("redirects to dashboard when book not found", async () => {
    mockGetUserSavedBooks = vi.fn().mockReturnValue([]);

    renderWithProviders();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("displays book cover image", async () => {
    renderWithProviders();

    await waitFor(() => {
      const coverImage = screen.getByAltText("Test Book Title");
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute(
        "src",
        "https://example.com/cover.jpg",
      );
    });
  });

  test("displays placeholder when no cover image", async () => {
    const bookWithoutThumbnail = {
      ...mockBook,
      thumbnail: null,
    };
    mockGetUserSavedBooks = vi.fn().mockReturnValue([bookWithoutThumbnail]);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.queryByAltText("Test Book Title")).not.toBeInTheDocument();
      const placeholder = document.querySelector(".cover-placeholder");
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveTextContent("T");
    });
  });

  test("toggles description show more/less", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    // find button by aria-label instead of text content
    const showMoreButton = screen.getByRole("button", {
      name: "Show more description",
    });
    fireEvent.click(showMoreButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Show less description" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Show less description" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Show more description" }),
      ).toBeInTheDocument();
    });
  });

  test("updates reading status when changed", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText("Select reading status");
    fireEvent.change(statusSelect, { target: { value: "completed" } });

    // the updateBook might be called with only the changed fields
    expect(mockUpdateBook).toHaveBeenCalled();

    // check that it was called with the book ID and an object containing status
    const calls = mockUpdateBook.mock.calls;
    expect(calls[0][0]).toBe("book-123");
    expect(calls[0][1]).toHaveProperty("status", "completed");
  });

  test("updates rating when stars are clicked", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    // find star buttons by their actual aria-label
    const stars = [
      screen.getByRole("radio", { name: "Rate 1 star" }),
      screen.getByRole("radio", { name: "Rate 2 stars" }),
      screen.getByRole("radio", { name: "Rate 3 stars" }),
      screen.getByRole("radio", { name: "Rate 4 stars" }),
      screen.getByRole("radio", { name: "Rate 5 stars" }),
    ];

    fireEvent.click(stars[4]); // click 5th star

    expect(mockUpdateBook).toHaveBeenCalled();
    const calls = mockUpdateBook.mock.calls;
    expect(calls[0][0]).toBe("book-123");
    expect(calls[0][1]).toHaveProperty("rating", 5);
  });

  test("save changes button updates book and shows success message", async () => {
    const mockAlert = vi.fn();
    window.alert = mockAlert;

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    // find button by its aria-label
    const saveButton = screen.getByRole("button", {
      name: "Save changes to book details",
    });

    // click the save button
    fireEvent.click(saveButton);

    // wait for the updateBook to be called
    await waitFor(
      () => {
        expect(mockUpdateBook).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    // wait a bit for the setTimeout in handleSaveChanges to complete
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(mockAlert).toHaveBeenCalledWith("Changes saved successfully!");
  });

  test("back button navigates to dashboard", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", {
      name: /go back to dashboard/i,
    });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("shows correct rating display", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    expect(screen.getByText(/\(4 stars?\)/i)).toBeInTheDocument();
  });

  test("handles book with no authors", async () => {
    const bookWithoutAuthors = {
      ...mockBook,
      authors: [],
    };
    mockGetUserSavedBooks = vi.fn().mockReturnValue([bookWithoutAuthors]);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    // check that "by" is present without an author name
    expect(screen.getByText(/by\s*$/)).toBeInTheDocument();
  });

  test("handles book with no description", async () => {
    const bookWithoutDescription = {
      ...mockBook,
      description: "",
    };
    mockGetUserSavedBooks = vi.fn().mockReturnValue([bookWithoutDescription]);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    });

    expect(screen.queryByText("Description")).not.toBeInTheDocument();
  });
});
