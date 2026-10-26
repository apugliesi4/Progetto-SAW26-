# Bookshelf — Progressive Web Application per il Tracciamento delle Letture

**Corso:** Sviluppo Applicazioni Web (SAW)  
**Anno Accademico:** 2025/2026  
**Studente:** Pugliesi Alessio — 617937


## Descrizione del Progetto

Bookshelf è una Single Page Application (SPA) orientata agli standard Progressive Web App (PWA) per l'indicizzazione, la catalogazione e il monitoraggio delle letture personali. L'applicazione implementa un'architettura client-server disaccoppiata basata su BaaS (Backend-as-a-Service) e API RESTful esterne, garantendo piena fruibilità sia desktop che mobile con supporto al funzionamento offline con pagine di backfall associata.


## Requisiti e Funzionalità Implementate

- **Gestione Autenticazione e Sicurezza:** 
  - Registrazione con validazione input.
  - Verifica forzata dell'indirizzo e-mail via protocollo SMTP Firebase prima della concessione del token di sessione (flusso protetto con invalidazione dell'auto-login e blocco accessi non verificati).
  - Meccanismo di reinvio asincrono del token di attivazione.

- **Integrazione API Esterna:** Interrogazione asincrona via fetch degli endpoint REST di [Open Library Search API](https://openlibrary.org/dev/docs/api/search).

- **Persistenza Dati e Cloud Storage:** Catalogazione personale sincronizzata su Firestore, con filtraggio per stati logici (`Da leggere`, `In lettura`, `In pausa`, `Letto`, `Abbandonato`).

- **Gamification & Feedback:** Motore di calcolo traguardi lato client con trigger su Web Notifications API native del browser e sistema di raccolta feedback attraverso apposito form.

- **PWA e Service Worker:** Cache-first per asset statici e shell dell'applicazione, runtime caching per le richieste esterne (tramite Workbox / `injectManifest`), installabilità (manifest valido) e predisposizione per FCM (Firebase Cloud Messaging).


## Architettura Software e Stack Tecnologico

- **Frontend Core:** React, Vite (bundler e toolchain)

- **UI & Components:** Lucide React (iconset vettoriale), CSS modulare

- **Backend-as-a-Service (BaaS):** 

  - Firebase Authentication (gestione identità)
  - Cloud Firestore (database NoSQL ad accessi controllati)

- **Service Worker Lifecycle:** `vite-plugin-pwa` (strategia personalizzata `injectManifest` per estendibilità push/background)
