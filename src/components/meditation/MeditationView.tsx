import React, { useState } from 'react';
import { MEDITATION_TRACKS } from '../../data/mockData';
import { MeditationTrack, MeditationCategory } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext';
import { BreathingEngine } from '../breathing/BreathingEngine';
import { Play, Heart, Search, Filter, Clock, Sparkles } from 'lucide-react';

interface MeditationViewProps {
  initialSubTab?: 'meditation' | 'breathing';
}

export const MeditationView: React.FC<MeditationViewProps> = ({ initialSubTab = 'meditation' }) => {
  const { user } = useAuth();
  const { playTrack, favorites, toggleFavorite } = useAudio();
  const [activeSubTab, setActiveSubTab] = useState<'meditation' | 'breathing'>(initialSubTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { key: 'all', label: 'Tất cả' },
    { key: 'beginner', label: 'Người mới' },
    { key: 'morning', label: 'Buổi sáng' },
    { key: 'sleep', label: 'Giấc ngủ' },
    { key: 'relaxation', label: 'Thư giãn' },
    { key: 'breath_focus', label: 'Hơi thở' },
    { key: 'gratitude', label: 'Biết ơn' },
    { key: 'loving_kindness', label: 'Từ bi' },
    { key: 'letting_go', label: 'Buông bỏ' },
    { key: 'focus', label: 'Tập trung' },
    { key: 'silent', label: 'Tịnh chỉ' },
  ];

  const filteredTracks = MEDITATION_TRACKS.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Subtab Switcher: Thiền định vs Tập thở */}
      <div className="flex items-center justify-center">
        <div className="flex items-center p-1 bg-[#E8DED0]/60 dark:bg-white/10 rounded-2xl max-w-xs w-full shadow-inner">
          <button
            onClick={() => setActiveSubTab('meditation')}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all min-h-[40px] ${
              activeSubTab === 'meditation'
                ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] shadow-sm font-semibold'
                : 'text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            Kho bài Thiền
          </button>
          <button
            onClick={() => setActiveSubTab('breathing')}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all min-h-[40px] ${
              activeSubTab === 'breathing'
                ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] shadow-sm font-semibold'
                : 'text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            Tập thở Chánh niệm
          </button>
        </div>
      </div>

      {activeSubTab === 'breathing' ? (
        <BreathingEngine />
      ) : (
        <>
          {/* Search bar & Category filter */}
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto sm:mx-0">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#17202D]/40 dark:text-white/40" />
              <input
                type="text"
                placeholder="Tìm bài thiền, giảng sư, chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:border-[#D8B878] transition-colors"
              />
            </div>

            {/* Horizontal Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors min-h-[36px] ${
                    selectedCategory === c.key
                      ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                      : 'bg-white/60 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tracks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTracks.map((track) => {
              const isFav = favorites.includes(track.id);
              return (
                <div
                  key={track.id}
                  className="group rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleFavorite(track.id)}
                        className="p-2 rounded-full bg-black/40 text-white hover:text-rose-400 transition-colors"
                        title={isFav ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[10px] text-[#D8B878] font-semibold uppercase tracking-wider">
                        {track.categoryName}
                      </span>
                      <h3 className="font-serif text-base font-bold text-white truncate">
                        {track.title}
                      </h3>
                      <p className="text-[11px] text-white/70 truncate">
                        {track.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#17202D]/70 dark:text-white/70 line-clamp-2 mb-4 leading-relaxed">
                      {track.description}
                    </p>

                    <div className="pt-3 border-t border-[#E8DED0]/50 dark:border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#17202D]/60 dark:text-white/60">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{track.durations.join(', ')} phút</span>
                      </div>

                      {track.isPremium && !user?.isPremium ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playTrack(track, 1)}
                            className="px-3 py-1.5 rounded-xl bg-[#D8B878]/20 border border-[#D8B878]/50 text-[#B89650] dark:text-[#D8B878] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#D8B878]/30 active:scale-95 transition-all min-h-[36px]"
                            title="Nghe thử 60 giây trước khi quyết định nâng cấp"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Nghe thử 60s</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => playTrack(track)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all min-h-[36px]"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Bắt đầu</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTracks.length === 0 && (
            <div className="p-12 text-center text-[#17202D]/50 dark:text-white/50">
              <p>Không tìm thấy bài thiền phù hợp với từ khóa của bạn.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
