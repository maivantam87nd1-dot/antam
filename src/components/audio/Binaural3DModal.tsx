import React, { useState, useEffect } from 'react';
import { Headphones, Volume2, X, Play, Square, Compass, Sparkles, Moon, Sun, Zap, Disc } from 'lucide-react';
import { BinauralBand } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface Binaural3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BINAURAL_PRESETS: Array<{
  band: BinauralBand;
  name: string;
  targetBeatHz: number;
  icon: string;
  subtitle: string;
  description: string;
}> = [
  {
    band: 'theta',
    name: 'Sóng Não Theta (6.0 Hz)',
    targetBeatHz: 6.0,
    icon: '🧘',
    subtitle: 'Thiền Định Sâu & Tĩnh Giác',
    description: 'Tần số hoàng kim đưa não bộ vào trạng thái thiền sâu, cân bằng hai bán cầu não và thanh lọc tâm trí.'
  },
  {
    band: 'alpha',
    name: 'Sóng Não Alpha (10.0 Hz)',
    targetBeatHz: 10.0,
    icon: '✨',
    subtitle: 'Thư Giãn Tỉnh Táo & Sáng Tạo',
    description: 'Giúp giải tỏa căng thẳng công việc, đưa tâm về an tĩnh nhưng vẫn duy trì sự sáng suốt và tập trung học tập.'
  },
  {
    band: 'delta',
    name: 'Sóng Não Delta (2.5 Hz)',
    targetBeatHz: 2.5,
    icon: '🌙',
    subtitle: 'Giấc Ngủ Sâu & Phục Hồi Tế Bào',
    description: 'Tần số siêu trầm ru êm hệ thần kinh, giải phóng hormone melatonin tự nhiên và xua tan chứng mất ngủ.'
  },
  {
    band: 'gamma',
    name: 'Sóng Não Gamma (40.0 Hz)',
    targetBeatHz: 40.0,
    icon: '⚡',
    subtitle: 'Tuệ Giác Khởi Sanh & Minh Triết',
    description: 'Kích thích khả năng liên kết thông tin đa tầng, tăng cường sự minh mẫn và khả năng nhận biết chánh niệm.'
  }
];

export const Binaural3DModal: React.FC<Binaural3DModalProps> = ({ isOpen, onClose }) => {
  const [selectedBand, setSelectedBand] = useState<BinauralBand>('theta');
  const [carrierFreq, setCarrierFreq] = useState(216); // 216Hz, 432Hz, 528Hz
  const [spatial3D, setSpatial3D] = useState(true);
  const [volume, setVolume] = useState(0.45);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isOpen && isPlaying) {
      soundEngine.stopBinauralBeats();
      setIsPlaying(false);
    }
  }, [isOpen]);

  const currentPreset = BINAURAL_PRESETS.find(p => p.band === selectedBand) || BINAURAL_PRESETS[0];

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundEngine.stopBinauralBeats();
      setIsPlaying(false);
    } else {
      soundEngine.startBinauralBeats(carrierFreq, currentPreset.targetBeatHz, volume, spatial3D);
      setIsPlaying(true);
      soundEngine.triggerHaptic(40);
    }
  };

  const handleBandChange = (band: BinauralBand) => {
    setSelectedBand(band);
    if (isPlaying) {
      const preset = BINAURAL_PRESETS.find(p => p.band === band);
      if (preset) {
        soundEngine.startBinauralBeats(carrierFreq, preset.targetBeatHz, volume, spatial3D);
      }
    }
  };

  const handleCarrierChange = (freq: number) => {
    setCarrierFreq(freq);
    if (isPlaying) {
      soundEngine.startBinauralBeats(freq, currentPreset.targetBeatHz, volume, spatial3D);
    }
  };

  const handleSpatialToggle = () => {
    const nextVal = !spatial3D;
    setSpatial3D(nextVal);
    if (isPlaying) {
      soundEngine.startBinauralBeats(carrierFreq, currentPreset.targetBeatHz, volume, nextVal);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isPlaying) {
      soundEngine.startBinauralBeats(carrierFreq, currentPreset.targetBeatHz, newVol, spatial3D);
    }
  };

  const handleChimeBell = () => {
    soundEngine.playSingingBowl(carrierFreq, 4.0, 0.5);
    soundEngine.triggerHaptic(50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DED0] dark:border-white/10 bg-gradient-to-r from-[#101D35] via-[#182B4D] to-[#1F3763] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#D8B878]/20 flex items-center justify-center text-[#D8B878]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Sóng Não 3D & Binaural Beats</h3>
              <p className="text-xs text-white/70">Âm thanh vòm xoay 360° định tâm sâu</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlaying) soundEngine.stopBinauralBeats();
              setIsPlaying(false);
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Headphone requirement notice */}
          <div className="flex items-center gap-2.5 text-xs text-[#B89650] dark:text-[#D8B878] bg-[#D8B878]/10 p-3 rounded-2xl border border-[#D8B878]/20">
            <Headphones className="w-4 h-4 shrink-0 animate-bounce" />
            <span>
              <strong>Lưu ý:</strong> Vui lòng đeo tai nghe stereo (hai bên tai) để trải nghiệm trọn vẹn hiệu ứng cộng hưởng sóng não và âm thanh 3D xoay vòng.
            </span>
          </div>

          {/* Interactive 3D Spatial Radar Visualizer */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#0B132B] to-[#101D35] p-6 text-center text-white border border-white/10 overflow-hidden shadow-inner">
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              {/* Concentric frequency rings */}
              <div className={`absolute inset-0 rounded-full border border-cyan-500/20 ${isPlaying ? 'animate-ping' : ''}`} />
              <div className="absolute inset-4 rounded-full border border-[#D8B878]/30" />
              <div className="absolute inset-10 rounded-full border border-dashed border-white/20" />

              {/* Head center marker */}
              <div className="relative z-10 w-14 h-14 rounded-full bg-[#101D35] border-2 border-[#D8B878] flex items-center justify-center text-2xl shadow-lg">
                {currentPreset.icon}
              </div>

              {/* Orbiting sound particle when 3D is active */}
              {spatial3D && isPlaying && (
                <div
                  className="absolute w-full h-full animate-spin"
                  style={{ animationDuration: '24s' }}
                >
                  <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] -top-2 left-1/2 -translate-x-1/2 absolute" />
                </div>
              )}
            </div>

            <div className="mt-3">
              <span className="text-xs uppercase tracking-wider text-[#D8B878] font-semibold">
                Tần số cộng hưởng: {currentPreset.targetBeatHz} Hz ({selectedBand.toUpperCase()})
              </span>
              <p className="text-xs text-white/70 mt-0.5">
                {spatial3D ? 'Âm thanh 3D đang xoay vòng quanh luân xa vương miện (Sahasrara)' : 'Âm thanh cân bằng cố định hai tai'}
              </p>
            </div>
          </div>

          {/* Preset Frequency Bands Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#17202D]/60 dark:text-white/60">
              Chọn tầng sóng não mong muốn:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {BINAURAL_PRESETS.map((preset) => (
                <button
                  key={preset.band}
                  onClick={() => handleBandChange(preset.band)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedBand === preset.band
                      ? 'border-[#B89650] dark:border-[#D8B878] bg-[#D8B878]/15 shadow-sm'
                      : 'border-[#E8DED0] dark:border-white/10 hover:bg-[#E8DED0]/40 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="font-semibold text-xs text-[#17202D] dark:text-white">{preset.name}</span>
                  </div>
                  <p className="text-[11px] text-[#17202D]/70 dark:text-white/70 mt-1 line-clamp-1">
                    {preset.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Carrier Tone (Tần số gốc) Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#17202D]/70 dark:text-white/70">
                Tần số sóng gốc (Carrier Tone):
              </span>
              <span className="text-[#B89650] dark:text-[#D8B878] font-bold">{carrierFreq} Hz</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { freq: 216, label: '216 Hz (Âm Om)' },
                { freq: 432, label: '432 Hz (Tự Nhiên)' },
                { freq: 528, label: '528 Hz (Tái Tạo)' }
              ].map(item => (
                <button
                  key={item.freq}
                  onClick={() => handleCarrierChange(item.freq)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    carrierFreq === item.freq
                      ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] border-transparent font-semibold'
                      : 'bg-[#E8DED0]/50 dark:bg-white/5 border-[#E8DED0] dark:border-white/10 text-[#17202D]/70 dark:text-white/70'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spatial Panner & Volume Controls */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#E8DED0]/40 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <Compass className="w-4 h-4 text-[#B89650] dark:text-[#D8B878]" />
                <span>Âm Thanh Vòm 3D (360° Spatial Panning)</span>
              </div>
              <button
                onClick={handleSpatialToggle}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  spatial3D ? 'bg-[#B89650] dark:bg-[#D8B878]' : 'bg-gray-300 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    spatial3D ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#B89650] dark:text-[#D8B878]" /> Âm lượng sóng não:
                </span>
                <span className="text-[#B89650] dark:text-[#D8B878]">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-[#B89650] dark:accent-[#D8B878]"
              />
            </div>
          </div>

          {/* Action Play / Stop Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleTogglePlay}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-gradient-to-r from-[#101D35] to-[#1C2C4E] hover:from-[#172644] hover:to-[#22355C] text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Dừng Phát Sóng Não</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-[#D8B878]" />
                  <span>Bắt Đầu Trải Nghiệm Sóng Não 3D</span>
                </>
              )}
            </button>

            <button
              onClick={handleChimeBell}
              className="py-3 px-4 rounded-2xl bg-[#E8DED0]/60 dark:bg-white/10 hover:bg-[#E8DED0] dark:hover:bg-white/20 text-[#17202D] dark:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Thỉnh chuông xoay thanh lọc"
            >
              <Disc className="w-4 h-4 text-[#B89650] dark:text-[#D8B878]" />
              <span>Chuông Xoay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
