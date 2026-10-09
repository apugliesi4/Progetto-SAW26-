# Bookshelf

Web app per cercare libri e tenere traccia delle proprie letture. Installabile come PWA e utilizzabile offline.

## Funzionalità

- Registrazione e login (Firebase Authentication, email/password)
- Ricerca libri tramite API REST [Open Library](https://openlibrary.org/dev/docs/api/search), senza chiave
- Libreria personale su Firestore con stati: Da leggere, In lettura, In pausa, Letto, Abbandonato
- Filtro della libreria per stato
- Traguardi stile videogioco, in una pagina dedicata, con notifica del browser allo sblocco
- PWA: installabile, con service worker personalizzato e cache offline
- Link al form di feedback in fondo alla pagina

## Stack

React + Vite · Firebase (Auth, Firestore) · Open Library API · vite-plugin-pwa (strategia `injectManifest`) · lucide-react

## Struttura

```
src/
  sw.js                    # service worker: precache + base per Firebase Cloud Messaging
  lib/                     # firebase, booksApi, library, achievements, notifications
  context/AuthContext.jsx
  components/              # BookCard, AchievementsPanel, PrivateRoute, Footer
  pages/                   # Login, Signup, Dashboard, Achievements
```

## Setup

1. Progetto su [Firebase Console](https://console.firebase.google.com): abilita Authentication (Email/Password) e Firestore.
2. Copia `.env.example` in `.env` e compila le credenziali della Web App:
```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_VAPID_KEY=
```
3. Pubblica queste regole in Firestore → Regole:
```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /libraries/{userId}/books/{bookId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
```
4. Installa e avvia:
```bash
   npm install --legacy-peer-deps
   npm run dev
```
   (`--legacy-peer-deps` serve per un conflitto di versioni tra `vite` e `vite-plugin-pwa`)

## PWA e notifiche

- Per testare installazione e offline usa la build di produzione: `npm run build && npm run preview`.
- Il service worker mette in cache l'app: se non vedi le modifiche, fai *Unregister* del service worker e *Clear site data* da DevTools → Application.
- Le notifiche dei traguardi sono locali e richiedono il permesso del browser.
- `sw.js` gestisce già i messaggi push in background, ma l'invio automatico richiederebbe Cloud Functions (piano Blaze), quindi per ora non è attivo.
- Su Codespaces, imposta la porta come *Public* per aprire l'app da altri dispositivi.

## Deploy (Firebase Hosting, piano gratuito)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting    # public directory: dist, single-page app: sì
npm run build
firebase deploy --only hosting
```