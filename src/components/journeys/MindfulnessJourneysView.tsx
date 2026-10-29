import React, { useState } from 'react';
import { MINDFULNESS_JOURNEYS, MEDITATION_TRACKS } from '../../data/mockData';
import { MindfulnessJourney } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { CheckCircle2, Circle, Play, Calendar, Sparkles, ChevronRight } from 'lucide-react';

export const MindfulnessJourneysView: React.FC = () => {
  const { playTrack } = useAudio();
  const [selectedJourney, setSelectedJourney] = useState<MindfulnessJourney>(MINDFULNESS_JOURNEYS[0]);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('antam_journey_progress');
    return saved ? JSON.parse(saved) : { 'journey-7days-step-1': true };
  });

  const toggleDayCompletion = (journeyId: string, dayNum: number) => {
    const key = `${journeyId}-step-${dayNum}`;
    const next = { ...completedDays, [key]: !completedDays[key] };
    setCompletedDays(next);
    localStorage.setItem('antam_journey_progress', JSON.stringify(next));
  };

  const handleStartStep = (step: any) => {
    const track = MEDITATION_TRACKS.find(t => t.id === step.meditationId) || MEDITATION_TRACKS[0];
    playTrack(track);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#101D35] dark:text-[#F5F7FA]">
          Hành Trình Thực Hành
        </h1>
        <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70">
          Xây dựng thói quen chánh niệm từng ngày một cách nhẹ nhàng, không áp lực
        </p>
      </div>

      {/* Journey Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MINDFULNESS_JOURNEYS.map((journey) => (
          <button
            key={journey.id}
            onClick={() => setSelectedJourney(journey)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] ${
              selectedJourney.id === journey.id
                ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] shadow-md'
                : 'bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35]'
            }`}
          >
            {journey.title}
          </button>
        ))}
      </div>

      {/* Selected Journey Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#101D35] to-[#172644] text-white shadow-xl border border-white/10">
        <div className="max-w-xl">
          <span className="text-xs font-semibold text-[#D8B878] uppercase tracking-wider block mb-1">
            Lộ trình {selectedJourney.durationDays} ngày
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            {selectedJourney.title}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
            {selectedJourney.description}
          </p>
          <div className="text-xs text-[#D8B878] font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Hãy tiến bước theo nhịp độ tự nhiên của chính bạn. Không sao cả nếu bạn lỡ một ngày!</span>
          </div>
        </div>
      </div>

      {/* Daily Steps Timeline */}
      <div className="space-y-4">
        {selectedJourney.steps.map((step) => {
          const stepKey = `${selectedJourney.id}-step-${step.day}`;
          const isDone = !!completedDays[stepKey];

          return (
            <div
              key={step.day}
              className={`p-5 rounded-3xl border transition-all ${
                isDone
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-white/80 dark:bg-white/5 border-[#E8DED0] dark:border-white/10 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleDayCompletion(selectedJourney.id, step.day)}
                    className="p-1 mt-0.5 rounded-full hover:scale-110 transition-transform text-[#B89650] dark:text-[#D8B878]"
                    title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white dark:text-[#101D35]" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#17202D]/30 dark:text-white/30" />
                    )}
                  </button>

                  <div>
                    <h3 className="font-serif text-base font-bold text-[#101D35] dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#17202D]/70 dark:text-white/70 mt-0.5">
                      {step.description}
                    </p>

                    {/* Reflection prompt */}
                    <div className="mt-2.5 p-3 rounded-2xl bg-[#D8B878]/10 text-xs text-[#101D35] dark:text-white/90">
                      <strong>Câu hỏi phản chiếu:</strong> {step.reflectionPrompt}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartStep(step)}
                  className="px-4 py-2.5 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center hover:opacity-95 active:scale-95 transition-all shadow-sm min-h-[40px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Bắt đầu ngày {step.day}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
