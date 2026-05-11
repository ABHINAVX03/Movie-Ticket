import { Router } from "express";
import * as show from "../controllers/showController.js";
import * as tmdb from "../controllers/tmdbController.js";

const r = Router();

r.get("/shows", show.listShows);
r.get("/shows/catalog", show.uniqueMovies);
r.get("/shows/movie/:movieId/schedule", show.scheduleForMovie);
r.get("/shows/:id", show.getShow);

r.get("/tmdb/now-playing", tmdb.nowPlaying);
r.get("/tmdb/movie/:id", tmdb.movieDetails);

export default r;
