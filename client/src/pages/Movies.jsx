import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { apiGet } from "../lib/api";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet("/api/shows/catalog");
        if (!cancelled) setMovies(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <p className="text-red-400">{error}</p>
        <p className="text-gray-500 mt-2 text-sm">Is the API running at {import.meta.env.VITE_API_URL || "http://localhost:3000"}?</p>
      </div>
    );
  }

  return movies.length > 0 ? (
    <div className="relative my-24 md:my-32 px-6 md:px-16 lg:px-24 xl:px-32 overflow-hidden min-h-[80vh]">
      <BlurCircle top="100px" left="-50px" />
      <BlurCircle top="200px" right="-80px" />

      <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-white">Now Showing</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {movies.map((movie) => (
          <MovieCard movie={movie} key={movie._id ?? movie.id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-300">No Movies Available</h1>
      <p className="mt-3 text-gray-500 text-lg">Add screenings from the admin panel.</p>
    </div>
  );
};

export default Movies;
