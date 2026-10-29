export type MoodType = 'peaceful' | 'happy' | 'tired' | 'anxious' | 'sad' | 'stressed' | 'insomnia';

export interface MoodCheckin {
  id: string;
  mood: MoodType;
  label: string;
  note?: string;
  timestamp: string;
}

export type MeditationCategory =
  | 'beginner'
  | 'morning'
  | 'sleep'
  | 'relaxation'
  | 'breath_focus'
  | 'mindfulness'
  | 'gratitude'
  | 'loving_kindness'
  | 'letting_go'
  | 'focus'
  | 'walking'
  | 'silent';

export interface MeditationTrack {
  id: string;
  title: string;
  subtitle: string;
  category: MeditationCategory;
  categoryName: string;
  description: string;
  durations: number[]; // e.g. [3, 5, 10, 15, 20, 30] in minutes
  instructor: string;
  source: string;
  image: string;
  audioTone: 'singing_bowl' | 'rain' | 'stream' | 'theta' | 'bamboo';
  isPremium?: boolean;
  instructions: string[];
}

export interface BuddhistScripture {
  id: string;
  title: string;
  sanskritTitle?: string;
  category: 'sutra' | 'mantra' | 'dharma_talk' | 'stories' | 'teachings';
  categoryLabel: string;
  translator: string;
  source: string;
  contentType: 'original' | 'translation' | 'commentary';
  description: string;
  image: string;
  audioTone: 'singing_bowl' | 'stream';
  contentVerses: {
    sectionTitle?: string;
    original?: string;
    translation: string;
    explanation?: string;
  }[];
  isPremium?: boolean;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  category: 'nature' | 'meditation' | 'binaural';
  type: 'rain' | 'stream' | 'singing_bowl' | 'bamboo_wind' | 'waves' | 'theta_drone';
  defaultVolume: number;
}

export interface SoundMixPreset {
  id: string;
  name: string;
  description: string;
  volumes: Record<string, number>;
}

export interface MindfulnessSpace {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  image: string;
  ambientTone: 'stream' | 'rain' | 'singing_bowl' | 'bamboo';
}

export interface MindfulnessJourney {
  id: string;
  title: string;
  subtitle: string;
  durationDays: number;
  description: string;
  image: string;
  steps: {
    day: number;
    title: string;
    description: string;
    meditationId: string;
    reflectionPrompt: string;
  }[];
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  gratitudeItems: string[];
  mood: MoodType;
  emotionIntensity?: number; // 1 to 5 scale
  prePostStatus?: 'before_meditation' | 'after_meditation' | 'general';
  voiceDurationSeconds?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isGuest: boolean;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  isPremium: boolean;
  totalMeditationMinutes: number;
  totalSessions: number;
  streakDays: number;
  lastPracticeDate?: string;
  selectedGoals: string[];
  mindfulnessBell: {
    enabled: boolean;
    times: string[]; // e.g. ["08:00", "12:00", "18:00", "21:00"]
    sound: 'singing_bowl' | 'temple_bell';
  };
  theme: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'large' | 'extra_large';
  token?: string;
}

export interface KnowledgeChunk {
  id: string;
  documentTitle: string;
  tradition: string;
  source: string;
  chapter?: string;
  content: string;
  keywords: string[];
}

export interface SubscriptionEntitlement {
  id: string;
  userId: string;
  planId: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'trial' | 'revoked';
  expiresAt: string;
  receiptToken: string;
  platform: 'apple_storekit' | 'google_play' | 'sandbox_test';
  verifiedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
  suggestedAction?: {
    type: 'meditation' | 'breathing' | 'sound' | 'scripture';
    targetId: string;
    label: string;
  };
}

export interface ScriptureExplanation {
  scriptureId: string;
  verseIndex: number;
  mode: 'simple' | 'deep' | 'practical';
  explanation: string;
  traditionNotes?: string;
  practicalApplication?: string;
  citations: string[];
}

export interface AffiliateOffer {
  id: string;
  title: string;
  category: 'gối_thiền' | 'chuông_xoay' | 'sách_phật_học' | 'tinh_dầu' | 'trang_phục_thiền';
  categoryLabel: string;
  description: string;
  partnerName: string;
  priceVnd: number;
  formattedPrice: string;
  imageUrl: string;
  affiliateUrl: string;
  disclaimer: string;
  rating?: number;
  inStock: boolean;
  features: string[];
}

export interface AdRewardState {
  hasRewardedSession: boolean;
  rewardType: 'bonus_meditation' | 'deep_breathing' | 'soundscape';
  grantedAt?: string;
  expiresAt?: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  adminEmail: string;
  timestamp: string;
  details: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalPremium: number;
  totalMinutes: number;
  totalJournals: number;
  totalActiveSessions: number;
  totalAiRequests: number;
  activeToday: number;
  retentionD7: string;
  affiliateClicks: number;
  adImpressions: number;
}

export type WishTopic = 'peace' | 'gratitude' | 'courage' | 'forgiveness' | 'patience' | 'compassion';

export interface CommunityWish {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  topic: WishTopic;
  content: string;
  createdAt: string;
  reportCount?: number;
  lotusCount: number; // Number of mindful lotuses offered
  blessedByMe?: boolean;
}

export interface SoundPreset {
  id: string;
  userId: string;
  name: string;
  volumes: Record<string, number>;
  shareCode: string;
  isPublic: boolean;
  createdAt: string;
}

export interface MicroPractice {
  id: string;
  title: string;
  subtitle: string;
  durationSeconds: number; // 30, 60, 90, 120
  context: 'pre_meeting' | 'after_conflict' | 'screen_fatigue' | 'lunch_break' | 'work_end' | 'pause_smile';
  guidanceText: string;
  instructionSteps: string[];
  audioTone: 'singing_bowl' | 'bamboo_wind' | 'stream' | 'temple_bell';
}

export interface MindfulnessBellConfig {
  enabled: boolean;
  intervalMinutes: number; // 15, 30, 45, 60
  startTime: string; // '08:00'
  endTime: string; // '18:00'
  workdaysOnly: boolean;
  sound: 'singing_bowl' | 'temple_bell';
  dnd: boolean;
}

export interface EmotionalTrendReport {
  totalMoodEntries: number;
  moodDistribution: Record<MoodType, number>;
  averageIntensity: number;
  preToPostImprovementRate: number; // percentage e.g. 78%
  topGratitudeKeywords: string[];
  recommendedLettingGoPractice: {
    title: string;
    description: string;
    trackId: string;
  };
}

// 1. Mindful Lens: AI Biometric Stress & State Recognition
export interface MindfulLensResult {
  stressLevel: number; // 1 to 100
  stressCategory: 'serene' | 'balanced' | 'mild_stress' | 'fatigued' | 'high_tension';
  primaryEmotion: string;
  heartRateEstimateBpm?: number;
  blinkFrequency?: 'calm' | 'normal' | 'rapid';
  facialTensionScore?: number; // 0 to 10
  buddhistInsight: string;
  recommendedPause: {
    title: string;
    description: string;
    durationSeconds: number;
    actionType: 'micro_breathing' | 'temple_bell' | 'mindful_walk';
  };
  timestamp: string;
}

// 2. Vườn Tâm An: Gamification Mindful Garden
export type PlantStage = 'seed' | 'sprout' | 'bud' | 'blooming' | 'enlightened';
export type PlantSpecies = 'lotus' | 'bodhi_tree' | 'bamboo' | 'jasmine';

export interface ZenGardenPlant {
  id: string;
  species: PlantSpecies;
  name: string;
  stage: PlantStage;
  currentPoints: number; // Progress within current stage (0 - 100)
  totalWaterPoints: number;
  flowersBloomed: number;
  plantedAt: string;
  lastWateredAt: string;
}

export interface ZenGardenBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface ZenGardenState {
  plants: ZenGardenPlant[];
  activePlantId: string;
  waterDrops: number; // Earned through mindful meditation minutes & journaling
  totalMindfulMinutesInvested: number;
  totalLotusesBloomed: number;
  badges: ZenGardenBadge[];
}

// 3. 3D Spatial Audio & Binaural Beats
export type BinauralBand = 'delta' | 'theta' | 'alpha' | 'gamma';

export interface BinauralBeatSetting {
  band: BinauralBand;
  name: string;
  carrierFreqHz: number;
  beatFreqHz: number;
  targetState: string;
  description: string;
}

// 4. Smart Real-time Personalization
export interface SmartPersonalizedAction {
  id: string;
  title: string;
  subtitle: string;
  category: 'breathing' | 'meditation' | 'scripture' | 'sound' | 'micro';
  actionPayload: any;
  reason: string;
  badgeText: string;
}

export interface SmartPersonalizationResponse {
  greeting: string;
  userContextSummary: string;
  primaryAction: SmartPersonalizedAction;
  secondaryActions: SmartPersonalizedAction[];
}

// 5. Offline Sync
export interface OfflineSyncPayload {
  sessions?: Array<{
    minutes: number;
    trackId?: string;
    timestamp: string;
  }>;
  journals?: Array<{
    title: string;
    content: string;
    mood: MoodType;
    gratitudeItems: string[];
    createdAt: string;
  }>;
  gardenWaters?: Array<{
    plantId: string;
    drops: number;
    timestamp: string;
  }>;
}
