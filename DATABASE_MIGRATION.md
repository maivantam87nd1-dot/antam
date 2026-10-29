# HƯỚNG DẪN MIGRATION CƠ SỞ DỮ LIỆU (DATABASE MIGRATION)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.0 Production Schema  

---

## 1. MỤC TIÊU MIGRATION
Nâng cấp từ tầng lưu trữ tệp cục bộ (`data/database.json`) lên cơ sở dữ liệu quan hệ hoàn chỉnh PostgreSQL / Supabase nhằm:
- Bảo đảm an toàn giao dịch với chuẩn ACID.
- Kích hoạt cơ chế Row Level Security (RLS) để cô lập dữ liệu người dùng tuyệt đối.
- Quản lý quan hệ khóa ngoại (Foreign Keys), Index và Unique Constraints.
- Tối ưu hóa truy vấn cho hàng trăm ngàn người dùng đồng thời.

---

## 2. TỆP SCHEMA QUAN HỆ SẢN XUẤT
Toàn bộ mã SQL DDL khởi tạo đã được chuẩn bị đầy đủ tại:
`migrations/001_production_schema.sql`

Bao gồm các bảng chính:
1. `profiles`: Thông tin người dùng, vai trò (`super_admin`, `admin`, `editor`, `user`, `guest`), số phút thiền, chuỗi ngày liên tiếp.
2. `user_preferences`: Tùy chọn mục tiêu, giờ chuông chánh niệm, âm lượng.
3. `device_tokens`: Quản lý token FCM / APNs cho thông báo đẩy.
4. `content_categories`, `content_licenses`, `content_sources`: Hệ thống chuẩn hóa nguồn gốc và bản quyền nội dung.
5. `meditation_content` & `buddhist_content`: Kho tàng kinh Phật và bài thiền.
6. `journal_entries` & `mood_checkins`: Nhật ký cảm xúc và các điều biết ơn.
7. `mindfulness_journeys` & `journey_progress`: Lộ trình chánh niệm theo ngày.
8. `subscriptions`, `purchase_events`, `entitlements`: Quản lý giao dịch mua hàng và quyền hội viên thật.
9. `knowledge_sources` & `knowledge_chunks`: Cơ sở dữ liệu tri thức Phật học phục vụ RAG AI.
10. `affiliate_offers`, `affiliate_click_events`, `ad_events`: Hệ thống kinh doanh minh bạch.
11. `admin_audit_logs`: Nhật ký kiểm toán bảo mật.

---

## 3. CÁC BƯỚC THỰC THI MIGRATION LÊN POSTGRESQL / SUPABASE

### Bước 1: Khởi tạo kết nối cơ sở dữ liệu
Thiết lập URL kết nối trong biến môi trường:
```bash
DATABASE_URL="postgres://postgres:<PASSWORD>@<HOST>:5432/postgres"
```

### Bước 2: Chạy script khởi tạo bảng và RLS
Sử dụng công cụ `psql` hoặc Supabase SQL Editor:
```bash
psql $DATABASE_URL -f migrations/001_production_schema.sql
```

### Bước 3: Script chuyển dữ liệu từ JSON sang PostgreSQL (Migration ETL)
Dữ liệu từ `data/database.json` có thể được import tự động bằng script:
```typescript
import fs from 'fs';
import { Client } from 'pg';

async function migrateJsonToPostgres() {
  const raw = fs.readFileSync('data/database.json', 'utf-8');
  const db = JSON.parse(raw);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  for (const u of db.users) {
    await client.query(`
      INSERT INTO profiles (id, email, display_name, role, is_guest, is_premium, streak_days, total_meditation_minutes, total_sessions, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
    `, [u.id, u.email, u.name, u.role, u.isGuest, u.isPremium, u.streakDays, u.totalMeditationMinutes, u.totalSessions, u.createdAt]);
  }

  console.log('Chuyển đổi dữ liệu sang PostgreSQL thành công.');
  await client.end();
}
```

---

## 4. CHIẾN LƯỢC PHỤC HỒI THẤT BẠI (ROLLBACK PLAN)
- Trước khi chạy migration trên production, luôn tạo bản sao lưu snapshot tệp `data/database.json`.
- Tệp `data/database.backup.json` luôn được đồng bộ tự động sau mỗi thao tác ghi dữ liệu.
- Trong trường hợp cơ sở dữ liệu từ xa gặp sự cố kết nối, máy chủ `server.ts` tự động kích hoạt fallback sang bộ nhớ cục bộ để dịch vụ không bị gián đoạn.
