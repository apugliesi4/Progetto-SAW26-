import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Imposta l'utente nello stato solo se ha confermato l'email
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Registrazione: crea l'account, invia l'email ed espelle subito l'utente
  const signup = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Invia link di verifica
    await sendEmailVerification(credential.user);
    
    // Disconnetti immediatamente per impedire l'accesso automatico
    await signOut(auth);
    
    return credential;
  };

  // Login: controlla se l'email è stata confermata prima di consentire l'accesso
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Se l'utente non ha cliccato sul link di verifica nella mail
    if (!credential.user.emailVerified) {
      await signOut(auth);
      const error = new Error("Devi confermare la tua email prima di accedere. Controlla la posta in arrivo o lo Spam.");
      error.code = "auth/unverified-email";
      throw error;
    }

    return credential;
  };

  // Funzione per consentire all'utente di richiedere un nuovo link se non l'ha ricevuto
  const resendVerification = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user);
      await signOut(auth);
    } else {
      await signOut(auth);
      throw new Error("Questo indirizzo email risulta già verificato. Puoi effettuare il login.");
    }
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro un AuthProvider");
  }
  return context;
}