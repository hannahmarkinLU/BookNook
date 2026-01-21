import { useState } from "react";
import { useBooks } from "../../context/BooksContext";

function Search() {
  const [input, setInput] = useState("");
  const { books, loading, error, searchBooks } = useBooks();

  const handleSubmit = (e) => {
    e.preventDefault();
    searchBooks(input);
  };

  return (
    <div>
      <h1>Search Books</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading books...</p>}
      {error && <p>{error}</p>}

      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.volumeInfo.title}</strong>
            {book.volumeInfo.authors && (
              <p>{book.volumeInfo.authors.join(", ")}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;
