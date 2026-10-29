import React, { useState } from 'react';
import { MINDFULNESS_SPACES } from '../../data/mockData';
import { MindfulnessSpace } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { Play, Pause, Maximize2, Minimize2, Sparkles, Volume2, Clock } from 'lucide-react';

export const AnTamSpaceView: React.FC = () => {
  const [activeSpace, setActiveSpace] = useState<MindfulnessSpace>(MINDFULNESS_SPACES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);

  const startSpaceSound = (space: MindfulnessSpace) => {
    soundEngine.stopAll();
    if (space.ambientTone === 'stream') soundEngine.startStream(0.4);
    else if (space.ambientTone === 'rain') soundEngine.startRain(0.4);
    else if (space.ambientTone === 'singing_bowl') soundEngine.startSingingBowlLoop(0.4);
    else soundEngine.startThetaDrone(0.3);
  };

  const handleTogglePlay = (space: MindfulnessSpace) => {
    if (isPlaying && activeSpace.id === space.id) {
      soundEngine.stopAll();
      setIsPlaying(false);
    } else {
      setActiveSpace(space);
      setIsPlaying(true);
      startSpaceSound(space);
      soundEngine.playSingingBowl(216, 5.0, 0.6);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
            Không Gian An Tâm (Zen Spaces)
          </h1>
          <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70">
            Hòa mình vào thiên nhiên tĩnh lặng, ngắm cảnh an yên và lắng đọng tâm hồn
          </p>
        </div>
      </div>

      {/* Main Selected Space Showcase Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl transition-all shadow-2xl border border-white/10 ${
          isImmersive ? 'fixed inset-0 z-50 rounded-none' : 'h-[380px] sm:h-[460px]'
        }`}
      >
        <img
          src={activeSpace.image}
          alt={activeSpace.vietnameseName}
          className="w-full h-full object-cover animate-float"
          style={{ animationDuration: '14s' }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setIsImmersive(!isImmersive)}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isImmersive ? 'Thoát toàn màn hình' : 'Toàn màn hình tĩnh lặng'}
          >
            {isImmersive ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Information & Ambient Player */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-md text-white">
            <span className="text-xs font-semibold text-[#D8B878] uppercase tracking-widest block mb-1">
              Không gian thiền định
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
              {activeSpace.vietnameseName}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {activeSpace.description}
            </p>
          </div>

          <button
            onClick={() => handleTogglePlay(activeSpace)}
            className="px-6 py-3.5 rounded-2xl bg-[#D8B878] hover:bg-[#c9a762] text-[#101D35] font-semibold text-xs sm:text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto min-h-[48px]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Tạm dừng âm cảnh</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu an trú</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Other Spaces Selector */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-[#B89650] dark:text-[#D8B878] uppercase tracking-wider block">
          Chọn Không Gian Khác
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MINDFULNESS_SPACES.map((space) => {
            const isSelected = activeSpace.id === space.id;
            return (
              <button
                key={space.id}
                onClick={() => {
                  setActiveSpace(space);
                  if (isPlaying) startSpaceSound(space);
                }}
                className={`group relative rounded-2xl overflow-hidden text-left border transition-all h-28 sm:h-32 flex flex-col justify-end p-3 ${
                  isSelected
                    ? 'border-[#D8B878] ring-2 ring-[#D8B878]/50 shadow-md'
                    : 'border-[#E8DED0] dark:border-white/10 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={space.image}
                  alt={space.vietnameseName}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="relative z-10 text-xs font-bold text-white leading-tight">
                  {space.vietnameseName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
