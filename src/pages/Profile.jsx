import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

// 9 avatar tematici (griglia 3x3)
const AVATARS = [
  { id: "fantasy", label: "Fantasy", src: "/avatars/fantasy.png" },
  { id: "scifi", label: "Sci-Fi", src: "/avatars/scifi.png" },
  { id: "thriller", label: "Giallo / Noir", src: "/avatars/thriller.png" },
  { id: "horror", label: "Horror", src: "/avatars/horror.png" },
  { id: "manga", label: "Manga", src: "/avatars/manga.png" },
  { id: "classic", label: "Classico", src: "/avatars/classic.png" },
  { id: "romance", label: "Romance", src: "/avatars/romance.png" },
  { id: "adventure", label: "Avventura", src: "/avatars/adventure.png" },
  { id: "essay", label: "Saggio", src: "/avatars/essay.png" },
];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dati profilo
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("/avatars/fantasy.png");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Stati interfaccia
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingSecurity, setUpdatingSecurity] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Stato eliminazione account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Caricamento dati da Firestore
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNickname(data.nickname || "");
          setSelectedAvatar(data.avatar || "/avatars/fantasy.png");
        }
        setNewEmail(user.email || "");
      } catch (err) {
        setErrorMsg("Errore nel recupero delle informazioni del profilo.");
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  // Salva Nickname e Avatar
  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg("");
    setErrorMsg("");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        nickname: nickname.trim(),
        avatar: selectedAvatar,
      });
      setProfileMsg("Profilo aggiornato con successo!");
    } catch (err) {
      setErrorMsg("Impossibile salvare il profilo. Riprova.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Aggiorna Email o Password
  async function handleUpdateSecurity(e) {
    e.preventDefault();
    if (!user) return;
    setUpdatingSecurity(true);
    setSecurityMsg("");
    setErrorMsg("");

    try {
      if (newEmail && newEmail !== user.email) {
        await updateEmail(user, newEmail);
      }
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error("La password deve contenere almeno 6 caratteri.");
        }
        await updatePassword(user, newPassword);
        setNewPassword("");
      }
      setSecurityMsg("Credenziali aggiornate correttamente.");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setErrorMsg("Operazione sensibile: effettua nuovamente l'accesso e riprova.");
      } else {
        setErrorMsg(err.message || "Errore durante l'aggiornamento della sicurezza.");
      }
    } finally {
      setUpdatingSecurity(false);
    }
  }

  // Invio email di reset password
  async function handleSendReset() {
    if (!user?.email) return;
    setSecurityMsg("");
    setErrorMsg("");

    try {
      await sendPasswordResetEmail(auth, user.email);
      setSecurityMsg("Email di reimpostazione inviata!");
    } catch (err) {
      setErrorMsg("Errore durante l'invio dell'email di reset.");
    }
  }

  // Eliminazione definitiva dell'account
  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleting(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // 1. Pulizia a cascata dei libri
      const booksRef = collection(db, "users", currentUser.uid, "books");
      const snapshot = await getDocs(booksRef);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((bookDoc) => batch.delete(bookDoc.ref));
        await batch.commit();
      }

      // 2. Eliminazione documento utente
      await deleteDoc(doc(db, "users", currentUser.uid));

      // 3. Eliminazione utente Auth
      await deleteUser(currentUser);

      navigate("/login");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setDeleteError(
          "Per sicurezza devi aver effettuato l'accesso di recente. Esci, rifai il login e riprova."
        );
      } else {
        setDeleteError("Impossibile eliminare l'account. Riprova più tardi.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <Link to="/" className="icon-button" title="Torna indietro">
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ textAlign: "center", width: "100%" }}>
          Il tuo 🤩<i>stupendo</i>🤩 profilo 
        </h1>
        <div style={{ width: 20 }} />
      </header>

      <main style={{ maxWidth: 600, width: "100%", margin: "0 auto", padding: "16px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--parchment-dim)", marginTop: 40 }}>
            Caricamento profilo…
          </p>
        ) : (
          <div className="auth-card" style={{ maxWidth: "100%", margin: "0" }}>
            {errorMsg && <p className="auth-error">{errorMsg}</p>}
            {profileMsg && (
              <p style={{ color: "var(--gold-bright)", fontSize: "0.9rem", margin: "8px 0" }}>
                {profileMsg}
              </p>
            )}

            {/* 1. NICKNAME E AVATAR */}
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="nickname" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Nickname
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Il tuo nome da lettore"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Scegli il tuo genere / Avatar
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginTop: 6,
                  }}
                >
                  {AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.src;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.src)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "10px 6px",
                          background: isSelected ? "rgba(224, 181, 99, 0.15)" : "#231d33",
                          border: isSelected ? "2px solid var(--gold-bright)" : "1px solid rgba(242, 237, 225, 0.1)",
                          borderRadius: 8,
                          cursor: "pointer",
                          color: isSelected ? "var(--gold-bright)" : "var(--parchment)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <img
                          src={av.src}
                          alt={av.label}
                          style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 6 }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span style={{ fontSize: "0.8rem", fontWeight: isSelected ? 600 : 400 }}>
                          {av.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={savingProfile} style={{ marginTop: 6 }}>
                {savingProfile ? "Salvataggio…" : "Salva Profilo"}
              </button>
            </form>

            <hr style={{ borderColor: "rgba(242, 237, 225, 0.1)", margin: "32px 0" }} />

            {/* 2. GESTIONE SICUREZZA */}
            <h2 style={{ margin: "0 0 6px" }}>Sicurezza 🗝️</h2>
            {securityMsg && (
              <p style={{ color: "var(--gold-bright)", fontSize: "0.9rem", margin: "8px 0" }}>
                {securityMsg}
              </p>
            )}

            <form onSubmit={handleUpdateSecurity} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="sec-email" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Modifica Email
                </label>
                <input
                  id="sec-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="sec-pass" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Nuova Password
                </label>
                <input
                  id="sec-pass"
                  type="password"
                  placeholder="Questa ricordatela!"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ textAlign: "left", marginTop: 2 }}>
                <button
                  type="button"
                  onClick={handleSendReset}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold-bright)",
                    textDecoration: "underline",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Invia email di reset password
                </button>
              </div>

              <button type="submit" disabled={updatingSecurity} style={{ marginTop: 10 }}>
                {updatingSecurity ? "Aggiornamento…" : "Aggiorna Credenziali"}
              </button>
            </form>

            <hr style={{ borderColor: "rgba(242, 237, 225, 0.1)", margin: "32px 0" }} />

            {/* 3. ZONA PERICOLO / ELIMINAZIONE ACCOUNT */}
            <section
              style={{
                padding: 16,
                border: "1px solid rgba(220, 53, 69, 0.3)",
                borderRadius: 8,
                background: "rgba(220, 53, 69, 0.05)",
              }}
            >
              <h3 style={{ color: "#ff6b6b", margin: "0 0 8px", fontSize: "1.05rem" }}>
                Brucia la tessera 🔥
              </h3>
              <p style={{ color: "var(--parchment-dim)", fontSize: "0.85rem", lineHeight: 1.5, margin: "0 0 12px" }}>
                Vuoi riprenderti la tua anima? Questa azione cancellerà definitivamente il tuo scaffale, i tuoi libri e tutti i tuoi progressi.
              </p>
              <h4 style={{ color: "#ff6b6b", margin: "0 0 16px", fontSize: "0.95rem" }}>
                Non si torna indietro!
              </h4>

              {deleteError && (
                <p className="auth-error" style={{ marginBottom: 14 }}>
                  {deleteError}
                </p>
              )}

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    background: "transparent",
                    color: "#ff6b6b",
                    border: "1px solid #ff6b6b",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Elimina account definitivamente
                </button>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.85rem", color: "#ff6b6b", fontWeight: 600 }}>
                    Confermi l'eliminazione?
                  </span>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDeleteAccount}
                    style={{
                      background: "#dc3545",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    {deleting ? "Cancellazione in corso…" : "Sì, distruggi tutto"}
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      background: "transparent",
                      color: "var(--parchment-dim)",
                      border: "1px solid var(--parchment-dim)",
                      padding: "8px 14px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Ci ho ripensato
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}