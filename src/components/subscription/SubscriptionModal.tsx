import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Check, Crown, ShieldAlert, Sparkles, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user, token } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'info' | 'error' | 'warning' | 'success';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const benefits = [
    'Truy cập trọn vẹn toàn bộ 50+ bài thiền chuyên sâu và pháp thoại Đại thừa tuyển chọn',
    'Bộ phối âm thanh thiền đa tầng Sound Mixer không giới hạn kênh phát',
    'Tải nội dung nghe ngoại tuyến (Offline Audio Mode) khi không có Internet',
    'Hạn mức trò chuyện với Trợ lý AI Chánh Niệm lên đến 60 câu hỏi/giờ',
    '100% không quảng cáo tài trợ và không làm phiền trong toàn bộ ứng dụng'
  ];

  const handleSandboxTestPurchase = async () => {
    setIsVerifying(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/subscription/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          planId: selectedPlan,
          platform: 'sandbox_test',
          isSandboxTest: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Lỗi khi kích hoạt chế độ thử nghiệm.'
        });
        return;
      }

      setStatusMessage({
        type: 'success',
        text: data.message || 'Đã kích hoạt gói thử nghiệm Sandbox thành công!'
      });
      if (user) {
        user.isPremium = true;
      }
    } catch (e) {
      setStatusMessage({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurchase = async () => {
    setIsVerifying(true);
    setStatusMessage(null);

    try {
      // Production Security & Real Store Compliance:
      // Request real StoreKit / Google Play Billing verification from backend
      const res = await fetch('/api/subscription/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          planId: selectedPlan,
          platform: 'production_store'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Honest disclosure of billing environment state
        setStatusMessage({
          type: 'warning',
          text: data.error || 'Cổng thanh toán App Store & Google Play đang chờ thiết lập chứng chỉ ký cho bản phát hành chính thức.'
        });
        return;
      }

      setStatusMessage({
        type: 'success',
        text: data.message || 'Đã xác thực gói hội viên thành công.'
      });
      if (user) {
        user.isPremium = true;
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: 'Cổng thanh toán đang kết nối tới máy chủ. Vui lòng thử lại sau.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsVerifying(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/subscription/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({
          type: 'info',
          text: data.error || 'Không tìm thấy hóa đơn mua hàng hợp lệ của tài khoản này trên App Store / Google Play.'
        });
        return;
      }

      setStatusMessage({
        type: 'success',
        text: data.message || 'Khôi phục gói mua thành công!'
      });
    } catch (e) {
      setStatusMessage({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ xác thực App Store/Google Play.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl shadow-2xl border border-[#D8B878]/30 overflow-hidden flex flex-col">
        {/* Top visual banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#101D35] via-[#172644] to-[#101D35] text-white overflow-hidden text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-3xl bg-[#D8B878] text-[#101D35] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Crown className="w-7 h-7 fill-current" />
          </div>

          <span className="text-[11px] uppercase tracking-widest text-[#D8B878] font-bold">
            GÓI HỘI VIÊN CAO CẤP
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
            AN TÂM Premium
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-sm mx-auto">
            Nuôi dưỡng sự bình an sâu sắc với kho nội dung độc quyền và trải nghiệm trọn vẹn
          </p>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-2.5">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#17202D]/80 dark:text-white/80">
                <Check className="w-4 h-4 text-[#B89650] dark:text-[#D8B878] shrink-0 mt-0.5" />
                <span className="leading-snug">{b}</span>
              </div>
            ))}
          </div>

          {/* Plan Choice Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-[#D8B878] bg-[#D8B878]/15 ring-2 ring-[#D8B878]/40 shadow-sm'
                  : 'border-[#E8DED0] dark:border-white/10 bg-white/60 dark:bg-white/5'
              }`}
            >
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-[#D8B878] text-[#101D35] text-[10px] font-bold rounded-full">
                TIẾT KIỆM 40%
              </span>
              <h4 className="text-xs font-bold text-[#101D35] dark:text-white">
                Gói 1 Năm
              </h4>
              <p className="font-mono text-base sm:text-lg font-bold text-[#B89650] dark:text-[#D8B878] mt-1 tabular-nums">
                699.000 đ
              </p>
              <span className="text-[10px] text-[#17202D]/50 dark:text-white/50 block">
                ~ 58.000 đ / tháng
              </span>
            </button>

            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-[#D8B878] bg-[#D8B878]/15 ring-2 ring-[#D8B878]/40 shadow-sm'
                  : 'border-[#E8DED0] dark:border-white/10 bg-white/60 dark:bg-white/5'
              }`}
            >
              <h4 className="text-xs font-bold text-[#101D35] dark:text-white">
                Gói 1 Tháng
              </h4>
              <p className="font-mono text-base sm:text-lg font-bold text-[#101D35] dark:text-white mt-1 tabular-nums">
                99.000 đ
              </p>
              <span className="text-[10px] text-[#17202D]/50 dark:text-white/50 block">
                Linh hoạt hàng tháng
              </span>
            </button>
          </div>

          {/* Action button */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handlePurchase}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-bold text-sm shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isVerifying ? 'Đang kết nối cổng thanh toán...' : 'Đăng ký AN TÂM Premium'}</span>
            </button>
            <button
              type="button"
              onClick={handleSandboxTestPurchase}
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#D8B878]/60 text-[#B89650] dark:text-[#D8B878] text-xs font-semibold hover:bg-[#D8B878]/10 transition-colors min-h-[40px]"
            >
              🛠️ Thử nghiệm Sandbox StoreKit (Dành cho QA / Test)
            </button>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 animate-fadeIn ${
              statusMessage.type === 'error'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : statusMessage.type === 'warning'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                : statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          <div className="space-y-1.5 pt-2 text-[11px] text-[#17202D]/60 dark:text-white/60 text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Không cam kết dài hạn</span>
              </span>
              <span>·</span>
              <button
                onClick={handleRestorePurchases}
                disabled={isVerifying}
                className="hover:underline font-semibold text-[#B89650] dark:text-[#D8B878]"
              >
                Khôi phục giao dịch mua
              </button>
            </div>
            <p className="text-[10px] text-[#17202D]/40 dark:text-white/40">
              Giao dịch được quản lý an toàn qua Apple App Store hoặc Google Play Billing. Hủy bất kỳ lúc nào trong phần Cài đặt tài khoản.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
