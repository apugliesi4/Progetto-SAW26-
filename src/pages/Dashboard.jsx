import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LogOut, Trophy, Menu, X, User } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import BookCard from "../components/BookCard";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
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

const STATUSES = ["Da leggere", "In lettura", "Letto", "In pausa", "Abbandonato"];
const FILTER_OPTIONS = ["Tutti", ...STATUSES];

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState({
    nickname: "",
    avatar: "/avatars/fantasy.png",
  });

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [library, setLibrary] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Tutti");
  const [actionError, setActionError] = useState("");

  // Caricamento profilo utente da Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            nickname: data.nickname || "",
            avatar: data.avatar || "/avatars/fantasy.png",
          });
        }
      } catch (err) {
        console.error("Errore recupero profilo:", err);
      }
    };
    loadProfile();
  }, [user]);

  // Listener real-time sulla libreria
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToLibrary(user.uid, (books) => {
      setLibrary(books);
      checkNewAchievements(user.uid, books)
        .then((newlyUnlocked) => {
          if (Array.isArray(newlyUnlocked)) {
            newlyUnlocked.forEach(notifyAchievement);
          }
        })
        .catch(console.error);
    });

    return () => unsubscribe();
  }, [user]);

  const libraryIds = useMemo(() => {
    return new Set(library.map((b) => b.externalId || b.id));
  }, [library]);

  const filteredLibrary = useMemo(() => {
    if (statusFilter === "Tutti") return library;
    return library.filter((book) => book.status === statusFilter);
  }, [library, statusFilter]);

  async function handleSearch(e) {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setSearching(true);
    setSearchError("");
    try {
      const books = await searchBooks(cleanQuery);
      setResults(books);
    } catch (err) {
      setSearchError(err.message || "Errore durante la ricerca.");
    } finally {
      setSearching(false);
    }
  }

  function handleGoHome() {
    setQuery("");
    setResults([]);
    setSearchError("");
    setActionError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAdd(book) {
    try {
      setActionError("");
      await addBookToLibrary(user.uid, book);
    } catch (err) {
      setActionError("Impossibile aggiungere il libro. Riprova.");
    }
  }

  async function handleStatusChange(bookId, newStatus) {
    try {
      setActionError("");
      await updateBookStatus(user.uid, bookId, newStatus);
    } catch (err) {
      setActionError("Errore durante l'aggiornamento dello stato.");
    }
  }

  async function handleRemove(bookId) {
    try {
      setActionError("");
      await removeBookFromLibrary(user.uid, bookId);
    } catch (err) {
      setActionError("Impossibile rimuovere il libro.");
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <button
            type="button"
            className="icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Apri menu"
            title="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <button
          type="button"
          className="header-title-button"
          onClick={handleGoHome}
          title="Torna alla home"
        >
          <h1>
            La tua ✨<i>magnifica</i>✨ raccolta di carta{" "}
            <span className="subtitle-tag">(digitale)</span>
          </h1>
        </button>

        <div className="header-right">
          <button
            type="button"
            className="icon-button"
            onClick={logout}
            aria-label="Logout"
            title="Disconnettiti"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Hamburger Drawer Menu */}
      {menuOpen && (
        <div className="menu-backdrop" onClick={() => setMenuOpen(false)}>
          <aside
            className="drawer-menu"
            onClick={(e) => e.stopPropagation()}
            aria-label="Menu laterale"
          >
            <div className="drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--gold-bright)",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/avatars/fantasy.png";
                  }}
                />
                <span style={{ fontWeight: 600, color: "var(--parchment)" }}>
                  {profile.nickname || "Lettore"}
                </span>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setMenuOpen(false)}
                aria-label="Chiudi menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="drawer-nav">
              <Link
                to="/profile"
                className="drawer-link"
                onClick={() => setMenuOpen(false)}
              >
                <User size={18} />
                <span>Profilo</span>
              </Link>

              <Link
                to="/achievements"
                className="drawer-link"
                onClick={() => setMenuOpen(false)}
              >
                <Trophy size={18} />
                <span>Traguardi</span>
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {actionError && <p className="auth-error global-banner">{actionError}</p>}

      {/* Sezione Ricerca */}
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
            {results.map((book) => {
              const bookKey = book.externalId || book.id;
              const isAlreadyInLibrary = libraryIds.has(bookKey);

              return (
                <BookCard
                  key={bookKey}
                  book={book}
                  action={
                    isAlreadyInLibrary ? (
                      <span className="already-added">Ce l'ho</span>
                    ) : (
                      <button type="button" onClick={() => handleAdd(book)}>
                        Aggiungi
                      </button>
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Sezione Libreria */}
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
                {status}
              </option>
            ))}
          </select>
        </div>

        {filteredLibrary.length === 0 ? (
          <p className="empty-state">
            {library.length === 0
              ? "Non hai ancora aggiunto libri. Cerca un titolo qui sopra per iniziare."
              : "Nessun libro corrisponde a questo filtro."}
          </p>
        ) : (
          <div className="results-grid">
            {filteredLibrary.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                action={
                  <div className="library-actions">
                    <select
                      value={book.status}
                      onChange={(e) => handleStatusChange(book.id, e.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemove(book.id)}
                    >
                      Togli
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}