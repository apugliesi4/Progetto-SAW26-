// Operazioni CRUD sulla libreria personale: "libraries/{uid}/books/{bookId}"
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const booksCollection = (uid) => collection(db, "libraries", uid, "books");
const bookDoc = (uid, bookId) => doc(db, "libraries", uid, "books", bookId);

// Ascolta in tempo reale i libri salvati dall'utente
export function subscribeToLibrary(uid, callback) {
  if (!uid) return () => {};

  return onSnapshot(booksCollection(uid), (snapshot) => {
    const books = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(books);
  });
}

// Aggiunge un nuovo libro allo scaffale con stato iniziale "Da leggere"
export async function addBookToLibrary(uid, book) {
  if (!uid || !book?.externalId) return;

  await setDoc(bookDoc(uid, book.externalId), {
    ...book,
    status: "Da leggere",
    addedAt: serverTimestamp(),
  });
}

// Rimuove un libro dalla libreria
export async function removeBookFromLibrary(uid, bookId) {
  if (!uid || !bookId) return;
  await deleteDoc(bookDoc(uid, bookId));
}

// Aggiorna lo stato di lettura del libro (es. "In lettura", "Letto")
export async function updateBookStatus(uid, bookId, status) {
  if (!uid || !bookId || !status) return;
  await setDoc(bookDoc(uid, bookId), { status }, { merge: true });
}