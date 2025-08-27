import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Title from '../../components/Title'
import Loading from '../../components/Loading'
import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react'
import { kConvertor } from '../../lib/kConvertor'

export default function AddShows() {
  const currency = import.meta.env.VITE_CURRENCY || '₹'

  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [dateTimeSelection, setDateTimeSelection] = useState({}) // { '2025-08-23': ['14:30','18:00'] }
  const [dateTimeInput, setDateTimeInput] = useState('')
  const [showPrice, setShowPrice] = useState('')

  useEffect(() => {
    setNowPlayingMovies(dummyShowsData || [])
  }, [])

  // Normalize time "HH:MM:SS" -> "HH:MM"
  const normalizeTime = (rawTime) => {
    if (!rawTime) return rawTime
    const parts = rawTime.split(':')
    return parts.length >= 2 ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}` : rawTime
  }

  const handleDateTimeAdd = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()

    if (!dateTimeInput) {
      console.warn('No dateTimeInput set')
      return
    }

    const [date, rawTime] = dateTimeInput.split('T')
    if (!date || !rawTime) {
      console.error('Invalid datetime-local value:', dateTimeInput)
      return
    }

    const time = normalizeTime(rawTime)

    setDateTimeSelection((prev) => {
      const base = prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}
      const times = Array.isArray(base[date]) ? [...base[date]] : []

      // add only when not present
      if (!times.includes(time)) {
        const updatedTimes = [...times, time]
          .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)) // sort HH:MM
        const next = { ...base, [date]: updatedTimes }
        console.log('Added time ->', { date, time, next })
        return next
      }

      console.log('Time already exists ->', { date, time, prev })
      return base
    })

    setDateTimeInput('') // clear input
  }

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const base = prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}
      const times = Array.isArray(base[date]) ? base[date] : []
      const filtered = times.filter((t) => t !== time)

      if (filtered.length === 0) {
        const { [date]: _, ...rest } = base
        console.log('Removed last time for date ->', { date, time, rest })
        return rest
      }

      const next = { ...base, [date]: filtered }
      console.log('Removed time ->', { date, time, next })
      return next
    })
  }

  // Debug render-state snapshot (helpful if page goes blank)
  useEffect(() => {
    console.debug('dateTimeSelection changed:', JSON.stringify(dateTimeSelection))
  }, [dateTimeSelection])

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>

      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className={`relative max-w-[160px] cursor-pointer hover:-translate-y-1 transition duration-300`}
              onClick={() => setSelectedMovie((prev) => (prev === movie.id ? null : movie.id))}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img src={movie.poster_path} alt={movie.title} className="w-full object-cover brightness-90" />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {Number(movie.vote_average).toFixed(1)}
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

      {/* price input */}
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

      {/* Date & Time Selection */}
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

      {/* Display Selected Times */}
      {Object.keys(dateTimeSelection).length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-2">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {Array.isArray(times) &&
                    times.map((t) => (
                      <div key={t} className="border border-primary px-2 py-1 flex items-center rounded">
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(date, t)}
                          className="ml-2"
                          aria-label={`Remove ${t} on ${date}`}
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

      <button type="button" className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer">
        Add Show
      </button>
    </>
  ) : (
    <Loading />
  )
}
