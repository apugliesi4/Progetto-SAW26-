import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Funzione per gestire la registrazione dell'utente
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }

    setSubmitting(true);
    try {
      // Creazione account Firebase Auth
      const userCredential = await signup(email, password);
      const user = userCredential?.user;

      // Inizializzazione profilo su Firestore con avatar e fallback nickname
      if (user?.uid) {
        await setDoc(doc(db, "users", user.uid), {
          nickname: nickname.trim() || email.split("@")[0],
          // Imposta un avatar di default se l'utente non ne sceglie uno
          avatar: "/avatars/fantasy.png",
          createdAt: new Date().toISOString(),
        });
      }

      navigate("/");
    } catch (err) {
      setError("Registrazione non riuscita. L'email potrebbe essere già in uso.");
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Cedi la tua anima👹</h1>
        <p className="auth-subtitle">Inizia a costruire 🎆<i>meravigliosa</i>🎆 la tua libreria</p>

        <label htmlFor="nickname">Nickname (opzionale)</label>
        <input
          id="nickname"
          type="text"
          placeholder="Come vuoi farti chiamare?"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creazione in corso…" : "Registrati"}
        </button>

        <p className="auth-switch">
          Abbiamo già i tuoi dati? <Link to="/login">Entra </Link>
        </p>
      </form>
    </div>
  );
}