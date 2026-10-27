import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";
import { db, auth } from "../lib/firebase";

const AVATARS = [
  { id: "fantasy", label: "Fantasy", src: "/avatars/fantasy.png" },
  { id: "scifi", label: "Sci-Fi", src: "/avatars/scifi.png" },
  { id: "thriller", label: "Thriller", src: "/avatars/thriller.png" },
  { id: "horror", label: "Horror", src: "/avatars/horror.png" },
  { id: "manga", label: "Manga", src: "/avatars/manga.png" },
  { id: "classic", label: "Classico", src: "/avatars/classic.png" },
  { id: "romance", label: "Romance", src: "/avatars/romance.png" },
  { id: "adventure", label: "Avventura", src: "/avatars/adventure.png" },
  { id: "essay", label: "Saggio", src: "/avatars/essay.png" },
];
export default function Profile() {
  const { user } = useAuth();

  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0].src);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    setNewEmail(user.email || "");

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.nickname) setNickname(data.nickname);
          if (data.avatar) setAvatar(data.avatar);
        }
      } catch (e) {
        setErr("Errore nel caricamento del profilo.");
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { nickname, avatar },
        { merge: true }
      );
      setMsg("Profilo salvato con successo.");
    } catch (e) {
      setErr("Errore durante il salvataggio del profilo.");
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await updateEmail(auth.currentUser, newEmail);
      setMsg("Email aggiornata.");
    } catch (e) {
      setErr("Errore aggiornamento email. Potrebbe servire un nuovo login.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
      setMsg("Password aggiornata.");
    } catch (e) {
      setErr("Errore aggiornamento password. Potrebbe servire un nuovo login.");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/" className="icon-button" title="Torna indietro">
            <ArrowLeft size={20} />
          </Link>
        </div>
        <h1 style={{ textAlign: "center", margin: 0 }}>Il tuo 🤩<i>stupendo</i>🤩 profilo</h1>
        <div className="header-right" style={{ width: 44 }}></div>
      </header>

      {msg && <p style={{ color: "var(--gold-bright)", textAlign: "center" }}>{msg}</p>}
      {err && <p className="auth-error" style={{ textAlign: "center" }}>{err}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Modifica Nickname e Avatar */}
        <form onSubmit={handleSaveProfile} className="auth-card" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2>Dati Personali</h2>
          <label>Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Scegli un nickname"
          />

          <label>Scegli il tuo stile di lettura</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "12px 0 20px" }}>
            {AVATARS.map((item) => (
              <div
                key={item.id}
                onClick={() => setAvatar(item.src)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 4,
                  background: avatar === item.src ? "rgba(201, 154, 62, 0.15)" : "var(--ink)",
                  border: avatar === item.src ? "2px solid var(--gold-bright)" : "1px solid rgba(242, 237, 225, 0.1)",
                }}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <span style={{ fontSize: "0.75rem", marginTop: 4, color: "var(--parchment-dim)" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <button type="submit">Salva Profilo</button>
        </form>

        {/* Modifica Email */}
        <form onSubmit={handleChangeEmail} className="auth-card" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2>Modifica Email</h2>
          <label>Nuova Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <button type="submit">Aggiorna Email</button>
        </form>

        {/* Modifica Password */}
        <form onSubmit={handleChangePassword} className="auth-card" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2>Modifica Password</h2>
          <label>Nuova Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Questa ricordatela"
            required
          />
          <button type="submit">Aggiorna Password</button>
        </form>
      </div>
    </div>
  );
}