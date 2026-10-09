import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { House, LogOut, Trophy } from "lucide-react";
import { searchBooks } from "../lib/booksApi";
import {
  addBookToLibrary,
  removeBookFromLibrary,
  subscribeToLibrary,
  updateBookStatus,
} from "../lib/library";
import {
  checkNewAchievements,
  notifyAchievement,
} from "../lib/achievements";
import Footer from "../components/Footer";

const STATUSES = ["Da leggere", "In lettura", "Letto", "In pausa", "Abbandonato"];
const FILTER_OPTIONS = ["Tutti", ...STATUSES];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [library, setLibrary] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Tutti");

useEffect(() => {
  if (!user) return;
  const unsubscribe = subscribeToLibrary(user.uid, (books) => {
  setLibrary(books);
  checkNewAchievements(user.uid, books).then((newly) => {
    newly.forEach(notifyAchievement);
    });
  });
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

  function handleGoHome() {
  setQuery("");
  setResults([]);
  setSearchError("");
}

  const libraryIds = new Set(library.map((b) => b.id));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>La tua  ✨<i>magnifica</i>✨  raccolta di carta <span style={{fontSize: "10px"}}>(digitale)</span> </h1>
      <div className="header-actions">
        <button className="icon-button" onClick={handleGoHome}>
          <House size={20} />
        </button>

        <Link className="icon-button" to="/achievements" title="Traguardi">
          <Trophy size={20} />
        </Link>  
        
        <button className="icon-button" onClick={logout}>
          <LogOut size={20} />
        </button>
      </div>
      </header>

    <section className="search-section">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Inserisci titolo o autore"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={searching}>
          {searching ? "Cercando…" : "Cerca"}
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
                    <span className="already-added">Ce l'ho</span>
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
        <div className="library-header">
          <h2>Libri posseduti ({library.length})</h2>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "Tutti" ? "Tutti" : status}
              </option>
            ))}
          </select>
        </div>

        {(() => {
          const filteredLibrary =
            statusFilter === "Tutti"
              ? library
              : library.filter((book) => book.status === statusFilter);

          if (filteredLibrary.length === 0) {
            return (
              <p className="empty-state">
                {library.length === 0
                  ? "Non hai ancora aggiunto libri. Cerca un titolo qui sopra per iniziare." : "Nessun libro corrisponde a questo filtro."}
              </p>
            );
          }

          return (
            <div className="results-grid">
              {filteredLibrary.map((book) => (
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
                        Togli
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          );
        })()}
      </section>
    <Footer />
   </div>
  )
}