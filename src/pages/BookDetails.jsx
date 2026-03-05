import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navigation/NavBar";
import { sanitizeInput, sanitizeAndValidate } from "../utils/security";
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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Sanitize book data when loading
  const sanitizeBookData = useCallback((bookData) => {
    if (!bookData) return null;

    return {
      ...bookData,
      title: bookData.title ? sanitizeInput(bookData.title) : "Unknown Title",
      authors:
        bookData.authors && Array.isArray(bookData.authors)
          ? bookData.authors.map((author) => sanitizeInput(author))
          : ["Unknown Author"],
      description: bookData.description
        ? sanitizeInput(bookData.description)
        : "",
      review: bookData.review
        ? sanitizeAndValidate.bookReview(bookData.review)
        : "",
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // find the book from user's saved books
    const savedBooks = getUserSavedBooks();
    const foundBook = savedBooks.find((b) => b.id === id);

    if (foundBook) {
      // Sanitize book data before setting state
      const sanitizedBook = sanitizeBookData(foundBook);

      setBook(sanitizedBook);
      setStatus(foundBook.status || "wishlist");
      setRating(foundBook.rating || 0);
      setReview(
        foundBook.review
          ? sanitizeAndValidate.bookReview(foundBook.review)
          : "",
      );
      setLoading(false);
    } else {
      // if book not found in saved books, redirect to dashboard
      navigate("/dashboard");
    }
  }, [id, user, navigate, getUserSavedBooks, sanitizeBookData]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    // Update book with sanitized data
    updateBook(id, {
      status: newStatus,
      // Ensure other fields are sanitized
      review: sanitizeAndValidate.bookReview(review),
    });
  };

  const handleRatingClick = (stars) => {
    setRating(stars);
    updateBook(id, {
      rating: stars,
      // Ensure other fields are sanitized
      review: sanitizeAndValidate.bookReview(review),
    });
  };

  const handleReviewChange = (e) => {
    const newReview = e.target.value;

    // Validate and sanitize review input
    const sanitizedReview = sanitizeAndValidate.bookReview(newReview);

    // Check review length (optional limit)
    if (sanitizedReview.length > 5000) {
      setValidationError("Review is too long (max 5000 characters)");
      return;
    }

    setValidationError("");
    setReview(sanitizedReview);
  };

  const validateForm = () => {
    // Check review length
    if (review.length > 5000) {
      setValidationError("Review is too long (max 5000 characters)");
      return false;
    }

    // Check rating bounds
    if (rating < 0 || rating > 5) {
      setValidationError("Rating must be between 0 and 5");
      return false;
    }

    // Check status validity
    const validStatuses = ["wishlist", "reading", "completed"];
    if (!validStatuses.includes(status)) {
      setValidationError("Invalid status selected");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSaveChanges = async () => {
    if (!book || !user) return;

    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Prepare sanitized updates
      const sanitizedUpdates = {
        status,
        rating,
        review: sanitizeAndValidate.bookReview(review),
      };

      updateBook(id, sanitizedUpdates);

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

  // Auto-save review after user stops typing (with validation)
  useEffect(() => {
    if (!book || !review.trim()) return;

    const timer = setTimeout(() => {
      // Validate before auto-saving
      if (review.length <= 5000) {
        const sanitizedReview = sanitizeAndValidate.bookReview(review);
        updateBook(id, { review: sanitizedReview });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [review, id, book, updateBook]);

  // Escape key handler to close expanded description
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && descriptionExpanded) {
        setDescriptionExpanded(false);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [descriptionExpanded]);

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

  // Check description length
  const maxDescriptionLength = 300;
  const isDescriptionLong =
    book.description && book.description.length > maxDescriptionLength;
  const truncatedDescription = book.description
    ? book.description.slice(0, maxDescriptionLength) + "…"
    : "";

  // Format authors display
  const formattedAuthors =
    book.authors && Array.isArray(book.authors)
      ? book.authors.join(", ")
      : "Unknown Author";

  // Safe title access for cover placeholder
  const titleFirstChar =
    book.title && book.title.length > 0 ? book.title.charAt(0) : "B";

  return (
    <>
      <Navbar />

      <main className="book-details-page">
        {/* back button */}
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
          aria-label="Go back to dashboard"
        >
          ← Back to Dashboard
        </button>

        {/* book cover and basic info */}
        <div className="book-details-header">
          <div className="book-details-cover">
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title || "Book cover"}
                onError={(e) => {
                  // Fallback for broken images
                  e.target.style.display = "none";
                  const placeholder =
                    e.target.parentElement.querySelector(".cover-placeholder");
                  if (placeholder) {
                    placeholder.style.display = "block";
                  }
                }}
              />
            ) : null}
            <div
              className="cover-placeholder"
              style={{ display: book.thumbnail ? "none" : "block" }}
            >
              {titleFirstChar}
            </div>
          </div>

          <div className="book-details-basic">
            <h1 className="book-details-title">{book.title}</h1>
            <p className="book-details-author">by {formattedAuthors}</p>

            {/* description with show more/show less */}
            {book.description && (
              <div className="book-description">
                <h3>Description</h3>
                <div className="description-text">
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
                      aria-label={
                        descriptionExpanded
                          ? "Show less description"
                          : "Show more description"
                      }
                    >
                      {descriptionExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* details form */}
        <div className="book-details-form">
          {validationError && (
            <div className="validation-error">{validationError}</div>
          )}

          {/* reading status */}
          <div className="form-group">
            <label htmlFor="reading-status">Reading Status</label>
            <select
              id="reading-status"
              value={status}
              onChange={handleStatusChange}
              aria-label="Select reading status"
            >
              <option value="wishlist">Wishlist</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* rating */}
          <div className="form-group">
            <label htmlFor="rating-stars">Rating</label>
            <div
              className="rating-stars"
              id="rating-stars"
              role="radiogroup"
              aria-label="Book rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= rating ? "filled" : ""}`}
                  onClick={() => handleRatingClick(star)}
                  aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                  aria-pressed={star === rating}
                  role="radio"
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
            <div className="review-container">
              <textarea
                id="review"
                value={review}
                onChange={handleReviewChange}
                placeholder="Write your thoughts about this book..."
                rows="6"
                maxLength="5000"
                aria-label="Book review"
              />
            </div>
          </div>

          {/* save button */}
          <button
            className="save-changes-button"
            onClick={handleSaveChanges}
            disabled={isSaving || Boolean(validationError)}
            aria-label="Save changes to book details"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </>
  );
}

export default BookDetails;
