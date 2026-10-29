# TÀI LIỆU HƯỚNG DẪN BẢO MẬT (SECURITY NOTES)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.0 Production Hardened  

---

## 1. NGUYÊN TẮC BẢO MẬT CỐT LÕI

### 1.1. Bảo Vệ Mật Khẩu & Xác Thực
- **Mật khẩu người dùng**: Được băm bằng thuật toán `scrypt` tiêu chuẩn mật mã học kết hợp muối ngẫu nhiên (salt 16-bytes).
- **Mật khẩu quản trị viên ban đầu**: Không bao giờ được hardcode tĩnh. Khởi tạo ngẫu nhiên hoặc truyền qua biến môi trường an toàn `ADMIN_INITIAL_PASSWORD`.
- **Phiên làm việc (Session Tokens)**: Tạo bằng chuỗi ngẫu nhiên 32-bytes mật mã học (`crypto.randomBytes(32)`), lưu kèm thời hạn hiệu lực (30 ngày cho tài khoản chính thức, 14 ngày cho khách) và kiểm tra chặt chẽ qua middleware `requireAuth`.
- **Thu hồi phiên khi đổi mật khẩu**: Khi người dùng đổi mật khẩu, hệ thống tự động hủy toàn bộ các phiên làm việc đang hoạt động khác nhằm ngăn ngừa nguy cơ tài khoản bị chiếm đoạt.

### 1.2. Chống Tấn Công Brute Force (Rate Limiting)
- Triển khai thuật toán trượt thời gian tại `checkRateLimit`:
  - `POST /api/auth/login`: Tối đa 8 lần thử sai trong 15 phút.
  - `POST /api/auth/register`: Tối đa 8 lần đăng ký từ cùng địa chỉ IP trong 15 phút.
  - `POST /api/auth/reset-password`: Tối đa 5 lần yêu cầu trong 15 phút.
  - `POST /api/ai/chat`: Tối đa 40 yêu cầu/giờ cho mỗi người dùng nhằm chống lạm dụng token API.

### 1.3. Chống Leo Thang Đặc Quyền (Privilege Escalation Defense)
- API `/api/auth/profile` lọc whitelist tuyệt đối.
- Người dùng chỉ được cập nhật các trường giao diện (`name`, `selectedGoals`).
- Bất kỳ nỗ lực nào nhằm gửi kèm `role: 'super_admin'` hoặc `isPremium: true` đều bị loại bỏ ở tầng máy chủ.
- Mọi endpoint quản trị (`/api/admin/*`) đều được bảo vệ bởi middleware kép: `requireAuth` và `requireAdmin`.

### 1.4. Bảo Vệ Quyền Riêng Tư (Privacy & GDPR)
- **Quyền được lãng quên (Right to be Forgotten)**: Người dùng có thể xóa vĩnh viễn toàn bộ tài khoản và nhật ký bằng `POST /api/auth/delete-account`.
- **Quyền di chuyển dữ liệu (Data Portability)**: Người dùng có thể tải về toàn bộ dữ liệu cá nhân (hồ sơ, nhật ký, cảm xúc, danh sách yêu thích) dưới định dạng JSON chuẩn qua `GET /api/auth/export-data`.
- **Bảo vệ quyền riêng tư nhật ký**: Nội dung nhật ký và cảm xúc được cô lập chặt chẽ theo `userId` xác thực từ token; không người dùng nào có thể xem hoặc can thiệp dữ liệu của người khác.

### 1.5. An Toàn Trợ Lý AI (AI Safety & Responsible AI)
- Khóa bí mật `GEMINI_API_KEY` chỉ lưu ở phía máy chủ, không bao giờ nhúng vào frontend bundle.
- AI không đưa ra chẩn đoán hay thay thế phác đồ điều trị y khoa.
- AI được tích hợp chỉ dẫn đồng cảm, ưu tiên hướng dẫn liên hệ đường dây hỗ trợ tâm lý khẩn cấp khi phát hiện trạng thái bế tắc tiêu cực.
