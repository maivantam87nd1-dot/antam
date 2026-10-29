import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundEngine } from '../services/soundEngine';
import { MeditationTrack, BuddhistScripture } from '../types';
import { useAuth } from './AuthContext';

interface AudioContextType {
  currentTrack: (MeditationTrack | BuddhistScripture | any) | null;
  isPlaying: boolean;
  isFullPlayerOpen: boolean;
  setIsFullPlayerOpen: (open: boolean) => void;
  selectedDuration: number;
  setSelectedDuration: (mins: number) => void;
  playbackProgress: number; // 0 - 100
  currentTime: number; // in seconds
  totalDurationSeconds: number;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  sleepTimerMinutes: number | null;
  setSleepTimer: (minutes: number | null) => void;
  ambientVolumes: Record<string, number>;
  setAmbientVolume: (id: string, vol: number) => void;
  playTrack: (track: any, durationMins?: number) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  togglePlayPause: () => void;
  seekTo: (progressPercent: number) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { completeSession, token } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(10); // minutes
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [sleepTimerMinutes, setSleepTimerMinutesState] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('antam_favorites');
    return saved ? JSON.parse(saved) : ['med-1', 'buddhist-1'];
  });

  const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>({
    rain: 0,
    stream: 0,
    singing_bowl: 0,
    theta_drone: 0,
  });

  const timerRef = useRef<any>(null);
  const totalDurationSeconds = selectedDuration * 60;
  const playbackProgress = totalDurationSeconds > 0 ? Math.min(100, (currentTime / totalDurationSeconds) * 100) : 0;

  // Sync favorites from backend if logged in
  useEffect(() => {
    if (token) {
      fetch('/api/user/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.favorites && Array.isArray(data.favorites)) {
            setFavorites(prev => {
              const merged = Array.from(new Set([...prev, ...data.favorites]));
              return merged;
            });
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('antam_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      return updated;
    });

    if (token) {
      fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: id })
      }).catch(() => {});
    }
  };

  // Timer loop when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev + 1 >= totalDurationSeconds) {
            // Completed session!
            clearInterval(timerRef.current);
            setIsPlaying(false);
            soundEngine.playSingingBowl(216, 8.0, 0.8);
            soundEngine.triggerHaptic([100, 50, 100]);
            completeSession(selectedDuration);
            return totalDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalDurationSeconds, playbackSpeed, selectedDuration]);

  const playTrack = (track: any, durationMins?: number) => {
    const mins = durationMins || (track.durations ? track.durations[0] : 10);
    setCurrentTrack(track);
    setSelectedDuration(mins);
    setCurrentTime(0);
    setIsPlaying(true);

    // Initial chime
    soundEngine.playSingingBowl(216, 7.0, 0.75);
    soundEngine.triggerHaptic(50);

    // Start background ambient tone based on track
    soundEngine.stopAll();
    const tone = track.audioTone || 'singing_bowl';
    if (tone === 'rain') {
      soundEngine.startRain(0.45);
    } else if (tone === 'stream') {
      soundEngine.startStream(0.4);
    } else if (tone === 'theta') {
      soundEngine.startThetaDrone(0.3);
    } else {
      soundEngine.startSingingBowlLoop(0.4);
    }

    // MediaSession lock screen update
    soundEngine.updateMediaSession(
      track.title,
      track.instructor || track.translator || 'AN TÂM',
      'AN TÂM Mindfulness',
      track.image || '/assets/images/lotus_pond_dawn_1793159474945.jpg',
      togglePlayPause
    );
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    soundEngine.stopAll();
  };

  const resumeTrack = () => {
    if (!currentTrack) return;
    setIsPlaying(true);
    const tone = currentTrack.audioTone || 'singing_bowl';
    if (tone === 'rain') soundEngine.startRain(0.45);
    else if (tone === 'stream') soundEngine.startStream(0.4);
    else if (tone === 'theta') soundEngine.startThetaDrone(0.3);
    else soundEngine.startSingingBowlLoop(0.4);
  };

  const stopTrack = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    soundEngine.stopAll();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const seekTo = (progressPercent: number) => {
    const targetSeconds = Math.round((progressPercent / 100) * totalDurationSeconds);
    setCurrentTime(targetSeconds);
  };

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutesState(minutes);
    if (minutes === null) {
      soundEngine.clearSleepTimer();
    } else {
      soundEngine.setSleepTimer(minutes, () => {
        setIsPlaying(false);
        setSleepTimerMinutesState(null);
      });
    }
  };

  const setAmbientVolume = (trackId: string, vol: number) => {
    setAmbientVolumes(prev => ({ ...prev, [trackId]: vol }));

    if (vol > 0) {
      if (trackId === 'rain') soundEngine.startRain(vol);
      else if (trackId === 'stream') soundEngine.startStream(vol);
      else if (trackId === 'singing_bowl') soundEngine.startSingingBowlLoop(vol);
      else if (trackId === 'theta_drone') soundEngine.startThetaDrone(vol);
      else if (trackId === 'bamboo_wind') soundEngine.startBambooWind(vol);
      else if (trackId === 'waves') soundEngine.startOceanWaves(vol);
      else if (trackId === 'birds') soundEngine.startMorningBirds(vol);
      else if (trackId === 'temple_bell') soundEngine.playTempleBell(vol);
      else if (trackId === 'wind_chime') soundEngine.playWindChime(vol);
      else soundEngine.setTrackVolume(trackId, vol);
    } else {
      soundEngine.stopAmbient(trackId);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isFullPlayerOpen,
        setIsFullPlayerOpen,
        selectedDuration,
        setSelectedDuration,
        playbackProgress,
        currentTime,
        totalDurationSeconds,
        playbackSpeed,
        setPlaybackSpeed,
        sleepTimerMinutes,
        setSleepTimer,
        ambientVolumes,
        setAmbientVolume,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        togglePlayPause,
        seekTo,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
