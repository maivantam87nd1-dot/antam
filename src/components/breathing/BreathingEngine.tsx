import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { useAuth } from '../../context/AuthContext';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export type BreathingMode = 'relax' | 'balance' | 'box' | 'sleep' | 'slow';

interface BreathingConfig {
  name: string;
  description: string;
  inhale: number;
  holdIn?: number;
  exhale: number;
  holdOut?: number;
}

const MODES: Record<BreathingMode, BreathingConfig> = {
  relax: {
    name: 'Thở Thư Giãn',
    description: 'Hít 4 giây, thở ra 6 giây giúp kích hoạt hệ phó giao cảm và giải tỏa căng thẳng.',
    inhale: 4,
    exhale: 6,
  },
  balance: {
    name: 'Thở Cân Bằng',
    description: 'Nhịp thở 4-4 đồng đều giúp quân bình cảm xúc và huyết áp.',
    inhale: 4,
    exhale: 4,
  },
  box: {
    name: 'Thở Hộp (Box Breathing)',
    description: 'Kỹ thuật 4-4-4-4 rèn luyện sự tĩnh tại và tập trung tinh thần cao độ.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
  sleep: {
    name: 'Thở 4-7-8 Dễ Ngủ',
    description: 'Kỹ thuật điều hòa khí huyết đưa não bộ vào trạng thái tĩnh lặng sâu.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
  },
  slow: {
    name: 'Thở Chậm Sâu',
    description: 'Hít 5 giây, thở ra 5 giây nuôi dưỡng từng tế bào bằng dưỡng khí dồi dào.',
    inhale: 5,
    exhale: 5,
  },
};

export const BreathingEngine: React.FC = () => {
  const { completeSession } = useAuth();
  const [selectedMode, setSelectedMode] = useState<BreathingMode>('relax');
  const [targetMinutes, setTargetMinutes] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Phases: 'inhale' | 'holdIn' | 'exhale' | 'holdOut'
  const [phase, setPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');
  const [phaseRemaining, setPhaseRemaining] = useState(MODES.relax.inhale);

  const cfg = MODES[selectedMode];
  const targetSeconds = targetMinutes * 60;

  // Bell audio cue on phase transition
  const triggerPhaseTransition = (nextPhase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    setPhase(nextPhase);
    soundEngine.triggerHaptic(nextPhase === 'inhale' ? 50 : 35);
    if (soundEnabled) {
      if (nextPhase === 'inhale') {
        soundEngine.playSingingBowl(324, 2.5, 0.4);
      } else if (nextPhase === 'exhale') {
        soundEngine.playSingingBowl(216, 3.0, 0.35);
      } else {
        soundEngine.playWoodBlock(0.2);
      }
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev + 1 >= targetSeconds) {
            // Finished
            setIsActive(false);
            soundEngine.playSingingBowl(216, 6.0, 0.7);
            soundEngine.triggerHaptic([100, 50, 100]);
            completeSession(targetMinutes);
            return targetSeconds;
          }
          return prev + 1;
        });

        setPhaseRemaining((prev) => {
          if (prev <= 1) {
            // Advance phase
            if (phase === 'inhale') {
              if (cfg.holdIn && cfg.holdIn > 0) {
                triggerPhaseTransition('holdIn');
                return cfg.holdIn;
              } else {
                triggerPhaseTransition('exhale');
                return cfg.exhale;
              }
            } else if (phase === 'holdIn') {
              triggerPhaseTransition('exhale');
              return cfg.exhale;
            } else if (phase === 'exhale') {
              if (cfg.holdOut && cfg.holdOut > 0) {
                triggerPhaseTransition('holdOut');
                return cfg.holdOut;
              } else {
                triggerPhaseTransition('inhale');
                return cfg.inhale;
              }
            } else {
              // from holdOut to inhale
              triggerPhaseTransition('inhale');
              return cfg.inhale;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, cfg, targetSeconds, targetMinutes, soundEnabled]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setPhaseRemaining(cfg.inhale);
    triggerPhaseTransition('inhale');
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setElapsedSeconds(0);
    setPhase('inhale');
    setPhaseRemaining(cfg.inhale);
  };

  // Phase instructional label
  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Hít Vào Nhẹ Nhàng';
      case 'holdIn':
        return 'Giữ Hơi Thong Dong';
      case 'exhale':
        return 'Thở Ra Buông Xả';
      case 'holdOut':
        return 'Nghỉ Trong Tĩnh Lặng';
    }
  };

  // Dynamic scale calculation for smooth breath visualization
  const getScaleClass = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'inhale') return 'scale-125 transition-transform duration-1000 ease-out';
    if (phase === 'holdIn') return 'scale-125 transition-transform duration-300';
    if (phase === 'exhale') return 'scale-85 transition-transform duration-1000 ease-in-out';
    return 'scale-85 transition-transform duration-300';
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto px-4 py-4 text-center">
      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-[#E8DED0]/60 dark:bg-white/10 rounded-2xl mb-5">
        {(Object.keys(MODES) as BreathingMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSelectedMode(mode);
              handleReset();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all min-h-[38px] ${
              selectedMode === mode
                ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] shadow-sm font-semibold'
                : 'text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            {MODES[mode].name}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#17202D]/60 dark:text-white/60 mb-6 max-w-md">
        {cfg.description}
      </p>

      {/* Main Breathing Visual: Concentric Sacred Zen Lotus / Circle */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
        {/* Outer ambient glow rings */}
        <div
          className={`absolute inset-0 rounded-full bg-[#D8B878]/15 dark:bg-[#D8B878]/10 blur-xl ${getScaleClass()}`}
        />
        <div
          className={`absolute inset-4 rounded-full border border-[#D8B878]/30 dark:border-[#D8B878]/20 ${getScaleClass()}`}
        />

        {/* Central Core Breathing Orb */}
        <div
          className={`w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#101D35] to-[#172644] dark:from-[#D8B878] dark:to-[#B89650] text-white dark:text-[#101D35] flex flex-col items-center justify-center shadow-2xl z-10 transition-transform ${getScaleClass()}`}
        >
          <span className="text-xs font-semibold tracking-widest uppercase opacity-80 mb-1">
            {getPhaseInstruction()}
          </span>
          <span className="font-serif text-4xl sm:text-5xl font-bold font-mono tabular-nums">
            {isActive ? phaseRemaining : cfg.inhale}
          </span>
          <span className="text-[11px] opacity-75 mt-1 font-mono tabular-nums">
            {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')} / {targetMinutes}:00
          </span>
        </div>
      </div>

      {/* Target Minutes Selection */}
      {!isActive && (
        <div className="flex items-center gap-2 my-4">
          <span className="text-xs text-[#17202D]/60 dark:text-white/60">Thời gian:</span>
          {[1, 3, 5, 10].map((m) => (
            <button
              key={m}
              onClick={() => setTargetMinutes(m)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors min-h-[36px] ${
                targetMinutes === m
                  ? 'bg-[#D8B878] text-[#101D35] font-semibold'
                  : 'bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70'
              }`}
            >
              {m} phút
            </button>
          ))}
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleReset}
          className="p-3 rounded-full bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Làm mới bài tập"
          aria-label="Làm mới"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={isActive ? handlePause : handleStart}
          className="px-8 py-3.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-sm shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 min-h-[48px]"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Tạm dừng</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{elapsedSeconds > 0 ? 'Tiếp tục thở' : 'Bắt đầu thở'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 rounded-full bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          title={soundEnabled ? 'Tắt tiếng chuông' : 'Bật tiếng chuông'}
          aria-label={soundEnabled ? 'Tắt chuông' : 'Bật chuông'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Safety Notice Note */}
      <div className="mt-8 flex items-center gap-2 text-xs text-[#17202D]/50 dark:text-white/50 max-w-sm">
        <ShieldAlert className="w-4 h-4 shrink-0 text-[#B89650]" />
        <span>Nếu bạn cảm thấy hơi thở gấp gáp hoặc chóng mặt, hãy dừng lại và thở tự nhiên.</span>
      </div>
    </div>
  );
};
