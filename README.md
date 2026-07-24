# Bookshelf

Web app per cercare libri e tenere traccia delle proprie letture.

## Stack

- **Frontend**: React + Vite
- **Autenticazione**: Firebase Authentication (email/password)
- **Database**: Firestore (libreria personale, un documento per libro, per utente)
- **API esterna (REST)**: [Google Books API](https://developers.google.com/books/docs/v1/using) — pubblica, non richiede chiave per le ricerche
- **PWA**: `vite-plugin-pwa` (manifest + service worker con caching offline, installabile)

## Struttura del progetto

```
src/
  lib/
    firebase.js     # inizializzazione Firebase (auth + firestore)
    booksApi.js      # client REST verso Google Books API
    library.js       # operazioni CRUD sulla libreria personale (Firestore)
  context/
    AuthContext.jsx  # stato utente e azioni di login/signup/logout
  components/
    PrivateRoute.jsx # protegge le route che richiedono autenticazione
    BookCard.jsx
  pages/
    Login.jsx
    Signup.jsx
    Dashboard.jsx    # ricerca libri + gestione libreria
```

## Setup

### 1. Crea un progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com) e crea un nuovo progetto.
2. Abilita **Authentication** > metodo di accesso **Email/Password**.
3. Crea un database **Firestore** (modalità produzione).
4. In "Impostazioni progetto > Le tue app", crea una Web App e copia le credenziali.
5. In Firestore, imposta le regole di sicurezza usando il contenuto di `firestore.rules` (Console Firestore > Regole).

### 2. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Compila `.env` con le credenziali copiate al punto precedente.

### 3. Installa le dipendenze e avvia

```bash
npm install
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`.

### In GitHub Codespaces

Il progetto include una configurazione `.devcontainer` che installa automaticamente le dipendenze
all'avvio del Codespace e apre in anteprima la porta 5173. Ricordati comunque di creare il file
`.env` (i Codespace non hanno accesso al tuo `.env` locale a meno che tu non lo aggiunga ai
Secrets del repository/Codespace).

## PWA

In `npm run dev` il service worker è attivo in modalità sviluppo. Per testare l'installazione
come app e il comportamento offline in modo realistico, usa la build di produzione:

```bash
npm run build
npm run preview
```

## Possibili estensioni

- Login con provider social (Google) tramite Firebase Auth
- Note personali o valutazione per ogni libro nella libreria
- Statistiche di lettura (libri letti per mese, pagine totali)
- Condivisione della libreria pubblica tramite un link
