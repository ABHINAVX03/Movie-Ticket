import axios from "axios";

const TMDB = "https://api.themoviedb.org/3";

function getKey() {
  return process.env.TMDB_API_KEY;
}

function mapMovie(m) {
  return {
    ...m,
    _id: String(m.id),
    poster_path: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "",
    backdrop_path: m.backdrop_path
      ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
      : "",
  };
}

export async function nowPlaying(req, res) {
  try {
    const apiKey = getKey();
    if (!apiKey) {
      return res.status(503).json({ message: "Set TMDB_API_KEY in server .env" });
    }
    const { data } = await axios.get(`${TMDB}/movie/now_playing`, {
      params: { api_key: apiKey, language: "en-US", page: req.query.page || 1 },
    });
    const results = (data.results || []).map(mapMovie);
    res.json(results);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(502).json({ message: "TMDB request failed" });
  }
}

export async function movieDetails(req, res) {
  try {
    const apiKey = getKey();
    if (!apiKey) {
      return res.status(503).json({ message: "Set TMDB_API_KEY in server .env" });
    }
    const { id } = req.params;
    const { data: m } = await axios.get(`${TMDB}/movie/${id}`, {
      params: { api_key: apiKey, append_to_response: "credits" },
    });

    const casts = (m.credits?.cast || []).slice(0, 18).map((c) => ({
      name: c.name,
      profile_path: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : "",
    }));

    const movie = {
      id: m.id,
      _id: String(m.id),
      title: m.title,
      overview: m.overview,
      poster_path: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : "",
      backdrop_path: m.backdrop_path
        ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
        : "",
      genres: m.genres || [],
      casts,
      release_date: m.release_date,
      original_language: m.original_language,
      tagline: m.tagline || "",
      vote_average: m.vote_average ?? 0,
      vote_count: m.vote_count ?? 0,
      runtime: m.runtime ?? 0,
    };
    res.json(movie);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(502).json({ message: "TMDB request failed" });
  }
}
