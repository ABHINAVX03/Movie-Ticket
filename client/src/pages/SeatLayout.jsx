import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import Loading from "../components/Loading";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { apiGet } from "../lib/api";

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [screening, setScreening] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet(`/api/shows/movie/${id}/schedule`);
        if (!cancelled) {
          setShow({
            movie: data.movie,
            dateTime: data.dateTime,
          });
        }
      } catch {
        if (!cancelled) setShow(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!selectedTime?.showId) {
      setScreening(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const doc = await apiGet(`/api/shows/${selectedTime.showId}`);
        if (!cancelled) setScreening(doc);
      } catch {
        if (!cancelled) setScreening(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedTime?.showId]);

  const occupied = screening?.occupiedSeats || {};

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select time first");
    }
    if (occupied[seatId]) {
      return toast("Seat already booked");
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast("You can only select 5 seats");
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((seat) => seat !== seatId) : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const taken = Boolean(occupied[seatId]);
          const selected = selectedSeats.includes(seatId);
          return (
            <button
              key={seatId}
              type="button"
              aria-pressed={selected}
              disabled={taken}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 transition ${
                taken
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed line-through"
                  : selected
                    ? "bg-primary text-white cursor-pointer"
                    : "hover:bg-primary/20 cursor-pointer"
              }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const handleProceed = () => {
    if (!selectedTime) return toast("Please select a time before checkout");
    if (selectedSeats.length === 0) return toast("Please select at least 1 seat");
    const price = screening?.showPrice ?? 0;
    navigate("/my-bookings", {
      state: {
        selectedSeats,
        selectedTime,
        show: { movie: show?.movie, showDateTime: selectedTime.time, showPrice: price },
        date,
      },
    });
  };

  const timesForDate = show?.dateTime?.[date] || [];

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6 mb-3">Available Timings</p>
        <div>
          {timesForDate.length === 0 ? (
            <p className="px-6 text-sm text-gray-500">No shows on this date.</p>
          ) : (
            timesForDate.map((item) => (
              <div
                key={item.showId + item.time}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTime(item)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedTime(item)}
                className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                  selectedTime?.time === item.time && selectedTime?.showId === item.showId
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20"
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                <p className="text-sm">{isoTimeFormat(item.time)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="70%" right="-10%" />
        <BlurCircle bottom="60%" right="75%" />

        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
        <img src={assets.screenImage} alt="Movie screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>{group.map((row) => renderSeats(row))}</div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceed}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
