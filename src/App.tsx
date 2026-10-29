import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider, useAudio } from './context/AudioContext';
import { DesktopHeader } from './components/navigation/DesktopHeader';
import { TabBar, TabKey } from './components/navigation/TabBar';
import { MiniPlayer } from './components/audio/MiniPlayer';
import { FullPlayerModal } from './components/audio/FullPlayerModal';
import { HomeView } from './components/home/HomeView';
import { MeditationView } from './components/meditation/MeditationView';
import { BuddhistLibraryView } from './components/buddhist/BuddhistLibraryView';
import { SoundMixerView } from './components/audio/SoundMixerView';
import { AnTamSpaceView } from './components/spaces/AnTamSpaceView';
import { PeaceJournalView } from './components/journal/PeaceJournalView';
import { MindfulnessJourneysView } from './components/journeys/MindfulnessJourneysView';
import { AffiliateStoreView } from './components/affiliate/AffiliateStoreView';
import { ProfileView } from './components/profile/ProfileView';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { RewardedAdModal } from './components/ads/RewardedAdModal';
import { GieoHatLanhView } from './components/community/GieoHatLanhView';
import { MicroMindfulnessModal } from './components/micro/MicroMindfulnessModal';
import { ZenGardenView } from './components/garden/ZenGardenView';
import { MindfulLensModal } from './components/lens/MindfulLensModal';
import { Binaural3DModal } from './components/audio/Binaural3DModal';
import { MEDITATION_TRACKS } from './data/mockData';
import { StatusBar, Style } from '@capacitor/status-bar';

const MainAppContent: React.FC = () => {
  const { currentTrack, playTrack } = useAudio();
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [secondarySection, setSecondarySection] = useState<'spaces' | 'journal' | 'journeys' | 'affiliate' | 'community' | 'garden' | null>(null);

  // Modals state
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [isMicroModalOpen, setIsMicroModalOpen] = useState(false);
  const [isMindfulLensOpen, setIsMindfulLensOpen] = useState(false);
  const [isBinauralModalOpen, setIsBinauralModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !localStorage.getItem('antam_onboarded');
  });

  useEffect(() => {
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#101D35' });
    } catch (e) {
      // In web browser environment, safely ignored
    }
  }, []);

  const handleQuickPractice = () => {
    const quickTrack = MEDITATION_TRACKS[0];
    playTrack(quickTrack, 3);
  };

  const handleSelectTab = (tab: TabKey) => {
    setCurrentTab(tab);
    setSecondarySection(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] flex flex-col font-sans transition-colors">
      {/* Desktop Header */}
      <DesktopHeader
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAI={() => setIsAIOpen(true)}
        onQuickPractice={handleQuickPractice}
      />

      {/* Sub-header Bar for quick navigation to Spaces, Journal, Journeys & Affiliate */}
      <div className="bg-[#E8DED0]/40 dark:bg-black/10 border-b border-[#E8DED0]/60 dark:border-white/5 py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-[#17202D]/50 dark:text-white/50 whitespace-nowrap">Không gian nhanh:</span>
            <button
              onClick={() => setSecondarySection('spaces')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap min-h-[32px] ${
                secondarySection === 'spaces'
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                  : 'bg-white/70 dark:bg-white/10 hover:bg-white text-[#17202D]/80 dark:text-white/80'
              }`}
            >
              🌿 Cảnh Thiền Spaces
            </button>
            <button
              onClick={() => setSecondarySection('journeys')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap min-h-[32px] ${
                secondarySection === 'journeys'
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                  : 'bg-white/70 dark:bg-white/10 hover:bg-white text-[#17202D]/80 dark:text-white/80'
              }`}
            >
              🗓️ Hành Trình Chánh Niệm
            </button>
            <button
              onClick={() => setSecondarySection('journal')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap min-h-[32px] ${
                secondarySection === 'journal'
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                  : 'bg-white/70 dark:bg-white/10 hover:bg-white text-[#17202D]/80 dark:text-white/80'
              }`}
            >
              ✍️ Nhật Ký Bình An
            </button>
            <button
              onClick={() => setSecondarySection('affiliate')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap min-h-[32px] ${
                secondarySection === 'affiliate'
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                  : 'bg-white/70 dark:bg-white/10 hover:bg-white text-[#17202D]/80 dark:text-white/80'
              }`}
            >
              🛍️ Góc An Tâm
            </button>
            <button
              onClick={() => setSecondarySection('garden')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap min-h-[32px] ${
                secondarySection === 'garden'
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                  : 'bg-white/70 dark:bg-white/10 hover:bg-white text-[#17202D]/80 dark:text-white/80'
              }`}
            >
              🌱 Vườn Tâm An
            </button>
            <button
              onClick={() => setSecondarySection('community')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap min-h-[32px] ${
                secondarySection === 'community'
                  ? 'bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] font-semibold'
                  : 'bg-white/70 dark:bg-white/10 hover:bg-white text-[#17202D]/80 dark:text-white/80'
              }`}
            >
              🌸 Gieo Hạt Lành
            </button>
            <button
              onClick={() => setIsMindfulLensOpen(true)}
              className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 hover:bg-amber-500/20 text-[#17202D]/80 dark:text-white/80 transition-colors whitespace-nowrap min-h-[32px] flex items-center gap-1"
            >
              <span>📷 Góc Nhìn Tỉnh Thức</span>
            </button>
            <button
              onClick={() => setIsBinauralModalOpen(true)}
              className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 hover:bg-cyan-500/20 text-[#17202D]/80 dark:text-white/80 transition-colors whitespace-nowrap min-h-[32px] flex items-center gap-1"
            >
              <span>🎧 Sóng Não 3D</span>
            </button>
            <button
              onClick={() => setIsMicroModalOpen(true)}
              className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 hover:bg-[#D8B878]/20 text-[#17202D]/80 dark:text-white/80 transition-colors whitespace-nowrap min-h-[32px] flex items-center gap-1"
            >
              <span>⏰ Chuông Chánh Niệm</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRewardedAdOpen(true)}
              className="text-[#B89650] dark:text-[#D8B878] font-medium hover:underline whitespace-nowrap flex items-center gap-1"
            >
              <span>🎁 Vé thiền 24h</span>
            </button>
            {secondarySection && (
              <button
                onClick={() => setSecondarySection(null)}
                className="text-[#B89650] dark:text-[#D8B878] font-semibold hover:underline whitespace-nowrap"
              >
                Quay về trang chính
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {secondarySection === 'garden' ? (
          <ZenGardenView
            onStartMeditation={() => {
              setCurrentTab('meditation');
              setSecondarySection(null);
            }}
            onOpenJournal={() => setSecondarySection('journal')}
          />
        ) : secondarySection === 'spaces' ? (
          <AnTamSpaceView />
        ) : secondarySection === 'journeys' ? (
          <MindfulnessJourneysView />
        ) : secondarySection === 'journal' ? (
          <PeaceJournalView />
        ) : secondarySection === 'affiliate' ? (
          <AffiliateStoreView />
        ) : secondarySection === 'community' ? (
          <GieoHatLanhView />
        ) : currentTab === 'home' ? (
          <HomeView
            onNavigateTab={handleSelectTab}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenBreathing={() => {
              setCurrentTab('meditation');
            }}
            onOpenMindfulLens={() => setIsMindfulLensOpen(true)}
            onOpenZenGarden={() => setSecondarySection('garden')}
            onOpenBinaural3D={() => setIsBinauralModalOpen(true)}
          />
        ) : currentTab === 'meditation' ? (
          <MeditationView />
        ) : currentTab === 'buddhist' ? (
          <BuddhistLibraryView />
        ) : currentTab === 'sound' ? (
          <SoundMixerView />
        ) : (
          <ProfileView
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenSubscription={() => setIsSubscriptionOpen(true)}
          />
        )}
      </main>

      {/* Mini Player */}
      <MiniPlayer />

      {/* Full Player Modal */}
      <FullPlayerModal />

      {/* Bottom Tab Bar (Touch-first mobile navigation) */}
      <TabBar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        hasMiniPlayer={!!currentTrack}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onOpenBreathing={() => {
          setIsAIOpen(false);
          setCurrentTab('meditation');
        }}
        onOpenBuddhist={() => {
          setIsAIOpen(false);
          setCurrentTab('buddhist');
        }}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardGranted={() => {
          setIsRewardedAdOpen(false);
        }}
      />

      {/* Micro-Mindfulness & Smart Bell Modal */}
      <MicroMindfulnessModal
        isOpen={isMicroModalOpen}
        onClose={() => setIsMicroModalOpen(false)}
      />

      {/* Mindful Lens Modal (AI Camera Biometric Stress Detection) */}
      <MindfulLensModal
        isOpen={isMindfulLensOpen}
        onClose={() => setIsMindfulLensOpen(false)}
        onStartMicroPractice={() => setIsMicroModalOpen(true)}
      />

      {/* 3D Spatial Audio & Binaural Beats Modal */}
      <Binaural3DModal
        isOpen={isBinauralModalOpen}
        onClose={() => setIsBinauralModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <MainAppContent />
      </AudioProvider>
    </AuthProvider>
  );
}
