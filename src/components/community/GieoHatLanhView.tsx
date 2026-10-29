import React, { useState, useEffect } from 'react';
import { CommunityWish, WishTopic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../../services/soundEngine';
import {
  Heart,
  Send,
  Sparkles,
  RefreshCw,
  Share2,
  ShieldAlert,
  CheckCircle2,
  User,
  Flower2,
  Compass,
  Smile,
  ShieldCheck,
  Sun
} from 'lucide-react';

export const GieoHatLanhView: React.FC = () => {
  const { user, token } = useAuth();
  const [wishes, setWishes] = useState<CommunityWish[]>([]);
  const [randomWish, setRandomWish] = useState<CommunityWish | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Form states
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [topic, setTopic] = useState<WishTopic>('peace');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [blessedIds, setBlessedIds] = useState<string[]>([]);

  const handleBlessWish = async (id: string) => {
    if (blessedIds.includes(id)) return;
    setBlessedIds(prev => [...prev, id]);
    soundEngine.playSingingBowl(432, 2.5, 0.35);
    soundEngine.triggerHaptic(40);

    // Optimistic UI update
    setWishes(prev =>
      prev.map(w => (w.id === id ? { ...w, lotusCount: (w.lotusCount || 0) + 1, blessedByMe: true } : w))
    );

    try {
      await fetch(`/api/community/wishes/${id}/bless`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
    } catch (e) {}
  };

  const topicLabels: Record<WishTopic, { label: string; icon: any; color: string }> = {
    peace: { label: 'Bình An', icon: Smile, color: 'text-emerald-500 bg-emerald-500/10' },
    gratitude: { label: 'Biết Ơn', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
    courage: { label: 'Can Đảm', icon: Sun, color: 'text-amber-500 bg-amber-500/10' },
    forgiveness: { label: 'Tha Thứ', icon: Flower2, color: 'text-purple-500 bg-purple-500/10' },
    patience: { label: 'Kiên Nhẫn', icon: Compass, color: 'text-blue-500 bg-blue-500/10' },
    compassion: { label: 'Từ Bi', icon: Sparkles, color: 'text-[#D8B878] bg-[#D8B878]/10' }
  };

  const fetchWishes = async () => {
    try {
      const res = await fetch('/api/community/wishes');
      const data = await res.json();
      if (data.wishes) {
        setWishes(data.wishes);
      }
    } catch (e) {}
  };

  const drawRandomCard = async () => {
    setIsDrawing(true);
    setIsFlipped(false);
    soundEngine.playSingingBowl(324, 4.0, 0.4);
    soundEngine.triggerHaptic(60);

    try {
      const res = await fetch('/api/community/wishes/random');
      const data = await res.json();
      if (data.wish) {
        setTimeout(() => {
          setRandomWish(data.wish);
          setIsFlipped(true);
          setIsDrawing(false);
          soundEngine.playWindChime(0.3);
        }, 600);
      }
    } catch (e) {
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    fetchWishes();
    drawRandomCard();
  }, []);

  const handlePlantSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/community/wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          content,
          authorName: isAnonymous ? 'Người bạn ẩn danh' : authorName,
          isAnonymous,
          topic
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể gieo hạt lành lúc này.');
      }

      setSubmitSuccess(true);
      soundEngine.playSingingBowl(216, 6.0, 0.6);
      soundEngine.triggerHaptic([80, 40, 80]);
      setContent('');
      if (data.wish) {
        setWishes([data.wish, ...wishes]);
      }
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gieo hạt lành.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async (id: string) => {
    if (reportedIds.includes(id)) return;
    try {
      await fetch(`/api/community/wishes/${id}/report`, { method: 'POST' });
      setReportedIds([...reportedIds, id]);
      alert('Đã gửi báo cáo. Ban biên tập An Tâm sẽ rà soát nội dung này.');
    } catch (e) {}
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredWishes = filterTopic === 'all'
    ? wishes
    : wishes.filter(w => w.topic === filterTopic);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8B878]/15 text-[#B89650] dark:text-[#D8B878] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Không Gian Từ Bi & Gieo Hạt Lành</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
          Vườn An Lạc & Lời Chúc Bình An
        </h1>
        <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70">
          Nơi sẻ chia những thông điệp thanh tịnh, không nút like ồn ào, không tranh biện, chỉ có sự nâng đỡ dịu dàng giữa những người bạn đồng tu.
        </p>
      </div>

      {/* Rút Thẻ Lời Chúc Đầu Ngày (Daily Metta Card) */}
      <div className="bg-gradient-to-br from-[#E8DED0]/50 to-white/80 dark:from-[#182642] dark:to-[#101D35] p-6 sm:p-8 rounded-3xl border border-[#E8DED0] dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
            <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
              Thẻ Lời Chúc Nhiệm Mầu Của Bạn Hôm Nay
            </h3>
          </div>
          <button
            onClick={drawRandomCard}
            disabled={isDrawing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/10 hover:bg-[#D8B878]/20 text-xs font-semibold text-[#101D35] dark:text-white transition-all shadow-xs min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDrawing ? 'animate-spin' : ''}`} />
            <span>Rút thẻ hạt lành khác</span>
          </button>
        </div>

        {randomWish && (
          <div className={`p-6 rounded-2xl bg-white/90 dark:bg-white/5 border border-[#D8B878]/30 transition-all duration-500 shadow-sm ${isFlipped ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${topicLabels[randomWish.topic as WishTopic]?.color || 'text-emerald-500 bg-emerald-500/10'}`}>
                {topicLabels[randomWish.topic as WishTopic]?.label || 'Bình An'}
              </span>
              <span className="text-[11px] text-[#17202D]/50 dark:text-white/50">
                Từ: {randomWish.authorName}
              </span>
            </div>
            <p className="font-serif text-base sm:text-lg text-[#101D35] dark:text-[#F5F7FA] italic leading-relaxed mb-4">
              "{randomWish.content}"
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-[#E8DED0]/50 dark:border-white/5 text-xs text-[#17202D]/60 dark:text-white/60">
              <span className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Đã kiểm duyệt chánh niệm
              </span>
              <button
                onClick={() => handleCopy(randomWish.id, randomWish.content)}
                className="flex items-center gap-1 hover:text-[#B89650] dark:hover:text-[#D8B878] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedId === randomWish.id ? 'Đã sao chép' : 'Lưu lời chúc'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Gieo Một Hạt Lành */}
      <div className="bg-white/80 dark:bg-white/5 p-6 rounded-3xl border border-[#E8DED0] dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
            Gieo Một Lời Chúc Vào Cộng Đồng
          </h3>
        </div>
        <p className="text-xs text-[#17202D]/70 dark:text-white/70">
          Mỗi lời chúc chân thành là một hạt giống thiện lành gieo vào tâm thức người khác. Xin gửi gắm những lời hòa ái, không mang tính phán xét.
        </p>

        {submitSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Hạt lành của bạn đã được gieo vào Vườn An Lạc. Nguyện chúc duyên lành lan tỏa khắp muôn nơi!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlantSeed} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#101D35] dark:text-white mb-1.5">
              Chọn phẩm chất bạn muốn gửi trao:
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(topicLabels) as WishTopic[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    topic === t
                      ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold scale-105'
                      : 'bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70 hover:bg-black/10'
                  }`}
                >
                  {topicLabels[t].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#101D35] dark:text-white mb-1">
              Nội dung lời chúc (tối đa 180 ký tự):
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={180}
              rows={3}
              placeholder="Ví dụ: Nguyện cho bạn luôn tìm thấy khoảng lặng bình an nơi hơi thở giữa những ngày bận rộn..."
              className="w-full p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none focus:border-[#D8B878] resize-none"
            />
            <div className="text-right text-[11px] text-[#17202D]/50 dark:text-white/50">
              {content.length}/180 ký tự
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#17202D]/80 dark:text-white/80">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-[#B89650] focus:ring-0"
                />
                <span>Gieo hạt ẩn danh</span>
              </label>

              {!isAnonymous && (
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Tên / Pháp danh của bạn"
                  className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
                  maxLength={30}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-50 min-h-[40px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang gửi gắm...' : 'Gieo Hạt Lành'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách các Hạt Lành trong Vườn An Lạc */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DED0] dark:border-white/10 pb-3">
          <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
            Những Lời Chúc Gần Đây
          </h3>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setFilterTopic('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                filterTopic === 'all'
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                  : 'bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70'
              }`}
            >
              Tất cả
            </button>
            {(Object.keys(topicLabels) as WishTopic[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTopic(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  filterTopic === t
                    ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                    : 'bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70'
                }`}
              >
                {topicLabels[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredWishes.map((w) => {
            const isReported = reportedIds.includes(w.id);
            return (
              <div
                key={w.id}
                className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 hover:border-[#D8B878]/40 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${topicLabels[w.topic as WishTopic]?.color || 'text-emerald-500 bg-emerald-500/10'}`}>
                    {topicLabels[w.topic as WishTopic]?.label || 'Bình An'}
                  </span>
                  <span className="text-[11px] text-[#17202D]/50 dark:text-white/50">
                    {w.authorName}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#17202D]/90 dark:text-white/90 leading-relaxed font-serif">
                  "{w.content}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DED0]/40 dark:border-white/5 text-[11px] text-[#17202D]/50 dark:text-white/50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBlessWish(w.id)}
                      disabled={blessedIds.includes(w.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        blessedIds.includes(w.id)
                          ? 'bg-pink-500/20 text-pink-600 dark:text-pink-300 font-semibold'
                          : 'bg-black/5 dark:bg-white/10 hover:bg-pink-500/10 text-[#17202D]/70 dark:text-white/70 hover:text-pink-600'
                      }`}
                      title="Gửi một niệm lành (thả hoa sen)"
                    >
                      <span className="text-sm">🪷</span>
                      <span>{w.lotusCount || 0}</span>
                    </button>
                    <span>{new Date(w.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopy(w.id, w.content)}
                      className="hover:text-[#B89650] dark:hover:text-[#D8B878] transition-colors"
                      title="Sao chép lời chúc"
                    >
                      {copiedId === w.id ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                    {!isReported ? (
                      <button
                        onClick={() => handleReport(w.id)}
                        className="hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Báo cáo nội dung không phù hợp"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-rose-400 text-[10px]">Đã báo cáo</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
