// Client per l'API REST esterna: Open Library Search API (pubblica, gratuita,
// nessuna API key richiesta). Documentazione: https://openlibrary.org/dev/docs/api/search

const BASE_URL = "https://openlibrary.org/search.json";

export async function searchBooks(query) {
  if (!query || !query.trim()) return [];

  const params = new URLSearchParams({
    q: query,
    limit: "20",
    fields: "key,title,author_name,cover_i,first_publish_year,number_of_pages_median",
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Ricerca non riuscita. Riprova tra poco.");
  }

  const data = await response.json();

  return (data.docs || []).map((doc) => {
    // doc.key è tipo "/works/OL45804W": lo usiamo come id univoco per il libro
    const externalId = doc.key.replace("/works/", "");

    return {
      externalId,
      title: doc.title || "Titolo sconosciuto",
      authors: doc.author_name || [],
      thumbnail: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
      description: "",
      pageCount: doc.number_of_pages_median || null,
    };
  });
}