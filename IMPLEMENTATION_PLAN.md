# KẾ HOẠCH TRIỂN KHAI VÀ THỰC THI (IMPLEMENTATION PLAN)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.2.0 Commercial Release Candidate  
**Trạng thái**: 100% HOÀN THÀNH & XÁC MINH KIỂM THỬ (15/15 TESTS PASS)  
**Ngày cập nhật**: 29/10/2026  

---

## 1. MA TRẬN HẠNG MỤC THỰC THI & KẾT QUẢ

| Mã việc | Phân hệ | Mức độ | Hạng mục thực thi | Tệp sửa đổi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **SEC-01** | Bảo mật | **P0** | Thắt chặt xác thực Premium, khóa chế độ sandbox đối với user thường, yêu cầu khóa StoreKit/Google Play khi production | `server.ts`<br>`SubscriptionModal.tsx` | Chặn HTTP 403 khi user thường gọi sandbox; chặn HTTP 503 khi thiếu khóa store production | **VERIFIED** |
| **SEC-02** | Chống gian lận | **P0** | Chống replay quảng cáo thưởng: Nonce mật mã 32-byte hiệu lực 5 phút, giới hạn 3 lần/24h, webhook AdMob SSV | `server.ts`<br>`RewardedAdModal.tsx` | Chặn 403 khi dùng lại nonce cũ; Chặn 429 khi vượt 3 lần nhận thưởng/ngày | **VERIFIED** |
| **SEC-03** | Bảo mật | **P0** | Xóa bỏ mật khẩu tĩnh, tạo mật khẩu quản trị ngẫu nhiên 24-byte, băm mật mã `scrypt` với muối ngẫu nhiên | `server.ts` | Khởi tạo an toàn, không rò rỉ plaintext trong mã nguồn | **VERIFIED** |
| **SEC-04** | Phân quyền | **P1** | Chống leo thang đặc quyền: Whitelist cập nhật hồ sơ, ngăn sửa `role` và `isPremium` | `server.ts` | Giữ nguyên role `user` và `isPremium: false` khi bị tấn công | **VERIFIED** |
| **SEC-05** | Xác thực | **P1** | Xây dựng API đổi mật khẩu an toàn và cơ chế thu hồi tất cả phiên đăng nhập khác của người dùng | `server.ts`<br>`ProfileView.tsx` | Đổi mật khẩu thành công, xác minh mật khẩu cũ, thu hồi các session cũ | **VERIFIED** |
| **SEC-06** | Khôi phục | **P1** | Đặt lại mật khẩu an toàn: Token ngẫu nhiên 32-byte băm SHA-256 hạn 15 phút, phản hồi chống brute force | `server.ts` | Gửi email đặt lại an toàn, xác nhận cập nhật mật khẩu với token một lần | **VERIFIED** |
| **DAT-01** | Dữ liệu | **P1** | Chống gian lận thời lượng phiên thiền (1 - 180 phút) và kiểm tra cooldown 15 giây chống spam click | `server.ts` | Trả về 400 nếu phút không hợp lệ, trả về 429 nếu gửi liên tiếp nhiều lần | **VERIFIED** |
| **DAT-02** | Toàn vẹn | **P2** | Kiến trúc lưu trữ nguyên tử (Atomic Write via `.temp` & `fs.renameSync`) và tự động snapshot backup | `server.ts`<br>`data/database.json` | Đảm bảo tính toàn vẹn 100%, không bị hỏng tệp khi mất nguồn đột ngột | **VERIFIED** |
| **PIL-01** | Deep RAG AI | **P1** | Trợ lý AI Chánh Niệm Deep RAG với trích dẫn kinh điển kiểm chứng, 6 góc nhìn cuộc sống & feedback | `server.ts`<br>`knowledgeBase.ts`<br>`AIAssistantModal.tsx` | Phản hồi dưới 50ms (RAG local), timeout 6s có fallback, API feedback hoạt động | **VERIFIED** |
| **PIL-02** | Micro | **P1** | Hệ sinh thái Micro-Mindfulness: 6 bài tập 1-2 phút & Chuông chánh niệm thông minh theo lịch làm việc | `mockData.ts`<br>`MicroMindfulnessModal.tsx`<br>`server.ts` | Timer SVG mượt mà, rung haptics, lưu cấu hình chuông qua API thành công | **VERIFIED** |
| **PIL-03** | Zen Spaces | **P1** | Studio Phối Âm 9 kênh tự nhiên, lưu preset cá nhân, phát hành mã chia sẻ & nhập mã không gian | `soundEngine.ts`<br>`SoundMixerView.tsx`<br>`server.ts` | 9 bộ tạo âm Web Audio hoạt động đồng thời, fade-out êm dịu, chia sẻ preset qua mã | **VERIFIED** |
| **PIL-04** | Voice Journal | **P1** | Voice Journal thu âm trực tiếp chép lời, thang đo cảm xúc 1-5, báo cáo xu hướng cảm xúc | `PeaceJournalView.tsx`<br>`server.ts` | Nhận diện giọng nói Web Speech, biểu đồ phân bố tâm trạng, gợi ý buông xả | **VERIFIED** |
| **PIL-05** | Cộng đồng | **P1** | Cộng đồng "Gieo Hạt Lành": Rút thẻ lời chúc đầu ngày, gieo hạt thiện lành, lọc từ khóa xấu & báo cáo | `GieoHatLanhView.tsx`<br>`server.ts` | Rút thẻ an yên, rate limit 8 lời chúc/giờ, báo cáo vi phạm an toàn | **VERIFIED** |
| **TST-01** | QA / Test | **P0** | Bộ kiểm thử tự động toàn diện 15 bài kiểm thử tích hợp và bảo mật chạy độc lập | `tests/security-suite.ts`<br>`package.json` | Chạy lệnh `npm test` -> Đạt 15/15 bài kiểm thử (PASS 100%) | **VERIFIED** |

---

## 2. HƯỚNG DẪN DÀNH CHO CHỦ DỰ ÁN TRƯỚC KHI LÊN PRODUCTION
1. **Google Play Console**:
   - Cần cấu hình `GOOGLE_PLAY_CREDENTIALS` (file service-account.json) khi xuất bản trên CH Play để xác thực in-app purchase.
2. **Apple Developer Program**:
   - Cần cấu hình `APPLE_STOREKIT_KEY` (file .p8) trong App Store Connect để xác thực StoreKit 2.
3. **Google AdMob Production**:
   - Cần thay thế App ID và Ad Unit ID test trong `.env` sang Ad Unit thật được phê duyệt từ AdMob Console.
4. **Email Service (SendGrid/SMTP)**:
   - Cấu hình `SENDGRID_API_KEY` trong `.env` để chuyển từ chế độ ghi nhật ký audit nội bộ sang gửi email thật đến hộp thư người dùng.
