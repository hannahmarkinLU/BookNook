import { useState } from "react";
import { useBooks } from "../context/BooksContext";
import Navbar from "../components/navigation/NavBar";
import "../styles/pages.css";

export default function AddBook() {
  const { searchBooks, searchResults, saveBook, isBookSaved, loading, error } =
    useBooks();

  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState({});
  const [expanded, setExpanded] = useState({});

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) searchBooks(query);
  };

  const handleStatusChange = (bookId, status) => {
    setStatuses((prev) => ({ ...prev, [bookId]: status }));
  };

  const toggleDescription = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Navbar />

      <main className="add-book-page">
        <h1 className="page-title">Add / Search Books</h1>

        {/* search */}
        <form className="search-card" onSubmit={handleSearch}>
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author"
          />
          <button className="primary-button" type="submit">
            Search
          </button>
        </form>

        {loading && <p className="status-text">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="search-results">
          {searchResults.map((book) => {
            const info = book.volumeInfo;
            const saved = isBookSaved(book.id);
            const status = statuses[book.id] || "wishlist";

            return (
              <div className="search-result-card" key={book.id}>
                {/* cover */}
                <div className="result-cover">
                  {info.imageLinks?.thumbnail ? (
                    <img src={info.imageLinks.thumbnail} alt={info.title} />
                  ) : (
                    <div className="cover-placeholder" />
                  )}
                </div>
                {/* info */}
                <div className="result-info">
                  <h3>{info.title}</h3>
                  <p className="author">
                    {info.authors?.[0] || "Unknown author"}
                  </p>

                  {/* expandable/collapsable desciption */}
                  {info.description && (
                    <p className="description">
                      {expanded[book.id]
                        ? info.description
                        : `${info.description.slice(0, 200)}…`}

                      {info.description.length > 200 && (
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => toggleDescription(book.id)}
                        >
                          {expanded[book.id] ? "Show less" : "Show more"}
                        </button>
                      )}
                    </p>
                  )}
                </div>
                {/* actions */}
                <div className="result-action">
                  <select
                    value={status}
                    onChange={(e) =>
                      handleStatusChange(book.id, e.target.value)
                    }
                    disabled={saved}
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    className="secondary-button"
                    disabled={saved}
                    onClick={() =>
                      saveBook({
                        id: book.id,
                        title: info.title,
                        authors: info.authors,
                        imageLinks: info.imageLinks,
                        description: info.description,
                        status,
                      })
                    }
                  >
                    {saved ? "Added" : "Add to My List"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
