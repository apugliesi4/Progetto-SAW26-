# Bookshelf — Progressive Web Application per il Tracciamento delle Letture

**Corso:** Sviluppo di Applicazioni Web (SAW)  
**Anno Accademico:** 2025/26
**Studente:** Pugliesi Alessio - 617937
---

## Descrizione del Progetto

**Bookshelf** (`Libreria-SAW`) è una Single Page Application (SPA) sviluppata secondo gli standard **Progressive Web App (PWA)** per la ricerca, la catalogazione e il monitoraggio delle letture personali. L'applicazione adotta un'architettura client-server disaccoppiata basata su **BaaS (Backend-as-a-Service)** e API RESTful esterne, garantendo fruibilità responsive su desktop e mobile, installabilità su dispositivo e supporto al funzionamento offline con pagina di fallback dedicata (`offline.html`).

---

## Requisiti e Funzionalità Implementate

- **Gestione Autenticazione, Profilo e Sicurezza:**
  - Registrazione con validazione degli input e inizializzazione del profilo utente su Firestore (nickname e selezione tra 9 avatar tematici).
  - Verifica obbligatoria dell'indirizzo e-mail tramite Firebase Authentication prima di consentire l'accesso alle rotte protette (con invalidazione dell'auto-login post-registrazione, blocco degli account non verificati e reinvio asincrono dell'e-mail di conferma).
  - Recupero password tramite invio di link di reset (`sendPasswordResetEmail`), aggiornamento credenziali e cancellazione definitiva dell'account con pulizia a cascata dei dati su Firestore (`writeBatch`).
  - Controllo degli accessi lato database tramite **Firestore Security Rules** dedicate per profili (`users/{uid}`) e librerie (`libraries/{uid}/books/{bookId}`).

- **Integrazione API Esterna:**
  - Ricerca asincrona via `fetch` sugli endpoint REST di [Open Library Search API](https://openlibrary.org/dev/docs/api/search), con gestione della cancellazione delle richieste concorrenti tramite `AbortController` e fallback grafico per le copertine mancanti.

- **Persistenza Dati Real-Time:**
  - Catalogazione personale sincronizzata in tempo reale su Cloud Firestore (`onSnapshot`), con aggiornamento dinamico e filtraggio per stati di lettura (`Da leggere`, `In lettura`, `In pausa`, `Letto`, `Abbandonato`).

- **Gamification & Feedback:**
  - Motore di valutazione traguardi lato client con sblocco persistente su Firestore e notifiche tramite **Web Notifications API** native del browser.
  - Sezione dedicata alla raccolta feedback degli utenti tramite modulo esterno collegato nel footer.

- **PWA, Caching e Service Worker:**
  - Precaching degli asset statici e dell'app shell tramite Workbox (`injectManifest`), routing SPA offline con fallback su `offline.html` e predisposizione per notifiche push in background tramite **Firebase Cloud Messaging (FCM)**.
  - Ottimizzazione delle policy `Cache-Control` e degli header di sicurezza su Firebase Hosting (`firebase.json`).

---

## Architettura Software e Stack Tecnologico

- **Frontend Core:** React 19, React Router DOM, Vite
- **UI & Styling:** CSS custom con variabili di tema, Lucide React (iconset vettoriale)
- **Backend-as-a-Service (BaaS):**
  - **Firebase Authentication:** gestione identità, verifica e-mail e reset password
  - **Cloud Firestore:** database NoSQL real-time protetto da Security Rules
  - **Firebase Hosting:** distribuzione statica con rewrite SPA e gestione cache
- **PWA & Service Worker:** `vite-plugin-pwa`, Workbox (`workbox-precaching`, `workbox-routing`, `workbox-core`), Firebase Cloud Messaging (`firebase/messaging/sw`)