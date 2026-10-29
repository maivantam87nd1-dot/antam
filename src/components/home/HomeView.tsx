import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';
import { MoodType } from '../../types';
import { MEDITATION_TRACKS, BUDDHIST_SCRIPTURES, DAILY_QUOTES, MINDFULNESS_SPACES } from '../../data/mockData';
import { SponsoredCard } from '../ads/SponsoredCard';
import {
  Sparkles,
  Play,
  Heart,
  Flame,
  Clock,
  BookOpen,
  Flower2,
  ChevronRight,
  Smile,
  Compass,
  Volume2,
  Eye,
  Headphones,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { SmartPersonalizationResponse } from '../../types';
import { offlineSync } from '../../services/offlineSync';

interface HomeViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenAI: () => void;
  onOpenBreathing: () => void;
  onOpenMindfulLens?: () => void;
  onOpenZenGarden?: () => void;
  onOpenBinaural3D?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateTab,
  onOpenAI,
  onOpenBreathing,
  onOpenMindfulLens,
  onOpenZenGarden,
  onOpenBinaural3D
}) => {
  const { user, logMood } = useAuth();
  const { playTrack, favorites, toggleFavorite } = useAudio();

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [smartRec, setSmartRec] = useState<SmartPersonalizationResponse | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // 1. Subscribe to offline sync queue
    const unsubscribe = offlineSync.subscribe((count) => {
      setPendingSyncCount(count);
    });

    // 2. Fetch real-time AI smart recommendations
    fetch('/api/user/smart-recommendations')
      .then(res => res.json())
      .then(data => {
        if (data.primaryAction) {
          setSmartRec(data);
        }
      })
      .catch(() => {});

    return () => unsubscribe();
  }, []);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng. Chúc bạn một ngày an nhiên.';
    if (hour < 18) return 'Một chút bình yên giữa những bộn bề.';
    return 'Hãy để tâm trí được nghỉ ngơi.';
  };

  const moods: { type: MoodType; label: string; icon: string }[] = [
    { type: 'peaceful', label: 'Bình an', icon: '🪷' },
    { type: 'happy', label: 'Vui vẻ', icon: '✨' },
    { type: 'tired', label: 'Mệt mỏi', icon: '🍃' },
    { type: 'anxious', label: 'Lo lắng', icon: '☁️' },
    { type: 'sad', label: 'Buồn phiền', icon: '🌧️' },
    { type: 'stressed', label: 'Căng thẳng', icon: '⚡' },
    { type: 'insomnia', label: 'Khó ngủ', icon: '🌙' },
  ];

  const handleSelectMood = async (m: MoodType, label: string) => {
    setSelectedMood(m);
    logMood(m, label);

    // Call server AI recommendation
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: m, hour: new Date().getHours() })
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch (e) {
      setRecommendation({
        title: '3 Phút Thở Chậm',
        type: 'breathing',
        targetId: 'relax',
        reason: 'Giúp điều hòa nhịp thở và đưa tâm trở về trạng thái an tĩnh.'
      });
    }
  };

  const handleQuickMeditation = () => {
    const quickTrack = MEDITATION_TRACKS[0]; // Beginner track
    playTrack(quickTrack, 3);
  };

  const todayQuote = DAILY_QUOTES[0];
  const featuredMeditation = MEDITATION_TRACKS[1]; // Morning awakening
  const featuredSutra = BUDDHIST_SCRIPTURES[0]; // Bat Nha Tam Kinh

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {/* 1. Header Greeting & Hero Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101D35] to-[#172644] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs uppercase tracking-widest text-[#D8B878] font-semibold mb-2">
            AN TÂM · MINDFULNESS
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
            {getGreeting()}
          </h1>
          <p className="text-sm text-white/80 mb-6">
            An tâm trong từng hơi thở – Bình an trong từng khoảnh khắc.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleQuickMeditation}
              className="px-5 py-3 rounded-2xl bg-[#D8B878] hover:bg-[#c9a762] text-[#101D35] font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt đầu 3 phút bình an</span>
            </button>

            <button
              onClick={onOpenBreathing}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Flower2 className="w-4 h-4 text-[#D8B878]" />
              <span>Tập thở chánh niệm</span>
            </button>
          </div>
        </div>

        {/* Ambient Lotus Image backdrop */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none hidden sm:block">
          <img
            src="/assets/images/lotus_pond_dawn_1793159474945.jpg"
            alt="Lotus"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Offline Sync Banner if items are waiting in local queue */}
      {pendingSyncCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-[#17202D] dark:text-cyan-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Đang lưu trữ <strong>{pendingSyncCount} mục ngoại tuyến</strong>. Sẽ tự động đồng bộ khi có kết nối mạng.</span>
          </div>
          <button
            onClick={() => offlineSync.syncNow()}
            className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-medium"
          >
            Đồng bộ ngay
          </button>
        </div>
      )}

      {/* TÍNH NĂNG ĐỘT PHÁ: Quick Innovators Launcher Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Mindful Lens */}
        <button
          onClick={onOpenMindfulLens}
          className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#F5EFE6] dark:from-[#142340] dark:to-[#101D35] border border-[#E8DED0] dark:border-white/10 hover:border-[#D8B878]/50 text-left transition-all group shadow-sm flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xs sm:text-sm text-[#17202D] dark:text-white truncate">
                Góc Nhìn Tỉnh Thức
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                AI LENS
              </span>
            </div>
            <p className="text-[11px] text-[#17202D]/60 dark:text-white/60 truncate mt-0.5">
              Camera nhận diện căng thẳng
            </p>
          </div>
        </button>

        {/* 2. Vườn Tâm An */}
        <button
          onClick={onOpenZenGarden}
          className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#F5EFE6] dark:from-[#142340] dark:to-[#101D35] border border-[#E8DED0] dark:border-white/10 hover:border-[#D8B878]/50 text-left transition-all group shadow-sm flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xs sm:text-sm text-[#17202D] dark:text-white truncate">
                Vườn Tâm An
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                SEN NỞ
              </span>
            </div>
            <p className="text-[11px] text-[#17202D]/60 dark:text-white/60 truncate mt-0.5">
              Vun đắp đóa sen chánh niệm
            </p>
          </div>
        </button>

        {/* 3. Sóng Não 3D */}
        <button
          onClick={onOpenBinaural3D}
          className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#F5EFE6] dark:from-[#142340] dark:to-[#101D35] border border-[#E8DED0] dark:border-white/10 hover:border-[#D8B878]/50 text-left transition-all group shadow-sm flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xs sm:text-sm text-[#17202D] dark:text-white truncate">
                Sóng Não 3D
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold shrink-0">
                BINAURAL
              </span>
            </div>
            <p className="text-[11px] text-[#17202D]/60 dark:text-white/60 truncate mt-0.5">
              Âm thanh vòm xoay 360°
            </p>
          </div>
        </button>
      </section>

      {/* CÁ NHÂN HÓA THỜI GIAN THỰC (REAL-TIME SMART AI RECOMMENDATION CARD) */}
      {smartRec && (
        <section className="p-5 rounded-3xl bg-[#E8DED0]/50 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B89650] dark:text-[#D8B878]" />
              <span className="text-xs uppercase font-bold tracking-wider text-[#17202D]/70 dark:text-white/70">
                Gợi Ý Chánh Niệm Thời Gian Thực
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold">
              {smartRec.primaryAction.badgeText}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#101D35] dark:text-white">
                {smartRec.primaryAction.title}
              </h3>
              <p className="text-xs text-[#17202D]/70 dark:text-white/70">
                {smartRec.primaryAction.reason}
              </p>
            </div>

            <button
              onClick={() => {
                if (smartRec.primaryAction.category === 'breathing') {
                  onOpenBreathing();
                } else if (smartRec.primaryAction.category === 'sound') {
                  if (onOpenBinaural3D) onOpenBinaural3D();
                } else if (smartRec.primaryAction.category === 'micro') {
                  onNavigateTab('meditation');
                } else {
                  handleQuickMeditation();
                }
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#101D35] hover:bg-[#1C2C4E] dark:bg-[#D8B878] dark:hover:bg-[#ecd29d] text-white dark:text-[#101D35] font-semibold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md transition-all min-h-[40px]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Thực Hành Ngay</span>
            </button>
          </div>
        </section>
      )}

      {/* 2. Mood Check-in: "Hôm nay tâm bạn thế nào?" */}
      <section className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-[#E8DED0] dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
              Hôm nay tâm bạn thế nào?
            </h2>
            <p className="text-xs text-[#17202D]/60 dark:text-white/60">
              Quan sát và ghi nhận cảm xúc tự nhiên không phán xét
            </p>
          </div>
        </div>

        {/* Mood Horizontal Pills */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {moods.map((m) => {
            const isSelected = selectedMood === m.type;
            return (
              <button
                key={m.type}
                onClick={() => handleSelectMood(m.type, m.label)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-h-[56px] ${
                  isSelected
                    ? 'bg-[#101D35] text-white border-[#101D35] dark:bg-[#D8B878] dark:text-[#101D35] dark:border-[#D8B878] shadow-sm font-semibold scale-105'
                    : 'bg-white/50 dark:bg-white/5 border-[#E8DED0] dark:border-white/10 hover:border-[#D8B878] text-[#17202D] dark:text-white'
                }`}
              >
                <span className="text-xl mb-1">{m.icon}</span>
                <span className="text-[11px] truncate">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Activity Recommendation */}
        {recommendation && (
          <div className="mt-4 p-4 rounded-2xl bg-[#D8B878]/15 dark:bg-[#D8B878]/10 border border-[#D8B878]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div>
              <span className="text-xs font-semibold text-[#B89650] dark:text-[#D8B878] uppercase tracking-wider">
                Gợi ý dành riêng cho tâm trạng của bạn
              </span>
              <h4 className="text-sm font-bold text-[#101D35] dark:text-white">
                {recommendation.title}
              </h4>
              <p className="text-xs text-[#17202D]/70 dark:text-white/70">
                {recommendation.reason}
              </p>
            </div>
            <button
              onClick={() => {
                if (recommendation.type === 'breathing') {
                  onOpenBreathing();
                } else if (recommendation.targetId) {
                  const track = MEDITATION_TRACKS.find(t => t.id === recommendation.targetId) || MEDITATION_TRACKS[0];
                  playTrack(track);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap min-h-[40px]"
            >
              Bắt đầu ngay
            </button>
          </div>
        )}
      </section>

      {/* 3. My Practice Journey Summary */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#101D35] dark:text-white tabular-nums">
            {user?.streakDays || 1}
          </span>
          <span className="text-[11px] text-[#17202D]/60 dark:text-white/60">
            Ngày liên tiếp
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#101D35] dark:text-white tabular-nums">
            {user?.totalMeditationMinutes || 35}
          </span>
          <span className="text-[11px] text-[#17202D]/60 dark:text-white/60">
            Phút tĩnh lặng
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
            <Flower2 className="w-4 h-4" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#101D35] dark:text-white tabular-nums">
            {user?.totalSessions || 4}
          </span>
          <span className="text-[11px] text-[#17202D]/60 dark:text-white/60">
            Buổi thực hành
          </span>
        </div>
      </section>

      {/* 4. Featured Meditation & Scripture */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
            Nội dung dành cho bạn
          </h2>
          <button
            onClick={() => onNavigateTab('meditation')}
            className="text-xs text-[#B89650] dark:text-[#D8B878] font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Featured Meditation */}
          <div className="group rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative h-44 overflow-hidden">
              <img
                src={featuredMeditation.image}
                alt={featuredMeditation.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => toggleFavorite(featuredMeditation.id)}
                  className="p-2 rounded-full bg-black/40 text-white hover:text-rose-400 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(featuredMeditation.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[11px] text-[#D8B878] font-semibold uppercase tracking-wider">
                  {featuredMeditation.categoryName}
                </span>
                <h3 className="font-serif text-lg font-bold text-white truncate">
                  {featuredMeditation.title}
                </h3>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#17202D]/70 dark:text-white/70 line-clamp-2 mb-3">
                {featuredMeditation.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#E8DED0]/50 dark:border-white/10 text-xs">
                <span className="text-[#17202D]/60 dark:text-white/60">
                  {featuredMeditation.instructor} · {featuredMeditation.durations[0]} phút
                </span>
                <button
                  onClick={() => playTrack(featuredMeditation)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Nghe thiền</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Featured Buddhist Scripture */}
          <div className="group rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative h-44 overflow-hidden">
              <img
                src={featuredSutra.image}
                alt={featuredSutra.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => toggleFavorite(featuredSutra.id)}
                  className="p-2 rounded-full bg-black/40 text-white hover:text-rose-400 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(featuredSutra.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[11px] text-[#D8B878] font-semibold uppercase tracking-wider">
                  {featuredSutra.categoryLabel}
                </span>
                <h3 className="font-serif text-lg font-bold text-white truncate">
                  {featuredSutra.title}
                </h3>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#17202D]/70 dark:text-white/70 line-clamp-2 mb-3">
                {featuredSutra.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#E8DED0]/50 dark:border-white/10 text-xs">
                <span className="text-[#17202D]/60 dark:text-white/60">
                  {featuredSutra.translator}
                </span>
                <button
                  onClick={() => onNavigateTab('buddhist')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc tụng kinh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Daily Buddha Wisdom Quote */}
      <section className="p-6 rounded-3xl bg-[#E8DED0]/50 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto">
          <span className="text-xs font-semibold text-[#B89650] dark:text-[#D8B878] uppercase tracking-wider mb-2 block">
            Lời Phật Dạy Hôm Nay
          </span>
          <blockquote className="font-serif italic text-base sm:text-lg text-[#101D35] dark:text-[#F5F7FA] mb-2 leading-relaxed">
            "{todayQuote.text}"
          </blockquote>
          <p className="text-xs text-[#17202D]/60 dark:text-white/60 font-medium">
            — {todayQuote.author}
          </p>
        </div>
      </section>

      {/* Non-intrusive Ethical Sponsor Card (Hidden for Premium) */}
      <SponsoredCard
        title="Trà Sen Cổ Truyền Tây Hồ - Nuôi dưỡng sự tĩnh lặng"
        sponsorName="Trà Đạo An Nhiên"
        description="Được ướp từ gạo sen Bách Diệp tuyển chọn, hương vị thanh khiết thích hợp để thưởng thức trước hoặc sau mỗi thời khóa tọa thiền."
        actionText="Khám phá trà thiền"
        actionUrl="https://shopee.vn/search?keyword=tra+sen+tay+ho+uop+that"
        badge="Được tài trợ"
      />

      {/* 6. AI An Tâm Companion Callout */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-[#D8B878]/20 via-[#A8B8A0]/15 to-[#DDEAF0]/20 border border-[#D8B878]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#101D35] text-[#D8B878] flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#101D35] dark:text-white">
              Cần một người lắng nghe hoặc giải đáp Phật pháp?
            </h3>
            <p className="text-xs text-[#17202D]/70 dark:text-white/70">
              Trợ lý AI An Tâm luôn sẵn sàng lắng nghe, gợi ý bài thở và chia sẻ giáo lý bình an.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAI}
          className="px-5 py-2.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap min-h-[44px]"
        >
          Trò chuyện với An Tâm
        </button>
      </section>
    </div>
  );
};
