import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BooksProvider, useBooks } from "../../context/BooksContext";
import { AuthProvider } from "../../context/AuthContext";

// test component to access context
function TestBooksConsumer() {
  const {
    saveBook,
    removeBook,
    updateBook,
    getUserSavedBooks,
    searchBooks,
    searchResults,
  } = useBooks();

  return (
    <div>
      <div data-testid="books-count">{getUserSavedBooks().length}</div>
      <button onClick={() => saveBook({ id: "1", title: "Test Book" })}>
        Save Book
      </button>
      <button onClick={() => removeBook("1")}>Remove Book</button>
      <button onClick={() => updateBook("1", { status: "reading" })}>
        Update Status
      </button>
      <button onClick={() => searchBooks("react")}>Search</button>
      <div data-testid="search-count">{searchResults.length}</div>
    </div>
  );
}

describe("BooksContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves book for authenticated user", async () => {
    // set authenticated user
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ id: "1", username: "test" }),
    );

    render(
      <AuthProvider>
        <BooksProvider>
          <TestBooksConsumer />
        </BooksProvider>
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("Save Book"));

    await waitFor(() => {
      expect(screen.getByTestId("books-count")).toHaveTextContent("1");
    });
  });

  test("prevents saving book for unauthenticated user", async () => {
    render(
      <AuthProvider>
        <BooksProvider>
          <TestBooksConsumer />
        </BooksProvider>
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("Save Book"));

    expect(screen.getByTestId("books-count")).toHaveTextContent("0");
  });
});
