import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Credenziali non valide o errore di accesso.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    setResetMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Inserisci prima la tua email nel campo sopra per recuperare la password.");
      return;
    }

    try {
      // Invia email con link di reset gestito da Firebase
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetMessage("Email inviata! Controlla la casella di posta per reimpostare la password.");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("Nessun account trovato con questo indirizzo email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Formato email non valido.");
      } else {
        setError("Impossibile inviare l'email di recupero. Riprova più tardi.");
      }
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Accedi alla tua libreria 📖</h1>
        <p className="auth-subtitle">Riapri il tuo scaffale personale</p>

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

        <div style={{ textAlign: "right", marginTop: "4px" }}>
          <button
            type="button"
            onClick={handleResetPassword}
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
            Non ricordo la password
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {resetMessage && (
          <p style={{ color: "var(--gold-bright)", fontSize: "0.85rem", margin: "10px 0 0" }}>
            {resetMessage}
          </p>
        )}

        <button type="submit" disabled={submitting} style={{ marginTop: "12px" }}>
          {submitting ? "Accesso in corso…" : "Entro"}
        </button>

        <p className="auth-switch">
          Non hai ancora ceduto l'anima? <Link to="/signup">Rimedia subito</Link>
        </p>
      </form>
    </div>
  );
}