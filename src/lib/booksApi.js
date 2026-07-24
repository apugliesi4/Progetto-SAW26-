// Client per l'API REST esterna: Google Books API (pubblica, no auth richiesta
// per le ricerche). Documentazione: https://developers.google.com/books/docs/v1/using

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export async function searchBooks(query) {
  if (!query || !query.trim()) return [];

  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Ricerca non riuscita. Riprova tra poco.");
  }

  const data = await response.json();

  return (data.items || []).map((item) => {
    const info = item.volumeInfo || {};
    return {
      externalId: item.id,
      title: info.title || "Titolo sconosciuto",
      authors: info.authors || [],
      thumbnail: info.imageLinks?.thumbnail || null,
      publishedDate: info.publishedDate || null,
      description: info.description || "",
      pageCount: info.pageCount || null,
    };
  });
}
