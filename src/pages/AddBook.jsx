import { useState } from "react";
import { useBooks } from "../context/BooksContext";

export default function AddBook() {
  const { searchBooks, searchResults, saveBook, loading, error } = useBooks();
  const [query, setQuery] = useState("");

  return (
    <div>
      <h1>Add a Book</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title or author"
      />

      <button onClick={() => searchBooks(query)}>Search</button>

      {loading && <p>Loading…</p>}
      {error && <p>{error}</p>}

      <ul>
        {searchResults.map((book) => (
          <li key={book.id}>
            <strong>{book.volumeInfo.title}</strong>
            <button onClick={() => saveBook(book)}>Save</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
