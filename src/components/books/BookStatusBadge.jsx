import "./BookStatusBadge.css";

function BookStatusBadge({ status }) {
  const labelMap = {
    wishlist: "Wishlist",
    reading: "Reading",
    completed: "Completed",
  };

  return (
    <span className={`status-badge ${status}`}>
      {labelMap[status] || "Wishlist"}
    </span>
  );
}

export default BookStatusBadge;
