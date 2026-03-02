import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookCard from "../../components/books/BookCard";
import { BooksProvider } from "../../context/BooksContext";
import { AuthProvider } from "../../context/AuthContext";

const mockBook = {
  id: "1",
  title: "Test Book",
  authors: ["Test Author"],
  status: "reading",
  thumbnail: "test.jpg",
};

// mock the navigate function
const mockNavigate = vi.fn();

// mock the entire react-router-dom module
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("BookCard", () => {
  // clear mocks before each test
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renders book information correctly", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>
            <BookCard book={mockBook} />
          </BooksProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
  });

  test("navigates to book details on click", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>
            <BookCard book={mockBook} />
          </BooksProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    // click on the book card (click on the title)
    fireEvent.click(screen.getByText("Test Book"));

    // check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/book/1");
  });
});
