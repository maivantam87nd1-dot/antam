# BÁO CÁO CÁC NÂNG CẤP VÀ HOÀN THIỆN (IMPLEMENTATION REPORT)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.0 Production Ready  
**Ngày cập nhật**: 28/10/2026  

---

## 1. CÁC HẠNG MỤC NÂNG CẤP CHÍNH

### 1.1. Hệ thống Quản trị & Bảo Mật (Security & Auth Hardening)
- **Thuật toán băm mật khẩu**: `scrypt` với muối ngẫu nhiên (salt 16-bytes), tạo chuỗi băm 64-bytes an toàn trước tấn công dictionary và rainbow table.
- **Phân quyền vai trò nghiêm ngặt**:
  - `super_admin`: Toàn quyền xem thống kê, quản trị nội dung CMS, kích hoạt sao lưu dữ liệu.
  - `admin`: Quản lý nội dung và người dùng.
  - `user`: Người dùng chính thức có xác thực mật khẩu.
  - `guest`: Tài khoản khách trải nghiệm nhanh không bắt buộc đăng ký.
- **Chống leo thang đặc quyền**: API `/api/auth/profile` lọc whitelist chặt chẽ, loại bỏ hoàn toàn khả năng can thiệp `role` và `isPremium` từ người dùng.
- **Đổi mật khẩu & Thu hồi phiên**: Endpoint `/api/auth/change-password` xác minh mật khẩu cũ, cấp salt mới, băm mật khẩu mới và hủy toàn bộ phiên làm việc khác để phòng chống đánh cắp phiên.
- **Chống tấn công Brute Force**: Triển khai `checkRateLimit` với cửa sổ trượt 15 phút cho đăng nhập và đăng ký.

### 1.2. Trợ Lý AI Phật Pháp & RAG Grounding
- **Mô hình**: Google Gemini 2.5/Flash thông qua `@google/genai` TypeScript SDK.
- **RAG Engine (`src/data/knowledgeBase.ts`)**:
  - 10 khối kiến thức Phật học kinh điển đã được kiểm duyệt: Tứ Diệu Đế, Bát Chánh Đạo, Bát Nhã Tâm Kinh, Kinh Quán Niệm Hơi Thở (Ānāpānasati), Chú Đại Bi, Kinh Từ Bi (Mettā Sutta), Tam Pháp Ấn, Kinh Pháp Cú, Kinh Phước Đức (Maṅgala Sutta), Thiền Chỉ - Quán.
  - Thuật toán trích xuất ngữ nghĩa và từ khóa đa tầng tính điểm mức độ phù hợp.
- **Định dạng trích dẫn**: Ép buộc AI trích dẫn nguồn theo chuẩn `[Nguồn: <Tên tài liệu>]`.
- **Hành động ngữ cảnh**: AI tự động gợi ý hành động cụ thể trong ứng dụng (bài tập thở khi căng thẳng, thiền ngủ khi mệt mỏi, đọc kinh điển khi hỏi giáo lý).
- **Bộ lọc an toàn**: Không chẩn đoán bệnh lý, khuyến khích tìm kiếm trợ giúp khi có dấu hiệu khủng hoảng tinh thần.
- **Giải thích câu kinh (`/api/ai/explain-scripture`)**: 3 chế độ (Dễ hiểu, Chuyên sâu, Ứng dụng đời sống).

### 1.3. Mô hình Kinh doanh Freemium & Thanh toán Minh bạch
- **Trải nghiệm 3 tầng**:
  1. *Khách (Guest)*: Trải nghiệm thiền cơ bản, tập thở, nghe âm thanh, đọc kinh điển, 40 câu hỏi AI/giờ.
  2. *Miễn phí (Free Registered)*: Đồng bộ lịch sử, theo dõi chuỗi ngày thiền, lưu nhật ký cá nhân và đồng bộ đa thiết bị.
  3. *Cao cấp (Premium)*: Không giới hạn bài thiền nâng cao, âm thanh đa tầng Sound Mixer, tải offline và hỗ trợ chuyên sâu.
- **Xác thực thanh toán thực tế**:
  - Yêu cầu cấu hình StoreKit / Google Play Billing phía server khi ở môi trường production.
  - Cung cấp chế độ kiểm thử QA Sandbox (`platform: 'sandbox_test'`) ghi log kiểm toán rõ ràng.
- **Quảng cáo nhận thưởng (Rewarded Ads)**:
  - Cho phép người dùng xem thông điệp đồng hành 15 giây để mở khóa 1 bài thiền trong 24 giờ.
  - Giới hạn tối đa 3 lần/24h và kiểm soát chống lạm dụng.
- **Góc An Tâm (Affiliate Minh Bạch)**:
  - Giới thiệu vật phẩm thiền (bồ đoàn vỏ đậu, chuông xoay Tây Tạng, trầm hương, sách Thiền sư Thích Nhất Hạnh).
  - Tuyên bố miễn trừ và minh bạch hoa hồng rõ ràng.

### 1.4. Bộ máy Âm thanh Thiền (Sound Engine)
- **Web Audio API nguyên bản**: Tổng hợp tự nhiên không cần tệp mp3 nặng:
  - Chuông xoay Tây Tạng 216Hz, 288Hz, 432Hz với chuỗi họa âm sinh động.
  - Tiếng mưa rơi liên tục bằng Pink Noise kết hợp Biquad Lowpass filter.
  - Tiếng suối reo róc rách với LFO điều biến tần số trung tâm.
  - Sóng não Theta 6Hz (216Hz - 222Hz) cho trạng thái thiền định sâu.
- **Hẹn giờ tắt thông minh**: Giảm dần âm lượng trong 30 giây cuối trước khi tắt hẳn để không làm giật mình khi người dùng đã ngủ say.
- **Tích hợp MediaSession**: Điều khiển phát/dừng trên màn hình khóa điện thoại và thông báo hệ thống.
- **Haptic Vibration**: Rung phản hồi nhẹ nhàng khi chuyển nhịp hít vào/thở ra và điểm chuông.

---

## 2. CÁC TỆP ĐƯỢC CHỈNH SỬA VÀ TẠO MỚI
1. `server.ts`: Hardening bảo mật, rate limiting, đổi mật khẩu, backup snapshot, kiểm thử sandbox, phân quyền admin.
2. `src/data/mockData.ts`: Chuẩn hóa đường dẫn hình ảnh sang `/assets/images/...`.
3. `src/data/affiliateOffers.ts`: Chuẩn hóa hình ảnh và liên kết vật phẩm chánh niệm.
4. `src/components/profile/ProfileView.tsx`: Thêm giao diện đổi mật khẩu an toàn, thông báo GDPR, xuất/xóa dữ liệu.
5. `src/components/subscription/SubscriptionModal.tsx`: Hỗ trợ luồng kiểm thử QA Sandbox và xác thực production.
6. `src/components/audio/FullPlayerModal.tsx` & `MiniPlayer.tsx`: Cập nhật hình ảnh và liên kết bộ phát.
7. `public/manifest.json`: Cập nhật icon và theme color `#101D35`.
8. `.env.example`: Tài liệu hóa đầy đủ các biến cấu hình.
