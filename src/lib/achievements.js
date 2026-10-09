import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

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
    description: "Hai 3 libri \"In lettura\" contemporaneamente",
    check: (stats) => stats.inProgress >= 3,
  },
  {
    id: "1st-in-hold",
    title: "Non sei tu... sono io...",
    description: "Hai messo un pausa una lettura",
    check: (stats) => stats.hold,
  },
  {
    id: "in-hold-3",
    title: "Indeciso",
    description: "Hai 3 libri \"In pausa\"",
    check: (stats) => stats.hold >= 3,
  },
  {
    id: "1st-dropped",
    title: "Ma seriamente??",
    description: "Hai abbandonato un povero libro innocente :(",
    check: (stats) => stats.dropped,
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

const ALL_STATUSES = ["Da leggere", "In lettura", "In pausa", "Letto", "Abbandonato"];

export function computeStats(library) {
  const uniqueAuthors = new Set(
    library.flatMap((b) => (Array.isArray(b.authors) ? b.authors : []))
  );

  const statusesPresent = new Set(library.map((b) => b.status));

  return {
    total: library.length,
    read: library.filter((b) => b.status === "Letto").length,
    dropped: library.filter((b) => b.status === "Abbandonato").length,
    inProgress: library.filter((b) => b.status === "In lettura").length,
    hold: library.filter((b) => b.status === "In pausa").length,
    uniqueAuthors: uniqueAuthors.size,
    hasLongBookRead: library.some((b) => b.status === "Letto" && b.pageCount && b.pageCount >= 800),
    allStatusesUsed: ALL_STATUSES.every((s) => statusesPresent.has(s)),
  };
}

export async function checkNewAchievements(uid, library) {
  const stats = computeStats(library);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const unlocked = (userSnap.exists() && userSnap.data().unlockedAchievements) || {};

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

export function subscribeToUnlockedAchievements(uid, callback) {
  return onSnapshot(doc(db, "users", uid), (snapshot) => {
    const unlocked = (snapshot.exists() && snapshot.data().unlockedAchievements) || {};
    callback(unlocked);
  });
}

export async function notifyAchievement(achievement) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }

  const options = {
    body: achievement.description,
    icon: "/icons/icon-192.png",
  };

  if (navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.showNotification(`🏆 ${achievement.title}`, options);
      return;
    }
  }

  new Notification(`🏆 ${achievement.title}`, options);
}