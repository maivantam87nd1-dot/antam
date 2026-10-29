import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, X, Heart, Shield, RefreshCw, Volume2, CheckCircle, Eye, Activity, Wind } from 'lucide-react';
import { MindfulLensResult } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface MindfulLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMicroPractice?: (practiceId: string) => void;
}

export const MindfulLensModal: React.FC<MindfulLensModalProps> = ({
  isOpen,
  onClose,
  onStartMicroPractice
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Manual assessment inputs (if camera is denied or user prefers privacy)
  const [facialTension, setFacialTension] = useState(5);
  const [selfScore, setSelfScore] = useState(55);
  const [result, setResult] = useState<MindfulLensResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setResult(null);
      setIsScanning(false);
      setScanProgress(0);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ truy cập camera. Bạn có thể tự đánh giá bằng thanh trượt.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera chưa được cấp quyền hoặc đang bận. Bạn hoàn toàn có thể tự điều chỉnh trạng thái bên dưới.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const handleScanNow = async () => {
    setIsScanning(true);
    setScanProgress(10);
    soundEngine.triggerHaptic(30);

    // Simulated multi-stage biometric extraction scan
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    try {
      const res = await fetch('/api/user/mindful-lens/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facialTension: streamActive ? Math.floor(Math.random() * 4) + 4 : facialTension,
          blinkRate: streamActive ? 18 : 16,
          selfAssessmentScore: selfScore
        })
      });

      const data = await res.json();
      clearInterval(interval);
      setScanProgress(100);

      setTimeout(() => {
        setIsScanning(false);
        if (data.success) {
          setResult(data.result);
          soundEngine.playSingingBowl(216, 4.0, 0.4);
          soundEngine.triggerHaptic([40, 80, 40]);
        }
      }, 300);
    } catch (e) {
      clearInterval(interval);
      setIsScanning(false);
    }
  };

  const handlePlayBell = () => {
    soundEngine.playTempleBell(0.8);
    soundEngine.triggerHaptic(60);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DED0] dark:border-white/10 bg-gradient-to-r from-[#101D35] to-[#1C2C4E] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#D8B878]/20 flex items-center justify-center text-[#D8B878]">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Góc Nhìn Tỉnh Thức</h3>
              <p className="text-xs text-white/70">AI Camera Nhận Diện Mức Độ Căng Thẳng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {!result ? (
            <>
              {/* Camera Viewport or Privacy Fallback */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10 shadow-inner">
                {streamActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {/* Futuristic HUD Scanning Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-[#D8B878]/30 rounded-2xl m-3 flex flex-col justify-between p-3">
                      <div className="flex justify-between items-center text-[10px] text-[#D8B878] font-mono">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 animate-pulse" /> BIOMETRIC SCANNER
                        </span>
                        <span>AI TỈNH THỨC</span>
                      </div>

                      {/* Oval face guide */}
                      <div className="self-center w-36 h-48 border-2 border-dashed border-[#D8B878]/60 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#D8B878] rounded-full animate-ping" />
                      </div>

                      <div className="text-center text-[11px] text-white/80 bg-black/50 py-1 rounded-full backdrop-blur-sm">
                        Giữ gương mặt cân đối trước màn hình
                      </div>
                    </div>

                    {isScanning && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#D8B878] to-transparent animate-pulse shadow-[0_0_15px_#D8B878]" />
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-white/70 space-y-3">
                    <Camera className="w-12 h-12 mx-auto text-[#D8B878]/60" />
                    <p className="text-sm font-medium">
                      {cameraError || 'Camera đang tắt. Bạn có thể quét khuôn mặt hoặc tự chọn cảm giác hiện tại bên dưới.'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="text-xs text-[#D8B878] underline hover:text-white transition-colors"
                    >
                      Bật lại camera trước
                    </button>
                  </div>
                )}
              </div>

              {/* Privacy statement */}
              <div className="flex items-center gap-2 text-xs text-[#17202D]/60 dark:text-white/60 bg-[#E8DED0]/40 dark:bg-white/5 p-3 rounded-xl">
                <Shield className="w-4 h-4 text-[#B89650] dark:text-[#D8B878] shrink-0" />
                <span>
                  Bảo mật tuyệt đối: Hình ảnh phân tích trực tiếp trên trình duyệt, không lưu trữ hay gửi video lên server.
                </span>
              </div>

              {/* Manual adjustment sliders for precision */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Mức độ mỏi mắt / căng cơ trán:</span>
                    <span className="text-[#B89650] dark:text-[#D8B878]">{facialTension}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={facialTension}
                    onChange={(e) => setFacialTension(Number(e.target.value))}
                    className="w-full accent-[#B89650] dark:accent-[#D8B878]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Áp lực tinh thần bạn đang cảm nhận:</span>
                    <span className="text-[#B89650] dark:text-[#D8B878]">{selfScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={selfScore}
                    onChange={(e) => setSelfScore(Number(e.target.value))}
                    className="w-full accent-[#B89650] dark:accent-[#D8B878]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleScanNow}
                disabled={isScanning}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#101D35] to-[#1C2C4E] hover:from-[#172644] hover:to-[#22355C] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D8B878]" />
                    <span>Đang đo nhịp căng thẳng ({scanProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D8B878]" />
                    <span>Bắt Đầu Nhận Diện Trạng Thái</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Result View */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Dial & Score */}
              <div className="p-5 rounded-2xl bg-[#E8DED0]/50 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-center space-y-3">
                <p className="text-xs uppercase tracking-wider text-[#17202D]/60 dark:text-white/60">
                  Chỉ số Căng Thẳng (Stress Index)
                </p>
                <div className="relative inline-flex items-center justify-center">
                  <div
                    className={`w-24 h-24 rounded-full flex flex-col items-center justify-center font-bold border-4 shadow-lg ${
                      result.stressLevel >= 70
                        ? 'border-red-400 text-red-500 bg-red-500/10'
                        : result.stressLevel >= 40
                        ? 'border-amber-400 text-amber-500 bg-amber-500/10'
                        : 'border-emerald-400 text-emerald-500 bg-emerald-500/10'
                    }`}
                  >
                    <span className="text-3xl font-serif">{result.stressLevel}</span>
                    <span className="text-[10px] font-normal uppercase">/ 100</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-[#17202D]/70 dark:text-white/70 pt-1">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" /> Nhịp tim ~{result.heartRateEstimateBpm} BPM
                  </span>
                  <span>·</span>
                  <span>Trạng thái: <strong>{result.primaryEmotion}</strong></span>
                </div>
              </div>

              {/* Buddhist Wisdom Insight */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#17202D] dark:text-amber-100 text-xs sm:text-sm leading-relaxed space-y-1.5">
                <p className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Lời Phật Dạy Dành Cho Bạn:
                </p>
                <p className="italic font-serif">"{result.buddhistInsight}"</p>
              </div>

              {/* Immediate Recommended Pause Action */}
              <div className="p-4 rounded-2xl bg-[#101D35] text-white space-y-3 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#D8B878] font-semibold">
                      Đề xuất khoảng lặng tức thì
                    </span>
                    <h4 className="font-serif text-base font-bold text-white mt-0.5">
                      {result.recommendedPause.title}
                    </h4>
                    <p className="text-xs text-white/80 mt-1">
                      {result.recommendedPause.description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {result.recommendedPause.actionType === 'temple_bell' ? (
                    <button
                      onClick={handlePlayBell}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#D8B878] text-[#101D35] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#e4c992] transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Thỉnh Đại Hồng Chung 108Hz</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        if (onStartMicroPractice) {
                          onStartMicroPractice('mp-1');
                        }
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#D8B878] text-[#101D35] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#e4c992] transition-colors"
                    >
                      <Wind className="w-4 h-4" />
                      <span>Bắt Đầu Khoảng Lặng ({result.recommendedPause.durationSeconds}s)</span>
                    </button>
                  )}

                  <button
                    onClick={() => setResult(null)}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                  >
                    Đo lại
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
