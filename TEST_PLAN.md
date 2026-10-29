# KẾ HOẠCH VÀ KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (TEST PLAN & RESULTS)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.2.0 Commercial Release Candidate  
**Môi trường thực thi**: Linux Node.js v22.14.0 / TypeScript tsx  
**Lệnh thực thi**: `npm test` hoặc `npx tsx tests/security-suite.ts`  
**Trạng thái kiểm thử**: 15/15 PASS (100% ĐẠT) — 0 FAIL  

---

## 1. MA TRẬN 15 BÀI KIỂM THỬ VÀ KẾT QUẢ THỰC TẾ

| STT | Mã kiểm thử | Phạm vi | Mô tả kịch bản kiểm thử | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **TST-SEC-01** | System / Headers | Kiểm tra `/api/health` và các Security Headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) | `healthy`, driver `atomic_json_storage_with_backup`, headers đầy đủ | **PASS** |
| 2 | **TST-AUTH-01** | Auth / Cryptography | Đăng ký tài khoản mới `/api/auth/register`, kiểm tra băm mật mã scrypt + muối | Token cấp hợp lệ, mật khẩu băm scrypt với salt 16 bytes, không lộ hash/salt | **PASS** |
| 3 | **TST-SEC-02** | RBAC / Privilege | Tấn công leo thang quyền qua `PUT /api/auth/profile` bằng payload `{ role: 'super_admin', isPremium: true }` | Máy chủ lọc theo whitelist: giữ nguyên `role: user` và `isPremium: false` | **PASS** |
| 4 | **TST-AUTH-02** | Auth / Session | Đổi mật khẩu qua `/api/auth/change-password` với mật khẩu cũ hợp lệ và kiểm tra thu hồi phiên khác | Đổi mật khẩu thành công; toàn bộ phiên cũ bị xóa khỏi bộ nhớ | **PASS** |
| 5 | **TST-AUTH-03** | Auth / Account Reset | Yêu cầu đặt lại mật khẩu `/api/auth/reset-password` | Sinh token ngẫu nhiên 32-byte băm SHA-256; phản hồi an toàn chống User Enumeration | **PASS** |
| 6 | **TST-PAY-01** | Payment / Entitlements | Tài khoản thông thường gửi payload kích hoạt sandbox `/api/subscription/verify` | Trả về HTTP 403 Forbidden: "Chỉ quản trị viên mới có quyền sử dụng chế độ Sandbox QA Testing" | **PASS** |
| 7 | **TST-PAY-02** | Payment / StoreKit | Gửi giao dịch Apple/Google Store lên máy chủ production khi chưa cấu hình khóa chứng thực | Trả về HTTP 503: "Cổng thanh toán StoreKit/Google Play chưa được kích hoạt khóa chứng thực" | **PASS** |
| 8 | **TST-ADS-01** | Ads / Anti-Replay | Luồng nhận thưởng: Tạo nonce `/api/ads/start-session`, gửi nhận thưởng, sau đó gửi lại cùng nonce | Lần 1: Thành công; Lần 2: Chặn 403 Forbidden do nonce đã bị tiêu thụ; Tần suất 24h được thực thi | **PASS** |
| 9 | **TST-SES-01** | Data / Anti-Spam | Hoàn thành phiên thiền `/api/user/complete-session`: Gửi phút âm hoặc > 180 phút; Gửi liên tiếp 2 request trong 1s | Phút âm bị chặn 400; Phiên 15 phút hợp lệ được ghi nhận; Spam liên tiếp bị chặn 429 | **PASS** |
| 10 | **TST-AI-01** | AI / RAG Grounding | Gọi endpoint `/api/ai/recommend` và tra cứu kho kiến thức RAG cục bộ | Gợi ý chính xác bài "Thở Cân Bằng Box Breathing" cho trạng thái căng thẳng | **PASS** |
| 11 | **TST-WISH-01** | Community / Metta | Rút ngẫu nhiên lời chúc `/api/community/wishes/random` và gieo lời chúc mới `POST /api/community/wishes` | Rút thẻ thành công, gieo hạt lành mới thành công (Mã thẻ: wish-...) | **PASS** |
| 12 | **TST-PRESET-01**| Zen Spaces / Preset | Lưu không gian phối âm đa lớp `POST /api/user/sound-presets` và nạp qua mã chia sẻ | Đã tạo preset với mã chia sẻ, nạp lại qua mã chia sẻ chính xác | **PASS** |
| 13 | **TST-BELL-01** | Micro / Smart Bell | Cài đặt lịch chuông chánh niệm `PUT /api/user/mindfulness-bell` | Đã lưu lịch chuông: mỗi 45 phút, khung giờ 08:30-17:30, âm chuông: temple_bell | **PASS** |
| 14 | **TST-JOURN-01**| Journal / Trends | Lưu Voice Journal `POST /api/user/voice-journal` và lấy báo cáo `GET /api/user/emotional-trends` | Lưu Voice Journal thành công, Báo cáo cải thiện: 100%, Gợi ý bài buông xả chuẩn xác | **PASS** |
| 15 | **TST-FB-01** | AI / Quality Audit | Gửi đánh giá phản hồi chất lượng câu trả lời AI `POST /api/ai/feedback` | Tiếp nhận phản hồi đánh giá AI thành công (helpful) | **PASS** |

---

## 2. NHẬT KÝ CHẠY TEST THỰC TẾ
```
> react-example@0.0.0 test
> npx tsx tests/security-suite.ts

====================================================
KHỞI CHẠY BỘ KIỂM THỬ BẢO MẬT & KIẾN TRÚC AN TÂM
====================================================
[PASS] [P1] Kiểm tra Health Check & Security Headers: Health: healthy, Driver: atomic_json_storage_with_backup, Security Headers OK
[PASS] [P0] Đăng ký tài khoản với băm mật khẩu an toàn: Đăng ký thành công, token cấp hợp lệ, không lộ hash/salt.
[PASS] [P0] Chống leo thang đặc quyền qua cập nhật hồ sơ: Role giữ nguyên: user, isPremium giữ nguyên: false
[PASS] [P1] Đổi mật khẩu an toàn và thu hồi các phiên cũ: Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được thu hồi an toàn.
[PASS] [P1] Yêu cầu đặt lại mật khẩu với token băm mật mã học: Đã gửi yêu cầu đặt lại mật khẩu, phản hồi an toàn chống lộ tài khoản.
[PASS] [P0] Chặn người dùng thông thường tự mở Sandbox Premium trái phép: Đã chặn 403 Forbidden với nỗ lực tự kích hoạt sandbox từ user thường.
[PASS] [P0] Khóa cổng thanh toán production khi thiếu khóa chứng thực Store: Trả về 503 thông báo rõ ràng cần khóa chứng thực Store, không cấp Premium giả.
[PASS] [P0] Xác minh nonce và giới hạn 3 lần/24h của Quảng cáo thưởng: Cấp thưởng lần 1 thành công; Chặn 403 Forbidden khi gửi lại nonce cũ.
[PASS] [P1] Kiểm tra hợp lệ thời lượng phiên thiền và chống spam click: Chặn số phút bất hợp lý (400), ghi nhận phiên hợp lệ, chặn spam liên tiếp (429).
[PASS] [P1] Kiểm tra RAG Knowledge Retrieval & Rate Limiting AI: Gợi ý chánh niệm theo tâm trạng: "Thở Cân Bằng Box Breathing" (breathing)
[PASS] [P1] Cộng đồng Gieo Hạt Lành & Rút Thẻ Bình An: Rút thẻ thành công, gieo hạt lành mới thành công (Mã thẻ: wish-1793237893052)
[PASS] [P1] Immersive Zen Spaces: Lưu & Tải Preset Âm Thanh: Đã tạo preset với mã chia sẻ ANTAM-BO9F1, nạp lại qua mã thành công.
[PASS] [P1] Cài đặt & Kích hoạt Chuông Chánh Niệm (Mindfulness Bell): Đã lưu lịch chuông: mỗi 45 phút, khung giờ 08:30-17:30, âm chuông: temple_bell.
[PASS] [P1] Voice Journal & Báo cáo Xu hướng Cảm xúc (Emotional Trends): Lưu Voice Journal thành công, Báo cáo cải thiện: 100%, Gợi ý: "Thiền Buông Xả & Nhận Diện Hai Mũi Tên"
[PASS] [P1] Gửi đánh giá phản hồi Trợ Lý AI (AI Feedback): Tiếp nhận phản hồi đánh giá AI thành công: Cảm ơn bạn đã đóng góp giúp An Tâm AI hoàn thiện hơn.
====================================================
TỔNG KẾT KẾT QUẢ BỘ KIỂM THỬ AN TÂM:
TỔNG SỐ TEST: 15 | ĐẠT (PASS): 15 | THẤT BẠI (FAIL): 0
====================================================
```
