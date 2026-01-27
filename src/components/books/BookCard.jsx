import BookStatusBadge from "./BookStatusBadge";
import { useBooks } from "../../context/BooksContext";
import "./BookCard.css";

function BookCard({ book }) {
  const { removeBook, updateBookStatus } = useBooks();

  return (
    <div className="book-card">
      <div className="book-cover">
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={book.title} />
        ) : (
          <div className="cover-placeholder" />
        )}
      </div>

      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="author">{book.authors?.[0] || "Unknown"}</p>

        <BookStatusBadge status={book.status} />

        <button className="remove-btn" onClick={() => removeBook(book.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default BookCard;
