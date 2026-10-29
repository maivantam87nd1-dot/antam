import React, { useState, useEffect, useRef } from 'react';
import { MICRO_PRACTICES } from '../../data/mockData';
import { soundEngine } from '../../services/soundEngine';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Clock,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Volume2,
  Calendar,
  Flame,
  ShieldCheck
} from 'lucide-react';

interface MicroMindfulnessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MicroMindfulnessModal: React.FC<MicroMindfulnessModalProps> = ({ isOpen, onClose }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'practices' | 'bell'>('practices');
  const [selectedPractice, setSelectedPractice] = useState(MICRO_PRACTICES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(MICRO_PRACTICES[0].durationSeconds);
  const [isCompleted, setIsCompleted] = useState(false);

  // Bell settings state
  const [bellEnabled, setBellEnabled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [workdaysOnly, setWorkdaysOnly] = useState(true);
  const [bellSound, setBellSound] = useState<'singing_bowl' | 'temple_bell'>('singing_bowl');
  const [dnd, setDnd] = useState(false);
  const [isSavingBell, setIsSavingBell] = useState(false);
  const [saveBellSuccess, setSaveBellSuccess] = useState(false);

  const timerRef = useRef<any>(null);

  // Fetch bell settings from backend if logged in
  useEffect(() => {
    if (token && isOpen) {
      fetch('/api/user/mindfulness-bell', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.config) {
            setBellEnabled(data.config.enabled);
            setIntervalMinutes(data.config.intervalMinutes);
            setStartTime(data.config.startTime);
            setEndTime(data.config.endTime);
            setWorkdaysOnly(data.config.workdaysOnly);
            setBellSound(data.config.sound);
            setDnd(data.config.dnd);
          }
        })
        .catch(() => {});
    }
  }, [token, isOpen]);

  // Handle practice selection
  const handleSelectPractice = (p: typeof MICRO_PRACTICES[0]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setSelectedPractice(p);
    setRemainingSeconds(p.durationSeconds);
    setIsCompleted(false);
  };

  // Timer loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            setIsCompleted(true);
            soundEngine.playSingingBowl(216, 7.0, 0.7);
            soundEngine.triggerHaptic([100, 50, 100]);
            return 0;
          }
          if (prev % 15 === 0) {
            soundEngine.triggerHaptic(30);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (!isPlaying) {
      if (isCompleted || remainingSeconds === 0) {
        setRemainingSeconds(selectedPractice.durationSeconds);
        setIsCompleted(false);
      }
      soundEngine.playSingingBowl(324, 3.5, 0.5);
      soundEngine.triggerHaptic(50);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setRemainingSeconds(selectedPractice.durationSeconds);
    setIsCompleted(false);
  };

  const handleTestBell = () => {
    if (bellSound === 'temple_bell') {
      soundEngine.playTempleBell(0.65);
    } else {
      soundEngine.playSingingBowl(216, 6.0, 0.65);
    }
    soundEngine.triggerHaptic([60, 40, 60]);
  };

  const handleSaveBellConfig = async () => {
    setIsSavingBell(true);
    setSaveBellSuccess(false);

    try {
      if (token) {
        await fetch('/api/user/mindfulness-bell', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            enabled: bellEnabled,
            intervalMinutes,
            startTime,
            endTime,
            workdaysOnly,
            sound: bellSound,
            dnd
          })
        });
      }

      // Also save to localStorage
      localStorage.setItem('antam_bell_config', JSON.stringify({
        enabled: bellEnabled,
        intervalMinutes,
        startTime,
        endTime,
        workdaysOnly,
        sound: bellSound,
        dnd
      }));

      handleTestBell();
      setSaveBellSuccess(true);
      setTimeout(() => setSaveBellSuccess(false), 3000);
    } catch (e) {
    } finally {
      setIsSavingBell(false);
    }
  };

  if (!isOpen) return null;

  const progressPercent = Math.min(
    100,
    ((selectedPractice.durationSeconds - remainingSeconds) / selectedPractice.durationSeconds) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#F8F6F1] dark:bg-[#101D35] rounded-3xl border border-[#E8DED0] dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DED0] dark:border-white/10 bg-white/40 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D8B878]/15 text-[#B89650] dark:text-[#D8B878]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#101D35] dark:text-[#F5F7FA]">
                Micro-Mindfulness & Chuông Chánh Niệm
              </h2>
              <p className="text-xs text-[#17202D]/60 dark:text-white/60">
                Những khoảng lặng 1–2 phút nuôi dưỡng bình an nơi công sở và đời sống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#17202D]/60 dark:text-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E8DED0] dark:border-white/10 bg-white/20 dark:bg-black/10 px-6 pt-2">
          <button
            onClick={() => setActiveTab('practices')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'practices'
                ? 'border-[#B89650] dark:border-[#D8B878] text-[#B89650] dark:text-[#D8B878]'
                : 'border-transparent text-[#17202D]/60 dark:text-white/60 hover:text-[#17202D]'
            }`}
          >
            Bài Tập 1–2 Phút Siêu Ngắn
          </button>
          <button
            onClick={() => setActiveTab('bell')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bell'
                ? 'border-[#B89650] dark:border-[#D8B878] text-[#B89650] dark:text-[#D8B878]'
                : 'border-transparent text-[#17202D]/60 dark:text-white/60 hover:text-[#17202D]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Cài Đặt Chuông Chánh Niệm</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'practices' ? (
            <div className="space-y-6">
              {/* Practice selector cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MICRO_PRACTICES.map((p) => {
                  const isSelected = selectedPractice.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPractice(p)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] border-transparent shadow-xs font-medium'
                          : 'bg-white/70 dark:bg-white/5 border-[#E8DED0] dark:border-white/10 text-[#17202D] dark:text-white hover:border-[#D8B878]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-black/20">
                          {p.durationSeconds}s
                        </span>
                      </div>
                      <h4 className="text-xs font-bold line-clamp-1">{p.title}</h4>
                      <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'opacity-80' : 'text-[#17202D]/60 dark:text-white/60'}`}>
                        {p.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Practice Interactive Arena */}
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-center space-y-5">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
                    {selectedPractice.title}
                  </h3>
                  <p className="text-xs text-[#17202D]/70 dark:text-white/70 max-w-md mx-auto mt-1">
                    {selectedPractice.guidanceText}
                  </p>
                </div>

                {/* Circular Timer Ring */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      className="stroke-[#E8DED0] dark:stroke-white/10"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      className="stroke-[#B89650] dark:stroke-[#D8B878] transition-all duration-1000 ease-linear"
                      strokeWidth="6"
                      strokeDasharray="276"
                      strokeDashoffset={276 - (276 * progressPercent) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-2xl font-bold text-[#101D35] dark:text-white">
                      {remainingSeconds}s
                    </span>
                    <span className="text-[10px] text-[#17202D]/60 dark:text-white/60 uppercase tracking-widest">
                      {isPlaying ? 'Thở an tịnh' : isCompleted ? 'Hoàn thành' : 'Sẵn sàng'}
                    </span>
                  </div>
                </div>

                {/* Instructions Steps */}
                <div className="bg-black/5 dark:bg-black/20 p-4 rounded-2xl text-left max-w-md mx-auto space-y-1.5">
                  <span className="text-[10px] font-bold text-[#B89650] dark:text-[#D8B878] uppercase tracking-wider block">
                    Chỉ dẫn thực hành:
                  </span>
                  {selectedPractice.instructionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#17202D]/80 dark:text-white/80">
                      <span className="w-4 h-4 rounded-full bg-[#D8B878]/20 text-[#B89650] dark:text-[#D8B878] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="p-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#17202D]/70 dark:text-white/70 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Đặt lại bài tập"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all min-h-[44px]"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Tạm Dừng' : isCompleted ? 'Thực Hành Lại' : 'Bắt Đầu 1 Phút'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Bell Settings Tab */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                <span className="font-bold">Chuông Chánh Niệm (Mindfulness Bell)</span> là pháp khí thong dong nhắc nhở bạn dừng lại công việc, buông lỏng hai vai và trở về trọn vẹn với hơi thở hiện tại.
              </div>

              {saveBellSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu cấu hình chuông chánh niệm thành công!</span>
                </div>
              )}

              <div className="space-y-4 bg-white/70 dark:bg-white/5 p-5 rounded-3xl border border-[#E8DED0] dark:border-white/10 text-xs">
                {/* Switch Enable */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DED0]/50 dark:border-white/5">
                  <div>
                    <span className="font-bold text-sm text-[#101D35] dark:text-white block">
                      Bật Chuông Chánh Niệm Tự Động
                    </span>
                    <span className="text-xs text-[#17202D]/60 dark:text-white/60">
                      Ngân chuông nhẹ nhàng sau mỗi khoảng thời gian bạn chọn
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bellEnabled}
                      onChange={(e) => setBellEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B89650]"></div>
                  </label>
                </div>

                {/* Interval select */}
                <div className="space-y-2">
                  <label className="font-bold text-[#101D35] dark:text-white block">
                    Khoảng thời gian ngân chuông:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setIntervalMinutes(mins)}
                        className={`py-2 rounded-xl text-center font-medium transition-all ${
                          intervalMinutes === mins
                            ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-bold shadow-xs'
                            : 'bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70'
                        }`}
                      >
                        {mins} phút
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#101D35] dark:text-white block mb-1">
                      Giờ bắt đầu:
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-[#17202D] dark:text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#101D35] dark:text-white block mb-1">
                      Giờ kết thúc:
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-[#17202D] dark:text-white text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Sound selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#101D35] dark:text-white block">
                      Âm sắc chuông:
                    </label>
                    <button
                      type="button"
                      onClick={handleTestBell}
                      className="text-[#B89650] dark:text-[#D8B878] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe thử</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBellSound('singing_bowl')}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        bellSound === 'singing_bowl'
                          ? 'border-[#B89650] dark:border-[#D8B878] bg-[#D8B878]/10 text-[#101D35] dark:text-white font-bold'
                          : 'border-transparent bg-black/5 dark:bg-white/5 text-[#17202D]/70 dark:text-white/70'
                      }`}
                    >
                      <span className="block text-xs">Chuông Xoay Tây Tạng</span>
                      <span className="text-[10px] opacity-70">Thanh thoát, rung cảm dịu dàng</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBellSound('temple_bell')}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        bellSound === 'temple_bell'
                          ? 'border-[#B89650] dark:border-[#D8B878] bg-[#D8B878]/10 text-[#101D35] dark:text-white font-bold'
                          : 'border-transparent bg-black/5 dark:bg-white/5 text-[#17202D]/70 dark:text-white/70'
                      }`}
                    >
                      <span className="block text-xs">Đại Hồng Chung 108Hz</span>
                      <span className="text-[10px] opacity-70">Trầm hùng, thức tỉnh tâm trí</span>
                    </button>
                  </div>
                </div>

                {/* Options: Workdays only & DND */}
                <div className="space-y-2 pt-2 border-t border-[#E8DED0]/50 dark:border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workdaysOnly}
                      onChange={(e) => setWorkdaysOnly(e.target.checked)}
                      className="rounded text-[#B89650]"
                    />
                    <span>Chỉ nhắc nhở trong các ngày làm việc (Thứ 2 - Thứ 6)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dnd}
                      onChange={(e) => setDnd(e.target.checked)}
                      className="rounded text-[#B89650]"
                    />
                    <span>Chế độ không làm phiền (Không rung khi thiết bị đang ở chế độ im lặng)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveBellConfig}
                  disabled={isSavingBell}
                  className="px-6 py-2.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-bold text-xs shadow-md hover:opacity-90 transition-all min-h-[40px]"
                >
                  {isSavingBell ? 'Đang lưu...' : 'Lưu Cài Đặt Chuông'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
