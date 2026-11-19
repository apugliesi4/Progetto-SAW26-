import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Protegge le rotte private: se non c'è un utente verificato, rimanda al login
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Caricamento…</div>;
  }

  // AuthContext imposta "user" solo se autenticato e con email verificata
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;

}