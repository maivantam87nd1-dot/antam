# AN TÂM — ỨNG DỤNG THIỀN ĐỊNH & PHẬT PHÁP CHÁNH NIỆM
> *"An tâm trong từng hơi thở, bình an trong từng khoảnh khắc."*

Ứng dụng thiền định, tập thở chánh niệm, âm nhạc thư giãn, kho tàng kinh điển Phật học có nguồn gốc đối soát và Trợ lý AI đồng hành thông minh, phục vụ chăm sóc sức khỏe tinh thần và nuôi dưỡng sự tĩnh lặng nội tâm.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Kho Bài Thiền Định & Tập Thở Chánh Niệm
- **10 bài thiền chuyên sâu**: Thiền cho người mới bắt đầu, Thiền bình minh, Thiền buông xả trước khi ngủ, Thiền quán thân (Body Scan), Thiền quán niệm hơi thở (Ānāpānasati), Thiền biết ơn, Thiền từ bi (Mettā), Thiền tập trung, Thiền chuông tịnh chỉ.
- **Động cơ tập thở (Breathing Engine)**:
  - 5 nhịp thở khoa học: Thư giãn (4-6), Cân bằng (4-4), Tập trung (Box Breathing 4-4-4-4), Giấc ngủ sâu (4-7-8), Thở chậm tự nhiên (5-5).
  - Vòng tròn thị giác động phồng - xẹp theo nhịp thở.
  - Âm thanh chuông xoay Tây Tạng và rung phản hồi xúc giác (Haptic Feedback) khi chuyển nhịp.

### 2. Thư Viện Phật Pháp Chánh Thống & Giải Thích AI
- **Kinh điển & Thần chú Đại thừa**: Bát Nhã Ba La Mật Đa Tâm Kinh, Chú Đại Bi (84 câu), Phẩm Phổ Môn (Kinh Pháp Hoa), Lời Phật dạy (Kinh Phước Đức).
- **Tính năng AI Diễn Giải Câu Kinh**: 3 góc nhìn (Dễ hiểu, Chuyên sâu giáo lý, Ứng dụng thực tế đời thường).
- **Chế độ Tụng Kinh Âm Thanh**: Tích hợp chuông xoay Tây Tạng và giọng đọc thiền sư thư thái.

### 3. Trợ Lý AI Chánh Niệm & Phật Pháp (RAG Grounded)
- Được huấn luyện và kiểm soát với cơ sở kiến thức Phật học chính thống (`src/data/knowledgeBase.ts`).
- Ép buộc trích dẫn nguồn văn bản (`[Nguồn: <Tài liệu>]`), không bịa đặt kinh điển.
- Tự động gợi ý bài tập thở, bài thiền và kinh điển tương ứng với cảm xúc người dùng.
- Bộ lọc an toàn: Đồng cảm sâu sắc, hỗ trợ chuyển hướng khi có khủng hoảng tinh thần.

### 4. Bàn Phối Âm Thanh Đa Tầng (Sound Mixer)
- Phối trộn độc lập: Tiếng mưa rơi (Pink Noise), Tiếng suối reo (LFO Water), Chuông xoay Tây Tạng (Tibetan Singing Bowl), Sóng não Theta 432Hz.
- Hẹn giờ tắt êm dịu (Sleep Timer) với cơ chế giảm âm lượng từ tốn trong 30 giây cuối.

### 5. Nhật Ký Bình An & Theo Dõi Tiến Trình
- Ghi nhận 3 điều biết ơn mỗi ngày.
- Thống kê chuỗi ngày liên tiếp (streak), tổng số phút thiền và số buổi thực hành.
- Xuất dữ liệu cá nhân (JSON) và quyền xóa tài khoản vĩnh viễn chuẩn GDPR.

### 6. Mô Hình Kinh Doanh Freemium & Góc An Tâm (Affiliate)
- Chế độ Khách (Guest Mode) không bắt buộc đăng ký.
- Cổng thanh toán StoreKit / Google Play có kiểm soát máy chủ, hỗ trợ chế độ kiểm thử QA Sandbox minh bạch.
- Giới thiệu vật phẩm thiền chất lượng cao với tuyên bố miễn trừ hoa hồng minh bạch.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Web Audio API.
- **Backend**: Node.js Express với Vite middleware.
- **AI**: Google GenAI SDK (`@google/genai`) - model `gemini-3.8-flash`.
- **Cơ sở dữ liệu**: JSON persistent storage + Backup snapshot kép (`data/database.json`), hỗ trợ chuyển đổi PostgreSQL / Supabase (`migrations/001_production_schema.sql`).
- **Mobile**: Capacitor 6, Android Studio, Xcode, PWA Manifest.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY CỤC BỘ

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường**:
   Sao chép mẫu cấu hình:
   ```bash
   cp .env.example .env
   ```
   Cung cấp `GEMINI_API_KEY` của bạn từ Google AI Studio.

3. **Chạy máy chủ phát triển**:
   ```bash
   npm run dev
   ```
   Truy cập ứng dụng tại `http://localhost:3000`.

4. **Kiểm tra kiểu dữ liệu & Lint**:
   ```bash
   npm run lint
   ```

5. **Đóng gói sản phẩm**:
   ```bash
   npm run build
   npm start
   ```

---

## 📑 BÀN GIAO TÀI LIỆU
- `AUDIT_REPORT.md`: Báo cáo chi tiết kiểm toán mã nguồn và khắc phục lỗ hổng P0, P1.
- `IMPLEMENTATION_REPORT.md`: Báo cáo chi tiết các kiến trúc đã hoàn thiện.
- `TEST_REPORT.md`: Kết quả kiểm thử thực tế các bộ test suite.
- `DEPLOYMENT_GUIDE.md`: Hướng dẫn triển khai Docker, Cloud Run và sao lưu.
- `MOBILE_RELEASE_CHECKLIST.md`: Checklist phát hành Android (.aab) và iOS (TestFlight).
- `DATABASE_MIGRATION.md`: Hướng dẫn chuyển đổi cơ sở dữ liệu lên PostgreSQL/Supabase.
- `SECURITY_NOTES.md`: Chính sách an toàn mật khẩu, rate limiting và quyền riêng tư.
- `migrations/001_production_schema.sql`: Toàn bộ DDL schema quan hệ cho production.
