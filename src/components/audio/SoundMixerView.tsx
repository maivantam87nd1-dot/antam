import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext';
import { AMBIENT_SOUNDS, SOUND_MIX_PRESETS } from '../../data/mockData';
import { SoundPreset } from '../../types';
import {
  CloudRain,
  Waves,
  Bell,
  Radio,
  Wind,
  Bird,
  BellRing,
  Sparkles,
  Volume2,
  VolumeX,
  Moon,
  RotateCcw,
  Share2,
  Bookmark,
  CheckCircle2,
  Plus,
  Trash2,
  Download
} from 'lucide-react';

export const SoundMixerView: React.FC = () => {
  const { user, token } = useAuth();
  const {
    ambientVolumes,
    setAmbientVolume,
    sleepTimerMinutes,
    setSleepTimer,
  } = useAudio();

  const [userPresets, setUserPresets] = useState<SoundPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareInputCode, setShareInputCode] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedShareCode, setCopiedShareCode] = useState<string | null>(null);

  // Fetch user presets
  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/user/sound-presets', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.userPresets) {
        setUserPresets(data.userPresets);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPresets();
  }, [token]);

  const getSoundIcon = (id: string) => {
    switch (id) {
      case 'rain': return CloudRain;
      case 'stream': return Waves;
      case 'singing_bowl': return Bell;
      case 'theta_drone': return Radio;
      case 'bamboo_wind': return Wind;
      case 'waves': return Waves;
      case 'birds': return Bird;
      case 'temple_bell': return BellRing;
      case 'wind_chime': return Sparkles;
      default: return Bell;
    }
  };

  const handleApplyPreset = (preset: { volumes: Record<string, number> }) => {
    AMBIENT_SOUNDS.forEach((s) => {
      const vol = preset.volumes[s.id] || 0;
      setAmbientVolume(s.id, vol);
    });
  };

  const handleResetAll = () => {
    AMBIENT_SOUNDS.forEach((s) => {
      setAmbientVolume(s.id, 0);
    });
  };

  const handleSaveCustomPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim() || isSavingPreset) return;

    setIsSavingPreset(true);
    setSaveSuccess(false);

    try {
      const activeVolumes: Record<string, number> = {};
      Object.entries(ambientVolumes).forEach(([k, v]) => {
        if (v > 0) activeVolumes[k] = v;
      });

      const res = await fetch('/api/user/sound-presets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: newPresetName.trim(),
          volumes: activeVolumes,
          isPublic: true
        })
      });

      const data = await res.json();
      if (data.preset) {
        setUserPresets([data.preset, ...userPresets]);
        setNewPresetName('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleImportPreset = async () => {
    if (!shareInputCode.trim()) return;
    setImportStatus('Đang tìm kiếm...');

    try {
      const res = await fetch(`/api/community/sound-presets/${shareInputCode.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok || !data.preset) {
        throw new Error(data.error || 'Mã chia sẻ không đúng.');
      }

      handleApplyPreset(data.preset);
      setImportStatus(`Đã áp dụng không gian "${data.preset.name}"!`);
      setShareInputCode('');
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      setImportStatus(`Lỗi: ${err.message || 'Không tìm thấy'}`);
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  const handleDeletePreset = async (id: string) => {
    setUserPresets(userPresets.filter(p => p.id !== id));
    if (token) {
      try {
        await fetch(`/api/user/sound-presets/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedShareCode(code);
    setTimeout(() => setCopiedShareCode(null), 2500);
  };

  const isAnyPlaying = Object.values(ambientVolumes).some(v => v > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8B878]/15 text-[#B89650] dark:text-[#D8B878] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Phối Âm Tĩnh Lặng 9 Kênh</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
            Phòng Âm Thanh & Giấc Ngủ
          </h1>
          <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70">
            Hòa quyện tiếng mưa, suối nguồn, gió trúc, chuông chùa và sóng não Theta định tâm
          </p>
        </div>

        {isAnyPlaying && (
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold text-[#17202D]/70 dark:text-white/70 hover:text-rose-500 transition-colors self-start min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tắt tất cả âm thanh</span>
          </button>
        )}
      </div>

      {/* Preset Soundscapes Curated */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#B89650] dark:text-[#D8B878] uppercase tracking-wider block">
          Bộ Phối Âm Chánh Niệm Chọn Lọc
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SOUND_MIX_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 hover:border-[#D8B878] text-left transition-all hover:shadow-xs group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#B89650] dark:text-[#D8B878]" />
                <h4 className="text-xs sm:text-sm font-bold text-[#101D35] dark:text-white group-hover:text-[#B89650] dark:group-hover:text-[#D8B878] transition-colors">
                  {p.name}
                </h4>
              </div>
              <p className="text-xs text-[#17202D]/60 dark:text-white/60 line-clamp-2">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mixer Sliders - 9 Channels */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-[#101D35] dark:text-white uppercase tracking-wider block">
          Bàn Trộn Âm Thanh Chi Tiết (9 Kênh Tùy Biến)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AMBIENT_SOUNDS.map((sound) => {
            const Icon = getSoundIcon(sound.id);
            const currentVol = ambientVolumes[sound.id] || 0;
            const isPlaying = currentVol > 0;

            return (
              <div
                key={sound.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPlaying
                    ? 'bg-white dark:bg-white/10 border-[#B89650] dark:border-[#D8B878] shadow-sm'
                    : 'bg-white/60 dark:bg-white/5 border-[#E8DED0] dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isPlaying
                          ? 'bg-[#B89650] text-white dark:bg-[#D8B878] dark:text-[#101D35]'
                          : 'bg-black/5 dark:bg-white/10 text-[#17202D]/60 dark:text-white/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#101D35] dark:text-white">
                        {sound.name}
                      </h4>
                      <span className="text-[10px] text-[#17202D]/50 dark:text-white/50">
                        {isPlaying ? `Âm lượng: ${Math.round(currentVol * 100)}%` : 'Đang tắt'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setAmbientVolume(sound.id, isPlaying ? 0 : sound.defaultVolume || 0.4)}
                    className="p-1.5 rounded-lg text-[#17202D]/60 dark:text-white/60 hover:text-[#101D35] dark:hover:text-white transition-colors"
                    title={isPlaying ? 'Tắt kênh này' : 'Bật kênh này'}
                  >
                    {isPlaying ? <Volume2 className="w-4 h-4 text-[#B89650] dark:text-[#D8B878]" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={currentVol}
                    onChange={(e) => setAmbientVolume(sound.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#E8DED0] dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#B89650] dark:accent-[#D8B878]"
                  />
                  <span className="text-[11px] font-mono w-8 text-right text-[#17202D]/60 dark:text-white/60">
                    {Math.round(currentVol * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Presets & Sharing */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#101D35] dark:text-white">
              Lưu & Chia Sẻ Không Gian Của Bạn
            </h3>
          </div>

          {/* Import Code Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập mã chia sẻ (VD: ANTAM-DAWN)"
              value={shareInputCode}
              onChange={(e) => setShareInputCode(e.target.value)}
              className="p-2 px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white uppercase font-mono tracking-wider focus:outline-none"
            />
            <button
              onClick={handleImportPreset}
              className="px-3 py-2 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs transition-all shrink-0 min-h-[36px]"
            >
              Nhập mã
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
            {importStatus}
          </div>
        )}

        {/* Save Current Mix Form */}
        <form onSubmit={handleSaveCustomPreset} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Đặt tên cho không gian hiện tại (VD: Chiều Mưa Rừng Trúc)"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            maxLength={40}
            className="flex-1 p-2.5 px-3.5 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newPresetName.trim() || isSavingPreset || !isAnyPlaying}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#B89650] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isSavingPreset ? 'Đang lưu...' : 'Lưu không gian này'}</span>
          </button>
        </form>

        {saveSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã lưu preset thành công vào danh sách của bạn!</span>
          </div>
        )}

        {/* User Saved Presets List */}
        {userPresets.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#E8DED0]/50 dark:border-white/5">
            <span className="text-xs font-semibold text-[#17202D]/70 dark:text-white/70 block">
              Không gian của bạn:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {userPresets.map((up) => (
                <div
                  key={up.id}
                  className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => handleApplyPreset(up)}>
                    <h5 className="font-bold text-[#101D35] dark:text-white hover:text-[#B89650] dark:hover:text-[#D8B878]">
                      {up.name}
                    </h5>
                    <span className="text-[10px] text-[#17202D]/50 dark:text-white/50 font-mono">
                      Mã: {up.shareCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCode(up.shareCode)}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#17202D]/60 dark:text-white/60"
                      title="Sao chép mã chia sẻ"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePreset(up.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500"
                      title="Xóa preset này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sleep Timer Bar */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#101D35] dark:text-white">
              Hẹn Giờ Tắt Âm Thanh (Sleep Timer)
            </h4>
            <p className="text-xs text-[#17202D]/60 dark:text-white/60">
              Tự động giảm dần âm lượng (Fade-out êm ái) và tắt khi bạn đã chìm vào giấc ngủ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[15, 30, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => setSleepTimer(sleepTimerMinutes === mins ? null : mins)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] ${
                sleepTimerMinutes === mins
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-bold shadow-xs'
                  : 'bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70 hover:bg-black/10'
              }`}
            >
              {mins} phút
            </button>
          ))}
          {sleepTimerMinutes !== null && (
            <button
              onClick={() => setSleepTimer(null)}
              className="px-2.5 py-1.5 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
