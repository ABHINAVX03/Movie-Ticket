import React, { useState } from "react";
import { dummyTrailers } from "../assets/assets";
import ReactPlayer from "react-player";
import BlurCircle from "./BlurCircle";
import { PlayCircleIcon } from "lucide-react";
import YouTubePlayer from "./YouTubePlayer";

const TrailerHeader = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <>
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
        <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
          Trailers
        </p>
      </div>

      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />
        <div className="mx-auto max-w-[960px] aspect-video bg-black rounded-2xl overflow-hidden">
          <YouTubePlayer url={currentTrailer.videoUrl} />
        </div>
        <div className="group grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
          {dummyTrailers.map((trailer) => (
            <button
              key={trailer.image}
              onClick={() => setCurrentTrailer(trailer)}
              className="aspect-video relative rounded-lg overflow-hidden transition duration-300 group-hover:opacity-50 hover:!opacity-100 hover:-translate-y-1"
            >
              <img
                src={trailer.image}
                alt={trailer.title || "Trailer thumbnail"}
                className="w-full h-full object-cover brightness-75"
              />
              <PlayCircleIcon
                strokeWidth={1.6}
                className="absolute top-1/2 left-1/2 w-8 h-8 md:w-12 md:h-12 transform -translate-x-1/2 -translate-y-1/2 text-white"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TrailerHeader;
