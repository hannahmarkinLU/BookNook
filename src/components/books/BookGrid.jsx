import BookCard from "./BookCard";

function BookGrid({ books }) {
  if (books.length === 0) {
    return <p className="empty-state">No books yet.</p>;
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default BookGrid;
