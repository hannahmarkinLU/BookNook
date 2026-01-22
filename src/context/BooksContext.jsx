import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const BooksContext = createContext();

export function BooksProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [searchResults, setSearchResults] = useState([]);
  const [userSavedBooks, setUserSavedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // load saved books when user changes
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setUserSavedBooks([]);
      return;
    }

    const allSavedBooks =
      JSON.parse(localStorage.getItem("savedBooksByUser")) || {};

    setUserSavedBooks(allSavedBooks[user.username] || []);
  }, [user, authLoading]);

  // persist books for the current user
  const persistUserBooks = (updatedBooks) => {
    if (!user) return;

    const allSavedBooks =
      JSON.parse(localStorage.getItem("savedBooksByUser")) || {};

    allSavedBooks[user.username] = updatedBooks;

    localStorage.setItem("savedBooksByUser", JSON.stringify(allSavedBooks));
  };

  // --- API SEARCH ---
  const searchBooks = async (query) => {
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query,
        )}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVED BOOKS ---
  const saveBook = (book) => {
    if (!user) return;

    const normalized = {
      id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || [],
      description: book.volumeInfo.description || "",
      thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
    };

    setUserSavedBooks((prev) => {
      if (prev.some((b) => b.id === normalized.id)) {
        return prev;
      }

      const updated = [...prev, normalized];
      persistUserBooks(updated);
      return updated;
    });
  };

  const removeBook = (bookId) => {
    if (!user) return;

    setUserSavedBooks((prev) => {
      const updated = prev.filter((b) => b.id !== bookId);
      persistUserBooks(updated);
      return updated;
    });
  };

  const isBookSaved = (bookId) => {
    if (!user) return false;
    return userSavedBooks.some((b) => b.id === bookId);
  };

  const getUserSavedBooks = () => {
    return user ? userSavedBooks : [];
  };

  const getAllUserBooks = () => {
    return JSON.parse(localStorage.getItem("savedBooksByUser")) || {};
  };

  return (
    <BooksContext.Provider
      value={{
        // API
        searchResults,
        searchBooks,
        loading,
        error,

        // saved books
        saveBook,
        removeBook,
        isBookSaved,
        getUserSavedBooks,
        getAllUserBooks,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export const useBooks = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooks must be used within BooksProvider");
  }
  return context;
};
