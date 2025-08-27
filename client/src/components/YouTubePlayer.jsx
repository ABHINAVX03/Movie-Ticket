import React, { useEffect, useRef } from "react";

const getVideoIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
    return urlObj.searchParams.get("v");
  } catch (e) {
    return url;
  }
};

const YouTubePlayer = ({ url, controls = true }) => {
  const playerRef = useRef(null);
  const containerId = `yt-player-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const videoId = getVideoIdFromUrl(url);

    // Load YouTube IFrame API if not loaded yet
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player(containerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,   // autoplay ON
          mute: 1,       // required for autoplay to work
          controls: controls ? 1 : 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.mute();      // ensure muted
            event.target.playVideo(); // play automatically
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [url, controls, containerId]);

  return (
    <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden">
      <div id={containerId} className="absolute top-0 left-0 w-full h-full"></div>
    </div>
  );
};

export default YouTubePlayer;
