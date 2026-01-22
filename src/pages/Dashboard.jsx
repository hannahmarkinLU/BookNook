import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BooksContext";
import BookCard from "../components/books/BookCard";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const { getUserSavedBooks } = useBooks();

  // prevent rendering before auth is ready
  if (authLoading) {
    return <p>Loading dashboard...</p>;
  }

  const savedBooks = getUserSavedBooks();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{user.username}'s Reading Dashboard</h1>
        <button onClick={logout}>Log out</button>
      </header>

      <nav className="dashboard-nav">
        <Link to="/search">Add Books</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <section className="dashboard-content">
        {savedBooks.length === 0 ? (
          <div className="empty-state">
            <p>You haven't saved any books yet.</p>
            <Link to="/search">Start searching →</Link>
          </div>
        ) : (
          <div className="book-grid">
            {savedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
