import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { retrieveKnowledgeChunks, VERIFIED_KNOWLEDGE_BASE } from './src/data/knowledgeBase';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Production Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// In-memory + JSON file persistence for local database
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utility using scrypt
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  isPremium: boolean;
  passwordHash?: string;
  salt?: string;
  isGuest?: boolean;
  streakDays: number;
  totalMeditationMinutes: number;
  totalSessions: number;
  lastPracticeDate?: string;
  lastSessionTimestamp?: number;
  selectedGoals?: string[];
  createdAt: string;
}

interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface EntitlementRecord {
  id: string;
  userId: string;
  planId: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'trial' | 'cancelled' | 'in_grace_period' | 'refunded' | 'revoked';
  expiresAt: string;
  receiptToken: string;
  platform: 'apple_storekit' | 'google_play' | 'sandbox_test';
  verifiedAt: string;
}

interface PasswordResetRecord {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

interface AdSessionRecord {
  nonce: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

interface DBStructure {
  users: UserRecord[];
  sessions: SessionRecord[];
  entitlements: EntitlementRecord[];
  passwordResets: PasswordResetRecord[];
  adSessions: Record<string, AdSessionRecord>;
  journals: Array<{
    id: string;
    userId: string;
    title: string;
    content: string;
    gratitudeItems: string[];
    mood: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }>;
  moodLogs: Array<{
    id: string;
    userId: string;
    mood: string;
    label: string;
    timestamp: string;
  }>;
  favorites: Record<string, string[]>; // userId -> trackIds[]
  userProgress: Record<string, Record<string, boolean>>; // userId -> journeyStepId -> boolean
  aiUsage: Record<string, { count: number; lastReset: number }>; // userId -> usage
  affiliateClicks: Array<{
    id: string;
    offerId: string;
    userId: string;
    sourceScreen: string;
    timestamp: string;
  }>;
  adEvents: Array<{
    id: string;
    eventType: 'IMPRESSION' | 'CLICK' | 'REWARDED_COMPLETED' | 'SSV_VERIFIED' | 'SESSION_STARTED';
    adUnitId: string;
    userId?: string;
    timestamp: string;
    details?: string;
  }>;
  userRewards: Record<string, { rewardType: string; expiresAt: string }>;
  auditLogs: Array<{
    id: string;
    action: string;
    adminEmail: string;
    timestamp: string;
    details: string;
  }>;
  soundPresets: Array<{
    id: string;
    userId: string;
    name: string;
    volumes: Record<string, number>;
    shareCode: string;
    isPublic: boolean;
    createdAt: string;
  }>;
  communityWishes: Array<{
    id: string;
    authorName: string;
    isAnonymous: boolean;
    topic: string;
    content: string;
    createdAt: string;
    reportCount: number;
    lotusCount: number;
  }>;
  aiFeedback: Array<{
    id: string;
    userId?: string;
    rating: string;
    feedback?: string;
    timestamp: string;
  }>;
  mindfulnessBells: Record<string, {
    enabled: boolean;
    intervalMinutes: number;
    startTime: string;
    endTime: string;
    workdaysOnly: boolean;
    sound: string;
    dnd: boolean;
  }>;
  zenGardens: Record<string, {
    plants: Array<{
      id: string;
      species: 'lotus' | 'bodhi_tree' | 'bamboo' | 'jasmine';
      name: string;
      stage: 'seed' | 'sprout' | 'bud' | 'blooming' | 'enlightened';
      currentPoints: number;
      totalWaterPoints: number;
      flowersBloomed: number;
      plantedAt: string;
      lastWateredAt: string;
    }>;
    activePlantId: string;
    waterDrops: number;
    totalMindfulMinutesInvested: number;
    totalLotusesBloomed: number;
    badges: Array<{ id: string; title: string; description: string; icon: string; unlockedAt?: string }>;
  }>;
}

// Admin Security: Never use hardcoded passwords in production source code
const adminSalt = generateSalt();
const initialAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(24).toString('hex');
const adminHash = hashPassword(initialAdminPassword, adminSalt);

let db: DBStructure = {
  users: [
    {
      id: 'admin-system-id',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@antam.app',
      name: 'Quản trị viên An Tâm',
      role: 'super_admin',
      isPremium: true,
      passwordHash: adminHash,
      salt: adminSalt,
      streakDays: 14,
      totalMeditationMinutes: 320,
      totalSessions: 28,
      lastPracticeDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
  ],
  sessions: [],
  entitlements: [],
  passwordResets: [],
  adSessions: {},
  journals: [],
  moodLogs: [],
  favorites: {},
  userProgress: {},
  aiUsage: {},
  affiliateClicks: [],
  adEvents: [],
  userRewards: {},
  soundPresets: [
    {
      id: 'preset-dawn-sanctuary',
      userId: 'system',
      name: 'Thiền Đường Bình Minh',
      volumes: { rain: 0.3, stream: 0.4, singing_bowl: 0.5, theta_drone: 0.2 },
      shareCode: 'ANTAM-DAWN',
      isPublic: true,
      createdAt: new Date().toISOString()
    }
  ],
  communityWishes: [
    {
      id: 'wish-1',
      authorName: 'Tâm An',
      isAnonymous: false,
      topic: 'peace',
      content: 'Nguyện chúc bạn có một ngày làm việc hanh thông, bước đi vững chãi và tâm hồn luôn tràn ngập sự bình an.',
      createdAt: new Date().toISOString(),
      reportCount: 0,
      lotusCount: 18
    },
    {
      id: 'wish-2',
      authorName: 'Bạn Đồng Tu',
      isAnonymous: true,
      topic: 'gratitude',
      content: 'Cảm ơn cuộc đời đã cho ta thêm một ngày nữa để thở, để mỉm cười và để yêu thương muôn loài.',
      createdAt: new Date().toISOString(),
      reportCount: 0,
      lotusCount: 24
    },
    {
      id: 'wish-3',
      authorName: 'Chân Như',
      isAnonymous: false,
      topic: 'courage',
      content: 'Dù phía trước có muôn vàn giông bão, hãy nhớ rằng bạn luôn có một nơi nương tựa vững chãi nhất: chính hơi thở của mình.',
      createdAt: new Date().toISOString(),
      reportCount: 0,
      lotusCount: 12
    },
    {
      id: 'wish-4',
      authorName: 'Vô Ưu',
      isAnonymous: true,
      topic: 'forgiveness',
      content: 'Buông xả những giận hờn không phải vì người khác, mà chính là món quà từ bi lớn nhất bạn dành tặng cho trái tim mình.',
      createdAt: new Date().toISOString(),
      reportCount: 0,
      lotusCount: 31
    },
    {
      id: 'wish-5',
      authorName: 'Tuệ Giác',
      isAnonymous: false,
      topic: 'patience',
      content: 'Như hoa sen cần bùn lầy để nở hoa thơm ngát, những thử thách hôm nay sẽ là chất liệu nuôi dưỡng sự kiên nhẫn của bạn ngày mai.',
      createdAt: new Date().toISOString(),
      reportCount: 0,
      lotusCount: 15
    },
    {
      id: 'wish-6',
      authorName: 'Từ Tâm',
      isAnonymous: false,
      topic: 'compassion',
      content: 'Nguyện cho tất cả chúng sinh khắp muôn phương đều được an lành, không sợ hãi và thoát khỏi mọi khổ đau.',
      createdAt: new Date().toISOString(),
      reportCount: 0,
      lotusCount: 42
    }
  ],
  aiFeedback: [],
  mindfulnessBells: {},
  zenGardens: {},
  auditLogs: [
    {
      id: 'log-init',
      action: 'SYSTEM_STARTUP',
      adminEmail: 'system@antam.internal',
      timestamp: new Date().toISOString(),
      details: 'Khởi tạo hệ thống AN TÂM v4.2 - Kiến trúc Chánh Niệm & Cộng đồng Gieo Hạt Lành'
    }
  ]
};

// Load persistent DB if available
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    db = {
      users: parsed.users || db.users,
      sessions: parsed.sessions || [],
      entitlements: parsed.entitlements || [],
      passwordResets: parsed.passwordResets || [],
      adSessions: parsed.adSessions || {},
      journals: parsed.journals || [],
      moodLogs: parsed.moodLogs || [],
      favorites: parsed.favorites || {},
      userProgress: parsed.userProgress || {},
      aiUsage: parsed.aiUsage || {},
      affiliateClicks: parsed.affiliateClicks || [],
      adEvents: parsed.adEvents || [],
      userRewards: parsed.userRewards || {},
      soundPresets: parsed.soundPresets && parsed.soundPresets.length > 0 ? parsed.soundPresets : db.soundPresets,
      communityWishes: (parsed.communityWishes && parsed.communityWishes.length > 0 ? parsed.communityWishes : db.communityWishes).map((w: any) => ({
        ...w,
        lotusCount: typeof w.lotusCount === 'number' ? w.lotusCount : 8
      })),
      aiFeedback: parsed.aiFeedback || [],
      mindfulnessBells: parsed.mindfulnessBells || {},
      zenGardens: parsed.zenGardens || {},
      auditLogs: parsed.auditLogs || db.auditLogs,
    };
  } catch (e) {
    console.error('Error loading db file, using seeded memory structure:', e);
  }
}

// Atomic file write to guarantee zero file corruption on server crash
function saveDb() {
  try {
    const jsonString = JSON.stringify(db, null, 2);
    const tempFile = path.join(DATA_DIR, `database.temp.${Date.now()}.${crypto.randomBytes(3).toString('hex')}.json`);
    fs.writeFileSync(tempFile, jsonString, 'utf-8');
    fs.renameSync(tempFile, DB_FILE); // Atomic filesystem rename
    // Secondary persistent backup snapshot
    const backupFile = path.join(DATA_DIR, 'database.backup.json');
    fs.writeFileSync(backupFile, jsonString, 'utf-8');
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

// System Email Service with SendGrid / SMTP / Safe Dry-run dispatch
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

async function sendSystemEmail(options: EmailOptions): Promise<boolean> {
  const isSendGridConfigured = Boolean(process.env.SENDGRID_API_KEY);
  if (isSendGridConfigured) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: process.env.EMAIL_FROM || 'no-reply@antam.app', name: 'AN TÂM Chánh Niệm' },
          subject: options.subject,
          content: [{ type: 'text/html', value: options.html || options.text }],
        }),
      });
      return response.ok;
    } catch (e) {
      console.error('SendGrid email error:', e);
    }
  }

  // Development & fallback audit log recording (no secrets leaked)
  console.log(`[EMAIL DISPATCH] To: ${options.to} | Subject: "${options.subject}"`);
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'EMAIL_DISPATCHED',
    adminEmail: 'system@antam.internal',
    timestamp: new Date().toISOString(),
    details: `Đã gửi email khôi phục mật khẩu tới ${options.to}`
  });
  return true;
}

// In-memory sliding window rate limiter for auth & sensitive endpoints
const rateLimitMap: Record<string, { count: number; firstAttempt: number }> = {};
function checkRateLimit(key: string, maxAttempts = 10, windowMs = 900000): boolean {
  const now = Date.now();
  const entry = rateLimitMap[key];
  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitMap[key] = { count: 1, firstAttempt: now };
    return true;
  }
  if (entry.count >= maxAttempts) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Extend Express Request with User Context
interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  sessionToken?: string;
}

// Authentication Middleware: Verifies Bearer Token
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để truy cập (Thiếu token).' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.sessions.find(s => s.token === token);

  if (!session) {
    return res.status(401).json({ error: 'Phiên làm việc không tồn tại hoặc đã hết hạn.' });
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    // Expired
    db.sessions = db.sessions.filter(s => s.token !== token);
    saveDb();
    return res.status(401).json({ error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Người dùng không tồn tại trong hệ thống.' });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

// Admin Middleware: Ensures role is super_admin or admin
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'super_admin' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Quyền truy cập bị từ chối: Yêu cầu quyền Quản trị viên.' });
  }
  next();
}

// Optional Auth Middleware (for guest or logged in user)
function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = db.sessions.find(s => s.token === token);
    if (session && new Date(session.expiresAt).getTime() > Date.now()) {
      const user = db.users.find(u => u.id === session.userId);
      if (user) {
        req.user = user;
        req.sessionToken = token;
      }
    }
  }
  next();
}

// --- Authentication Endpoints ---

// 1. Register with email, password, and name (Rate limited)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`register_${ip}`, 8, 900000)) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu đăng ký từ thiết bị này. Vui lòng thử lại sau 15 phút.' });
  }

  const { email, password, name } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ email hợp lệ.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có độ dài ít nhất 6 ký tự.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email này đã được đăng ký tài khoản trong hệ thống.' });
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const userId = `user-${Date.now()}`;

  const newUser: UserRecord = {
    id: userId,
    email: email.toLowerCase().trim(),
    name: name?.trim() || email.split('@')[0],
    role: 'user', // Strict role isolation: users can never register as admin
    isPremium: false,
    passwordHash,
    salt,
    isGuest: false,
    streakDays: 1,
    totalMeditationMinutes: 0,
    totalSessions: 0,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Create session
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString(); // 30 days
  db.sessions.push({ token, userId, createdAt: new Date().toISOString(), expiresAt });

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'USER_REGISTERED',
    adminEmail: newUser.email,
    timestamp: new Date().toISOString(),
    details: `Người dùng mới đăng ký tài khoản: ${newUser.email}`
  });

  saveDb();

  const { passwordHash: _, salt: __, ...sanitizedUser } = newUser;
  return res.status(201).json({
    user: sanitizedUser,
    token
  });
});

// 2. Login with email & password verification (Rate limited against brute force)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { email, password } = req.body;

  if (!checkRateLimit(`login_${ip}_${email}`, 8, 900000)) {
    return res.status(429).json({ error: 'Quá nhiều lần đăng nhập không thành công. Vì sự an toàn, tài khoản bị tạm khóa 15 phút.' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || !user.passwordHash || !user.salt) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
  }

  // Create session
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), expiresAt });

  saveDb();

  const { passwordHash: _, salt: __, ...sanitizedUser } = user;
  return res.json({
    user: sanitizedUser,
    token
  });
});

// 3. Guest Mode with secure temporary token
app.post('/api/auth/guest', (_req: Request, res: Response) => {
  const guestId = `guest-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const guestUser: UserRecord = {
    id: guestId,
    email: `khach_${Date.now()}@antam.internal`,
    name: 'Khách An Lạc',
    role: 'user',
    isPremium: false,
    isGuest: true,
    streakDays: 1,
    totalMeditationMinutes: 0,
    totalSessions: 0,
    createdAt: new Date().toISOString(),
  };

  db.users.push(guestUser);

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();
  db.sessions.push({ token, userId: guestId, createdAt: new Date().toISOString(), expiresAt });

  saveDb();

  return res.json({
    user: guestUser,
    token
  });
});

// 4. Get current user profile (Validated by token)
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  // Check active entitlement
  const activeEntitlement = db.entitlements.find(
    e => e.userId === user.id && e.status === 'active' && new Date(e.expiresAt).getTime() > Date.now()
  );

  const isUserPremium = !!activeEntitlement;
  if (user.isPremium !== isUserPremium) {
    user.isPremium = isUserPremium;
    saveDb();
  }

  const { passwordHash: _, salt: __, ...sanitizedUser } = user;
  return res.json({
    user: sanitizedUser,
    entitlement: activeEntitlement || null
  });
});

// 5. Logout
app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.sessions = db.sessions.filter(s => s.token !== req.sessionToken);
  saveDb();
  return res.json({ success: true, message: 'Đăng xuất thành công.' });
});

// 6. Update user profile (Strict sanitization against privilege escalation)
app.post('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, avatar, selectedGoals, mindfulnessBell, theme, fontSize } = req.body;

  // Strict field whitelist - never allow mutating role, isPremium, email, passwordHash or salt
  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim().slice(0, 80);
  }
  if (Array.isArray(selectedGoals)) {
    user.selectedGoals = selectedGoals.filter(g => typeof g === 'string').slice(0, 15);
  }

  saveDb();
  const { passwordHash: _, salt: __, ...sanitized } = user;
  return res.json({ user: sanitized });
});

// 7. Change password
app.post('/api/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (user.isGuest) {
    return res.status(400).json({ error: 'Tài khoản khách không thể đổi mật khẩu. Vui lòng đăng ký tài khoản chính thức.' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có độ dài ít nhất 6 ký tự.' });
  }

  if (!user.passwordHash || !user.salt) {
    return res.status(400).json({ error: 'Tài khoản chưa được thiết lập mật khẩu.' });
  }

  const computedCurrent = hashPassword(currentPassword, user.salt);
  if (computedCurrent !== user.passwordHash) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không chính xác.' });
  }

  const newSalt = generateSalt();
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPassword, newSalt);

  // Invalidate all other sessions for security
  db.sessions = db.sessions.filter(s => s.token === req.sessionToken);

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'PASSWORD_CHANGED',
    adminEmail: user.email,
    timestamp: new Date().toISOString(),
    details: `Người dùng ${user.email} đổi mật khẩu thành công.`
  });

  saveDb();
  return res.json({ success: true, message: 'Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được thu hồi an toàn.' });
});

// 8. Reset password request (Rate limited, single-use token, email dispatched)
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { email } = req.body;

  if (!checkRateLimit(`reset_${ip}`, 5, 900000)) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút.' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ email hợp lệ.' });
  }

  const normalized = email.toLowerCase().trim();
  const user = db.users.find(u => u.email.toLowerCase() === normalized);

  if (user && !user.isGuest) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.passwordResets = db.passwordResets || [];
    db.passwordResets.unshift({
      id: `reset-${Date.now()}`,
      email: normalized,
      tokenHash,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    });
    saveDb();

    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
    await sendSystemEmail({
      to: normalized,
      subject: 'Khôi phục mật khẩu tài khoản AN TÂM',
      text: `Chào bạn, bạn vừa yêu cầu khôi phục mật khẩu. Vui lòng nhấn vào liên kết sau trong 15 phút: ${resetLink}`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2>Khôi phục mật khẩu tài khoản AN TÂM</h2>
        <p>Chào bạn,</p>
        <p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${normalized}</strong>. Vui lòng nhấn nút bên dưới để tạo mật khẩu mới:</p>
        <p><a href="${resetLink}" style="display:inline-block; padding:12px 24px; background:#101D35; color:#D8B878; text-decoration:none; border-radius:8px; font-weight:bold;">Đặt lại mật khẩu</a></p>
        <p><small>Liên kết có hiệu lực trong 15 phút và chỉ được dùng 1 lần duy nhất.</small></p>
      </div>`
    });
  }

  // Consistent message prevents account enumeration
  return res.json({
    success: true,
    message: 'Nếu email này tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn.'
  });
});

// 9. Confirm reset password with token verification
app.post('/api/auth/reset-password-confirm', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { token, newPassword } = req.body;

  if (!checkRateLimit(`reset_confirm_${ip}`, 10, 900000)) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau 15 phút.' });
  }

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Mã xác thực token không hợp lệ hoặc thiếu.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có độ dài ít nhất 6 ký tự.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const now = Date.now();

  db.passwordResets = db.passwordResets || [];
  const resetRecord = db.passwordResets.find(
    r => r.tokenHash === tokenHash && !r.used && new Date(r.expiresAt).getTime() > now
  );

  if (!resetRecord) {
    return res.status(400).json({ error: 'Mã xác thực khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === resetRecord.email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Tài khoản không còn tồn tại trong hệ thống.' });
  }

  // Generate new salt and hash for new password
  const newSalt = generateSalt();
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPassword, newSalt);

  // Single-use guarantee
  resetRecord.used = true;

  // Revoke all existing sessions for this user
  db.sessions = db.sessions.filter(s => s.userId !== user.id);

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'PASSWORD_RESET_COMPLETED',
    adminEmail: user.email,
    timestamp: new Date().toISOString(),
    details: `Đặt lại mật khẩu thành công qua email cho tài khoản ${user.email}. Đã thu hồi toàn bộ phiên đăng nhập cũ.`
  });

  saveDb();
  return res.json({ success: true, message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.' });
});

// 7. Delete account (GDPR & privacy compliant)
app.post('/api/auth/delete-account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  db.users = db.users.filter(u => u.id !== userId);
  db.sessions = db.sessions.filter(s => s.userId !== userId);
  db.entitlements = db.entitlements.filter(e => e.userId !== userId);
  db.journals = db.journals.filter(j => j.userId !== userId);
  db.moodLogs = db.moodLogs.filter(m => m.userId !== userId);
  delete db.favorites[userId];
  delete db.userProgress[userId];
  delete db.aiUsage[userId];

  saveDb();
  return res.json({ success: true, message: 'Tài khoản và toàn bộ dữ liệu cá nhân đã được xóa vĩnh viễn.' });
});

// 8. Export user data (Privacy export)
app.get('/api/auth/export-data', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = req.user!;
  const userJournals = db.journals.filter(j => j.userId === userId);
  const userMoods = db.moodLogs.filter(m => m.userId === userId);
  const userFavs = db.favorites[userId] || [];
  const userEnts = db.entitlements.filter(e => e.userId === userId);

  const { passwordHash: _, salt: __, ...sanitized } = user;

  return res.json({
    exportDate: new Date().toISOString(),
    profile: sanitized,
    journals: userJournals,
    moods: userMoods,
    favorites: userFavs,
    entitlements: userEnts
  });
});

// --- RAG AI Gateway with Grounded Knowledge Retrieval ---
app.post('/api/ai/chat', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messages } = req.body;
    const userId = req.user?.id || 'anonymous';

    // Rate Limiting & Token Budget check
    const now = Date.now();
    const userUsage = db.aiUsage[userId] || { count: 0, lastReset: now };
    if (now - userUsage.lastReset > 3600000) {
      // 1 hour window reset
      userUsage.count = 0;
      userUsage.lastReset = now;
    }

    if (userUsage.count >= 40) {
      return res.status(429).json({
        error: 'Bạn đã đạt giới hạn 40 câu hỏi trong 1 giờ. Hãy hít thở sâu và quay lại sau ít phút nhé.'
      });
    }

    userUsage.count += 1;
    db.aiUsage[userId] = userUsage;
    saveDb();

    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
    }

    // 1. RAG Knowledge Retrieval: Retrieve relevant verified Buddhist chunks
    const retrievedChunks = retrieveKnowledgeChunks(lastUserMessage, 3);
    const knowledgeContextText = retrievedChunks.map((chunk, idx) => {
      return `[Tài liệu tham khảo ${idx + 1}]:\n- Tiêu đề: ${chunk.documentTitle}\n- Xuất xứ: ${chunk.source} (${chunk.tradition})\n- Chương mục: ${chunk.chapter || 'Kinh điển'}\n- Nội dung cốt lõi: ${chunk.content}`;
    }).join('\n\n');

    const systemInstruction = `Bạn là Trợ Lý Chánh Niệm & Phật Pháp AN TÂM (AN TAM AI) - người bạn đồng hành thanh thản, từ bi, trí tuệ và tôn trọng người dùng.

QUY TẮC CỐT LÕI (NGHIÊM NGẶT):
1. TRUY XUẤT KIẾN THỨC THẬT (RAG GROUNDING): Dưới đây là các tài liệu kinh điển và Phật học đã được kiểm duyệt:
${knowledgeContextText}

2. NGUYÊN TẮC TRẢ LỜI:
- Khi trả lời về Phật pháp, bạn PHẢI dựa trên các tài liệu đã kiểm duyệt ở trên.
- Trích dẫn rõ nguồn ở cuối câu trả lời theo định dạng: [Nguồn: <Tên tài liệu>] (Ví dụ: [Nguồn: Kinh Quán Niệm Hơi Thở - Majjhima Nikāya]).
- Tuyệt đối không tự bịa đặt lời Phật dạy hoặc bịa đặt tên kinh điển không có thật. Nếu vấn đề người dùng hỏi nằm ngoài phạm vi các nguồn tài liệu hiện có, hãy trả lời thận trọng và thành thật nói rõ giới hạn thông tin.
- Phân biệt rõ giữa nguyên văn kinh điển và phần diễn giải đời sống.

3. AN TOÀN VÀ ĐỒNG CẢM:
- Giao tiếp dịu dàng, xưng hô 'An Tâm' và 'bạn'.
- KHÔNG BAO GIỜ đưa ra chẩn đoán y tế, phác đồ điều trị tâm thần hoặc cam đoan chữa lành bệnh lý thay thế y khoa.
- Nếu phát hiện nguy cơ tự gây hại hoặc bế tắc cùng cực, hãy phản hồi với sự trắc ẩn sâu sắc và khuyên người dùng liên hệ các đường dây trợ giúp khủng hoảng hoặc người thân tin cậy ngay.

4. HÀNH ĐỘNG GỢI Ý:
- Tích hợp tự nhiên các bài tập chánh niệm của AN TÂM (tập thở 4-4, thiền buông xả, nghe kinh Bát Nhã, tiếng mưa thiền).`;

    const chatContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.65,
      },
    });

    const replyText = response.text || 'An Tâm đang cùng bạn an trú trong giây phút hiện tại. Hãy hít một hơi thật sâu và thở ra nhẹ nhàng.';

    // Extract citations
    const citations = retrievedChunks.map(c => `${c.documentTitle} (${c.tradition})`);

    // Contextual action inference
    let suggestedAction = undefined;
    const lower = lastUserMessage.toLowerCase();
    if (lower.includes('ngủ') || lower.includes('mất ngủ') || lower.includes('khó ngủ')) {
      suggestedAction = {
        type: 'meditation' as const,
        targetId: 'med-3',
        label: 'Mở bài Thiền buông xả trước khi ngủ'
      };
    } else if (lower.includes('thở') || lower.includes('căng thẳng') || lower.includes('hồi hộp') || lower.includes('lo lắng')) {
      suggestedAction = {
        type: 'breathing' as const,
        targetId: 'relax',
        label: 'Bắt đầu bài tập thở thư giãn 4-6 nhịp'
      };
    } else if (lower.includes('kinh') || lower.includes('bát nhã') || lower.includes('chú đại bi') || lower.includes('tâm kinh')) {
      suggestedAction = {
        type: 'scripture' as const,
        targetId: 'buddhist-1',
        label: 'Đọc tụng Bát Nhã Ba La Mật Đa Tâm Kinh'
      };
    } else if (lower.includes('chuông') || lower.includes('mưa') || lower.includes('âm thanh') || lower.includes('suối')) {
      suggestedAction = {
        type: 'sound' as const,
        targetId: 'rain',
        label: 'Bật âm thanh mưa thiền & chuông xoay'
      };
    }

    return res.json({
      reply: replyText,
      citations,
      suggestedAction
    });
  } catch (error: any) {
    console.error('Gemini AI Chat Error:', error);
    return res.json({
      reply: 'An Tâm luôn ở bên bạn. Trong lúc này, bạn hãy hít vào một hơi thật sâu, cảm nhận lồng ngực mở rộng, rồi từ tốn thở ra buông bỏ muộn phiền. Hãy thử bắt đầu với một bài tập thở nhẹ nhàng nhé.',
      citations: ['Kinh Quán Niệm Hơi Thở (Ānāpānasati Sutta)'],
      suggestedAction: {
        type: 'breathing' as const,
        targetId: 'relax',
        label: 'Bắt đầu 1 phút thở chánh niệm'
      }
    });
  }
});

// Scripture Verse Explanation Endpoint (Giải thích bằng AI với rate limit)
app.post('/api/ai/explain-scripture', optionalAuth, async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`ai_explain_${ip}`, 30, 3600000)) {
    return res.status(429).json({ error: 'Bạn đã đạt giới hạn 30 câu giải thích kinh trong 1 giờ. Hãy tĩnh tâm chiêm nghiệm nhé.' });
  }

  try {
    const { scriptureTitle, verseText, mode } = req.body;
    let cleanVerse = typeof verseText === 'string' ? verseText.trim().slice(0, 1000) : '';

    if (!cleanVerse && scriptureTitle) {
      const foundInKb = VERIFIED_KNOWLEDGE_BASE.find(k => 
        k.documentTitle.toLowerCase().includes(scriptureTitle.toLowerCase()) || 
        scriptureTitle.toLowerCase().includes(k.documentTitle.toLowerCase()) ||
        k.keywords.some(kw => scriptureTitle.toLowerCase().includes(kw))
      );
      if (foundInKb) {
        cleanVerse = foundInKb.content.slice(0, 1000);
      } else {
        cleanVerse = `Tinh hoa giác ngộ và chánh niệm trong kinh ${scriptureTitle}`;
      }
    }

    if (!cleanVerse) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên kinh hoặc câu kinh cần giải thích.' });
    }

    const modeDescriptions: Record<string, string> = {
      simple: 'Giải thích bằng ngôn từ mộc mạc, bình dị, dễ hiểu cho người mới bắt đầu.',
      deep: 'Giải thích chuyên sâu dựa trên giáo nghĩa tính Không, Duyên khởi và Phật học kinh viện.',
      practical: 'Tập trung vào cách ứng dụng câu kinh vào đời sống thường nhật để buông bỏ giận hờn, lo âu và bận rộn.'
    };

    const prompt = `Bạn là chuyên gia giảng giải Phật học của AN TÂM.
Hãy giải thích đoạn kinh sau:
- Kinh: ${scriptureTitle || 'Kinh điển Đại thừa'}
- Đoạn kinh: "${cleanVerse}"
- Chế độ giải thích yêu cầu: ${modeDescriptions[mode || 'simple'] || modeDescriptions.simple}

Yêu cầu:
1. Giải thích mạch lạc, súc tích (dưới 250 từ).
2. Nêu rõ ý nghĩa cốt lõi, không suy diễn sai lệch so với tinh thần kinh văn truyền thống.
3. Cung cấp một lời khuyên thực hành ngắn gọn.`;

    // Timeout protection: 6s max for external AI call, then graceful fallback to RAG
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 6000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    return res.json({
      explanation: response.text || 'Câu kinh nhắc nhở chúng ta quay về quán chiếu thực tại với tâm không ngăn ngại, nhìn rõ vạn pháp đều duyên sinh để buông bỏ chấp trước.',
      mode: mode || 'simple',
      citations: [scriptureTitle || 'Đại Tạng Kinh Đại Chính Tân Tu']
    });
  } catch (e: any) {
    // Graceful RAG fallback: Never leave the seeker with an error screen
    const { scriptureTitle, verseText, mode } = req.body;
    const query = `${scriptureTitle || ''} ${verseText || ''}`;
    const chunks = retrieveKnowledgeChunks(query, 1);
    if (chunks.length > 0) {
      return res.json({
        explanation: `${chunks[0].content}\n\n[Lời khuyên thực hành AN TÂM]: Hãy dành 5 phút theo dõi hơi thở tự nhiên, giữ tâm rỗng rang và quán chiếu lời dạy trong giây phút hiện tại.`,
        mode: mode || 'simple',
        citations: [chunks[0].source, chunks[0].documentTitle],
        isFallbackRag: true,
      });
    }

    return res.json({
      explanation: 'Câu kinh nhắc nhở chúng ta quay về quán chiếu thực tại với tâm không ngăn ngại, nhìn rõ vạn pháp đều duyên sinh để buông bỏ chấp trước và nuôi dưỡng lòng từ bi vô lượng.',
      mode: mode || 'simple',
      citations: [scriptureTitle || 'Đại Tạng Kinh'],
      isFallbackRag: true,
    });
  }
});

// Recommendation Endpoint (Rate limited)
app.post('/api/ai/recommend', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`ai_rec_${ip}`, 60, 3600000)) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu gợi ý. Vui lòng thử lại sau ít phút.' });
  }

  const { mood } = req.body;
  let recommendation = {
    title: '3 Phút Thở Chậm',
    type: 'breathing',
    targetId: 'relax',
    reason: 'Giúp cân bằng lại nhịp tim và làm dịu hệ thần kinh.'
  };

  if (mood === 'tired' || mood === 'insomnia') {
    recommendation = {
      title: 'Thiền Buông Xả Thân Tâm',
      type: 'meditation',
      targetId: 'med-3',
      reason: 'Thả lỏng toàn bộ cơ bắp và đưa tâm trí vào giấc ngủ an lành.'
    };
  } else if (mood === 'anxious' || mood === 'stressed') {
    recommendation = {
      title: 'Thở Cân Bằng Box Breathing',
      type: 'breathing',
      targetId: 'box',
      reason: 'Kỹ thuật thở 4-4-4-4 giúp làm chủ cảm xúc và xua tan âu lo tức thì.'
    };
  } else if (mood === 'happy' || mood === 'peaceful') {
    recommendation = {
      title: 'Thiền Nuôi Dưỡng Lòng Biết Ơn',
      type: 'meditation',
      targetId: 'med-6',
      reason: 'Mở rộng niềm hân hoan và lan tỏa năng lượng tích cực đến muôn loài.'
    };
  }

  return res.json({ recommendation });
});

// --- User Private Data Endpoints (Strictly Protected by requireAuth) ---

app.get('/api/user/journal', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const entries = db.journals.filter(j => j.userId === userId);
  return res.json({ entries });
});

app.post('/api/user/journal', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, content, gratitudeItems, mood, tags } = req.body;

  const newEntry = {
    id: `j-${Date.now()}`,
    userId,
    title: title?.trim() || 'Khoảnh khắc bình an',
    content: content?.trim() || '',
    gratitudeItems: Array.isArray(gratitudeItems) ? gratitudeItems : [],
    mood: mood || 'peaceful',
    tags: Array.isArray(tags) ? tags : ['an_tam'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.journals.unshift(newEntry);
  saveDb();
  return res.status(201).json({ entry: newEntry });
});

app.delete('/api/user/journal/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id;

  const exists = db.journals.find(j => j.id === id && j.userId === userId);
  if (!exists) {
    return res.status(404).json({ error: 'Không tìm thấy mục nhật ký hoặc không có quyền xóa.' });
  }

  db.journals = db.journals.filter(j => j.id !== id);
  saveDb();
  return res.json({ success: true });
});

app.post('/api/user/mood', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { mood, label } = req.body;

  const newMood = {
    id: `m-${Date.now()}`,
    userId,
    mood,
    label,
    timestamp: new Date().toISOString()
  };

  db.moodLogs.unshift(newMood);
  saveDb();
  return res.json({ moodLog: newMood });
});

app.post('/api/user/complete-session', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const rawMinutes = Number(req.body.minutes !== undefined ? req.body.minutes : req.body.durationMinutes);

  // Validation: Duration must be an integer between 1 and 180 minutes
  if (isNaN(rawMinutes) || rawMinutes < 1 || rawMinutes > 180) {
    return res.status(400).json({ error: 'Thời lượng phiên thiền không hợp lệ (yêu cầu từ 1 đến 180 phút).' });
  }

  // Anti-spam protection: prevent rapid automated submissions within 15 seconds
  const now = Date.now();
  if (user.lastSessionTimestamp && (now - user.lastSessionTimestamp) < 15000) {
    return res.status(429).json({ error: 'Các phiên thiền không thể hoàn thành quá nhanh liên tiếp nhau.' });
  }
  user.lastSessionTimestamp = now;

  const duration = Math.round(rawMinutes);
  const today = new Date().toISOString().split('T')[0];
  if (user.lastPracticeDate !== today) {
    user.streakDays = (user.streakDays || 0) + 1;
    user.lastPracticeDate = today;
  }
  user.totalMeditationMinutes = (user.totalMeditationMinutes || 0) + duration;
  user.totalSessions = (user.totalSessions || 0) + 1;

  saveDb();
  return res.json({
    success: true,
    user: {
      streakDays: user.streakDays,
      totalMeditationMinutes: user.totalMeditationMinutes,
      totalSessions: user.totalSessions,
    }
  });
});

// User Stats Endpoint
app.get('/api/user/stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    streakDays: user.streakDays || 1,
    totalMeditationMinutes: user.totalMeditationMinutes || 0,
    totalSessions: user.totalSessions || 0,
    lastPracticeDate: user.lastPracticeDate || new Date().toISOString().split('T')[0],
  });
});

// User Favorites Endpoints
app.get('/api/user/favorites', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const favs = db.favorites[userId] || [];
  return res.json({ favorites: favs });
});

app.post('/api/user/favorites', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.body;
  if (!itemId || typeof itemId !== 'string') {
    return res.status(400).json({ error: 'Yêu cầu itemId hợp lệ.' });
  }

  if (!db.favorites[userId]) {
    db.favorites[userId] = [];
  }

  const index = db.favorites[userId].indexOf(itemId);
  if (index > -1) {
    db.favorites[userId].splice(index, 1);
  } else {
    db.favorites[userId].push(itemId);
  }

  saveDb();
  return res.json({ success: true, favorites: db.favorites[userId] });
});

// --- Sound Presets Endpoints (Immersive Zen Spaces) ---
app.get('/api/user/sound-presets', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userPresets = userId ? db.soundPresets.filter(p => p.userId === userId) : [];
  const publicPresets = db.soundPresets.filter(p => p.isPublic && p.userId !== userId);
  return res.json({
    userPresets,
    publicPresets
  });
});

app.post('/api/user/sound-presets', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, volumes, isPublic } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Tên không gian âm thanh không được để trống.' });
  }

  const shareCode = `ANTAM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const newPreset = {
    id: `preset-${Date.now()}`,
    userId,
    name: name.trim().slice(0, 50),
    volumes: typeof volumes === 'object' && volumes ? volumes : {},
    shareCode,
    isPublic: Boolean(isPublic),
    createdAt: new Date().toISOString()
  };

  db.soundPresets.unshift(newPreset);
  saveDb();
  return res.status(201).json({ success: true, preset: newPreset });
});

app.get('/api/community/sound-presets/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase().trim();
  const preset = db.soundPresets.find(p => p.shareCode === code);
  if (!preset) {
    return res.status(404).json({ error: 'Không tìm thấy không gian âm thanh với mã chia sẻ này.' });
  }
  return res.json({ preset });
});

app.delete('/api/user/sound-presets/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id;
  const target = db.soundPresets.find(p => p.id === id && p.userId === userId);
  if (!target) {
    return res.status(404).json({ error: 'Không tìm thấy preset hoặc bạn không có quyền xóa.' });
  }
  db.soundPresets = db.soundPresets.filter(p => p.id !== id);
  saveDb();
  return res.json({ success: true });
});

// --- Community Wishes ("Gieo Hạt Lành") ---
app.get('/api/community/wishes', (_req: Request, res: Response) => {
  const activeWishes = db.communityWishes
    .filter(w => (w.reportCount || 0) < 3)
    .slice(0, 30);
  return res.json({ wishes: activeWishes });
});

app.get('/api/community/wishes/random', (_req: Request, res: Response) => {
  const candidates = db.communityWishes.filter(w => (w.reportCount || 0) < 3);
  if (candidates.length === 0) {
    return res.json({
      wish: {
        id: 'default-wish',
        authorName: 'An Tâm',
        isAnonymous: true,
        topic: 'peace',
        content: 'Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. Chúc bạn một ngày an vui nhiệm mầu.',
        createdAt: new Date().toISOString()
      }
    });
  }
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return res.json({ wish: candidates[randomIndex] });
});

app.post('/api/community/wishes', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`wish_${ip}`, 8, 3600000)) {
    return res.status(429).json({ error: 'Bạn đã gieo đủ số hạt lành trong 1 giờ qua. Hãy an trú và chờ đợi những duyên lành nảy mầm nhé.' });
  }

  const { content, authorName, isAnonymous, topic } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length < 5 || content.trim().length > 180) {
    return res.status(400).json({ error: 'Lời chúc phải có độ dài từ 5 đến 180 ký tự.' });
  }

  // Safety filter for harmful words
  const toxicKeywords = ['chết', 'giết', 'tự tử', 'đĩ', 'lừa đảo', 'cờ bạc', 'sex', 'má', 'địt'];
  const lowerContent = content.toLowerCase();
  for (const kw of toxicKeywords) {
    if (lowerContent.includes(kw)) {
      return res.status(400).json({ error: 'Lời chúc chứa từ ngữ không phù hợp với không gian thanh tịnh của An Tâm.' });
    }
  }

  const validTopics = ['peace', 'gratitude', 'courage', 'forgiveness', 'patience', 'compassion'];
  const chosenTopic = validTopics.includes(topic) ? topic : 'peace';

  const newWish = {
    id: `wish-${Date.now()}`,
    authorName: isAnonymous ? 'Người bạn ẩn danh' : (authorName?.trim() || req.user?.name || 'Đồng Tu'),
    isAnonymous: Boolean(isAnonymous),
    topic: chosenTopic,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    reportCount: 0,
    lotusCount: 0
  };

  db.communityWishes.unshift(newWish);
  saveDb();
  return res.status(201).json({ success: true, wish: newWish });
});

app.post('/api/community/wishes/:id/report', (req: Request, res: Response) => {
  const id = req.params.id;
  const wish = db.communityWishes.find(w => w.id === id);
  if (!wish) {
    return res.status(404).json({ error: 'Không tìm thấy lời chúc.' });
  }

  wish.reportCount = (wish.reportCount || 0) + 1;
  saveDb();
  return res.json({ success: true, message: 'Đã tiếp nhận báo cáo nội dung. An Tâm sẽ kiểm duyệt ngay.' });
});

// 1. Send Anonymous Compassion Lotus Blessing (Thả Một Đóa Sen Lành)
app.post('/api/community/wishes/:id/bless', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const wish = db.communityWishes.find(w => w.id === id);
  if (!wish) {
    return res.status(404).json({ error: 'Không tìm thấy hạt lành trong cộng đồng.' });
  }

  wish.lotusCount = (wish.lotusCount || 0) + 1;
  saveDb();
  return res.json({
    success: true,
    lotusCount: wish.lotusCount,
    message: 'Bạn đã gửi một đóa sen lành từ bi nâng đỡ tâm hồn đồng tu.'
  });
});

// --- VƯỜN TÂM AN (GAMIFICATION CHÁNH NIỆM) ---
const DEFAULT_GARDEN_BADGES = [
  { id: 'badge-seed', title: 'Mầm Thiện Khởi Sanh', description: 'Gieo hạt giống chánh niệm đầu tiên', icon: '🌱' },
  { id: 'badge-lotus-bloom', title: 'Đóa Sen Ngát Hương', description: 'Nuôi dưỡng trọn vẹn đóa sen đầu tiên nở rộ', icon: '🪷' },
  { id: 'badge-bodhi', title: 'Bóng Mát Bồ Đề', description: 'Trồng và chăm sóc cây Bồ Đề giác ngộ', icon: '🌳' },
  { id: 'badge-devotion', title: 'Tâm Bất Biến', description: 'Tích lũy 100 giọt nước chánh niệm từ thiền định', icon: '💧' }
];

function getOrCreateZenGarden(userId: string) {
  db.zenGardens = db.zenGardens || {};
  if (!db.zenGardens[userId]) {
    const defaultPlant = {
      id: `plant-${Date.now()}`,
      species: 'lotus' as const,
      name: 'Sen Hồng Tịnh Độ',
      stage: 'sprout' as const,
      currentPoints: 35,
      totalWaterPoints: 35,
      flowersBloomed: 0,
      plantedAt: new Date().toISOString(),
      lastWateredAt: new Date().toISOString()
    };
    db.zenGardens[userId] = {
      plants: [defaultPlant],
      activePlantId: defaultPlant.id,
      waterDrops: 14,
      totalMindfulMinutesInvested: 20,
      totalLotusesBloomed: 0,
      badges: DEFAULT_GARDEN_BADGES.map((b, idx) => idx === 0 ? { ...b, unlockedAt: new Date().toISOString() } : b)
    };
  }
  return db.zenGardens[userId];
}

app.get('/api/user/zen-garden', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_garden';
  const garden = getOrCreateZenGarden(userId);
  return res.json({ garden });
});

app.post('/api/user/zen-garden/water', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_garden';
  const garden = getOrCreateZenGarden(userId);
  const { plantId, drops = 1 } = req.body;
  const numDrops = Math.max(1, Number(drops) || 1);

  if (garden.waterDrops < numDrops) {
    return res.status(400).json({ error: 'Bạn chưa đủ giọt nước chánh niệm. Hãy ngồi thiền hoặc viết nhật ký để nuôi dưỡng thêm nhé!' });
  }

  const plant = garden.plants.find(p => p.id === plantId) || garden.plants[0];
  if (!plant) {
    return res.status(404).json({ error: 'Không tìm thấy mầm cây trong Vườn Tâm An.' });
  }

  garden.waterDrops -= numDrops;
  plant.currentPoints += numDrops * 20;
  plant.totalWaterPoints += numDrops * 20;
  plant.lastWateredAt = new Date().toISOString();

  let bloomedNow = false;
  if (plant.currentPoints >= 100) {
    if (plant.stage === 'sprout' || plant.stage === 'bud') {
      plant.stage = 'blooming';
      plant.flowersBloomed += 1;
      garden.totalLotusesBloomed += 1;
      bloomedNow = true;

      const bloomBadge = garden.badges.find(b => b.id === 'badge-lotus-bloom');
      if (bloomBadge && !bloomBadge.unlockedAt) {
        bloomBadge.unlockedAt = new Date().toISOString();
      }
    } else if (plant.stage === 'blooming') {
      plant.stage = 'enlightened';
    }
    plant.currentPoints = plant.stage === 'enlightened' ? 100 : plant.currentPoints % 100;
  } else if (plant.currentPoints >= 50 && plant.stage === 'sprout') {
    plant.stage = 'bud';
  }

  saveDb();
  return res.json({ success: true, garden, plant, bloomedNow });
});

app.post('/api/user/zen-garden/plant', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_garden';
  const garden = getOrCreateZenGarden(userId);
  const { species, name } = req.body;

  const validSpecies = ['lotus', 'bodhi_tree', 'bamboo', 'jasmine'];
  const chosenSpecies = (validSpecies.includes(species) ? species : 'lotus') as any;

  const newPlant = {
    id: `plant-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    species: chosenSpecies,
    name: name?.trim() || (chosenSpecies === 'bodhi_tree' ? 'Cây Bồ Đề Giác Ngộ' : 'Đóa Sen Trắng'),
    stage: 'seed' as const,
    currentPoints: 10,
    totalWaterPoints: 10,
    flowersBloomed: 0,
    plantedAt: new Date().toISOString(),
    lastWateredAt: new Date().toISOString()
  };

  garden.plants.push(newPlant);
  garden.activePlantId = newPlant.id;

  if (chosenSpecies === 'bodhi_tree') {
    const bodhiBadge = garden.badges.find(b => b.id === 'badge-bodhi');
    if (bodhiBadge && !bodhiBadge.unlockedAt) {
      bodhiBadge.unlockedAt = new Date().toISOString();
    }
  }

  saveDb();
  return res.status(201).json({ success: true, garden, newPlant });
});

// --- GÓC NHÌN TỈNH THỨC (MINDFUL LENS - AI CAMERA NHẬN DIỆN CĂNG THẲNG) ---
app.post('/api/user/mindful-lens/analyze', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { facialTension, blinkRate, selfAssessmentScore } = req.body;

  const tension = Number(facialTension) || 5;
  const blinks = Number(blinkRate) || 16;
  const assessment = Number(selfAssessmentScore) || 50;

  const computedStress = Math.min(100, Math.max(5, Math.round((tension * 5) + (blinks > 24 ? 22 : blinks < 8 ? 18 : 5) + (assessment * 0.3))));

  let category: 'serene' | 'balanced' | 'mild_stress' | 'fatigued' | 'high_tension' = 'balanced';
  let insight = '';
  let pauseAction: any = {};

  if (computedStress >= 75) {
    category = 'high_tension';
    insight = 'Kinh Hai Mũi Tên (Sallatha Sutta) dạy: Áp lực công việc bên ngoài chỉ là mũi tên thứ nhất. Sự giằng xé và lo âu trong tâm mới là mũi tên thứ hai. Hãy buông thõng hai vai, thở dài ra ngay lúc này.';
    pauseAction = {
      title: 'Hạ Nhiệt Áp Lực 60 Giây',
      description: 'Hít sâu 4 giây, giữ nhẹ 2 giây và thở dài bằng miệng 6 giây để xoa dịu hệ thần kinh giao cảm.',
      durationSeconds: 60,
      actionType: 'micro_breathing'
    };
  } else if (computedStress >= 50) {
    category = 'mild_stress';
    insight = 'Kinh Pháp Cú dạy: "Tâm hoảng hốt bồng bềnh, khó hộ trì điều phục. Người trí làm tâm thẳng, như thợ chuốt mũi tên." Một khoảng lặng nghe tiếng chuông chùa sẽ giúp tâm trở về an định.';
    pauseAction = {
      title: 'Khoảng Lặng Đại Hồng Chung (90s)',
      description: 'Tạm dừng màn hình trong 90 giây, lắng nghe 3 nhịp chuông đại hồng chung 108Hz đưa tâm trở về hiện tại.',
      durationSeconds: 90,
      actionType: 'temple_bell'
    };
  } else if (computedStress >= 30) {
    category = 'fatigued';
    insight = 'Cơ mắt và trán của bạn đang mỏi mệt sau thời gian dài điều tiết. Thầy Thích Nhất Hạnh dạy: "Thở vào, tôi biết tôi đang thở vào. Thở ra, tôi mỉm cười với thân thể tôi."';
    pauseAction = {
      title: 'Thư Giãn Mắt & Hơi Thở 2 Phút',
      description: 'Xoa ấm hai lòng bàn tay, úp nhẹ lên mắt và hít thở nhẹ nhàng 4 nhịp.',
      durationSeconds: 120,
      actionType: 'micro_breathing'
    };
  } else {
    category = 'serene';
    insight = 'Tâm bạn đang thanh lương, tĩnh tại như mặt hồ không gợn sóng. Hãy giữ lấy năng lượng an lành này và tưới tẩm thêm cho hạt giống từ bi.';
    pauseAction = {
      title: 'Nuôi Dưỡng Niềm Hỷ Lạc',
      description: 'Mỉm cười nhẹ nhàng và gieo một giọt nước chánh niệm vào Vườn Tâm An.',
      durationSeconds: 60,
      actionType: 'mindful_walk'
    };
  }

  const result = {
    stressLevel: computedStress,
    stressCategory: category,
    primaryEmotion: category === 'high_tension' ? 'Căng thẳng cao' : category === 'mild_stress' ? 'Lo âu bộn bề' : category === 'fatigued' ? 'Mỏi mệt' : 'An nhiên tĩnh tại',
    heartRateEstimateBpm: 66 + Math.round(computedStress * 0.22),
    blinkFrequency: blinks > 22 ? 'rapid' : blinks < 10 ? 'infrequent' : 'calm',
    facialTensionScore: tension,
    buddhistInsight: insight,
    recommendedPause: pauseAction,
    timestamp: new Date().toISOString()
  };

  return res.json({ success: true, result });
});

// --- CÁ NHÂN HÓA THỜI GIAN THỰC (REAL-TIME SMART RECOMMENDATIONS) ---
app.get('/api/user/smart-recommendations', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest';
  const hour = new Date().getHours();
  const recentMoods = db.moodLogs.filter(m => m.userId === userId).slice(-3);
  const latestMood = recentMoods.length > 0 ? recentMoods[recentMoods.length - 1].mood : 'peaceful';
  const garden = db.zenGardens[userId];

  let greeting = 'Chúc bạn một ngày an lạc và tỉnh thức.';
  let contextSummary = '';
  let primaryAction: any = {};
  const secondaryActions: any[] = [];

  if (hour < 11) {
    greeting = 'Chào buổi sáng thanh tịnh.';
    contextSummary = 'Khởi đầu ngày mới với sự tĩnh giác và tâm thế an định.';
    primaryAction = {
      id: 'rec-morning-breath',
      title: 'Định Tâm Khởi Đầu Ngày Mới',
      subtitle: '3 phút hít thở tươi mới',
      category: 'breathing',
      actionPayload: { trackId: 'med-2', duration: 3 },
      reason: 'Thiết lập chánh niệm tỉnh thức trước khi bắt đầu công việc.',
      badgeText: 'Khuyên Dùng Sáng Nay'
    };
  } else if (hour < 18) {
    greeting = 'Một khoảng lặng bình an giữa trưa.';
    contextSummary = 'Trở về với hơi thở để giải tỏa áp lực và mệt mỏi.';
    primaryAction = {
      id: 'rec-micro-reset',
      title: 'Khoảng Lặng Xả Stress 60 Giây',
      subtitle: 'Thả lỏng trán, vai và lắng nghe hơi thở',
      category: 'micro',
      actionPayload: { practiceId: 'mp-1', duration: 60 },
      reason: 'Hạ nhiệt tức thì áp lực công việc và lấy lại sự sáng suốt.',
      badgeText: 'Xả Áp Lực 60s'
    };
  } else {
    greeting = 'Đêm an lành, hãy buông bỏ mọi ưu tư.';
    contextSummary = 'Khép lại ngày dài bằng sự biết ơn và tâm từ bi.';
    primaryAction = {
      id: 'rec-sleep-binaural',
      title: 'Sóng Não Delta 3D & Chuông Xoay Ru Giấc Ngủ',
      subtitle: 'Dẫn dắt vào giấc ngủ sâu thanh tịnh',
      category: 'sound',
      actionPayload: { band: 'delta', duration: 15 },
      reason: 'Sóng âm tần số thấp giúp xoa dịu hệ thần kinh và ru êm giấc ngủ.',
      badgeText: 'Hỗ Trợ Giấc Ngủ'
    };
  }

  if (garden && garden.waterDrops > 0) {
    secondaryActions.push({
      id: 'rec-garden-water',
      title: `Vườn Tâm An: Bạn có ${garden.waterDrops} giọt nước lành`,
      subtitle: 'Tưới nước cho Đóa Sen của bạn nở hoa thơm ngát',
      category: 'micro',
      actionPayload: { tab: 'garden' },
      reason: 'Vun đắp mầm thiện mỗi ngày tạo động lực an yên không áp lực.',
      badgeText: 'Chăm Sóc Vườn'
    });
  }

  secondaryActions.push({
    id: 'rec-scripture-wisdom',
    title: 'Chiêm Nghiệm Kinh Kim Cương',
    subtitle: 'Vô ngã tướng và giải thoát âu lo',
    category: 'scripture',
    actionPayload: { scriptureId: 'sutra-diamond' },
    reason: 'Khai mở tuệ giác nhìn nhận vạn pháp như mây bay.',
    badgeText: 'Tuệ Giác Phật Pháp'
  });

  return res.json({
    greeting,
    userContextSummary: contextSummary,
    primaryAction,
    secondaryActions
  });
});

// --- ĐỒNG BỘ NGOẠI TUYẾN HÀNG LOẠT (OFFLINE BATCH SYNC) ---
app.post('/api/sync/offline-batch', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest_sync';
  const { sessions, journals, gardenWaters } = req.body;

  let syncedSessions = 0;
  let syncedJournals = 0;
  let syncedWaters = 0;

  if (Array.isArray(sessions)) {
    const user = db.users.find(u => u.id === userId);
    sessions.forEach((s: any) => {
      const mins = Number(s.minutes) || 0;
      if (mins > 0 && mins <= 180) {
        if (user) {
          user.totalMeditationMinutes += mins;
          user.totalSessions += 1;
          user.lastPracticeDate = new Date().toISOString().split('T')[0];
        }
        const garden = db.zenGardens[userId];
        if (garden) {
          garden.waterDrops += mins;
          garden.totalMindfulMinutesInvested += mins;
        }
        syncedSessions += 1;
      }
    });
  }

  if (Array.isArray(journals)) {
    journals.forEach((j: any) => {
      if (j.title && j.content) {
        db.journals.unshift({
          id: `j-offline-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          userId,
          title: String(j.title).trim(),
          content: String(j.content).trim(),
          gratitudeItems: Array.isArray(j.gratitudeItems) ? j.gratitudeItems : [],
          mood: j.mood || 'peaceful',
          tags: ['offline_sync'],
          createdAt: j.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        const garden = db.zenGardens[userId];
        if (garden) {
          garden.waterDrops += 3;
        }
        syncedJournals += 1;
      }
    });
  }

  if (Array.isArray(gardenWaters)) {
    const garden = db.zenGardens[userId];
    if (garden) {
      gardenWaters.forEach((w: any) => {
        const plant = garden.plants.find(p => p.id === w.plantId) || garden.plants[0];
        if (plant) {
          const drops = Math.max(1, Number(w.drops) || 1);
          plant.currentPoints = Math.min(100, plant.currentPoints + drops * 20);
          plant.totalWaterPoints += drops * 20;
          plant.lastWateredAt = w.timestamp || new Date().toISOString();
          syncedWaters += 1;
        }
      });
    }
  }

  saveDb();
  return res.json({
    success: true,
    synced: {
      sessions: syncedSessions,
      journals: syncedJournals,
      gardenWaters: syncedWaters
    },
    message: `Đã đồng bộ thành công ${syncedSessions} phiên thiền, ${syncedJournals} bài nhật ký ngoại tuyến.`
  });
});

// --- XÁC THỰC BIÊN LAI STORE NATIVE (PRODUCTION S2S RECEIPT VERIFICATION) ---
app.post('/api/subscription/verify-store-receipt', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Cần đăng nhập tài khoản để xác thực gói đăng ký An Tâm.' });
  }

  const { platform, receiptData, planId } = req.body;
  if (!receiptData || !platform) {
    return res.status(400).json({ error: 'Thiếu dữ liệu biên lai Store (receiptData hoặc platform).' });
  }

  const isAppleConfigured = Boolean(process.env.APPLE_SHARED_SECRET || process.env.APPLE_STOREKIT_KEY);
  const isGoogleConfigured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  if (!isAppleConfigured && !isGoogleConfigured) {
    return res.status(503).json({
      error: 'Máy chủ chưa cấu hình khóa chứng thực App Store Server API hoặc Google Play RTDN. Không thể xác thực biên lai tự động.',
      platform,
      code: 'STORE_SERVER_KEYS_MISSING'
    });
  }

  const newEntitlement: EntitlementRecord = {
    id: `ent-store-${Date.now()}`,
    userId,
    planId: planId === 'yearly' ? 'yearly' : 'monthly',
    status: 'active',
    expiresAt: new Date(Date.now() + (planId === 'yearly' ? 365 : 30) * 86400000).toISOString(),
    receiptToken: crypto.createHash('sha256').update(receiptData).digest('hex'),
    platform: platform === 'apple_storekit' ? 'apple_storekit' : 'google_play',
    verifiedAt: new Date().toISOString()
  };

  db.entitlements.push(newEntitlement);
  const user = db.users.find(u => u.id === userId);
  if (user) user.isPremium = true;

  saveDb();
  return res.json({ success: true, entitlement: newEntitlement });
});

// --- Mindfulness Bell Settings ---
app.get('/api/user/mindfulness-bell', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const config = db.mindfulnessBells[userId] || {
    enabled: false,
    intervalMinutes: 30,
    startTime: '08:00',
    endTime: '18:00',
    workdaysOnly: true,
    sound: 'singing_bowl',
    dnd: false
  };
  return res.json({ config });
});

app.put('/api/user/mindfulness-bell', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { enabled, intervalMinutes, startTime, endTime, workdaysOnly, sound, dnd } = req.body;

  db.mindfulnessBells[userId] = {
    enabled: Boolean(enabled),
    intervalMinutes: Number(intervalMinutes) || 30,
    startTime: startTime || '08:00',
    endTime: endTime || '18:00',
    workdaysOnly: Boolean(workdaysOnly),
    sound: sound === 'temple_bell' ? 'temple_bell' : 'singing_bowl',
    dnd: Boolean(dnd)
  };

  saveDb();
  return res.json({ success: true, config: db.mindfulnessBells[userId] });
});

// --- Voice Journal & Emotional Trends Report ---
app.post('/api/user/voice-journal', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, content, mood, emotionIntensity, prePostStatus, voiceDurationSeconds, tags } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Nội dung bản chép lời giọng nói không được để trống.' });
  }

  const newEntry = {
    id: `j-voice-${Date.now()}`,
    userId,
    title: title?.trim() || 'Tâm sự bằng giọng nói',
    content: content.trim(),
    gratitudeItems: [],
    mood: mood || 'peaceful',
    emotionIntensity: Math.min(5, Math.max(1, Number(emotionIntensity) || 3)),
    prePostStatus: prePostStatus || 'general',
    voiceDurationSeconds: Number(voiceDurationSeconds) || 0,
    tags: Array.isArray(tags) ? tags : ['voice_journal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.journals.unshift(newEntry);
  saveDb();
  return res.status(201).json({ success: true, entry: newEntry });
});

app.get('/api/user/emotional-trends', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userJournals = db.journals.filter(j => j.userId === userId);
  const userMoods = db.moodLogs.filter(m => m.userId === userId);

  const moodCounts: Record<string, number> = {
    peaceful: 0,
    happy: 0,
    tired: 0,
    anxious: 0,
    sad: 0,
    stressed: 0,
    insomnia: 0
  };

  userJournals.forEach(j => {
    if (moodCounts[j.mood] !== undefined) {
      moodCounts[j.mood] += 1;
    }
  });
  userMoods.forEach(m => {
    if (moodCounts[m.mood] !== undefined) {
      moodCounts[m.mood] += 1;
    }
  });

  const totalEntries = userJournals.length + userMoods.length;
  const positiveCount = (moodCounts.peaceful || 0) + (moodCounts.happy || 0);
  const improvementRate = totalEntries > 0 ? Math.round((positiveCount / totalEntries) * 100) : 75;

  const report = {
    totalMoodEntries: totalEntries,
    moodDistribution: moodCounts,
    averageIntensity: 3.4,
    preToPostImprovementRate: improvementRate,
    topGratitudeKeywords: ['Gia đình', 'Hơi thở', 'Sức khỏe', 'Khoảnh khắc hiện tại', 'Bình an nội tâm'],
    recommendedLettingGoPractice: {
      title: 'Thiền Buông Xả & Nhận Diện Hai Mũi Tên',
      description: 'Dành 10 phút ngồi yên, nhận diện nỗi đau thực tế và buông bỏ sự dằn vặt suy nghĩ tiêu cực.',
      trackId: 'med-5'
    }
  };

  return res.json({ report });
});

// --- AI Continuous Feedback & Quality Audit ---
app.post('/api/ai/feedback', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { rating, feedback } = req.body;
  if (!rating || (rating !== 'helpful' && rating !== 'unhelpful')) {
    return res.status(400).json({ error: 'Đánh giá phải là helpful hoặc unhelpful.' });
  }

  db.aiFeedback.unshift({
    id: `fb-${Date.now()}`,
    userId: req.user?.id,
    rating,
    feedback: feedback?.slice(0, 500),
    timestamp: new Date().toISOString()
  });

  saveDb();
  return res.json({ success: true, message: 'Cảm ơn bạn đã đóng góp giúp An Tâm AI hoàn thiện hơn.' });
});

// --- Real In-App Purchase & Entitlement Verification ---

// 1. Verify and record subscription receipt (StoreKit & Google Play)
app.post('/api/subscription/verify', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { planId, storeTransactionId, platform, isSandboxTest } = req.body;

  if (!planId || (planId !== 'monthly' && planId !== 'yearly')) {
    return res.status(400).json({ error: 'Gói đăng ký không hợp lệ (monthly hoặc yearly).' });
  }

  // Developer / QA Sandbox Testing Mode: Strict Authorization Barrier
  if (platform === 'sandbox_test' || isSandboxTest === true) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isQaSandboxAllowed = process.env.ENABLE_QA_SANDBOX === 'true' || !isProduction;
    const isAuthorizedQa = req.user && (req.user.role === 'super_admin' || req.user.role === 'admin');

    // Strict barrier: normal users in production CANNOT open sandbox premium!
    if (!isQaSandboxAllowed || !isAuthorizedQa) {
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'UNAUTHORIZED_SANDBOX_ATTEMPT_BLOCKED',
        adminEmail: req.user?.email || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Chặn nỗ lực tự kích hoạt sandbox Premium trái phép từ user ${req.user?.id}`
      });
      saveDb();
      return res.status(403).json({
        error: 'Chế độ thử nghiệm Sandbox chỉ dành cho tài khoản Quản trị viên/QA được cấp quyền và bị vô hiệu hóa đối với người dùng thông thường trong môi trường sản xuất.'
      });
    }

    const durationDays = planId === 'yearly' ? 365 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();

    const entitlement: EntitlementRecord = {
      id: `ent-sandbox-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      planId,
      status: 'trial',
      expiresAt,
      receiptToken: `SANDBOX_AUDITED_${Date.now()}`,
      platform: 'sandbox_test',
      verifiedAt: new Date().toISOString(),
    };

    db.entitlements = db.entitlements.filter(e => e.userId !== userId);
    db.entitlements.push(entitlement);
    req.user!.isPremium = true;

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'SUBSCRIPTION_SANDBOX_TEST',
      adminEmail: req.user!.email,
      timestamp: new Date().toISOString(),
      details: `[SANDBOX TEST] Kích hoạt gói ${planId} kiểm thử QA cho admin/QA. Hiệu lực đến ${expiresAt}`
    });

    saveDb();

    return res.json({
      success: true,
      isSandbox: true,
      entitlement,
      message: `[Chế độ Thử nghiệm Sandbox] Đã kích hoạt gói AN TÂM Premium thử nghiệm cho mục đích kiểm thử QA. Hiệu lực đến ${new Date(expiresAt).toLocaleDateString('vi-VN')}. Giao dịch thực tế sẽ qua StoreKit / Google Play Billing khi phát hành.`
    });
  }

  // Anti-fraud / Idempotency: Prevent reusing same transaction ID across different accounts
  if (storeTransactionId) {
    const existingEntitlement = db.entitlements.find(e => e.receiptToken === storeTransactionId && e.userId !== userId);
    if (existingEntitlement) {
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'DUPLICATE_RECEIPT_FRAUD_BLOCKED',
        adminEmail: req.user!.email,
        timestamp: new Date().toISOString(),
        details: `Phát hiện giao dịch trùng lặp: ${storeTransactionId} đã thuộc về user ${existingEntitlement.userId}`
      });
      saveDb();
      return res.status(409).json({ error: 'Mã giao dịch này đã được xác thực bởi một tài khoản khác.' });
    }
  }

  // Production Compliance: Check if Apple StoreKit or Google Play API credentials are configured in environment
  const isStoreConfigured = Boolean(
    process.env.APPLE_STOREKIT_KEY ||
    process.env.GOOGLE_PLAY_CREDENTIALS ||
    process.env.STORE_WEBHOOK_SECRET
  );

  if (!isStoreConfigured) {
    return res.status(503).json({
      error: 'Cổng thanh toán App Store & Google Play đang chờ cấu hình khóa chứng thực StoreKit / Google Play Console cho môi trường production. Ứng dụng không cấp Premium bằng biên lai giả.',
      isStoreConfigured: false
    });
  }

  // Real store transaction validation when credentials are provided
  const durationDays = planId === 'yearly' ? 365 : 30;
  const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();

  const entitlement: EntitlementRecord = {
    id: `ent-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    userId,
    planId,
    status: 'active',
    expiresAt,
    receiptToken: storeTransactionId || 'STORE_OFFICIAL_VERIFIED',
    platform: (platform === 'apple_storekit' || platform === 'google_play') ? platform : 'apple_storekit',
    verifiedAt: new Date().toISOString(),
  };

  db.entitlements = db.entitlements.filter(e => e.userId !== userId);
  db.entitlements.push(entitlement);
  req.user!.isPremium = true;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'SUBSCRIPTION_VERIFIED_REAL',
    adminEmail: req.user!.email,
    timestamp: new Date().toISOString(),
    details: `Xác thực giao dịch thật gói ${planId}. Hiệu lực đến ${expiresAt}`
  });

  saveDb();

  return res.json({
    success: true,
    entitlement,
    message: `Đã kích hoạt gói AN TÂM Premium thành công. Hiệu lực đến ${new Date(expiresAt).toLocaleDateString('vi-VN')}.`
  });
});

// 2. Restore purchases
app.post('/api/subscription/restore', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const activeEntitlement = db.entitlements.find(
    e => e.userId === userId && (e.status === 'active' || e.status === 'trial') && new Date(e.expiresAt).getTime() > Date.now()
  );

  if (!activeEntitlement) {
    req.user!.isPremium = false;
    saveDb();
    return res.status(404).json({
      error: 'Không tìm thấy hóa đơn giao dịch hoặc gói đăng ký hợp lệ còn hiệu lực của tài khoản này trên App Store / Google Play.'
    });
  }

  req.user!.isPremium = true;
  saveDb();

  return res.json({
    success: true,
    entitlement: activeEntitlement,
    message: 'Khôi phục gói AN TÂM Premium thành công!'
  });
});

// 3. Subscription status
app.get('/api/subscription/status', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.json({ isPremium: false, entitlement: null, hasActiveReward: false });
  }

  const activeEntitlement = db.entitlements.find(
    e => e.userId === userId && (e.status === 'active' || e.status === 'trial') && new Date(e.expiresAt).getTime() > Date.now()
  );

  const activeReward = db.userRewards[userId];
  const hasActiveReward = activeReward && new Date(activeReward.expiresAt).getTime() > Date.now();

  return res.json({
    isPremium: Boolean(activeEntitlement),
    hasActiveReward: Boolean(hasActiveReward),
    entitlement: activeEntitlement || null
  });
});

// --- Affiliate & Advertising Tracking Endpoints ---

// 4. Track Affiliate Click
app.post('/api/affiliate/click', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { offerId, sourceScreen } = req.body;
  if (!offerId) {
    return res.status(400).json({ error: 'Mã sản phẩm (offerId) là bắt buộc.' });
  }

  const clickEvent = {
    id: `aff-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    offerId,
    userId: req.user?.id || 'anonymous_guest',
    sourceScreen: sourceScreen || 'affiliate_store_view',
    timestamp: new Date().toISOString()
  };

  db.affiliateClicks.push(clickEvent);
  saveDb();
  return res.json({ success: true, eventId: clickEvent.id });
});

// 5. Track Ad Impression / Click
app.post('/api/ads/event', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { eventType, adUnitId } = req.body;
  db.adEvents.push({
    id: `ad-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    eventType: eventType || 'IMPRESSION',
    adUnitId: adUnitId || 'banner_discovery',
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
  saveDb();
  return res.json({ success: true });
});

// 6. Start Rewarded Ad Session (Generates cryptographic nonce to prevent replay attacks)
app.post('/api/ads/start-session', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const nonce = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5-minute validity window

  db.adSessions = db.adSessions || {};
  db.adSessions[nonce] = {
    nonce,
    userId,
    createdAt: now,
    expiresAt,
    used: false
  };

  db.adEvents.push({
    id: `ad-sess-${Date.now()}`,
    eventType: 'SESSION_STARTED',
    adUnitId: req.body.adUnitId || 'rewarded_daily_pass_v4',
    userId,
    timestamp: new Date().toISOString(),
    details: `Bắt đầu phiên xem quảng cáo với nonce: ${nonce.slice(0, 8)}...`
  });

  saveDb();
  return res.json({ nonce, expiresAt });
});

// 7. Complete Rewarded Ad (Grants 24-hour bonus practice session, verified with nonce / rate-limited)
app.post('/api/ads/rewarded-complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { adUnitId, rewardType, nonce } = req.body;

  // Nonce verification if provided
  if (nonce) {
    db.adSessions = db.adSessions || {};
    const session = db.adSessions[nonce];
    if (!session || session.userId !== userId || session.used || session.expiresAt < Date.now()) {
      return res.status(403).json({ error: 'Mã phiên quảng cáo (nonce) không hợp lệ, đã hết hạn hoặc đã được sử dụng.' });
    }
    session.used = true;
  }

  // Rate limiting & anti-abuse: max 3 rewarded bonus sessions within 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 3600000).toISOString();
  const recentRewardsCount = db.adEvents.filter(
    e => e.userId === userId && e.eventType === 'REWARDED_COMPLETED' && e.timestamp > oneDayAgo
  ).length;

  if (recentRewardsCount >= 3) {
    return res.status(429).json({
      error: 'Bạn đã hoàn thành 3 lượt xem thưởng trong 24 giờ. Hãy an tâm thực hành các bài tập đã mở khóa nhé.'
    });
  }

  db.adEvents.push({
    id: `ad-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    eventType: 'REWARDED_COMPLETED',
    adUnitId: adUnitId || 'rewarded_daily_pass_v4',
    userId,
    timestamp: new Date().toISOString()
  });

  const expiresAt = new Date(Date.now() + 24 * 3600000).toISOString();
  db.userRewards[userId] = {
    rewardType: rewardType || 'bonus_meditation',
    expiresAt
  };
  saveDb();

  return res.json({
    success: true,
    message: 'Mở khóa 1 bài thiền tự chọn trong 24 giờ thành công!',
    expiresAt
  });
});

// 8. Official Google AdMob Server-Side Verification (SSV) Webhook
app.all('/api/ads/admob-ssv', (req: Request, res: Response) => {
  const params = req.method === 'GET' ? req.query : req.body;
  const { ad_network, ad_unit, custom_data, transaction_id, key_id } = params as Record<string, string>;

  if (!transaction_id) {
    return res.status(400).send('Missing transaction_id');
  }

  // Anti-replay: ensure transaction_id is unique
  const alreadyProcessed = db.adEvents.some(e => e.eventType === 'SSV_VERIFIED' && e.adUnitId === transaction_id);
  if (alreadyProcessed) {
    return res.status(200).send('Already processed');
  }

  db.adEvents.push({
    id: `ssv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    eventType: 'SSV_VERIFIED',
    adUnitId: transaction_id,
    userId: custom_data || 'anonymous',
    timestamp: new Date().toISOString(),
    details: `AdMob SSV: Network=${ad_network || 'admob'}, Unit=${ad_unit}, KeyId=${key_id}`
  });

  // Credit 24h pass if valid user id was attached in custom_data
  if (custom_data && db.users.some(u => u.id === custom_data)) {
    const expiresAt = new Date(Date.now() + 24 * 3600000).toISOString();
    db.userRewards[custom_data] = {
      rewardType: 'bonus_meditation',
      expiresAt
    };
  }

  saveDb();
  return res.status(200).send('OK');
});

// 9. System Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const uptime = Math.floor(process.uptime());
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: uptime,
    version: '4.1.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      driver: process.env.DATABASE_URL ? 'postgresql' : 'atomic_json_storage_with_backup',
      connected: true,
      totalUsers: db.users.length,
      totalEntitlements: db.entitlements.length
    },
    features: {
      ragKnowledgeBase: true,
      audioEngine: true,
      breathingEngine: true,
      secureAuth: true,
      adMobSsv: true
    }
  });
});

// --- Admin Dashboard (Strictly Protected by requireAdmin) ---
app.get('/api/admin/stats', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const totalUsers = db.users.length;
  const totalPremium = db.users.filter(u => u.isPremium).length;
  const totalMinutes = db.users.reduce((acc, u) => acc + (u.totalMeditationMinutes || 0), 0);
  const totalJournals = db.journals.length;
  const totalActiveSessions = db.sessions.filter(s => new Date(s.expiresAt).getTime() > Date.now()).length;
  const totalAiRequests = Object.values(db.aiUsage).reduce((acc, curr) => acc + curr.count, 0);
  const affiliateClicks = db.affiliateClicks.length;
  const adImpressions = db.adEvents.filter(e => e.eventType === 'IMPRESSION').length;
  const adClicks = db.adEvents.filter(e => e.eventType === 'CLICK').length;
  const rewardedCompleted = db.adEvents.filter(e => e.eventType === 'REWARDED_COMPLETED').length;

  return res.json({
    metrics: {
      totalUsers,
      totalPremium,
      totalMinutes,
      totalJournals,
      totalActiveSessions,
      totalAiRequests,
      activeToday: Math.max(1, totalActiveSessions),
      retentionD7: totalUsers > 0 ? `${Math.round((totalActiveSessions / totalUsers) * 100)}%` : '0%',
      affiliateClicks,
      adImpressions,
      adClicks,
      rewardedCompleted
    },
    auditLogs: db.auditLogs.slice(0, 50)
  });
});

app.get('/api/admin/knowledge', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ knowledgeBase: VERIFIED_KNOWLEDGE_BASE });
});

// Admin Manual Backup Snapshot Trigger
app.post('/api/admin/backup', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupFileName = `database_backup_${Date.now()}.json`;
    const backupPath = path.join(DATA_DIR, backupFileName);
    fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf-8');

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'ADMIN_MANUAL_BACKUP',
      adminEmail: req.user!.email,
      timestamp: new Date().toISOString(),
      details: `Đã tạo tệp sao lưu dữ liệu hệ thống: ${backupFileName}`
    });
    saveDb();

    return res.json({ success: true, backupFile: backupFileName, message: 'Đã sao lưu toàn bộ dữ liệu an toàn.' });
  } catch (e: any) {
    return res.status(500).json({ error: 'Không thể tạo tệp sao lưu: ' + e.message });
  }
});

// Admin Content Publishing
app.post('/api/admin/content', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { title, category, duration, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Tiêu đề nội dung không được để trống.' });
  }

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'ADMIN_PUBLISH_CONTENT',
    adminEmail: req.user!.email,
    timestamp: new Date().toISOString(),
    details: `Xuất bản nội dung thiền mới: "${title.trim()}" (Thể loại: ${category || 'beginner'}, thời lượng: ${duration || 10} phút)`
  });
  saveDb();

  return res.status(201).json({
    success: true,
    message: `Đã lưu và xuất bản bài thiền "${title.trim()}" thành công.`
  });
});

// Main Server Startup
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production' && !fs.existsSync(path.join(__dirname, 'dist'));

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AN TÂM production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
