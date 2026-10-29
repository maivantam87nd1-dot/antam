import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Check, Sparkles, Flower2, Heart } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { loginAsGuest, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Giảm căng thẳng',
    'Tập thở',
    'Nuôi dưỡng sự bình an'
  ]);
  const [emailInput, setEmailInput] = useState('');

  if (!isOpen) return null;

  const goalsList = [
    'Giảm căng thẳng',
    'Ngủ ngon hơn',
    'Học thiền',
    'Tập thở',
    'Nghe kinh Phật',
    'Tìm hiểu Phật pháp',
    'Nuôi dưỡng sự bình an',
    'Khám phá ứng dụng'
  ];

  const toggleGoal = (g: string) => {
    setSelectedGoals(prev =>
      prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g]
    );
  };

  const handleFinishOnboarding = async (useEmail = false) => {
    await loginAsGuest();
    if (useEmail && emailInput.trim()) {
      await updateProfile({ email: emailInput.trim(), selectedGoals });
    } else {
      await updateProfile({ selectedGoals });
    }
    localStorage.setItem('antam_onboarded', 'true');
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg h-full sm:h-auto max-h-[92vh] bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-none sm:rounded-3xl shadow-2xl border border-[#E8DED0] dark:border-white/10 flex flex-col overflow-hidden">
        {/* Step 1: Welcome & Lotus Pond */}
        {step === 1 && (
          <div className="flex flex-col h-full animate-fadeIn">
            <div className="relative h-64 sm:h-72 overflow-hidden">
              <img
                src="/assets/images/lotus_pond_dawn_1793159474945.jpg"
                alt="Hồ sen bình minh"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6F1] dark:from-[#101D35] via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between text-center">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-[#B89650] dark:text-[#D8B878] font-bold">
                  CHÀO MỪNG BẠN ĐẾN VỚI AN TÂM
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-white leading-tight">
                  Một không gian bình yên dành riêng cho bạn.
                </h2>
                <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70 leading-relaxed max-w-sm mx-auto">
                  Trở về với hiện tại, thắp sáng chánh niệm trong từng hơi thở và bước đi.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Tiếp tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Meditation & Breath */}
        {step === 2 && (
          <div className="flex flex-col h-full animate-fadeIn">
            <div className="relative h-64 sm:h-72 overflow-hidden">
              <img
                src="/assets/images/zen_bamboo_temple_1793159475967.jpg"
                alt="Thiền viện rừng trúc"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6F1] dark:from-[#101D35] via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between text-center">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-[#B89650] dark:text-[#D8B878] font-bold">
                  THIỀN ĐỊNH & HƠI THỞ
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-white leading-tight">
                  Chỉ vài phút mỗi ngày để trở về với chính mình.
                </h2>
                <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70 leading-relaxed max-w-sm mx-auto">
                  Các bài thiền có hướng dẫn từ 3 đến 30 phút cùng động cơ tập thở tương tác giúp xoa dịu hệ thần kinh tức thì.
                </p>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="py-3 px-5 rounded-2xl bg-black/5 dark:bg-white/10 text-xs font-semibold min-h-[48px]"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Tiếp tục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Buddhist scriptures & music */}
        {step === 3 && (
          <div className="flex flex-col h-full animate-fadeIn">
            <div className="relative h-64 sm:h-72 overflow-hidden">
              <img
                src="/assets/images/moonlit_sanctuary_1793159476039.jpg"
                alt="Thiền đường trăng thanh"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6F1] dark:from-[#101D35] via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between text-center">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-[#B89650] dark:text-[#D8B878] font-bold">
                  KINH PHẬT & ÂM NHẠC THƯ GIÃN
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-white leading-tight">
                  Lắng nghe, thấu hiểu và nuôi dưỡng sự bình an.
                </h2>
                <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70 leading-relaxed max-w-sm mx-auto">
                  Kho tàng kinh điển Đại thừa chuẩn xác, âm thanh tự nhiên phối đa tầng và người bạn đồng hành AI thấu cảm.
                </p>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="py-3 px-5 rounded-2xl bg-black/5 dark:bg-white/10 text-xs font-semibold min-h-[48px]"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Cá nhân hóa trải nghiệm</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Personalization goals */}
        {step === 4 && (
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between animate-fadeIn overflow-y-auto">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#B89650] dark:text-[#D8B878] font-bold block mb-1">
                BƯỚC 4 / 5
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#101D35] dark:text-white mb-2">
                Bạn tìm đến AN TÂM vì điều gì?
              </h2>
              <p className="text-xs text-[#17202D]/70 dark:text-white/70 mb-4">
                Chọn những mục bạn quan tâm để ứng dụng gợi ý nội dung phù hợp nhất.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {goalsList.map((g) => {
                  const isChecked = selectedGoals.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between min-h-[44px] ${
                        isChecked
                          ? 'border-[#D8B878] bg-[#D8B878]/15 text-[#101D35] dark:text-white font-semibold shadow-sm'
                          : 'border-[#E8DED0] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#17202D]/70 dark:text-white/70'
                      }`}
                    >
                      <span>{g}</span>
                      {isChecked && <Check className="w-4 h-4 text-[#B89650] dark:text-[#D8B878] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="py-3 px-5 rounded-2xl bg-black/5 dark:bg-white/10 text-xs font-semibold min-h-[48px]"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>Bước cuối cùng</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Start / Guest / Email */}
        {step === 5 && (
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between animate-fadeIn text-center">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-[#D8B878]/25 text-[#B89650] dark:text-[#D8B878] flex items-center justify-center mx-auto shadow-md">
                <Flower2 className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#101D35] dark:text-white">
                Bắt đầu hành trình An Lạc
              </h2>
              <p className="text-xs text-[#17202D]/70 dark:text-white/70 max-w-sm mx-auto">
                Bạn có thể khám phá ứng dụng ngay lập tức mà không cần tạo tài khoản, hoặc nhập email để đồng bộ tiến độ.
              </p>

              <div className="max-w-xs mx-auto space-y-3 pt-2">
                <input
                  type="email"
                  placeholder="Nhập email nếu muốn lưu tiến độ..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#D8B878] text-xs focus:outline-none"
                />

                <button
                  onClick={() => handleFinishOnboarding(true)}
                  className="w-full py-3 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-semibold text-xs shadow-md min-h-[44px]"
                >
                  Tiếp tục với Email
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8DED0] dark:border-white/10" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#F8F6F1] dark:bg-[#101D35] px-2 text-[#17202D]/50 dark:text-white/50">Hoặc</span></div>
                </div>

                <button
                  onClick={() => handleFinishOnboarding(false)}
                  className="w-full py-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-[#E8DED0] dark:border-white/15 text-[#17202D] dark:text-white font-medium text-xs hover:bg-black/5 min-h-[44px]"
                >
                  Khám phá không cần tài khoản (Khách)
                </button>
              </div>
            </div>

            <p className="text-[10px] text-[#17202D]/50 dark:text-white/50 pt-4">
              Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư của AN TÂM.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
