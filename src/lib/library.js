// Operazioni CRUD sulla libreria personale dell'utente, salvata su Firestore
// nella collezione "libraries/{uid}/books/{bookId}".

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function booksCollection(uid) {
  return collection(db, "libraries", uid, "books");
}

export function subscribeToLibrary(uid, callback) {
  return onSnapshot(booksCollection(uid), (snapshot) => {
    const books = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(books);
  });
}

export async function addBookToLibrary(uid, book) {
  const ref = doc(db, "libraries", uid, "books", book.externalId);
  await setDoc(ref, {
    ...book,
    status: "da leggere",
    addedAt: serverTimestamp(),
  });
}

export async function removeBookFromLibrary(uid, bookId) {
  const ref = doc(db, "libraries", uid, "books", bookId);
  await deleteDoc(ref);
}

export async function updateBookStatus(uid, bookId, status) {
  const ref = doc(db, "libraries", uid, "books", bookId);
  await setDoc(ref, { status }, { merge: true });
}
