import React, { useState, useEffect } from 'react';
import { Droplets, Sparkles, Award, Plus, Share2, Check, RefreshCw, Heart, Info } from 'lucide-react';
import { ZenGardenState, ZenGardenPlant, PlantSpecies } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface ZenGardenViewProps {
  onStartMeditation?: () => void;
  onOpenJournal?: () => void;
}

export const ZenGardenView: React.FC<ZenGardenViewProps> = ({
  onStartMeditation,
  onOpenJournal
}) => {
  const [garden, setGarden] = useState<ZenGardenState | null>(null);
  const [loading, setLoading] = useState(true);
  const [watering, setWatering] = useState(false);
  const [bloomCelebration, setBloomCelebration] = useState(false);
  const [isPlantingOpen, setIsPlantingOpen] = useState(false);
  const [newSpecies, setNewSpecies] = useState<PlantSpecies>('lotus');
  const [newPlantName, setNewPlantName] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    fetchGarden();
  }, []);

  const fetchGarden = async () => {
    try {
      const res = await fetch('/api/user/zen-garden');
      const data = await res.json();
      if (data.garden) {
        setGarden(data.garden);
      }
    } catch (e) {
      console.error('Error fetching garden:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleWaterPlant = async (drops = 1) => {
    if (!garden || garden.waterDrops < drops || watering) return;
    setWatering(true);
    soundEngine.playSingingBowl(432, 2.5, 0.35);
    soundEngine.triggerHaptic(50);

    try {
      const res = await fetch('/api/user/zen-garden/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantId: garden.activePlantId, drops })
      });
      const data = await res.json();
      if (data.success) {
        setGarden(data.garden);
        if (data.bloomedNow) {
          setBloomCelebration(true);
          soundEngine.playTempleBell(0.7);
          soundEngine.triggerHaptic([60, 100, 60, 120]);
          setTimeout(() => setBloomCelebration(false), 5000);
        }
      }
    } catch (e) {
      console.error('Watering error:', e);
    } finally {
      setWatering(false);
    }
  };

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/zen-garden/plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species: newSpecies,
          name: newPlantName.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setGarden(data.garden);
        setIsPlantingOpen(false);
        setNewPlantName('');
        soundEngine.playSingingBowl(324, 3.0, 0.4);
      }
    } catch (e) {
      console.error('Error planting new seed:', e);
    }
  };

  const handleShareGardenCard = () => {
    const activePlant = garden?.plants.find(p => p.id === garden.activePlantId) || garden?.plants[0];
    const text = `🌸 Vườn Tâm An của tôi tại An Tâm: Đã nuôi dưỡng được ${activePlant?.flowersBloomed || 0} đóa sen nở hoa từ ${garden?.totalMindfulMinutesInvested || 0} phút chánh niệm. Chúc bạn một ngày bình yên!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  if (loading || !garden) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#17202D]/60 dark:text-white/60">
        <RefreshCw className="w-8 h-8 animate-spin text-[#B89650] dark:text-[#D8B878] mb-3" />
        <p className="text-sm">Đang mở cửa Vườn Tâm An...</p>
      </div>
    );
  }

  const activePlant = garden.plants.find(p => p.id === garden.activePlantId) || garden.plants[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101D35] via-[#1A2D4F] to-[#253D66] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8B878]/20 text-[#D8B878] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VƯỜN TÂM AN · CHÁNH NIỆM TỰ TẠI</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Nuôi Dưỡng Mầm Thiện Từng Ngày
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Mỗi phút bạn ngồi thiền hay viết nhật ký biết ơn đều chuyển hóa thành những giọt nước mát lành nuôi dưỡng đóa sen và cây bồ đề trong tâm hồn bạn.
            </p>
          </div>

          {/* Water Drops Stats Pill */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shrink-0 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shadow-inner">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-white/70">Giọt nước chánh niệm</p>
              <p className="text-2xl font-serif font-bold text-white">
                {garden.waterDrops} <span className="text-xs font-normal text-cyan-300">giọt</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Interactive Garden Sanctuary */}
      <section className="relative rounded-3xl bg-[#F8F6F1] dark:bg-[#142340] border border-[#E8DED0] dark:border-white/10 p-6 sm:p-8 shadow-sm text-center overflow-hidden">
        {/* Celebration Confetti Effect on Bloom */}
        {bloomCelebration && (
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-amber-400/20 to-transparent flex items-center justify-center z-20 pointer-events-none animate-in fade-in duration-500">
            <div className="text-center p-6 bg-black/60 rounded-3xl backdrop-blur-md border border-amber-300/40 text-white space-y-2">
              <p className="text-4xl animate-bounce">🪷 ✨</p>
              <h3 className="font-serif text-xl font-bold text-[#D8B878]">Đóa Sen Nở Rộ Ngát Hương!</h3>
              <p className="text-xs text-white/80">Tâm hoa đã nở rộ nhờ sự kiên trì chánh niệm của bạn.</p>
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto space-y-6">
          {/* Plant Selector Pills if user has multiple plants */}
          {garden.plants.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
              {garden.plants.map(p => (
                <button
                  key={p.id}
                  onClick={() => setGarden({ ...garden, activePlantId: p.id })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    garden.activePlantId === p.id
                      ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35]'
                      : 'bg-[#E8DED0]/60 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70 hover:bg-[#E8DED0]'
                  }`}
                >
                  {p.species === 'lotus' ? '🪷' : p.species === 'bodhi_tree' ? '🌳' : '🎋'} {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Plant Illustration Container with Peaceful Lotus SVG */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            {/* Soft Ambient Halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D8B878]/20 via-pink-400/10 to-transparent blur-2xl animate-pulse" />

            {/* Lotus SVG Representation based on Stage */}
            <div className="relative z-10 transition-transform duration-500 transform hover:scale-105">
              {activePlant.species === 'bodhi_tree' ? (
                /* Bodhi Tree SVG */
                <svg className="w-48 h-48 drop-shadow-xl" viewBox="0 0 100 100" fill="none">
                  <path d="M50 85 L50 60 Q45 50 35 45 Q50 48 50 35 Q55 48 65 45 Q55 50 50 60" stroke="#795548" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="50" cy="30" r="22" fill="#2E7D32" fillOpacity="0.85" />
                  <circle cx="38" cy="38" r="16" fill="#388E3C" fillOpacity="0.9" />
                  <circle cx="62" cy="38" r="16" fill="#4CAF50" fillOpacity="0.9" />
                  <circle cx="50" cy="22" r="14" fill="#81C784" fillOpacity="0.8" />
                </svg>
              ) : activePlant.stage === 'seed' ? (
                /* Seed stage */
                <svg className="w-32 h-32 drop-shadow-md" viewBox="0 0 100 100" fill="none">
                  <ellipse cx="50" cy="75" rx="30" ry="10" fill="#5D4037" fillOpacity="0.4" />
                  <ellipse cx="50" cy="65" rx="8" ry="12" fill="#8D6E63" />
                  <path d="M50 53 Q53 45 58 42" stroke="#81C784" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : activePlant.stage === 'sprout' ? (
                /* Sprout stage */
                <svg className="w-36 h-36 drop-shadow-md" viewBox="0 0 100 100" fill="none">
                  <ellipse cx="50" cy="80" rx="35" ry="10" fill="#4E342E" fillOpacity="0.3" />
                  <path d="M50 80 Q50 60 50 50" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 55 Q35 45 40 35 Q48 40 50 52" fill="#66BB6A" />
                  <path d="M50 52 Q65 42 60 32 Q52 38 50 50" fill="#81C784" />
                </svg>
              ) : activePlant.stage === 'bud' ? (
                /* Bud stage */
                <svg className="w-44 h-44 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
                  <path d="M50 85 Q50 65 50 55" stroke="#388E3C" strokeWidth="5" strokeLinecap="round" />
                  <ellipse cx="50" cy="40" rx="14" ry="22" fill="#EC407A" fillOpacity="0.9" />
                  <path d="M50 40 Q40 30 38 45 Q44 55 50 58" fill="#F06292" />
                  <path d="M50 40 Q60 30 62 45 Q56 55 50 58" fill="#F48FB1" />
                  <path d="M35 55 Q50 65 65 55 Q50 72 35 55" fill="#43A047" />
                </svg>
              ) : (
                /* Full Blooming Lotus */
                <svg className="w-52 h-52 drop-shadow-2xl animate-in zoom-in-95 duration-500" viewBox="0 0 100 100" fill="none">
                  <ellipse cx="50" cy="82" rx="42" ry="10" fill="#1B5E20" fillOpacity="0.3" />
                  {/* Floating Lotus Leaves */}
                  <path d="M12 78 Q50 90 88 78 Q50 72 12 78" fill="#2E7D32" fillOpacity="0.8" />
                  {/* Outer Petals */}
                  <path d="M50 65 C25 65 15 48 28 35 C38 48 48 55 50 65 Z" fill="#F06292" fillOpacity="0.85" />
                  <path d="M50 65 C75 65 85 48 72 35 C62 48 52 55 50 65 Z" fill="#F06292" fillOpacity="0.85" />
                  {/* Mid Petals */}
                  <path d="M50 65 C32 60 26 40 40 25 C46 38 48 50 50 65 Z" fill="#F48FB1" />
                  <path d="M50 65 C68 60 74 40 60 25 C54 38 52 50 50 65 Z" fill="#F48FB1" />
                  {/* Central Sacred Petal */}
                  <path d="M50 65 C42 45 40 25 50 12 C60 25 58 45 50 65 Z" fill="#F8BBD0" />
                  {/* Golden Stamen */}
                  <ellipse cx="50" cy="45" rx="5" ry="4" fill="#FFD54F" />
                </svg>
              )}
            </div>
          </div>

          {/* Plant Name & Growth Details */}
          <div>
            <h3 className="font-serif text-xl font-bold text-[#17202D] dark:text-white">
              {activePlant.name}
            </h3>
            <p className="text-xs text-[#17202D]/60 dark:text-white/60 mt-0.5">
              Giai đoạn: <strong className="capitalize text-[#B89650] dark:text-[#D8B878]">
                {activePlant.stage === 'seed' ? 'Hạt mầm' : activePlant.stage === 'sprout' ? 'Đâm chồi' : activePlant.stage === 'bud' ? 'Búp sen' : activePlant.stage === 'blooming' ? 'Nở hoa thơm ngát' : 'Giác ngộ viên mãn'}
              </strong> · Đã nở: <strong>{activePlant.flowersBloomed} đóa</strong>
            </p>
          </div>

          {/* Progress Bar to next stage */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#17202D]/70 dark:text-white/70">
              <span>Độ tươi tốt</span>
              <span className="font-semibold">{activePlant.currentPoints}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-[#E8DED0] dark:bg-white/10 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-[#D8B878] transition-all duration-500"
                style={{ width: `${Math.min(100, activePlant.currentPoints)}%` }}
              />
            </div>
          </div>

          {/* Watering Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleWaterPlant(1)}
              disabled={garden.waterDrops < 1 || watering}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                garden.waterDrops >= 1
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Droplets className="w-4 h-4 text-cyan-200" />
              <span>Tưới 1 Giọt Nước</span>
            </button>

            {garden.waterDrops >= 3 && (
              <button
                onClick={() => handleWaterPlant(3)}
                disabled={watering}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-sm font-medium transition-colors"
              >
                Tưới 3 giọt cùng lúc
              </button>
            )}

            <button
              onClick={handleShareGardenCard}
              className="p-3 rounded-2xl bg-[#E8DED0]/60 dark:bg-white/10 hover:bg-[#E8DED0] dark:hover:bg-white/20 text-[#17202D]/80 dark:text-white/80 transition-colors"
              title="Chia sẻ thiệp vườn tâm an"
            >
              {copyFeedback ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          {/* How to get more water prompt */}
          {garden.waterDrops < 1 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#17202D] dark:text-amber-100 flex items-center justify-between gap-3">
              <span className="text-left">
                Bạn đã dùng hết giọt nước. Hãy thiền định 3–5 phút để nhận thêm giọt nước chánh niệm nhé!
              </span>
              {onStartMeditation && (
                <button
                  onClick={onStartMeditation}
                  className="px-3 py-1.5 rounded-xl bg-[#D8B878] text-[#101D35] font-semibold text-xs whitespace-nowrap hover:bg-[#ecd29d] transition-colors"
                >
                  Ngồi Thiền Ngay
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Garden Achievements & Mindful Badges */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
            <span>Huy Hiệu Vườn Tâm</span>
          </h3>
          <button
            onClick={() => setIsPlantingOpen(true)}
            className="text-xs text-[#B89650] dark:text-[#D8B878] font-semibold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gieo mầm cây mới</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {garden.badges.map(badge => {
            const isUnlocked = Boolean(badge.unlockedAt);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-[#E8DED0]/50 dark:bg-white/5 border-[#E8DED0] dark:border-white/10 shadow-sm'
                    : 'bg-black/5 dark:bg-black/20 border-dashed border-gray-300 dark:border-white/5 opacity-50'
                }`}
              >
                <div className="text-3xl mb-1.5">{badge.icon}</div>
                <h4 className="font-medium text-xs text-[#17202D] dark:text-white">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-[#17202D]/60 dark:text-white/60 mt-1 line-clamp-2">
                  {badge.description}
                </p>
                {isUnlocked ? (
                  <span className="inline-block mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Đã khai mở
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-[10px] text-gray-400">
                    Chưa đạt
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Modal: Plant a New Seed */}
      {isPlantingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/10 space-y-4">
            <h3 className="font-serif text-lg font-bold">Gieo Mầm Cây Mới Vào Vườn</h3>
            <p className="text-xs text-[#17202D]/70 dark:text-white/70">
              Chọn giống cây thiền môn bạn muốn gieo hạt và chăm sóc bằng sự thực tập mỗi ngày:
            </p>

            <form onSubmit={handleCreatePlant} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { species: 'lotus' as const, label: 'Đóa Sen Hồng', icon: '🪷' },
                  { species: 'bodhi_tree' as const, label: 'Cây Bồ Đề', icon: '🌳' },
                  { species: 'bamboo' as const, label: 'Rừng Trúc Xanh', icon: '🎋' },
                  { species: 'jasmine' as const, label: 'Hoa Nhài Trắng', icon: '🌼' }
                ].map(opt => (
                  <button
                    key={opt.species}
                    type="button"
                    onClick={() => setNewSpecies(opt.species)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      newSpecies === opt.species
                        ? 'border-[#B89650] dark:border-[#D8B878] bg-[#D8B878]/10'
                        : 'border-[#E8DED0] dark:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Tên gọi cho mầm cây (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đóa Sen An Lạc"
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none focus:border-[#D8B878]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlantingOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-white/10 text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold"
                >
                  Gieo Hạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
