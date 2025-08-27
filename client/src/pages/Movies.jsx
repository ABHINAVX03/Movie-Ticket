import React from "react";
import BlurCircle from "../components/BlurCircle";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";

const Movies = () => {
  return dummyShowsData.length > 0 ? (
    <div className="relative my-24 md:my-32 px-6 md:px-16 lg:px-24 xl:px-32 overflow-hidden min-h-[80vh]">
      
      <BlurCircle top="100px" left="-50px" />
      <BlurCircle top="200px" right="-80px" />

      <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-white">
        Now Showing
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {dummyShowsData.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-300">
        No Movies Available
      </h1>
      <p className="mt-3 text-gray-500 text-lg">
        Check back later for the latest releases 🎬
      </p>
    </div>
  );
};

export default Movies;
