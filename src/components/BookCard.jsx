export default function BookCard({ book, action }) {
  return (
    <div className="book-card">
      <div className="book-cover">
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={`Copertina di ${book.title}`} />
        ) : (
          <div className="book-cover-placeholder" aria-hidden="true">
            {book.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="book-authors">
          {book.authors?.length ? book.authors.join(", ") : "Autore sconosciuto"}
        </p>
        {book.status && <span className={`book-status status-${book.status.replace(" ", "-")}`}>{book.status}</span>}
      </div>
      {action && <div className="book-actions">{action}</div>}
    </div>
  );
}
