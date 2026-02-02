import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBooks } from "../context/BooksContext";
import Navbar from "../components/navigation/NavBar";
import "../styles/pages.css";

function Profile() {
  const { user, logout, deleteAccount } = useAuth();
  const { getUserSavedBooks } = useBooks();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const books = getUserSavedBooks() || [];

  // Calculate statistics
  const totalBooks = books.length;
  const reading = books.filter((b) => b.status === "reading").length;
  const completed = books.filter((b) => b.status === "completed").length;
  const wishlist = books.filter((b) => b.status === "wishlist").length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      alert("Failed to delete account. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <h1 className="profile-title">Profile</h1>

        {/* User Info Section */}
        <section className="profile-info">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-details">
              <h2 className="profile-username">{user.username}</h2>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
            <button
              className="delete-button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h3>Delete Account</h3>
              <p>
                Are you sure you want to delete your account? This action cannot
                be undone. All your saved books will be permanently deleted.
              </p>
              <div className="delete-modal-actions">
                <button
                  className="cancel-button"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="confirm-delete-button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="divider"></div>

        {/* Reading Statistics Section */}
        <section className="reading-stats">
          <h2>Reading Statistics</h2>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Total Books</div>
              <div className="stat-value">{totalBooks}</div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Currently Reading</div>
              <div className="stat-value">{reading}</div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completed}</div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Want to Read</div>
              <div className="stat-value">{wishlist}</div>
            </div>
          </div>
        </section>

        {/* Additional Stats (Optional) */}
        <section className="additional-stats">
          <h3>Additional Statistics</h3>

          <div className="additional-stats-grid">
            <div className="additional-stat">
              <span>Books with Reviews:</span>
              <strong>
                {books.filter((b) => b.review && b.review.trim() !== "").length}
              </strong>
            </div>

            <div className="additional-stat">
              <span>Books with Ratings:</span>
              <strong>
                {books.filter((b) => b.rating && b.rating > 0).length}
              </strong>
            </div>

            <div className="additional-stat">
              <span>Average Rating:</span>
              <strong>
                {books.filter((b) => b.rating && b.rating > 0).length > 0
                  ? (
                      books
                        .filter((b) => b.rating && b.rating > 0)
                        .reduce((sum, b) => sum + b.rating, 0) /
                      books.filter((b) => b.rating && b.rating > 0).length
                    ).toFixed(1)
                  : "N/A"}
              </strong>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Profile;
