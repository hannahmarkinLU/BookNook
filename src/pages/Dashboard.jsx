import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BooksContext";
import Navbar from "../components/navigation/NavBar";
import BookGrid from "../components/books/BookGrid";
import "../styles/pages.css";

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { getUserSavedBooks } = useBooks();

  if (authLoading) {
    return <p>Loading dashboard...</p>;
  }

  const books = getUserSavedBooks() || [];

  const total = books.length;
  const reading = books.filter((b) => b.status === "reading").length;
  const completed = books.filter((b) => b.status === "completed").length;

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <h1 className="dashboard-title">{user.username}'s Reading Dashboard</h1>

        {/* Stats */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <span>Total Books</span>
            <strong>{total}</strong>
          </div>

          <div className="stat-card">
            <span>Currently Reading</span>
            <strong>{reading}</strong>
          </div>

          <div className="stat-card">
            <span>Completed</span>
            <strong>{completed}</strong>
          </div>
        </section>

        {/* Filters */}
        <section className="dashboard-filters">
          <div>
            <label>Filter by Status</label>
            <select>
              <option value="">All</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="to-be-read">To Be Read</option>
              <option value="did-not-finish">Did Not Finish</option>
            </select>
          </div>

          <div>
            <label>Search</label>
            <input type="text" placeholder="Search by title..." />
          </div>
        </section>

        {/* Books */}
        <BookGrid books={books} />
      </main>
    </>
  );
}

export default Dashboard;
