import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const ALL_STATUSES = ["Da leggere", "In lettura", "In pausa", "Letto", "Abbandonato"];

// Elenco dei traguardi disponibili e relative condizioni di sblocco
export const ACHIEVEMENTS = [
  {
    id: "1st-book",
    title: "Primo grande passo",
    description: "Hai aggiunto il tuo primo libro alla libreria",
    check: (stats) => stats.total >= 1,
  },
  {
    id: "read-5",
    title: "Lettore accanito",
    description: "Hai letto 5 libri",
    check: (stats) => stats.read >= 5,
  },
  {
    id: "read-10",
    title: "Bibliofilo",
    description: "Hai letto 10 libri",
    check: (stats) => stats.read >= 10,
  },
  {
    id: "read-25",
    title: "Maratoneta",
    description: "Hai letto 25 libri",
    check: (stats) => stats.read >= 25,
  },
  {
    id: "read-50",
    title: "🎉 Leggenda 🎉",
    description: "Hai letto 50 libri",
    check: (stats) => stats.read >= 50,
  },
  {
    id: "collector-20",
    title: "Collezionista",
    description: "Hai 20 libri nella tua libreria",
    check: (stats) => stats.total >= 20,
  },
  {
    id: "collector-50",
    title: "Bibliomane",
    description: "Hai 50 libri nella tua libreria",
    check: (stats) => stats.total >= 50,
  },
  {
    id: "multitasker",
    title: "Multitasking",
    description: 'Hai 3 libri "In lettura" contemporaneamente',
    check: (stats) => stats.inProgress >= 3,
  },
  {
    id: "1st-in-hold",
    title: "Non sei tu... sono io...",
    description: "Hai messo in pausa una lettura",
    check: (stats) => stats.hold >= 1,
  },
  {
    id: "in-hold-3",
    title: "Indeciso",
    description: 'Hai 3 libri "In pausa"',
    check: (stats) => stats.hold >= 3,
  },
  {
    id: "1st-dropped",
    title: "Ma seriamente??",
    description: "Hai abbandonato un povero libro innocente :(",
    check: (stats) => stats.dropped >= 1,
  },
  {
    id: "dropped-3",
    title: "Non fa per me",
    description: "Hai abbandonato 3 poveri libri innocenti ;(",
    check: (stats) => stats.dropped >= 3,
  },
  {
    id: "authors-10",
    title: "Esploratore letterario",
    description: "Hai libri di almeno 10 autori diversi",
    check: (stats) => stats.uniqueAuthors >= 10,
  },
  {
    id: "big-book",
    title: "Tomo imponente",
    description: "Hai letto un libro di almeno 800 pagine",
    check: (stats) => stats.hasLongBookRead,
  },
  {
    id: "full-house",
    title: "Tuttofare",
    description: "Hai almeno un libro in ognuno dei 5 stati possibili",
    check: (stats) => stats.allStatusesUsed,
  },
];

// Calcola tutte le statistiche della libreria con una singola iterazione
export function computeStats(library = []) {
  let read = 0;
  let dropped = 0;
  let inProgress = 0;
  let hold = 0;
  let hasLongBookRead = false;

  const uniqueAuthors = new Set();
  const statusesPresent = new Set();

  for (const book of library) {
    if (book.status) {
      statusesPresent.add(book.status);

      if (book.status === "Letto") {
        read++;
        if (book.pageCount >= 800) hasLongBookRead = true;
      } else if (book.status === "Abbandonato") {
        dropped++;
      } else if (book.status === "In lettura") {
        inProgress++;
      } else if (book.status === "In pausa") {
        hold++;
      }
    }

    if (Array.isArray(book.authors)) {
      book.authors.forEach((author) => uniqueAuthors.add(author));
    }
  }

  return {
    total: library.length,
    read,
    dropped,
    inProgress,
    hold,
    uniqueAuthors: uniqueAuthors.size,
    hasLongBookRead,
    allStatusesUsed: ALL_STATUSES.every((s) => statusesPresent.has(s)),
  };
}

// Verifica e salva su Firestore eventuali nuovi traguardi sbloccati
export async function checkNewAchievements(uid, library) {
  if (!uid) return [];

  const stats = computeStats(library);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const unlocked = userSnap.data()?.unlockedAchievements || {};

  const newlyUnlocked = ACHIEVEMENTS.filter(
    (a) => !unlocked[a.id] && a.check(stats)
  );

  if (newlyUnlocked.length === 0) return [];

  const updates = { unlockedAchievements: {} };
  newlyUnlocked.forEach((a) => {
    updates.unlockedAchievements[a.id] = true;
  });

  await setDoc(userRef, updates, { merge: true });
  return newlyUnlocked;
}

// Ascolta in tempo reale i traguardi sbloccati dall'utente
export function subscribeToUnlockedAchievements(uid, callback) {
  if (!uid) return () => {};

  return onSnapshot(doc(db, "users", uid), (snapshot) => {
    callback(snapshot.data()?.unlockedAchievements || {});
  });
}

// Mostra una notifica push di sistema (via Service Worker o Notification API)
export async function notifyAchievement(achievement) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }

  const options = {
    body: achievement.description,
    icon: "/icons/icon-192.png",
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.showNotification(`🏆 ${achievement.title}`, options);
      return;
    }
  }

  new Notification(`🏆 ${achievement.title}`, options);
}