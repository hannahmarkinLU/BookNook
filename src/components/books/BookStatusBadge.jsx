function BookStatusBadge({ status }) {
  return (
    <span className={`status-badge ${status || "To Be Read"}`}>
      {status || "To Be Read"}
    </span>
  );
}

export default BookStatusBadge;
