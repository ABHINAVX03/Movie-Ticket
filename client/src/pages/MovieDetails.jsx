import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { HeartIcon, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { apiGet } from "../lib/api";

const MovieDetails = () => {
  const { id } = useParams();
  const [shows, setShows] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [error, setError] = useState(null);
  const dateSelectRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const schedule = await apiGet(`/api/shows/movie/${id}/schedule`);
        if (cancelled) return;
        setShows(schedule);
        try {
          const movies = await apiGet("/api/shows/catalog");
          if (!cancelled) setCatalog(Array.isArray(movies) ? movies : []);
        } catch {
          if (!cancelled) setCatalog([]);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setShows(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBuyClick = () => {
    if (dateSelectRef.current) {
      dateSelectRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const related = catalog.filter((m) => String(m._id ?? m.id) !== String(id)).slice(0, 4);

  if (error) {
    return (
      <div className="px-6 md:px-40 pt-30 md:pt-50 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-gray-300 max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="mt-6 px-8 py-2 bg-primary rounded-md text-sm font-medium"
        >
          Back to movies
        </button>
      </div>
    );
  }

  return shows ? (
    <div className="px-6 md:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={shows.movie.poster_path}
          alt={shows.movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />
        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">{(shows.movie.original_language || "en").toUpperCase()}</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">{shows.movie.title}</h1>
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {Number(shows.movie.vote_average ?? 0).toFixed(1)} User Rating
          </div>
          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">{shows.movie.overview}</p>
          <p>
            {timeFormat(shows.movie.runtime)} ●{" "}
            {(shows.movie.genres || []).map((genre) => genre.name).join(", ") || "—"} ●{" "}
            {shows.movie.release_date ? shows.movie.release_date.split("-")[0] : "—"}
          </p>
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button
              type="button"
              className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <button
              type="button"
              onClick={handleBuyClick}
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </button>
            <button
              type="button"
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <HeartIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <p className="text-lg font-medium mt-20">Your favorite Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center px-4 gap-4 w-max">
          {(shows.movie.casts || []).slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={cast.profile_path}
                alt=""
                className="rounded-full h-20 md:h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div ref={dateSelectRef}>
        <DateSelect dateTime={shows.dateTime} id={id} />
      </div>
      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {related.map((movie) => (
          <MovieCard key={movie._id ?? movie.id} movie={movie} />
        ))}
      </div>
      <div className="flex justify-center mt-20">
        <button
          type="button"
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;
