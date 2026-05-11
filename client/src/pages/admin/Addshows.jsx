import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { kConvertor } from "../../lib/kConvertor";
import toast from "react-hot-toast";
import { apiGet, apiPost } from "../../lib/api";

export default function AddShows() {
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingMovies(true);
        const data = await apiGet("/api/tmdb/now-playing");
        if (!cancelled) setNowPlayingMovies(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setNowPlayingMovies([]);
          toast.error(e.message || "Could not load TMDB catalog");
        }
      } finally {
        if (!cancelled) setLoadingMovies(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizeTime = (rawTime) => {
    if (!rawTime) return rawTime;
    const parts = rawTime.split(":");
    return parts.length >= 2 ? `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}` : rawTime;
  };

  const handleDateTimeAdd = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    if (!dateTimeInput) return;

    const [date, rawTime] = dateTimeInput.split("T");
    if (!date || !rawTime) {
      toast.error("Pick a valid date and time");
      return;
    }

    const time = normalizeTime(rawTime);

    setDateTimeSelection((prev) => {
      const base = prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {};
      const times = Array.isArray(base[date]) ? [...base[date]] : [];

      if (!times.includes(time)) {
        const updatedTimes = [...times, time].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
        return { ...base, [date]: updatedTimes };
      }
      return base;
    });

    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const base = prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {};
      const times = Array.isArray(base[date]) ? base[date] : [];
      const filtered = times.filter((t) => t !== time);

      if (filtered.length === 0) {
        const { [date]: _, ...rest } = base;
        return rest;
      }

      return { ...base, [date]: filtered };
    });
  };

  const handleAddShows = async () => {
    if (!selectedMovie) {
      toast.error("Select a movie");
      return;
    }
    if (!showPrice && showPrice !== "0") {
      toast.error("Enter show price");
      return;
    }
    if (Object.keys(dateTimeSelection).length === 0) {
      toast.error("Add at least one show time");
      return;
    }

    try {
      setSubmitting(true);
      const movie = await apiGet(`/api/tmdb/movie/${selectedMovie}`);
      await apiPost("/api/admin/shows/bulk", {
        movie,
        showPrice: Number(showPrice),
        dateTimeSelection,
      });
      toast.success("Shows created");
      setDateTimeSelection({});
      setShowPrice("");
      setSelectedMovie(null);
    } catch (e) {
      toast.error(e.message || "Failed to create shows");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMovies) return <Loading />;

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-medium">Now Playing (TMDB)</p>

      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className="relative max-w-[160px] cursor-pointer hover:-translate-y-1 transition duration-300"
              onClick={() => setSelectedMovie((prev) => (prev === movie.id ? null : movie.id))}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full object-cover brightness-90"
                />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {Number(movie.vote_average ?? 0).toFixed(1)}
                  </p>
                  <p className="text-gray-300">{kConvertor(movie.vote_count)} Votes</p>
                </div>
              </div>

              {selectedMovie === movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}

              <p className="font-medium truncate">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Select Date and Time</label>
        <div className="inline-flex gap-5 border-gray-600 p-1 pl-3 rounded-lg items-center">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md"
          />
          <button
            type="button"
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-2">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([d, times]) => (
              <li key={d}>
                <div className="font-medium">{d}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {Array.isArray(times) &&
                    times.map((t) => (
                      <div key={t} className="border border-primary px-2 py-1 flex items-center rounded">
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(d, t)}
                          className="ml-2"
                          aria-label={`Remove ${t} on ${d}`}
                        >
                          <DeleteIcon width={15} className="text-red-500 hover:text-red-700 cursor-pointer" />
                        </button>
                      </div>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        disabled={submitting}
        onClick={handleAddShows}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add Show"}
      </button>
    </>
  ) : (
    <p className="text-gray-400 mt-8">
      No TMDB results. Set <code className="text-primary">TMDB_API_KEY</code> on the server and restart.
    </p>
  );
}
