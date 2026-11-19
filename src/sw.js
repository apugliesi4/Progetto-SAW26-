import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute, setCatchHandler } from "workbox-routing";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const OFFLINE_FALLBACK = "/offline.html";

// Attiva subito il nuovo Service Worker senza attendere la chiusura delle schede
self.skipWaiting();
clientsClaim();

// Precacha tutti gli asset generati da Vite (inclusi index.html e offline.html) e pulisce vecchie cache
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Routing SPA: serve index.html precachato per tutte le rotte interne (es. /profile, /achievements)
const navigationHandler = createHandlerBoundToURL("/index.html");
registerRoute(new NavigationRoute(navigationHandler));

// Fallback offline: se una richiesta di navigazione fallisce del tutto, mostra offline.html
setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    const cachedOffline = await caches.match(OFFLINE_FALLBACK, { ignoreSearch: true });
    return cachedOffline || Response.error();
  }
  return Response.error();
});

// Inizializzazione Firebase Cloud Messaging per notifiche in background
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

// Apre l'app (o porta in primo piano la scheda già aperta) al click sulla notifica
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});