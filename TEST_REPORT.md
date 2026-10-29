# BÁO CÁO KIỂM THỬ THỰC TẾ (TEST REPORT)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.0 Production Ready  
**Ngày kiểm thử**: 28/10/2026  

---

## 1. KẾT QUẢ TỔNG QUAN

| Nhóm Kiểm Thử | Trạng Thái | Số Ca Kiểm Thử | Kết Quả |
|---|---|---|---|
| **TypeScript Type Checking** | PASS | Toàn bộ dự án | 0 lỗi compilation (`tsc --noEmit`) |
| **Production Build (Vite)** | PASS | `npm run build` | Thành công, tạo `dist/` |
| **Bảo Mật Xác Thực & Băm Mật Khẩu (P0)** | PASS | Automated Suite | Đạt 100% (scrypt, salt, không lộ hash) |
| **Chống Leo Thang Đặc Quyền (P0)** | PASS | Automated Suite | Đạt 100% (role & isPremium được bảo vệ) |
| **Khóa Sandbox Trái Phép Trong Production (P0)** | PASS | Automated Suite | Đạt 100% (chặn 403 Forbidden với user thường) |
| **Cổng Xác Thực StoreKit / Play Billing (P0)** | PASS | Automated Suite | Đạt 100% (503 khi thiếu khóa, chống cấp giả) |
| **Chống Gian Lận Quảng Cáo Thưởng (P0)** | PASS | Automated Suite | Đạt 100% (xác minh nonce, chặn replay 403, giới hạn 3 lần/24h) |
| **Đổi Mật Khẩu & Thu Hồi Phiên (P1)** | PASS | Automated Suite | Đạt 100% |
| **Đặt Lại Mật Khẩu Qua Email & Token (P1)** | PASS | Automated Suite | Đạt 100% (token SHA-256, 15 phút, dùng 1 lần) |
| **Chống Spam Phiên Thiền & Xác Thực Số Phút (P1)** | PASS | Automated Suite | Đạt 100% (chặn số phút âm/vượt ngưỡng 180, chặn spam < 15s) |
| **Health Check & Security Headers (P1)** | PASS | Automated Suite | Đạt 100% (nosniff, SAMEORIGIN, mode=block) |
| **RAG Knowledge Retrieval & Rate Limit AI (P1)** | PASS | Automated Suite | Đạt 100% (grounding theo tâm trạng, trích dẫn chuẩn) |

---

## 2. CHI TIẾT CÁC BÀI TEST CHÍNH

### 2.1. Authentication & Security Test Suite
- **Test 1.1: Đăng ký tài khoản mới hợp lệ**:
  - Gửi `POST /api/auth/register` với email và mật khẩu >= 6 ký tự.
  - Kết quả: Tạo tài khoản với `role: 'user'`, băm `scrypt` với muối ngẫu nhiên, sinh Bearer token 30 ngày. -> **PASS**
- **Test 1.2: Ngăn chặn đăng ký trùng email**:
  - Đăng ký lại cùng một email.
  - Kết quả: Trả về HTTP 409 Conflict với thông báo rõ ràng. -> **PASS**
- **Test 1.3: Chống tấn công Brute Force**:
  - Gửi hơn 8 yêu cầu đăng nhập sai mật khẩu liên tiếp.
  - Kết quả: Trả về HTTP 429 Too Many Requests và khóa tạm thời 15 phút. -> **PASS**
- **Test 1.4: Ngăn chặn leo thang đặc quyền qua cập nhật hồ sơ**:
  - Gửi `POST /api/auth/profile` kèm `{ role: 'super_admin', isPremium: true }`.
  - Kết quả: Máy chủ chỉ cập nhật `name` và `selectedGoals`, giữ nguyên quyền `user` và `isPremium: false`. -> **PASS**
- **Test 1.5: Đổi mật khẩu và thu hồi phiên**:
  - Gửi `POST /api/auth/change-password` với mật khẩu cũ chính xác và mật khẩu mới >= 6 ký tự.
  - Kết quả: Cấp muối mới, băm mật khẩu mới, thu hồi toàn bộ các phiên khác, ghi nhận audit log. -> **PASS**

### 2.2. In-App Purchase & Subscription Test Suite
- **Test 2.1: Yêu cầu thanh toán production khi chưa có chứng chỉ Store**:
  - Gửi `POST /api/subscription/verify` với `platform: 'production_store'`.
  - Kết quả: Trả về HTTP 503 thông báo cổng thanh toán đang chờ cấu hình khóa StoreKit/Google Play, không cấp Premium giả. -> **PASS**
- **Test 2.2: Luồng kiểm thử QA Sandbox**:
  - Gửi `POST /api/subscription/verify` với `platform: 'sandbox_test'`.
  - Kết quả: Cấp gói hội viên thử nghiệm có thời hạn với cờ `isSandbox: true`, ghi nhận audit log `SUBSCRIPTION_SANDBOX_TEST`. -> **PASS**
- **Test 2.3: Khôi phục gói mua hợp lệ**:
  - Gửi `POST /api/subscription/restore`.
  - Kết quả: Kiểm tra quyền sở hữu còn hạn trong cơ sở dữ liệu và khôi phục thành công. -> **PASS**

### 2.3. Rewarded Ad Anti-Abuse Test Suite
- **Test 3.1: Hoàn thành xem thông điệp nhận thưởng**:
  - Gửi `POST /api/ads/rewarded-complete`.
  - Kết quả: Cấp quyền thực hành 1 bài thiền trong 24 giờ. -> **PASS**
- **Test 3.2: Giới hạn tối đa 3 lần/24 giờ**:
  - Gọi lần thứ 4 trong vòng 24 giờ.
  - Kết quả: Trả về HTTP 429 với thông báo đã đạt giới hạn 3 lần/24h. -> **PASS**

### 2.4. Trợ Lý AI Phật Pháp & RAG Grounding
- **Test 4.1: Truy xuất tài liệu kinh điển phù hợp**:
  - Truy vấn về "Bát Nhã Tâm Kinh", "Tứ Diệu Đế", "hơi thở".
  - Kết quả: `retrieveKnowledgeChunks` trích xuất chính xác tài liệu từ `src/data/knowledgeBase.ts`. -> **PASS**
- **Test 4.2: Ép buộc trích dẫn nguồn**:
  - Phản hồi chứa trích dẫn chuẩn `[Nguồn: <Tài liệu>]`. -> **PASS**
- **Test 4.3: Gợi ý hành động ngữ cảnh**:
  - Người dùng nhắc đến mất ngủ -> gợi ý bài Thiền buông xả trước khi ngủ (`med-3`).
  - Người dùng lo lắng -> gợi ý bài Thở thư giãn 4-6 nhịp. -> **PASS**
- **Test 4.4: Giới hạn tần suất gọi AI**:
  - Giới hạn 40 câu hỏi/giờ cho mỗi người dùng được thực thi tại middleware `/api/ai/chat`. -> **PASS**

### 2.5. Cơ Sở Dữ Liệu & Toàn Vẹn Tệp
- **Test 5.1: Ghi dữ liệu và sao lưu kép**:
  - Khi lưu dữ liệu, hệ thống tự động cập nhật cả `database.json` và `database.backup.json`. -> **PASS**
- **Test 5.2: Xuất dữ liệu cá nhân (GDPR)**:
  - `GET /api/auth/export-data` trả về toàn bộ hồ sơ, nhật ký, cảm xúc, lịch sử yêu thích không kèm muối và mật khẩu băm. -> **PASS**
- **Test 5.3: Xóa vĩnh viễn tài khoản**:
  - `POST /api/auth/delete-account` xóa sạch toàn bộ hồ sơ, phiên, nhật ký, quyền lợi và mức sử dụng AI của người dùng. -> **PASS**
