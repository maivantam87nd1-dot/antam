import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Pause, X, Maximize2 } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, stopTrack, setIsFullPlayerOpen, playbackProgress } = useAudio();

  if (!currentTrack) return null;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-1"
      aria-label="Trình phát thanh thu nhỏ"
    >
      <div className="max-w-xl mx-auto bg-[#101D35]/95 dark:bg-[#172644]/95 text-white backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {/* Subtle top progress hairline */}
        <div className="w-full bg-white/10 h-0.5">
          <div
            className="bg-[#D8B878] h-full transition-all duration-300"
            style={{ width: `${playbackProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between p-2.5 gap-3">
          {/* Left: Artwork + Title */}
          <div
            onClick={() => setIsFullPlayerOpen(true)}
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black/20">
              <img
                src={currentTrack.image || '/assets/images/lotus_pond_dawn_1793159474945.jpg'}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-[#D8B878] animate-pulse"></span>
                    <span className="w-0.5 h-3 bg-[#D8B878] animate-pulse delay-75"></span>
                    <span className="w-0.5 h-1.5 bg-[#D8B878] animate-pulse delay-150"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#D8B878] transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/60 truncate">
                {currentTrack.instructor || currentTrack.translator || 'AN TÂM'}
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsFullPlayerOpen(true)}
              className="p-2 text-white/70 hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Mở toàn màn hình"
              aria-label="Mở toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-[#D8B878] hover:bg-[#c9a762] text-[#101D35] flex items-center justify-center shadow-md active:scale-95 transition-all min-h-[44px] min-w-[44px]"
              title={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
              aria-label={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={stopTrack}
              className="p-2 text-white/50 hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Đóng phát"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
