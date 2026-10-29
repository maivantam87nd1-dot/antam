import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Gift, CheckCircle, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted
}) => {
  const { user, token } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && secondsRemaining === 0) {
      setIsCompleted(true);
      setIsPlaying(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, secondsRemaining]);

  if (!isOpen) return null;

  const handleStartWatch = async () => {
    setIsPlaying(true);
    setSecondsRemaining(15);
    try {
      const res = await fetch('/api/ads/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ adUnitId: 'rewarded_daily_pass_v4' })
      });
      const data = await res.json();
      if (data.nonce) {
        setNonce(data.nonce);
      }
    } catch (e) {}
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch('/api/ads/rewarded-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          adUnitId: 'rewarded_daily_pass_v4',
          rewardType: 'bonus_meditation',
          nonce
        })
      });

      if (res.ok) {
        onRewardGranted();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl shadow-2xl border border-[#D8B878]/30 overflow-hidden flex flex-col p-6 text-center">
        {!isPlaying && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="w-14 h-14 rounded-3xl bg-[#D8B878]/20 text-[#B89650] dark:text-[#D8B878] flex items-center justify-center mx-auto mb-3 shadow-md">
          <Gift className="w-7 h-7" />
        </div>

        <span className="text-[10px] uppercase tracking-widest text-[#B89650] dark:text-[#D8B878] font-bold">
          QUYỀN LỢI TỰ NGUYỆN (REWARDED PASS)
        </span>

        <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-[#101D35] dark:text-white">
          Mở Khóa Phiên Thiền Tự Chọn
        </h3>

        <p className="text-xs text-[#17202D]/70 dark:text-white/70 mt-2 leading-relaxed">
          Dành 15 giây xem thông điệp bảo trợ từ cộng đồng chánh niệm để mở khóa 1 bài thiền nâng cao miễn phí trong ngày hôm nay.
        </p>

        {/* Content Box */}
        <div className="my-5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#E8DED0] dark:border-white/10">
          {!isPlaying && !isCompleted && (
            <div className="space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Không chèn quảng cáo giữa lúc thiền định hoặc tụng kinh</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Hoàn toàn do bạn chủ động quyết định xem hay không</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Thời lượng ngắn (chỉ 15 giây) và không phát âm thanh đột ngột</span>
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full border-4 border-[#D8B878] border-t-transparent animate-spin mx-auto flex items-center justify-center">
                <span className="font-mono text-lg font-bold text-[#101D35] dark:text-white">
                  {secondsRemaining}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#101D35] dark:text-white">
                  Thông điệp đồng hành: "Trà Đạo & Chánh Niệm An Lạc"
                </p>
                <p className="text-[11px] text-[#17202D]/60 dark:text-white/60">
                  Thưởng thức trà sen truyền thống, tĩnh lặng giữa cuộc sống bận rộn.
                </p>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="py-4 space-y-2 text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              <CheckCircle className="w-10 h-10 mx-auto" />
              <p className="font-semibold text-sm">Chúc mừng bạn đã hoàn tất!</p>
              <p className="text-xs text-[#17202D]/70 dark:text-white/70">
                Phiên thiền tự chọn trong ngày đã sẵn sàng để bạn thực hành.
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div>
          {!isPlaying && !isCompleted && (
            <button
              onClick={handleStartWatch}
              className="w-full py-3.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Clock className="w-4 h-4" />
              <span>Xem thông điệp 15 giây & Mở khóa</span>
            </button>
          )}

          {isCompleted && (
            <button
              onClick={handleClaimReward}
              disabled={isClaiming}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isClaiming ? 'Đang kích hoạt...' : 'Nhận phần thưởng & Bắt đầu'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
