import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import { apiGet } from "../lib/api";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet("/api/shows/catalog");
        if (!cancelled) setMovies((Array.isArray(data) ? data : []).slice(0, 4));
      } catch {
        if (!cancelled) setMovies([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="0%" left="85%" size="250px" />

        <p className="text-grey-300 font-medium text-lg">Now showing</p>
        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-4 text-sm text-gray-300 cursor-pointer"
        >
          View All
          <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
        </button>
      </div>
      <div className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 gap-8 mt-8">
        {movies.map((show) => (
          <MovieCard key={show._id ?? show.id} movie={show} />
        ))}
      </div>
      <div className="flex justify-center mt-20">
        <button
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
        >
          Show more
        </button>
      </div>
      <div></div>
    </div>
  );
};

export default FeaturedSection;
