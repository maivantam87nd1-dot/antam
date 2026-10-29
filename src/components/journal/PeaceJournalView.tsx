import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JournalEntry, MoodType, EmotionalTrendReport } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  PenLine,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  Heart,
  Mic,
  MicOff,
  BarChart2,
  Smile,
  ArrowRight,
  TrendingUp,
  Compass,
  Volume2
} from 'lucide-react';

export const PeaceJournalView: React.FC = () => {
  const { user, token } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'journal' | 'trends'>('journal');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [mood, setMood] = useState<MoodType>('peaceful');
  const [emotionIntensity, setEmotionIntensity] = useState(3);
  const [prePostStatus, setPrePostStatus] = useState<'before_meditation' | 'after_meditation' | 'general'>('general');

  // Voice Journal states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const voiceTimerRef = useRef<any>(null);

  // Emotional Trends state
  const [trendReport, setTrendReport] = useState<EmotionalTrendReport | null>(null);

  const moodOptions: { type: MoodType; label: string; emoji: string }[] = [
    { type: 'peaceful', label: 'Bình an', emoji: '🌿' },
    { type: 'happy', label: 'Hân hoan', emoji: '✨' },
    { type: 'tired', label: 'Mệt mỏi', emoji: '🍃' },
    { type: 'anxious', label: 'Lo âu', emoji: '🌊' },
    { type: 'sad', label: 'Thoáng buồn', emoji: '🌧️' },
    { type: 'stressed', label: 'Căng thẳng', emoji: '⚡' },
    { type: 'insomnia', label: 'Khó ngủ', emoji: '🌙' },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'vi-VN';
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setContent(prev => (prev ? prev + ' ' + currentTranscript : currentTranscript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Fetch journal entries & trends
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch('/api/user/journal', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.entries) setEntries(data.entries);
      } catch (e) {
        const saved = localStorage.getItem('antam_journals');
        if (saved) setEntries(JSON.parse(saved));
      }
    };

    const fetchTrends = async () => {
      if (token) {
        try {
          const res = await fetch('/api/user/emotional-trends', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.report) setTrendReport(data.report);
        } catch (e) {}
      }
    };

    fetchEntries();
    fetchTrends();
  }, [user, token]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói tiếng Việt trực tiếp.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      setIsRecording(false);
      soundEngine.triggerHaptic(40);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setVoiceDuration(0);
        soundEngine.triggerHaptic([60, 40]);
        voiceTimerRef.current = setInterval(() => {
          setVoiceDuration(prev => prev + 1);
        }, 1000);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title && !content) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      setIsRecording(false);
    }

    const gratitudeItems = [gratitude1, gratitude2, gratitude3].filter(g => g.trim().length > 0);

    const payload = {
      title: title || (voiceDuration > 0 ? 'Tâm sự bằng giọng nói' : 'Khoảnh khắc bình an'),
      content,
      gratitudeItems,
      mood,
      emotionIntensity,
      prePostStatus,
      voiceDurationSeconds: voiceDuration,
      tags: ['an_tam', mood]
    };

    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.entry) {
        setEntries([data.entry, ...entries]);
        soundEngine.playSingingBowl(324, 4.0, 0.4);
        soundEngine.triggerHaptic([50, 50]);
      }
    } catch (e) {
      const newEntry: JournalEntry = {
        id: `local-${Date.now()}`,
        title: payload.title,
        content,
        gratitudeItems,
        mood,
        emotionIntensity,
        prePostStatus,
        voiceDurationSeconds: voiceDuration,
        tags: ['an_tam'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [newEntry, ...entries];
      setEntries(updated);
      localStorage.setItem('antam_journals', JSON.stringify(updated));
    }

    // Reset form
    setTitle('');
    setContent('');
    setGratitude1('');
    setGratitude2('');
    setGratitude3('');
    setVoiceDuration(0);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    try {
      await fetch(`/api/user/journal/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {}
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `antam_nhat_ky_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.gratitudeItems?.some(g => g.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8B878]/15 text-[#B89650] dark:text-[#D8B878] text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5" />
            <span>Chăm Sóc & Chuyển Hóa Cảm Xúc</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
            Nhật Ký Tâm Sự & Voice Journal
          </h1>
          <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70">
            Nơi trải lòng bằng văn bản hoặc giọng nói, quan sát cảm xúc và thực hành buông xả
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView(activeView === 'journal' ? 'trends' : 'journal')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all min-h-[40px] ${
              activeView === 'trends'
                ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] border-transparent'
                : 'bg-white/80 dark:bg-white/10 border-[#E8DED0] dark:border-white/10 text-[#17202D] dark:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>{activeView === 'trends' ? 'Xem Danh Sách Nhật Ký' : 'Báo Cáo Cảm Xúc'}</span>
          </button>

          {activeView === 'journal' && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Viết / Thu Âm Mới</span>
            </button>
          )}
        </div>
      </div>

      {activeView === 'trends' ? (
        /* Emotional Trends Analytics View */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
                <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
                  Bản Đồ Cảm Xúc Của Bạn (Emotional Landscape)
                </h3>
              </div>
              <span className="text-xs text-[#17202D]/60 dark:text-white/60">
                Tổng cộng: {trendReport?.totalMoodEntries || entries.length} khoảnh khắc
              </span>
            </div>

            {/* Improvement Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#E8DED0]/30 dark:bg-black/20 border border-[#E8DED0]/60 dark:border-white/5 space-y-1">
                <span className="text-xs text-[#17202D]/60 dark:text-white/60">Tỷ lệ bình an sau thiền:</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {trendReport?.preToPostImprovementRate || 78}%
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">cải thiện tâm trạng</span>
                </div>
                <p className="text-[11px] text-[#17202D]/50 dark:text-white/50">
                  Dựa trên sự thay đổi cảm xúc trước và sau các phiên thực hành chánh niệm của bạn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#E8DED0]/30 dark:bg-black/20 border border-[#E8DED0]/60 dark:border-white/5 space-y-1">
                <span className="text-xs text-[#17202D]/60 dark:text-white/60">Mức độ an tịnh trung bình:</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-[#B89650] dark:text-[#D8B878]">
                    {trendReport?.averageIntensity || 3.5} / 5.0
                  </span>
                  <span className="text-xs text-[#B89650] dark:text-[#D8B878]">vững chãi nội tâm</span>
                </div>
                <p className="text-[11px] text-[#17202D]/50 dark:text-white/50">
                  Bạn đang duy trì năng lượng tự quan sát rất tích cực và kiên định.
                </p>
              </div>
            </div>

            {/* Gratitude Keywords */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#101D35] dark:text-white block">
                Nguồn Năng Lượng Biết Ơn Được Ghi Nhận Nhiều Nhất:
              </span>
              <div className="flex flex-wrap gap-2">
                {(trendReport?.topGratitudeKeywords || ['Gia đình', 'Hơi thở', 'Sức khỏe', 'Khoảnh khắc hiện tại', 'Bình an nội tâm']).map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-[#D8B878]/15 text-[#B89650] dark:text-[#D8B878] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Letting Go Practice */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#D8B878]/15 via-transparent to-transparent border border-[#D8B878]/30 space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#B89650] dark:text-[#D8B878]" />
                <span className="text-xs font-bold text-[#B89650] dark:text-[#D8B878] uppercase tracking-wider">
                  Gợi ý thực hành buông xả hôm nay:
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#101D35] dark:text-white">
                {trendReport?.recommendedLettingGoPractice.title || 'Thiền Buông Xả & Nhận Diện Hai Mũi Tên'}
              </h4>
              <p className="text-xs text-[#17202D]/70 dark:text-white/70">
                {trendReport?.recommendedLettingGoPractice.description || 'Dành 10 phút ngồi yên, nhận diện nỗi đau thực tế và buông bỏ sự dằn vặt suy nghĩ tiêu cực do tâm thức tự tạo.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Journal Entries & Creation Arena */
        <div className="space-y-6">
          {/* Create Journal Card */}
          {isCreating && (
            <div className="bg-white dark:bg-[#182642] p-6 rounded-3xl border border-[#D8B878] dark:border-[#D8B878]/40 shadow-lg space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DED0] dark:border-white/10">
                <div className="flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
                  <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
                    Viết Hoặc Thu Âm Nhật Ký Chánh Niệm
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 rounded-lg text-[#17202D]/50 hover:text-[#17202D] dark:text-white/50 dark:hover:text-white"
                >
                  Đóng
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-4">
                {/* Voice Record Bar */}
                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`p-3 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isRecording
                          ? 'bg-rose-500 text-white animate-pulse shadow-md'
                          : 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35]'
                      }`}
                      title={isRecording ? 'Dừng thu âm' : 'Nói để viết tự động'}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-[#101D35] dark:text-white block">
                        {isRecording ? 'Đang lắng nghe lời tâm sự của bạn...' : 'Thu âm nhật ký (Voice Journal)'}
                      </span>
                      <span className="text-[10px] text-[#17202D]/60 dark:text-white/60">
                        {isRecording ? `Thời gian: ${voiceDuration} giây (Bấm lại để dừng)` : 'Nói tự nhiên bằng tiếng Việt, hệ thống sẽ tự động chép lời'}
                      </span>
                    </div>
                  </div>

                  {isRecording && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#101D35] dark:text-white mb-1.5">
                    Tâm trạng của bạn lúc này:
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {moodOptions.map((item) => (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => setMood(item.type)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          mood === item.type
                            ? 'bg-[#D8B878]/15 border-[#D8B878] text-[#101D35] dark:text-white font-bold scale-105'
                            : 'border-transparent bg-black/5 dark:bg-white/5 text-[#17202D]/70 dark:text-white/70'
                        }`}
                      >
                        <span className="text-base block mb-0.5">{item.emoji}</span>
                        <span className="text-[10px] block">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pre / Post Meditation Marker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#101D35] dark:text-white mb-1">
                      Thời điểm ghi chép:
                    </label>
                    <select
                      value={prePostStatus}
                      onChange={(e) => setPrePostStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
                    >
                      <option value="general">Tâm sự thường nhật</option>
                      <option value="before_meditation">Trước khi ngồi thiền (Nhận diện)</option>
                      <option value="after_meditation">Sau khi ngồi thiền (Khinh an)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101D35] dark:text-white mb-1">
                      Mức độ cảm xúc (1: Rất nhẹ - 5: Rất mãnh liệt):
                    </label>
                    <div className="flex items-center gap-2 pt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setEmotionIntensity(lvl)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                            emotionIntensity === lvl
                              ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35]'
                              : 'bg-black/5 dark:bg-white/10 text-[#17202D]/60 dark:text-white/60'
                          }`}
                        >
                          {lvl}★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#101D35] dark:text-white mb-1">
                    Tiêu đề (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Khoảnh khắc bình an dưới bóng cây..."
                    className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-[#101D35] dark:text-white mb-1">
                    Tâm sự hoặc bản chép lời giọng nói:
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    placeholder="Những suy nghĩ đang diễn ra trong tâm thức bạn... Bạn có thể chỉnh sửa tự do sau khi thu âm."
                    className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* 3 Gratitude items */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#B89650] dark:text-[#D8B878]">
                    Ba điều bạn biết ơn lúc này:
                  </label>
                  <input
                    type="text"
                    value={gratitude1}
                    onChange={(e) => setGratitude1(e.target.value)}
                    placeholder="1. Biết ơn hơi thở vẫn đang nuôi sống thân tâm..."
                    className="w-full p-2 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={gratitude2}
                    onChange={(e) => setGratitude2(e.target.value)}
                    placeholder="2. Biết ơn một bữa cơm ấm cúng hay nụ cười của người thân..."
                    className="w-full p-2 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={gratitude3}
                    onChange={(e) => setGratitude3(e.target.value)}
                    placeholder="3. Biết ơn nghịch cảnh đã giúp mình học bài học kiên nhẫn..."
                    className="w-full p-2 rounded-xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#17202D]/60 dark:text-white/60 hover:bg-black/5"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim() && !title.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-bold text-xs shadow-md hover:opacity-90 disabled:opacity-50 transition-all min-h-[40px]"
                  >
                    Lưu Nhật Ký An Yên
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search & Export Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#17202D]/40 dark:text-white/40" />
              <input
                type="text"
                placeholder="Tìm kiếm dòng tâm sự, từ khóa biết ơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none"
              />
            </div>

            {entries.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] transition-colors self-start min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải dữ liệu JSON (Bảo mật)</span>
              </button>
            )}
          </div>

          {/* Entries Timeline */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-dashed border-[#E8DED0] dark:border-white/10 space-y-3">
              <Sparkles className="w-8 h-8 text-[#B89650] dark:text-[#D8B878] mx-auto opacity-70" />
              <h4 className="font-serif text-base font-bold text-[#101D35] dark:text-white">
                Vườn nhật ký còn đang mở
              </h4>
              <p className="text-xs text-[#17202D]/60 dark:text-white/60 max-w-sm mx-auto">
                Hãy dành một phút tĩnh lặng để ghi chép cảm xúc hoặc thu âm lời tâm sự đầu tiên hôm nay nhé.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const moodMeta = moodOptions.find(m => m.type === entry.mood) || moodOptions[0];
                return (
                  <div
                    key={entry.id}
                    className="p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 hover:border-[#D8B878]/50 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{moodMeta.emoji}</span>
                        <div>
                          <h4 className="font-serif text-sm font-bold text-[#101D35] dark:text-white">
                            {entry.title}
                          </h4>
                          <span className="text-[10px] text-[#17202D]/50 dark:text-white/50 flex items-center gap-2">
                            <span>{new Date(entry.createdAt).toLocaleDateString('vi-VN')}</span>
                            {entry.voiceDurationSeconds ? (
                              <span className="text-[#B89650] dark:text-[#D8B878] font-medium flex items-center gap-1">
                                <Volume2 className="w-3 h-3" />
                                <span>Voice ({entry.voiceDurationSeconds}s)</span>
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-lg text-[#17202D]/40 hover:text-rose-500 dark:text-white/40 transition-colors"
                        title="Xóa mục này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-[#17202D]/80 dark:text-white/80 leading-relaxed font-sans whitespace-pre-line">
                      {entry.content}
                    </p>

                    {entry.gratitudeItems && entry.gratitudeItems.length > 0 && (
                      <div className="p-3 rounded-2xl bg-[#E8DED0]/30 dark:bg-black/20 space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-[#B89650] dark:text-[#D8B878] uppercase tracking-wider block">
                          Điều biết ơn:
                        </span>
                        {entry.gratitudeItems.map((g, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[#17202D]/80 dark:text-white/80 text-[11px]">
                            <Heart className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                            <span>{g}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
