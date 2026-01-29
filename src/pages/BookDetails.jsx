import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navigation/NavBar";
import "../styles/pages.css";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserSavedBooks, updateBook } = useBooks();

  const [book, setBook] = useState(null);
  const [status, setStatus] = useState("wishlist");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false); // Add this state

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // find the book from user's saved books
    const savedBooks = getUserSavedBooks();
    const foundBook = savedBooks.find((b) => b.id === id);

    if (foundBook) {
      setBook(foundBook);
      setStatus(foundBook.status || "wishlist");
      setRating(foundBook.rating || 0);
      setReview(foundBook.review || "");
      setLoading(false);
    } else {
      // if book not found in saved books, redirect to dashboard
      navigate("/dashboard");
    }
  }, [id, user, navigate, getUserSavedBooks]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    updateBook(id, { status: newStatus });
  };

  const handleRatingClick = (stars) => {
    setRating(stars);
    updateBook(id, { rating: stars });
  };

  const handleReviewChange = (e) => {
    const newReview = e.target.value;
    setReview(newReview);
  };

  const handleSaveChanges = async () => {
    if (!book || !user) return;

    setIsSaving(true);

    try {
      updateBook(id, {
        status,
        rating,
        review,
      });

      setTimeout(() => {
        setIsSaving(false);
        alert("Changes saved successfully!");
      }, 300);
    } catch (error) {
      console.error("Failed to save changes:", error);
      setIsSaving(false);
      alert("Failed to save changes. Please try again.");
    }
  };

  const toggleDescription = () => {
    setDescriptionExpanded(!descriptionExpanded);
  };

  // auto-save review after user stops typing
  useEffect(() => {
    if (!book || !review.trim()) return;

    const timer = setTimeout(() => {
      updateBook(id, { review });
    }, 1000);

    return () => clearTimeout(timer);
  }, [review, id, book, updateBook]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="book-details-page">
          <p>Loading book details...</p>
        </main>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Navbar />
        <main className="book-details-page">
          <p>Book not found</p>
          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </main>
      </>
    );
  }

  // check description length
  const maxDescriptionLength = 300;
  const isDescriptionLong =
    book.description && book.description.length > maxDescriptionLength;
  const truncatedDescription = book.description
    ? book.description.slice(0, maxDescriptionLength) + "…"
    : "";

  return (
    <>
      <Navbar />

      <main className="book-details-page">
        {/* back button */}
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        {/* book cover and basic info */}
        <div className="book-details-header">
          <div className="book-details-cover">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} />
            ) : (
              <div className="cover-placeholder" />
            )}
          </div>

          <div className="book-details-basic">
            <h1 className="book-details-title">{book.title}</h1>
            <p className="book-details-author">
              by {book.authors?.join(", ") || "Unknown Author"}
            </p>

            {/* description with show more/show less */}
            {book.description && (
              <div className="book-description">
                <h3>Description</h3>
                <p className="description-text">
                  {descriptionExpanded
                    ? book.description
                    : isDescriptionLong
                      ? truncatedDescription
                      : book.description}

                  {isDescriptionLong && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={toggleDescription}
                    >
                      {descriptionExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* details form */}
        <div className="book-details-form">
          {/* reading status */}
          <div className="form-group">
            <label htmlFor="reading-status">Reading Status</label>
            <select
              id="reading-status"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="wishlist">Wishlist</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* rating */}
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= rating ? "filled" : ""}`}
                  onClick={() => handleRatingClick(star)}
                  aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
              <span className="rating-value">
                {rating > 0
                  ? `(${rating} star${rating !== 1 ? "s" : ""})`
                  : "No rating yet"}
              </span>
            </div>
          </div>

          {/* review */}
          <div className="form-group">
            <label htmlFor="review">Review</label>
            <textarea
              id="review"
              value={review}
              onChange={handleReviewChange}
              placeholder="Write your thoughts about this book..."
              rows="6"
            />
          </div>

          {/* save button */}
          <button
            className="save-changes-button"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </>
  );
}

export default BookDetails;
