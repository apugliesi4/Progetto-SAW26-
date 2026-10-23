import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";

export default function PrivateRoute({ children }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="loading-screen">Caricamento…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verifica la tua email</h1>
        <p className="auth-subtitle">
          Abbiamo inviato un link di conferma a {user.email}. Cliccalo, poi premi "Ho verificato".
        </p>
        <button
          type="submit"
          onClick={async () => {
            await user.reload();
            window.location.reload();
          }}
        >
          Ho verificato
        </button>
        <p className="auth-switch">
          <button className="link-button" onClick={() => sendEmailVerification(user)}>
            Rinvia email
          </button>{" "}
          ·{" "}
          <button className="link-button" onClick={logout}>
            Esci
          </button>
        </p>
      </div>
    </div>
  );
}

  return children;
  
}
