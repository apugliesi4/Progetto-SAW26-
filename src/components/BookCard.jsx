// Card singolo libro con copertina, dettagli e azioni opzionali
export default function BookCard({ book = {}, action }) {
  const title = book.title || "Titolo sconosciuto";
  // Sostituisce tutti gli spazi con trattini per la classe CSS
  const statusClass = book.status ? `status-${book.status.trim().replace(/\s+/g, "-")}` : "";

  return (
    <div className="book-card">
      <div className="book-cover">
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={`Copertina di ${title}`} loading="lazy" />
        ) : (
          // Placeholder con l'iniziale del titolo se manca la copertina
          <div className="book-cover-placeholder" aria-hidden="true">
            {title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="book-info">
        <h3>{title}</h3>
        <p className="book-authors">
          {book.authors?.length ? book.authors.join(", ") : "Autore sconosciuto"}
        </p>
        {book.status && (
          <span className={`book-status ${statusClass}`}>{book.status}</span>
        )}
      </div>

      {action && <div className="book-actions">{action}</div>}
    </div>
  );
}