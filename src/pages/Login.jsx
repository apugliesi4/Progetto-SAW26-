import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
// Pagina di accesso con gestione recupero password e rinvio verifica email
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();

  // Gestisce il tentativo di login
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setUnverifiedEmail(false);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      if (err.code === "auth/unverified-email") {
        setError(err.message);
        setUnverifiedEmail(true);
      } else if (err.code === "auth/too-many-requests") {
        setError("Troppi tentativi falliti. Riprova tra qualche minuto.");
      } else {
        setError("Credenziali non valide o errore di accesso.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Re-invia il link di conferma se l'account non è ancora attivo
  async function handleResendVerification() {
    setError("");
    setInfoMessage("");
    setSubmitting(true);

    try {
      await resendVerification(email.trim(), password);
      setInfoMessage("Nuova email di verifica inviata! Controlla posta in arrivo o Spam.");
      setUnverifiedEmail(false);
    } catch (err) {
      setError(err.message || "Impossibile reinviare l'email di verifica.");
    } finally {
      setSubmitting(false);
    }
  }

  // Invia l'email di reset password tramite Firebase
  async function handleResetPassword() {
    setError("");
    setInfoMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Inserisci prima la tua email nel campo sopra per recuperare la password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfoMessage("Email inviata! Controlla la casella di posta per reimpostare la password.");
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        setError("Formato email non valido.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Troppe richieste ravvicinate. Riprova più tardi.");
      } else {
        setError("Impossibile inviare l'email di recupero. Controlla l'indirizzo inserito.");
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
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ textAlign: "right", marginTop: "4px" }}>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={submitting}
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

        {unverifiedEmail && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={submitting}
            style={{
              background: "transparent",
              border: "1px solid var(--gold-bright)",
              color: "var(--gold-bright)",
              marginTop: "8px",
              fontSize: "0.85rem",
            }}
          >
            Invia di nuovo l'email di conferma
          </button>
        )}

        {infoMessage && (
          <p style={{ color: "var(--gold-bright)", fontSize: "0.85rem", margin: "10px 0 0" }}>
            {infoMessage}
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