import mongoose from "mongoose";
import Show from "../models/Show.js";
import axios from "axios";

const TMDB = "https://api.themoviedb.org/3";

function localDateKey(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function fetchTmdbMovie(id) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY missing");
  const { data: m } = await axios.get(`${TMDB}/movie/${id}`, {
    params: { api_key: apiKey, append_to_response: "credits" },
  });
  const casts = (m.credits?.cast || []).slice(0, 18).map((c) => ({
    name: c.name,
    profile_path: c.profile_path
      ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
      : "",
  }));
  return {
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
}

export async function listShows(req, res) {
  try {
    const future = req.query.future === "1" || req.query.future === "true";
    const q = future ? { showDateTime: { $gte: new Date() } } : {};
    const shows = await Show.find(q).sort({ showDateTime: 1 }).lean();
    res.json(shows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function uniqueMovies(req, res) {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .sort({ showDateTime: 1 })
      .lean();
    const map = new Map();
    for (const s of shows) {
      const mid = String(s.movie?.id ?? s.movie?._id ?? "");
      if (!mid) continue;
      if (!map.has(mid)) {
        map.set(mid, {
          ...s.movie,
          id: s.movie.id ?? Number(mid),
          _id: String(s.movie.id ?? s.movie._id ?? mid),
        });
      }
    }
    res.json([...map.values()]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function scheduleForMovie(req, res) {
  try {
    const { movieId } = req.params;
    const num = Number(movieId);
    const or = [];
    if (!Number.isNaN(num)) or.push({ "movie.id": num });
    or.push({ "movie._id": movieId });

    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
      $or: or,
    })
      .sort({ showDateTime: 1 })
      .lean();

    if (!shows.length) {
      return res.status(404).json({ message: "No upcoming shows for this movie." });
    }

    const movie = shows[0].movie;
    const dateTime = {};
    for (const sh of shows) {
      const key = localDateKey(sh.showDateTime);
      if (!dateTime[key]) dateTime[key] = [];
      dateTime[key].push({
        time: new Date(sh.showDateTime).toISOString(),
        showId: String(sh._id),
      });
    }
    res.json({ movie, dateTime });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function getShow(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid show id" });
    }
    const show = await Show.findById(id).lean();
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function createShowsBulk(req, res) {
  try {
    let { movie, movieId, showPrice, dateTimeSelection } = req.body;
    if (!showPrice && showPrice !== 0) {
      return res.status(400).json({ message: "showPrice is required" });
    }
    if (!dateTimeSelection || typeof dateTimeSelection !== "object") {
      return res.status(400).json({ message: "dateTimeSelection object required" });
    }

    if (!movie && movieId) {
      movie = await fetchTmdbMovie(movieId);
    }
    if (!movie || !movie.title) {
      return res.status(400).json({ message: "movie or valid movieId required" });
    }

    const mid = movie.id ?? movieId;
    const docs = [];
    for (const [date, times] of Object.entries(dateTimeSelection)) {
      if (!Array.isArray(times)) continue;
      for (const t of times) {
        const iso = new Date(`${date}T${t}:00`).toISOString();
        if (Number.isNaN(new Date(iso).getTime())) continue;
        docs.push({
          movie: { ...movie, id: movie.id ?? Number(mid), _id: String(movie.id ?? mid) },
          showDateTime: new Date(iso),
          showPrice: Number(showPrice),
          occupiedSeats: {},
        });
      }
    }

    if (!docs.length) {
      return res.status(400).json({ message: "No valid show slots parsed" });
    }

    const inserted = await Show.insertMany(docs);
    res.status(201).json({ created: inserted.length, ids: inserted.map((d) => d._id) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
}

export async function updateShow(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid show id" });
    }
    const { showDateTime, showPrice, movie } = req.body;
    const patch = {};
    if (showDateTime !== undefined) patch.showDateTime = new Date(showDateTime);
    if (showPrice !== undefined) patch.showPrice = Number(showPrice);
    if (movie !== undefined) patch.movie = movie;

    const show = await Show.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).lean();
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function deleteShow(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid show id" });
    }
    const r = await Show.findByIdAndDelete(id);
    if (!r) return res.status(404).json({ message: "Show not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
