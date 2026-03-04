import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookGrid from "../../components/books/BookGrid";
import { BooksProvider } from "../../context/BooksContext";
import { AuthProvider } from "../../context/AuthContext";

// mock the BookCard component to isolate BookGrid tests
vi.mock("../../components/books/BookCard", () => ({
  default: ({ book }) => (
    <div data-testid={`book-card-${book.id}`}>
      {book.title} - {book.authors?.[0]}
    </div>
  ),
}));

const mockBooks = [
  {
    id: "1",
    title: "Test Book 1",
    authors: ["Author One"],
    status: "reading",
  },
  {
    id: "2",
    title: "Test Book 2",
    authors: ["Author Two"],
    status: "completed",
  },
];

const emptyBooks = [];

describe("BookGrid", () => {
  // helper function to render with providers
  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>{ui}</BooksProvider>
        </AuthProvider>
      </BrowserRouter>,
    );
  };

  test("renders empty state message when no books", () => {
    renderWithProviders(<BookGrid books={emptyBooks} />);

    expect(screen.getByText("No books yet.")).toBeInTheDocument();
  });

  test("renders correct number of book cards when books provided", () => {
    renderWithProviders(<BookGrid books={mockBooks} />);

    expect(screen.getByTestId("book-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("book-card-2")).toBeInTheDocument();
    expect(screen.getByText("Test Book 1 - Author One")).toBeInTheDocument();
    expect(screen.getByText("Test Book 2 - Author Two")).toBeInTheDocument();
  });

  test("has book-grid class for CSS styling", () => {
    const { container } = renderWithProviders(<BookGrid books={mockBooks} />);

    expect(container.querySelector(".book-grid")).toBeInTheDocument();
  });

  test("handles empty books array gracefully", () => {
    renderWithProviders(<BookGrid books={[]} />);

    expect(screen.getByText("No books yet.")).toBeInTheDocument();
  });
});
