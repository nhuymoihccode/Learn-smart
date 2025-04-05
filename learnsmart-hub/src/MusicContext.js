import React, { createContext, useState } from 'react';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopMusic = () => {
    if (currentTrack) {
      currentTrack.pause();
      currentTrack.currentTime = 0;
      setCurrentTrack(null);
      setPlayingTrackId(null);
      setIsPlaying(false);
    }
  };

  return (
    <MusicContext.Provider value={{ currentTrack, setCurrentTrack, playingTrackId, setPlayingTrackId, isPlaying, setIsPlaying, stopMusic }}>
      {children}
    </MusicContext.Provider>
  );
};