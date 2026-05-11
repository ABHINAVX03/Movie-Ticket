import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY = "movie-ticket-local-bookings";

const loadStored = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fromCheckout = location.state;
    if (fromCheckout?.selectedSeats?.length && fromCheckout?.show) {
      const price = Number(fromCheckout.show.showPrice ?? 0);
      const entry = {
        _id: crypto.randomUUID(),
        user: { name: "You" },
        show: fromCheckout.show,
        amount: fromCheckout.selectedSeats.length * price,
        bookedSeats: fromCheckout.selectedSeats,
        isPaid: false,
      };
      const next = [entry, ...loadStored()];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      navigate("/my-bookings", { replace: true });
    }
    setBookings(loadStored());
    setIsLoading(false);
  }, [location.state, navigate]);

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>

      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet. Complete a seat selection to see tickets here.</p>
      ) : null}

      {bookings.map((item, index) => (
        <div
          key={item._id || index}
          className="flex flex-col md:flex-row justify-between 
          bg-gradient-to-r from-red-900/40 to-red-700/20 
          border border-primary/20 rounded-xl mt-4 p-3 md:p-4 max-w-3xl 
          shadow-lg"
        >
          <div className="flex flex-col md:flex-row">
            <img
              src={item.show.movie.poster_path}
              alt={item.show.movie.title}
              className="md:w-40 w-full aspect-video object-cover object-bottom rounded-lg"
            />
            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{item.show.movie.title}</p>
              <p className="text-gray-400 text-sm">{timeFormat(item.show.movie.runtime)}</p>
              <p className="text-gray-400 text-sm mt-auto">{dateFormat(item.show.showDateTime)}</p>
            </div>
          </div>

          <div className="flex flex-col items-end text-right justify-between p-4 min-w-[200px]">
            <div className="flex items-center gap-4">
              {!item.isPaid && (
                <button
                  type="button"
                  className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition"
                >
                  Pay Now
                </button>
              )}

              <p className="text-2xl font-bold">
                {currency}
                {item.amount}
              </p>
            </div>

            <div className="mt-3 text-sm">
              <p>
                <span className="text-gray-400">Total Tickets: </span>
                {item.bookedSeats.length}
              </p>
              <p>
                <span className="text-gray-400">Seat Number: </span>
                {item.bookedSeats.join(", ")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
