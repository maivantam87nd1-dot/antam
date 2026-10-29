-- ====================================================================
-- AN TÂM - PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE COMPLIANT)
-- VERSION 4.0 - ENTERPRISE SECURITY, RLS, AND RELATIONAL NORMALIZATION
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. USERS & ACCESS CONTROL (AUTH & ROLES)
-- --------------------------------------------------------------------

CREATE TYPE user_role_enum AS ENUM ('super_admin', 'admin', 'editor', 'user', 'guest');
CREATE TYPE subscription_status_enum AS ENUM ('free', 'trial', 'active', 'expired', 'cancelled', 'revoked');
CREATE TYPE subscription_plan_enum AS ENUM ('monthly', 'yearly');
CREATE TYPE platform_enum AS ENUM ('apple_storekit', 'google_play', 'web_stripe', 'sandbox_test');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(120) NOT NULL DEFAULT 'Học viên Chánh Niệm',
    avatar_url TEXT,
    role user_role_enum NOT NULL DEFAULT 'user',
    is_guest BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    streak_days INTEGER NOT NULL DEFAULT 1,
    total_meditation_minutes INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    last_practice_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    selected_goals JSONB NOT NULL DEFAULT '["Giảm căng thẳng", "Tập thở", "Nuôi dưỡng sự bình an"]'::jsonb,
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    font_size VARCHAR(20) NOT NULL DEFAULT 'normal',
    sound_volume FLOAT NOT NULL DEFAULT 0.8,
    bell_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    bell_times JSONB NOT NULL DEFAULT '["08:00", "12:00", "21:00"]'::jsonb,
    bell_sound VARCHAR(50) NOT NULL DEFAULT 'singing_bowl',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL, -- 'ios' | 'android' | 'web'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. CONTENT & KNOWLEDGE SYSTEM (MEDITATION, BUDDHIST, AUDIO)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS content_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS content_licenses (
    id VARCHAR(50) PRIMARY KEY,
    license_name VARCHAR(120) NOT NULL,
    license_url TEXT,
    allows_commercial BOOLEAN NOT NULL DEFAULT TRUE,
    attribution_required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS content_sources (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author_or_translator VARCHAR(255),
    publisher VARCHAR(255),
    source_url TEXT,
    license_id VARCHAR(50) REFERENCES content_licenses(id),
    verified_by VARCHAR(120) NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meditation_content (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) REFERENCES content_categories(id),
    duration_minutes INTEGER NOT NULL DEFAULT 10,
    narrator VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    preview_duration_seconds INTEGER NOT NULL DEFAULT 60,
    audio_url TEXT,
    image_url TEXT,
    script_content TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buddhist_content (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    sanskrit_title VARCHAR(255),
    tradition VARCHAR(100) NOT NULL, -- 'Đại thừa' | 'Nguyên thủy' | 'Thiền tông'
    source_id VARCHAR(50) REFERENCES content_sources(id),
    original_verses TEXT NOT NULL,
    vietnamese_translation TEXT NOT NULL,
    summary TEXT NOT NULL,
    is_canonical BOOLEAN NOT NULL DEFAULT TRUE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    audio_chanting_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audio_content (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'ambient' | 'nature' | 'bell' | 'binaural'
    synthesis_algorithm VARCHAR(80) NOT NULL, -- 'pink_noise_biquad' | 'additive_sine' | 'fm_stream'
    default_volume FLOAT NOT NULL DEFAULT 0.5,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE
);

-- --------------------------------------------------------------------
-- 3. USER ACTIVITY & PERSONAL PROGRESS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(30) NOT NULL, -- 'meditation' | 'buddhist' | 'audio'
    content_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    track_id VARCHAR(50) REFERENCES meditation_content(id),
    duration_minutes INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS breathing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pattern_name VARCHAR(50) NOT NULL, -- 'relax_4_6' | 'box_4_4_4_4' | 'balance_4_4' | 'calm_4_7_8'
    cycles_completed INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    gratitude_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    mood VARCHAR(30) NOT NULL DEFAULT 'peaceful',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mood VARCHAR(30) NOT NULL,
    label VARCHAR(100) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mindfulness_journeys (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT NOT NULL,
    stages JSONB NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS journey_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    journey_id VARCHAR(50) REFERENCES mindfulness_journeys(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, journey_id, day_number)
);

-- --------------------------------------------------------------------
-- 4. REAL IN-APP PURCHASES & SUBSCRIPTIONS (ENTITLEMENTS)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id subscription_plan_enum NOT NULL,
    platform platform_enum NOT NULL,
    store_original_transaction_id VARCHAR(255) NOT NULL,
    store_product_id VARCHAR(100) NOT NULL,
    status subscription_status_enum NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'INITIAL_BUY' | 'RENEWAL' | 'CANCELLATION' | 'REFUND'
    platform platform_enum NOT NULL,
    raw_receipt_hash VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL, -- 'VERIFIED_REAL' | 'FAILED' | 'REVOKED'
    amount_cents INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL, -- 'premium_catalog' | 'ai_unlimited' | 'offline_audio'
    status subscription_status_enum NOT NULL DEFAULT 'active',
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, feature_key)
);

-- --------------------------------------------------------------------
-- 5. RAG AI KNOWLEDGE BASE & AUDITED SESSIONS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS knowledge_sources (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    tradition VARCHAR(100) NOT NULL,
    canonical_collection VARCHAR(100),
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    license VARCHAR(100) NOT NULL,
    verified_by VARCHAR(100) NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id VARCHAR(50) PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    document_title VARCHAR(255) NOT NULL,
    chapter VARCHAR(150),
    content TEXT NOT NULL,
    keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Đàm đạo Chánh Niệm',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    suggested_action JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_count INTEGER NOT NULL DEFAULT 1,
    token_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, window_start)
);

-- --------------------------------------------------------------------
-- 6. MONETIZATION (AFFILIATE & AD LOGS)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS affiliate_offers (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'gối_thiền' | 'chuông_xoay' | 'sách_phật_học' | 'tinh_dầu'
    description TEXT NOT NULL,
    partner_name VARCHAR(120) NOT NULL,
    price_vnd INTEGER NOT NULL,
    affiliate_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_click_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id VARCHAR(50) NOT NULL REFERENCES affiliate_offers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    source_screen VARCHAR(80) NOT NULL,
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'IMPRESSION' | 'CLICK' | 'REWARDED_COMPLETED'
    ad_unit_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reward_granted VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 7. AUDIT LOGS FOR ADMIN GOVERNANCE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- --------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_user ON mood_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_entitlements_lookup ON entitlements(user_id, feature_key, status);
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON knowledge_chunks USING gin (keywords);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_offer ON affiliate_click_events(offer_id, created_at);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Note: In production Supabase / Postgres with Auth:
-- CREATE POLICY "Users access own profile" ON profiles FOR ALL USING (auth.uid() = id);
-- CREATE POLICY "Users access own journals" ON journal_entries FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Users access own mood" ON mood_checkins FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 8. MARKET DIFFERENTIATORS (ZEN GARDEN, MINDFUL LENS & COMPASSION FEED)
-- --------------------------------------------------------------------

CREATE TYPE plant_species_enum AS ENUM ('lotus', 'bodhi_tree', 'bamboo', 'jasmine');
CREATE TYPE plant_stage_enum AS ENUM ('seed', 'sprout', 'bud', 'blooming', 'enlightened');

CREATE TABLE IF NOT EXISTS zen_garden_plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    species plant_species_enum NOT NULL DEFAULT 'lotus',
    name VARCHAR(120) NOT NULL DEFAULT 'Đóa Sen Thanh Tịnh',
    stage plant_stage_enum NOT NULL DEFAULT 'sprout',
    current_points INTEGER NOT NULL DEFAULT 30,
    total_water_points INTEGER NOT NULL DEFAULT 30,
    flowers_bloomed INTEGER NOT NULL DEFAULT 0,
    planted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_watered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zen_garden_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_key VARCHAR(60) NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_key)
);

CREATE TABLE IF NOT EXISTS mindful_lens_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    stress_level INTEGER NOT NULL CHECK (stress_level BETWEEN 1 AND 100),
    stress_category VARCHAR(30) NOT NULL,
    facial_tension_score FLOAT,
    heart_rate_estimate_bpm INTEGER,
    recommended_pause_title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_compassion_wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Người bạn ẩn danh',
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    topic VARCHAR(40) NOT NULL DEFAULT 'peace',
    content TEXT NOT NULL,
    lotus_count INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE zen_garden_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE zen_garden_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindful_lens_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_compassion_wishes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_garden_user ON zen_garden_plants(user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_created ON community_compassion_wishes(created_at DESC);

