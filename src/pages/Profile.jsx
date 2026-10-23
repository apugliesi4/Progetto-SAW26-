import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";
import { db, auth } from "../lib/firebase";

const AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
];

export default function Profile() {
  const { user } = useAuth();

  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    setNewEmail(user.email || "");
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.nickname) setNickname(data.nickname);
        if (data.avatar) setAvatar(data.avatar);
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
        <Link to="/" className="icon-button" title="Torna indietro">
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ textAlign: "center", width: "100%" }}>Il tuo Profilo</h1>
        <div style={{ width: 20 }} />
      </header>

      {msg && <p style={{ color: "var(--gold-bright)", textAlign: "center" }}>{msg}</p>}
      {err && <p className="auth-error" style={{ textAlign: "center" }}>{err}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <form onSubmit={handleSaveProfile} className="auth-card" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2>Dati Personali</h2>
          <label>Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Scegli un nickname"
          />

          <label>Avatar</label>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            {AVATARS.map((av) => (
              <img
                key={av}
                src={av}
                alt="Avatar"
                onClick={() => setAvatar(av)}
                style={{
                  width: 50,
                  height: 50,
                  cursor: "pointer",
                  borderRadius: "50%",
                  border: avatar === av ? "2px solid var(--gold-bright)" : "2px solid transparent",
                }}
              />
            ))}
          </div>

          <button type="submit">Salva Profilo</button>
        </form>

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

        <form onSubmit={handleChangePassword} className="auth-card" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2>Modifica Password</h2>
          <label>Nuova Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Questa ricordatela, eh!"
            required
          />
          <button type="submit">Aggiorna Password</button>
        </form>
      </div>
    </div>
  );
}