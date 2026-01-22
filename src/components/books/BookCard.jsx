import { useBooks } from "../../context/BooksContext";

function BookCard({ book }) {
  const { removeBook, isBookSaved } = useBooks();

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3>{book.title}</h3>
        {isBookSaved(book.id) && (
          <button onClick={() => removeBook(book.id)}>Remove</button>
        )}
      </div>
      <p className="book-authors">
        By: {book.authors?.join(", ") || "Unknown"}
      </p>
      {book.thumbnail && (
        <img src={book.thumbnail} alt={book.title} className="book-thumbnail" />
      )}
      <p className="book-description">
        {book.description?.substring(0, 150)}...
      </p>
    </div>
  );
}

export default BookCard;
