"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  cover?: string;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playbackRate: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setRate: (rate: number) => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const PERSISTENCE_KEY = "lilian_audio_state";

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persistence: Load on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const savedState = localStorage.getItem(PERSISTENCE_KEY);
    if (savedState) {
      try {
        const { track, position, rate } = JSON.parse(savedState);
        if (track && track.url) {
          setCurrentTrack(track);
          audio.src = track.url;
          audio.currentTime = Math.max(0, position - 2); // 2s tolerance
          setPlaybackRate(rate || 1);
          audio.playbackRate = rate || 1;
        }
      } catch (e) {
        console.error("Failed to restore audio state", e);
      }
    }

    const updateProgress = () => {
      setProgress(audio.currentTime);
      // Periodic save (every 5s)
      if (Math.floor(audio.currentTime) % 5 === 0) {
        saveState(audio.currentTime);
      }
    };

    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      localStorage.removeItem(PERSISTENCE_KEY);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Media Session API & State Sync
  useEffect(() => {
    if (currentTrack && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || "Instituto Figura Viva",
        artwork: [
          {
            src: currentTrack.cover || "/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", togglePlay);
      navigator.mediaSession.setActionHandler("pause", togglePlay);
      navigator.mediaSession.setActionHandler("seekbackward", () =>
        seek(audioRef.current!.currentTime - 15),
      );
      navigator.mediaSession.setActionHandler("seekforward", () =>
        seek(audioRef.current!.currentTime + 15),
      );
      navigator.mediaSession.setActionHandler("stop", stop);
    }
  }, [currentTrack]);

  const saveState = (pos: number) => {
    if (currentTrack) {
      localStorage.setItem(
        PERSISTENCE_KEY,
        JSON.stringify({
          track: currentTrack,
          position: pos,
          rate: playbackRate,
        }),
      );
    }
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
      saveState(audioRef.current.currentTime);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(time, audioRef.current.duration));
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
      saveState(newTime);
    }
  };

  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    localStorage.removeItem(PERSISTENCE_KEY);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        playbackRate,
        playTrack,
        togglePlay,
        seek,
        setRate,
        stop,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
