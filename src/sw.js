import { precacheAndRoute } from "workbox-precaching";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

precacheAndRoute(self.__WB_MANIFEST);

const OFFLINE_FALLBACK = "/offline.html";

// Caching della pagina offline statica
self.addEventListener("install", (event) => {

  // Salta la fase di attesa attivando subito il nuovo Service Worker 
  self.skipWaiting();

  event.waitUntil(
    caches.open("offline-cache").then((cache) => cache.add(OFFLINE_FALLBACK))
  );
});

// Se salta la connessione, mostra offline.html
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open("offline-cache");
        return await cache.match(OFFLINE_FALLBACK);
      })
    );
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(

    // Prende il controllo immediato di tutte le schede/pagine aperte
    self.clients.claim().then(async () => {

      // Pulizia di vecchie cache non più necessarie per aggiornamento versione
      const cacheNames = await caches.keys();
      return Promise.all(
        cacheNames
          .filter((name) => name !== "offline-cache" && !name.startsWith("workbox-precache"))
          .map((name) => caches.delete(name))
      );
    })
  );
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const title = payload.notification?.title || "Libreria-SAW";
  const body = payload.notification?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  });
});