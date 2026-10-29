import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { soundEngine } from '../../services/soundEngine';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Heart,
  Moon,
  Volume2,
  VolumeX,
  Sliders,
  Volume1
} from 'lucide-react';

export const FullPlayerModal: React.FC = () => {
  const {
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
    togglePlayPause,
    seekTo,
    favorites,
    toggleFavorite,
  } = useAudio();

  const [isSpeakingInstruction, setIsSpeakingInstruction] = useState(false);
  const [currentInstructionIdx, setCurrentInstructionIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const isFav = favorites.includes(currentTrack.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const handleSkip = (secondsDelta: number) => {
    const target = Math.max(0, Math.min(totalDurationSeconds, currentTime + secondsDelta));
    seekTo((target / totalDurationSeconds) * 100);
  };

  const handleToggleVoiceInstruction = () => {
    if (isSpeakingInstruction) {
      soundEngine.stopSpeaking();
      setIsSpeakingInstruction(false);
    } else {
      const instructions = currentTrack.instructions || [];
      if (instructions.length > 0) {
        setIsSpeakingInstruction(true);
        const textToRead = instructions.join('. ');
        soundEngine.speakText(textToRead, () => {
          setIsSpeakingInstruction(false);
        });
      }
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      soundEngine.setMasterVolume(0.8);
      setIsMuted(false);
    } else {
      soundEngine.setMasterVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-title"
    >
      <div className="relative w-full max-w-xl h-full sm:h-auto max-h-[96vh] bg-[#101D35] text-white rounded-none sm:rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        {/* Ambient Blurred Background from artwork */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <img
            src={currentTrack.image || '/assets/images/lotus_pond_dawn_1793159474945.jpg'}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-125"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Top Header bar */}
        <div className="relative z-10 flex items-center justify-between p-5 border-b border-white/10">
          <button
            onClick={() => setIsFullPlayerOpen(false)}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Thu nhỏ trình phát"
            aria-label="Thu nhỏ trình phát"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#D8B878] font-semibold">
              {currentTrack.categoryName || 'Không gian Chánh niệm'}
            </span>
            <p className="text-[11px] text-white/50">AN TÂM Zen Sound</p>
          </div>

          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            title={isFav ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
            aria-label={isFav ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white/80'}`} />
          </button>
        </div>

        {/* Scrollable Center Body */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center">
          {/* Main Visual Artwork with pulsing ring */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-2 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 group">
            <img
              src={currentTrack.image || '/assets/images/lotus_pond_dawn_1793159474945.jpg'}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />
            {isPlaying && (
              <div className="absolute inset-0 border-2 border-[#D8B878]/40 rounded-3xl animate-pulse-subtle pointer-events-none" />
            )}
          </div>

          {/* Titles */}
          <div className="text-center mt-4 mb-2 max-w-md">
            <h3 id="player-title" className="font-serif text-2xl font-bold tracking-tight text-white mb-1">
              {currentTrack.title}
            </h3>
            <p className="text-sm text-white/70">
              {currentTrack.instructor || currentTrack.translator || 'Ban biên tập AN TÂM'}
            </p>
            {currentTrack.source && (
              <p className="text-xs text-[#D8B878]/80 mt-1">
                Nguồn: {currentTrack.source}
              </p>
            )}
          </div>

          {/* Duration Selector Tabs (when supported) */}
          {currentTrack.durations && currentTrack.durations.length > 1 && (
            <div className="my-3 flex items-center gap-1.5 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
              {currentTrack.durations.map((dur: number) => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] ${
                    selectedDuration === dur
                      ? 'bg-[#D8B878] text-[#101D35] shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {dur} phút
                </button>
              ))}
            </div>
          )}

          {/* Progress Slider */}
          <div className="w-full mt-4 max-w-md">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={playbackProgress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D8B878]"
              aria-label="Thanh tiến độ âm thanh"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1 font-mono tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(Math.max(0, totalDurationSeconds - currentTime))}</span>
            </div>
          </div>

          {/* Primary Transport Controls */}
          <div className="flex items-center justify-center gap-6 my-4">
            <button
              onClick={() => handleSkip(-15)}
              className="p-3 text-white/70 hover:text-white rounded-full bg-white/5 hover:bg-white/15 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Lùi 15 giây"
              aria-label="Lùi 15 giây"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-[#D8B878] hover:bg-[#c9a762] text-[#101D35] flex items-center justify-center shadow-lg active:scale-95 transition-transform min-h-[48px] min-w-[48px]"
              title={isPlaying ? 'Tạm dừng' : 'Bắt đầu phát'}
              aria-label={isPlaying ? 'Tạm dừng' : 'Bắt đầu phát'}
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>

            <button
              onClick={() => handleSkip(15)}
              className="p-3 text-white/70 hover:text-white rounded-full bg-white/5 hover:bg-white/15 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Tiến 15 giây"
              aria-label="Tiến 15 giây"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          {/* Secondary Utilities: Speed, Sleep Timer, Voice Guide, Mute */}
          <div className="flex items-center justify-around w-full max-w-sm py-2 border-t border-white/10 text-xs">
            {/* Speed Selector */}
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1.0 ? 1.2 : playbackSpeed === 1.2 ? 0.8 : 1.0;
                setPlaybackSpeed(nextSpeed);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono min-h-[40px]"
              title="Tốc độ phát"
            >
              {playbackSpeed}x
            </button>

            {/* Sleep Timer dropdown */}
            <div className="relative">
              <select
                value={sleepTimerMinutes || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setSleepTimer(val);
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg px-2.5 py-2 cursor-pointer border-none outline-none appearance-none pr-7 min-h-[40px]"
                aria-label="Hẹn giờ tắt nhạc"
              >
                <option value="" className="bg-[#101D35] text-white">Hẹn giờ ngủ: Tắt</option>
                <option value="5" className="bg-[#101D35] text-white">5 phút</option>
                <option value="10" className="bg-[#101D35] text-white">10 phút</option>
                <option value="15" className="bg-[#101D35] text-white">15 phút</option>
                <option value="30" className="bg-[#101D35] text-white">30 phút</option>
                <option value="45" className="bg-[#101D35] text-white">45 phút</option>
                <option value="60" className="bg-[#101D35] text-white">60 phút</option>
              </select>
              <Moon className="w-3.5 h-3.5 absolute right-2 top-3 pointer-events-none text-[#D8B878]" />
            </div>

            {/* Voice recitation guide */}
            {currentTrack.instructions && (
              <button
                onClick={handleToggleVoiceInstruction}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors min-h-[40px] ${
                  isSpeakingInstruction ? 'bg-[#D8B878] text-[#101D35]' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Giọng đọc hướng dẫn tiếng Việt"
              >
                <Volume1 className="w-4 h-4" />
                <span>{isSpeakingInstruction ? 'Dừng đọc' : 'Đọc dẫn'}</span>
              </button>
            )}

            {/* Mute button */}
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={isMuted ? 'Bật âm' : 'Tắt âm'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Instructions / Sutra verses text section */}
          {currentTrack.instructions && (
            <div className="w-full max-w-md mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
              <h4 className="text-xs font-semibold text-[#D8B878] uppercase tracking-wider mb-2">
                Chỉ dẫn thực hành
              </h4>
              <ul className="space-y-2 text-xs text-white/80 leading-relaxed list-disc list-inside">
                {currentTrack.instructions.map((ins: string, idx: number) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
