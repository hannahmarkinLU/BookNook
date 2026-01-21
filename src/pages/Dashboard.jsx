// placeholder dashboard, to be updated with ui matching wireframe
import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BooksContext";
import BookCard from "../components/books/BookCard";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();
  const { getUserSavedBooks } = useBooks();

  const savedBooks = getUserSavedBooks();

  return (
    <div className="dashboard">
      <header>
        <h1>{user.username}'s Reading Dashboard</h1>
        <button onClick={logout}>Log out</button>
      </header>

      <nav>
        <Link to="/search">Add Books</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <section>
        {savedBooks.length === 0 ? (
          <p>You haven’t saved any books yet.</p>
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
