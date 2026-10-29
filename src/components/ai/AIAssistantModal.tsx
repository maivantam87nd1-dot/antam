import React, { useState, useRef, useEffect } from 'react';
import { AIMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';
import { MEDITATION_TRACKS } from '../../data/mockData';
import { soundEngine } from '../../services/soundEngine';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Mic,
  MicOff,
  BookMarked,
  ThumbsUp,
  ThumbsDown,
  Share2,
  CheckCircle2,
  Briefcase,
  Users,
  Flame,
  Frown,
  Compass,
  Heart
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBreathing: () => void;
  onOpenBuddhist: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenBreathing,
  onOpenBuddhist
}) => {
  const { user, token } = useAuth();
  const { playTrack } = useAudio();

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Kính chào bạn ${user?.name || ''}. Tôi là Trợ Lý Chánh Niệm & Phật Pháp AN TÂM (Deep RAG). Tôi được trau dồi dựa trên các kinh điển Phật học đã được kiểm chứng và kiến thức thiền định chính thống (Kinh Trung Bộ, Kinh Pháp Cú, Bát Nhã Tâm Kinh, Làng Mai). Bạn đang cảm thấy thế nào, hay có vấn đề cuộc sống nào muốn cùng tôi chiêm nghiệm?`,
      timestamp: new Date().toISOString(),
      citations: ['Kinh Chuyển Pháp Luân (Tương Ưng Bộ)', 'Bát Nhã Tâm Kinh (Đại thừa)', 'Kinh Quán Niệm Hơi Thở']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'unhelpful'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const lifeTopics = [
    { id: 'work', label: 'Công việc & Áp lực', icon: Briefcase, prompt: 'Tôi đang chịu nhiều áp lực và căng thẳng trong công việc, Phật pháp khuyên tôi nên điều phục tâm thế nào?' },
    { id: 'family', label: 'Gia đình & Mối quan hệ', icon: Users, prompt: 'Làm sao để thực hành ái ngữ và lắng nghe sâu khi có bất hòa trong gia đình?' },
    { id: 'forgiveness', label: 'Giận dữ & Tha thứ', icon: Flame, prompt: 'Kinh Pháp Cú dạy gì về việc hóa giải hận thù và học cách tha thứ cho người làm tổn thương mình?' },
    { id: 'expectation', label: 'Thất bại & Kỳ vọng', icon: Frown, prompt: 'Khi thất bại hoặc kế hoạch sụp đổ, làm sao để buông bỏ bám chấp theo tinh thần Kinh Kim Cương?' },
    { id: 'impermanence', label: 'Vô thường & Mất mát', icon: Compass, prompt: 'Kinh Mũi Tên dạy cách nhìn nhận nỗi đau thứ nhất và nỗi đau thứ hai như thế nào khi gặp mất mát?' },
    { id: 'gratitude', label: 'Nuôi dưỡng biết ơn', icon: Heart, prompt: 'Làm thế nào để nuôi dưỡng tâm biết ơn và hiện pháp lạc trú trong từng hơi thở thường nhật?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói tiếng Việt trực tiếp.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || isSending) return;

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi xử lý AI.');
      }

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'An Tâm đang cùng bạn an trú trong sự tĩnh lặng...',
        timestamp: new Date().toISOString(),
        citations: data.citations || [],
        suggestedAction: data.suggestedAction
      };
      setMessages([...newMessages, aiMsg]);
      soundEngine.playSingingBowl(324, 3.0, 0.35);
    } catch (e: any) {
      const fallbackMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'An Tâm luôn ở bên bạn. Khi tâm trí xao động, điều tốt nhất lúc này là quay về với hơi thở tự nhiên. Bạn hãy thở vào một hơi thật sâu và thở ra buông bỏ muộn phiền nhé. "Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười."',
        timestamp: new Date().toISOString(),
        citations: ['Kinh Quán Niệm Hơi Thở (Ānāpānasati Sutta - Majjhima Nikāya 118)'],
        suggestedAction: {
          type: 'breathing',
          targetId: 'relax',
          label: 'Tập thở thư giãn 4-6 nhịp'
        }
      };
      setMessages([...newMessages, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFeedback = async (msgId: string, rating: 'helpful' | 'unhelpful') => {
    setFeedbackGiven(prev => ({ ...prev, [msgId]: rating }));
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          rating,
          feedback: `Rating from message ${msgId}`
        })
      });
      soundEngine.triggerHaptic(30);
    } catch (e) {}
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExecuteAction = (action: any) => {
    onClose();
    if (action.type === 'breathing') {
      onOpenBreathing();
    } else if (action.type === 'scripture') {
      onOpenBuddhist();
    } else if (action.type === 'meditation') {
      const track = MEDITATION_TRACKS.find(t => t.id === action.targetId) || MEDITATION_TRACKS[0];
      playTrack(track, 10);
    } else if (action.type === 'sound') {
      soundEngine.startRain(0.5);
      soundEngine.startSingingBowlLoop(0.4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#F8F6F1] dark:bg-[#101D35] rounded-3xl border border-[#E8DED0] dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DED0] dark:border-white/10 bg-white/40 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#D8B878]/15 text-[#B89650] dark:text-[#D8B878]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
                  Trợ Lý Chánh Niệm An Tâm AI
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Deep RAG Grounded
                </span>
              </div>
              <p className="text-xs text-[#17202D]/60 dark:text-white/60">
                Đối thoại từ bi dựa trên kinh điển Phật học chính thống & thiền định ứng dụng
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

        {/* Life Topics Fast Bar */}
        <div className="px-6 py-2.5 bg-white/30 dark:bg-black/10 border-b border-[#E8DED0]/60 dark:border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-[#17202D]/50 dark:text-white/50 shrink-0">
            Chủ đề cuộc sống:
          </span>
          {lifeTopics.map((lt) => {
            const Icon = lt.icon;
            return (
              <button
                key={lt.id}
                onClick={() => handleSendMessage(lt.prompt)}
                disabled={isSending}
                className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 hover:bg-[#D8B878]/20 border border-[#E8DED0] dark:border-white/10 text-[#17202D]/80 dark:text-white/80 whitespace-nowrap flex items-center gap-1.5 transition-all text-xs shrink-0 disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-[#B89650] dark:text-[#D8B878]" />
                <span>{lt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const feedback = feedbackGiven[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#101D35] text-[#D8B878] dark:bg-[#D8B878] dark:text-[#101D35] flex items-center justify-center shrink-0 mt-1 shadow-xs font-bold text-xs">
                    AT
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 shadow-xs ${
                    isUser
                      ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] rounded-tr-none'
                      : 'bg-white dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-[#17202D] dark:text-white rounded-tl-none font-sans'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Citations Badge */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-[#E8DED0]/50 dark:border-white/10 text-[11px] text-[#17202D]/60 dark:text-white/60 space-y-1">
                      <span className="font-semibold text-[#B89650] dark:text-[#D8B878] flex items-center gap-1">
                        <BookMarked className="w-3 h-3" />
                        <span>Nguồn kinh văn tham chiếu kiểm chứng:</span>
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 pl-1 font-serif italic text-[11px]">
                        {msg.citations.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contextual Action Button */}
                  {!isUser && msg.suggestedAction && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleExecuteAction(msg.suggestedAction)}
                        className="w-full flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-[#D8B878]/15 hover:bg-[#D8B878]/25 text-[#B89650] dark:text-[#D8B878] font-bold text-xs transition-all border border-[#D8B878]/30"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Bottom Message Actions: Copy & Feedback */}
                  {!isUser && msg.id !== 'init-1' && (
                    <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-[#17202D]/50 dark:text-white/50">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-[#B89650] dark:hover:text-[#D8B878] transition-colors flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>{copiedId === msg.id ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span>Đánh giá:</span>
                        <button
                          onClick={() => handleFeedback(msg.id, 'helpful')}
                          className={`p-1 rounded transition-colors ${feedback === 'helpful' ? 'text-emerald-500 font-bold' : 'hover:text-emerald-500'}`}
                          title="Câu trả lời hữu ích"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'unhelpful')}
                          className={`p-1 rounded transition-colors ${feedback === 'unhelpful' ? 'text-rose-500 font-bold' : 'hover:text-rose-500'}`}
                          title="Cần hoàn thiện thêm"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'B'}
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 justify-start items-center text-xs text-[#17202D]/60 dark:text-white/60 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#101D35] text-[#D8B878] dark:bg-[#D8B878] dark:text-[#101D35] flex items-center justify-center font-bold text-xs">
                AT
              </div>
              <div className="bg-white dark:bg-white/10 p-3 rounded-2xl border border-[#E8DED0] dark:border-white/10 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B89650]" />
                <span>An Tâm đang tra cứu kinh điển & chiêm nghiệm câu trả lời...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white/80 dark:bg-white/5 border-t border-[#E8DED0] dark:border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-2xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70 hover:bg-black/10'
              }`}
              title={isListening ? 'Dừng lắng nghe' : 'Nói để đặt câu hỏi'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hỏi về giáo lý Phật pháp, cách quản trị cơn giận hay phương pháp thiền..."
              disabled={isSending}
              className="flex-1 p-2.5 px-4 rounded-2xl bg-black/5 dark:bg-white/10 border border-[#E8DED0] dark:border-white/10 text-xs text-[#17202D] dark:text-white focus:outline-none focus:border-[#D8B878]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 px-4 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] font-bold text-xs transition-all disabled:opacity-50 min-h-[40px] flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
