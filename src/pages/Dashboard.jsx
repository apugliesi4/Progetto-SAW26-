import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";
import { searchBooks } from "../lib/booksApi";
import {
  addBookToLibrary,
  removeBookFromLibrary,
  subscribeToLibrary,
  updateBookStatus,
} from "../lib/library";

const STATUSES = ["da leggere", "in lettura", "letto"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToLibrary(user.uid, setLibrary);
    return unsubscribe;
  }, [user]);

  async function handleSearch(e) {
    e.preventDefault();
    setSearching(true);
    setSearchError("");
    try {
      const books = await searchBooks(query);
      setResults(books);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }

  const libraryIds = new Set(library.map((b) => b.id));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>La tua libreria</h1>
        <button className="link-button" onClick={logout}>
          Esci
        </button>
      </header>

      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Cerca un libro per titolo o autore…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={searching}>
            {searching ? "Cerco…" : "Cerca"}
          </button>
        </form>

        {searchError && <p className="auth-error">{searchError}</p>}

        {results.length > 0 && (
          <div className="results-grid">
            {results.map((book) => (
              <BookCard
                key={book.externalId}
                book={book}
                action={
                  libraryIds.has(book.externalId) ? (
                    <span className="already-added">Già in libreria</span>
                  ) : (
                    <button onClick={() => addBookToLibrary(user.uid, book)}>
                      Aggiungi
                    </button>
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="library-section">
        <h2>I tuoi libri ({library.length})</h2>
        {library.length === 0 ? (
          <p className="empty-state">
            Non hai ancora aggiunto libri. Cerca un titolo qui sopra per iniziare.
          </p>
        ) : (
          <div className="results-grid">
            {library.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                action={
                  <div className="library-actions">
                    <select
                      value={book.status}
                      onChange={(e) =>
                        updateBookStatus(user.uid, book.id, e.target.value)
                      }
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      className="remove-button"
                      onClick={() => removeBookFromLibrary(user.uid, book.id)}
                    >
                      Rimuovi
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
