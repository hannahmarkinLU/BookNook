import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BooksContext";
import Navbar from "../components/navigation/NavBar";
import BookGrid from "../components/books/BookGrid";
import "../styles/pages.css";

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { getUserSavedBooks } = useBooks();

  // state for filters
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (authLoading) {
    return <p>Loading dashboard...</p>;
  }

  const books = getUserSavedBooks() || [];

  // calculate total stats from all books
  const totalBooks = books.length;
  const totalReading = books.filter((b) => b.status === "reading").length;
  const totalCompleted = books.filter((b) => b.status === "completed").length;
  const totalWishlist = books.filter((b) => b.status === "wishlist").length;

  // filter logic
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // apply status filter
      if (statusFilter && book.status !== statusFilter) {
        return false;
      }

      // apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          book.title.toLowerCase().includes(query) ||
          (book.authors &&
            book.authors.some((author) => author.toLowerCase().includes(query)))
        );
      }

      return true;
    });
  }, [books, statusFilter, searchQuery]);

  // calculate filtered stats
  const filteredTotal = filteredBooks.length;
  const filteredReading = filteredBooks.filter(
    (b) => b.status === "reading",
  ).length;
  const filteredCompleted = filteredBooks.filter(
    (b) => b.status === "completed",
  ).length;
  const filteredWishlist = filteredBooks.filter(
    (b) => b.status === "wishlist",
  ).length;

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <h1 className="dashboard-title">{user.username}'s Reading Dashboard</h1>

        {/* show totals from all books */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <span>Total Books</span>
            <strong>{totalBooks}</strong>
          </div>

          <div className="stat-card">
            <span>Currently Reading</span>
            <strong>{totalReading}</strong>
          </div>

          <div className="stat-card">
            <span>Completed</span>
            <strong>{totalCompleted}</strong>
          </div>
        </section>

        {/* filters */}
        <section className="dashboard-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Filter by Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="wishlist">Wishlist</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* clear filters button */}
          {(statusFilter || searchQuery) && (
            <div className="filter-group">
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setStatusFilter("");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* pass filtered books to bookgrid */}
        <BookGrid books={filteredBooks} />
      </main>
    </>
  );
}

export default Dashboard;
