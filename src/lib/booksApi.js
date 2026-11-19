// Client REST per Open Library Search API (gratuita, senza API key)
const BASE_URL = "https://openlibrary.org/search.json";

export async function searchBooks(query, signal) {
  const cleanQuery = query?.trim();
  if (!cleanQuery) return [];

  const params = new URLSearchParams({
    q: cleanQuery,
    limit: "20",
    fields: "key,title,author_name,cover_i,first_publish_year,number_of_pages_median",
  });

  // Passiamo signal per poter interrompere richieste obsolete se l'utente continua a digitare
  const response = await fetch(`${BASE_URL}?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error("Ricerca non riuscita. Riprova tra poco.");
  }

  const data = await response.json();

  return (data.docs || []).map((doc) => {
    // Trasforma "/works/OL45804W" in "OL45804W" da usare come ID univoco
    const externalId = doc.key ? doc.key.replace("/works/", "") : crypto.randomUUID();

    return {
      externalId,
      title: doc.title || "Titolo sconosciuto",
      authors: Array.isArray(doc.author_name) ? doc.author_name : [],
      thumbnail: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
      description: "",
      pageCount: doc.number_of_pages_median || null,
    };
  });
}