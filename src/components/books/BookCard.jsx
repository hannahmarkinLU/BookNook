import { useNavigate } from "react-router-dom";
import BookStatusBadge from "./BookStatusBadge";
import { useBooks } from "../../context/BooksContext";
import { FiTrash2 } from "react-icons/fi";
import "./BookCard.css";

function BookCard({ book }) {
  const navigate = useNavigate();
  const { removeBook } = useBooks();

  const handleBookClick = () => {
    navigate(`/book/${book.id}`);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation(); // prevent navigating when clicking remove
    removeBook(book.id);
  };

  return (
    <div className="book-card" onClick={handleBookClick}>
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

        {/* pushes the footer to the bottom */}
        <div className="spacer"></div>

        <div className="book-footer">
          <BookStatusBadge status={book.status} />
          <button
            className="remove-btn"
            onClick={handleRemoveClick}
            aria-label="Remove book"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
