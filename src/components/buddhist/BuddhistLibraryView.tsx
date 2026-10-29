import React, { useState } from 'react';
import { BUDDHIST_SCRIPTURES } from '../../data/mockData';
import { BuddhistScripture } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { soundEngine } from '../../services/soundEngine';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Heart,
  Search,
  ChevronLeft,
  Bookmark,
  Info,
  Sparkles,
  X,
  RefreshCw,
  Share2
} from 'lucide-react';

export const BuddhistLibraryView: React.FC = () => {
  const { favorites, toggleFavorite } = useAudio();
  const [selectedScripture, setSelectedScripture] = useState<BuddhistScripture | null>(null);
  const [fontSize, setFontSize] = useState<number>(17); // in px
  const [isChantingPlaying, setIsChantingPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookmarkedVerse, setBookmarkedVerse] = useState<number | null>(null);

  // AI Scripture Explanation Modal State
  const [explainingVerse, setExplainingVerse] = useState<{
    text: string;
    sectionTitle?: string;
  } | null>(null);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'deep' | 'practical'>('simple');
  const [explanationResult, setExplanationResult] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const categories = [
    { key: 'all', label: 'Tất cả' },
    { key: 'sutra', label: 'Kinh điển' },
    { key: 'mantra', label: 'Thần chú' },
    { key: 'teachings', label: 'Lời Phật dạy' },
  ];

  const filtered = BUDDHIST_SCRIPTURES.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartChantingAudio = (scripture: BuddhistScripture) => {
    if (isChantingPlaying) {
      soundEngine.stopAll();
      soundEngine.stopSpeaking();
      setIsChantingPlaying(false);
    } else {
      setIsChantingPlaying(true);
      soundEngine.playSingingBowl(216, 5.0, 0.6);
      soundEngine.startSingingBowlLoop(0.35);

      const textToRecite = scripture.contentVerses
        .map(v => `${v.sectionTitle ? v.sectionTitle + '. ' : ''}${v.original || ''} ${v.translation}`)
        .join('. ');

      soundEngine.speakText(textToRecite, () => {
        setIsChantingPlaying(false);
      });
    }
  };

  const handleCloseReading = () => {
    if (isChantingPlaying) {
      soundEngine.stopAll();
      soundEngine.stopSpeaking();
      setIsChantingPlaying(false);
    }
    setSelectedScripture(null);
  };

  const handleRequestAIExplanation = async (mode: 'simple' | 'deep' | 'practical') => {
    if (!explainingVerse) return;
    setExplanationMode(mode);
    setIsExplaining(true);
    setExplanationResult(null);

    try {
      const res = await fetch('/api/ai/explain-scripture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptureTitle: selectedScripture?.title,
          verseText: explainingVerse.text,
          mode
        })
      });
      const data = await res.json();
      setExplanationResult(data.explanation || 'Không thể tạo diễn giải lúc này.');
    } catch (e) {
      setExplanationResult('Đoạn kinh này nhắc nhở chúng ta quay về nhận diện tính duyên khởi của vạn pháp, không bám víu vào các tướng giả hợp để đạt tâm an tịnh.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleOpenExplainModal = (verse: any) => {
    setExplainingVerse({
      text: `${verse.original ? verse.original + ' - ' : ''}${verse.translation}`,
      sectionTitle: verse.sectionTitle
    });
    setExplanationResult(null);
    handleRequestAIExplanation(explanationMode);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Detail Scripture Reading View */}
      {selectedScripture ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top reader navigation */}
          <div className="flex items-center justify-between border-b border-[#E8DED0] dark:border-white/10 pb-4">
            <button
              onClick={handleCloseReading}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white min-h-[44px]"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Quay lại Thư viện</span>
            </button>

            {/* Reader Utilities: Font size, Audio chanting, Favorite */}
            <div className="flex items-center gap-2">
              {/* Font size adjuster */}
              <div className="flex items-center gap-1 bg-white/70 dark:bg-white/10 rounded-xl p-1 border border-[#E8DED0] dark:border-white/10">
                <button
                  onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                  className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 rounded-lg min-h-[36px]"
                  title="Giảm cỡ chữ"
                >
                  A-
                </button>
                <span className="text-[11px] font-mono px-1">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                  className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 rounded-lg min-h-[36px]"
                  title="Tăng cỡ chữ"
                >
                  A+
                </button>
              </div>

              {/* Chanting Audio Voice Play */}
              <button
                onClick={() => handleStartChantingAudio(selectedScripture)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  isChantingPlaying
                    ? 'bg-[#D8B878] text-[#101D35] shadow-sm'
                    : 'bg-[#101D35] text-white dark:bg-white/10 hover:bg-[#172644]'
                }`}
                title="Tụng kinh thanh tịnh"
              >
                {isChantingPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Dừng nghe</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe tụng</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleFavorite(selectedScripture.id)}
                className="p-2.5 rounded-xl bg-white/70 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 hover:text-rose-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(selectedScripture.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Scripture Header Info */}
          <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
            <span className="text-xs font-semibold text-[#B89650] dark:text-[#D8B878] uppercase tracking-widest">
              {selectedScripture.categoryLabel}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
              {selectedScripture.title}
            </h1>
            {selectedScripture.sanskritTitle && (
              <p className="text-xs text-[#17202D]/60 dark:text-white/60 italic">
                {selectedScripture.sanskritTitle}
              </p>
            )}

            <div className="pt-2 text-xs text-[#17202D]/70 dark:text-white/70 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span><strong>Dịch giả:</strong> {selectedScripture.translator}</span>
              <span><strong>Xuất xứ:</strong> {selectedScripture.source}</span>
              <span><strong>Phân loại:</strong> {selectedScripture.contentType === 'original' ? 'Nguyên văn' : 'Bản dịch chính thống'}</span>
            </div>
          </div>

          {/* Scripture Content Verses Card */}
          <div className="max-w-3xl mx-auto space-y-6">
            {selectedScripture.contentVerses.map((verse, idx) => {
              const isBookmarked = bookmarkedVerse === idx;
              return (
                <div
                  key={idx}
                  className={`p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-white/5 border transition-all ${
                    isBookmarked
                      ? 'border-[#D8B878] shadow-md'
                      : 'border-[#E8DED0] dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    {verse.sectionTitle ? (
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[#B89650] dark:text-[#D8B878]">
                        {verse.sectionTitle}
                      </h3>
                    ) : <span />}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenExplainModal(verse)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D8B878]/15 hover:bg-[#D8B878]/25 text-[#B89650] dark:text-[#D8B878] text-xs font-semibold transition-colors"
                        title="Dùng AI giải nghĩa câu kinh"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Giải thích AI</span>
                      </button>

                      <button
                        onClick={() => setBookmarkedVerse(isBookmarked ? null : idx)}
                        className={`text-xs flex items-center gap-1 ${
                          isBookmarked ? 'text-[#D8B878] font-semibold' : 'text-[#17202D]/40 dark:text-white/40 hover:text-[#101D35]'
                        }`}
                        title="Đánh dấu dòng đang đọc"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        <span>{isBookmarked ? 'Đang đọc' : 'Đánh dấu'}</span>
                      </button>
                    </div>
                  </div>

                  {verse.original && (
                    <div className="mb-4 p-4 rounded-2xl bg-[#E8DED0]/30 dark:bg-black/20 text-[#101D35]/90 dark:text-white/90 font-serif italic border-l-2 border-[#D8B878]">
                      <p style={{ fontSize: `${fontSize - 1}px`, lineHeight: 1.7 }}>
                        {verse.original}
                      </p>
                    </div>
                  )}

                  <div className="text-[#17202D] dark:text-[#F5F7FA] font-sans">
                    <p style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
                      {verse.translation}
                    </p>
                  </div>

                  {verse.explanation && (
                    <div className="mt-4 pt-3 border-t border-[#E8DED0]/60 dark:border-white/10 flex items-start gap-2 text-xs text-[#17202D]/70 dark:text-white/70">
                      <Info className="w-4 h-4 text-[#B89650] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong>Chú giải truyền thống:</strong> {verse.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Main Scripture Grid View */
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
              Thư Viện Phật Pháp
            </h1>
            <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70">
              Nguồn kinh điển chính thống, chú giải mạch lạc và lời Phật dạy soi sáng tâm hồn
            </p>
          </div>

          {/* Search bar & Category filter */}
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#17202D]/40 dark:text-white/40" />
              <input
                type="text"
                placeholder="Tìm kinh điển, thần chú, lời Phật dạy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:border-[#D8B878] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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

          {/* Scripture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((scripture) => {
              const isFav = favorites.includes(scripture.id);
              return (
                <div
                  key={scripture.id}
                  className="group rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={scripture.image}
                      alt={scripture.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleFavorite(scripture.id)}
                        className="p-2 rounded-full bg-black/40 text-white hover:text-rose-400 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[10px] text-[#D8B878] font-semibold uppercase tracking-wider">
                        {scripture.categoryLabel}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-white truncate">
                        {scripture.title}
                      </h3>
                      {scripture.sanskritTitle && (
                        <p className="text-[11px] text-white/70 italic truncate">
                          {scripture.sanskritTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#17202D]/70 dark:text-white/70 line-clamp-2 mb-4 leading-relaxed">
                      {scripture.description}
                    </p>

                    <div className="pt-3 border-t border-[#E8DED0]/50 dark:border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[#17202D]/60 dark:text-white/60 truncate max-w-[200px]">
                        {scripture.translator}
                      </span>

                      <button
                        onClick={() => setSelectedScripture(scripture)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all min-h-[36px]"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Đọc kinh</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {explainingVerse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl p-6 shadow-2xl border border-[#D8B878]/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DED0] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
                <h3 className="font-serif text-base font-bold text-[#101D35] dark:text-white">
                  Diễn Giải Câu Kinh Bằng AI
                </h3>
              </div>
              <button
                onClick={() => setExplainingVerse(null)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Verse Context */}
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs italic text-[#101D35]/80 dark:text-white/80">
              "{explainingVerse.text}"
            </div>

            {/* 3 Explanation Modes */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'simple' as const, label: 'Dễ hiểu' },
                { key: 'deep' as const, label: 'Chuyên sâu' },
                { key: 'practical' as const, label: 'Đời sống' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => handleRequestAIExplanation(m.key)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                    explanationMode === m.key
                      ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] shadow-sm'
                      : 'bg-white dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-[#17202D]/70 dark:text-white/70'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Result Area */}
            {isExplaining ? (
              <div className="p-8 text-center text-xs text-[#17202D]/60 dark:text-white/60 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#B89650] dark:text-[#D8B878]" />
                <p>AI An Tâm đang tra cứu kinh tạng và chuẩn bị diễn giải...</p>
              </div>
            ) : explanationResult ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#172644] border border-[#E8DED0] dark:border-white/10 text-xs sm:text-sm leading-relaxed space-y-2">
                <p className="whitespace-pre-line">{explanationResult}</p>
                <div className="pt-2 text-[10px] text-[#17202D]/50 dark:text-white/50 border-t border-[#E8DED0]/50 dark:border-white/10">
                  Nguồn căn cứ: {selectedScripture?.title || 'Kinh điển Đại thừa'}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplainingVerse(null)}
                className="px-4 py-2 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
