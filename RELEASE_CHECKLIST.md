# DANH SÁCH KIỂM TRA ĐIỀU KIỆN PHÁT HÀNH DI ĐỘNG (RELEASE CHECKLIST)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.3.0 (Market Dominance & Innovative Mindfulness Release)  
**Mục tiêu**: Phát hành Google Play Store (Android) & Apple App Store (iOS)  
**Tình trạng đánh giá**: **CONDITIONAL GO (Sẵn sàng mã nguồn 100% — Cần tài khoản nhà phát triển & chứng chỉ ký)**  

---

## 1. TIÊU CHÍ MÃ NGUỒN & KỸ THUẬT (TECHNICAL READINESS)
- [x] **Biên dịch TypeScript không lỗi**: Đã chạy `tsc --noEmit` đạt 0 lỗi (TypeScript 7 strict).
- [x] **Linting Codebase**: Kiểm tra cú pháp, import và kiểu dữ liệu hoàn toàn hợp lệ.
- [x] **Đóng gói Production (Vite Build)**: Chạy `npm run build` thành công, sinh thư mục `dist/` đầy đủ bundle JS, CSS và assets.
- [x] **Kiểm thử Tự động Chuyên sâu**: Bộ kiểm thử `tests/security-suite.ts` đạt **20/20 PASS (100%)**, bao phủ toàn bộ 5 trụ cột và 4 tính năng đột phá thị trường.
- [x] **"Góc Nhìn Tỉnh Thức" (Mindful Lens)**: AI Camera nhận diện mức độ căng thẳng (Stress Level Index 1-100) qua phân tích cử động khuôn mặt, nhịp chớp mắt và nhịp tim ước tính, tự động gợi ý khoảng lặng hoặc chuông chùa 108Hz.
- [x] **"Vườn Tâm An" (Gamification Chánh Niệm)**: Nuôi dưỡng sen nở và cây Bồ Đề bằng các giọt nước chánh niệm tích lũy từ phút thiền và nhật ký biết ơn, động lực tâm lý nhân văn không áp lực streak tiêu cực.
- [x] **"Sóng Não 3D & Binaural Beats Tần Số Kép"**: Trình tạo sóng não Delta (2.5Hz), Theta (6Hz), Alpha (10Hz), Gamma (40Hz) kết hợp Spatial Audio Orbit Panner xoay vòng 360° quanh đầu.
- [x] **"Chia Sẻ Hạt Lành Ẩn Danh & Thả Đóa Sen Lành"**: Bảng tin từ bi không bình luận độc hại, người dùng gửi gắm lời nguyện và tặng hoa sen nâng đỡ tinh thần nhau (`/api/community/wishes/:id/bless`).
- [x] **Đồng Bộ Ngoại Tuyến Hàng Loạt (Offline Batch Sync Engine)**: Queue cục bộ lưu trữ phiên thiền, nhật ký và hành động tưới cây khi mất mạng, tự động đẩy lên server qua `/api/sync/offline-batch` khi có internet trở lại.
- [x] **Cá Nhân Hóa Thời Gian Thực (Smart AI Recommendations)**: Trợ lý AI tự động phân tích bối cảnh thời gian trong ngày và trạng thái tâm hồn để đưa ra 3 đề xuất chánh niệm chuẩn xác trên đầu trang chủ.
- [x] **Lưu trữ Nguyên tử**: Hệ thống tệp JSON có cơ chế ghi `.temp` và snapshot sao lưu tự động `data/database.backup.json`.
- [x] **Sẵn sàng CSDL PostgreSQL**: Tệp DDL `migrations/001_production_schema.sql` đã cập nhật bảng `zen_garden_plants`, `zen_garden_badges`, `mindful_lens_logs`, `community_compassion_wishes`.
- [x] **Capacitor Configuration**: Tệp `capacitor.config.ts` đã cấu hình `appId: 'app.antam.mindfulness'`, `appName: 'AN TÂM'`, thư mục web `dist`.
- [x] **Tài nguyên Di động**: Thư mục hình ảnh chuẩn hóa tại `public/assets/images/`, manifest PWA tại `public/manifest.json`.

---

## 2. TIÊU CHÍ BẢO MẬT & CHỐNG GIAN LẬN (SECURITY HARDENING)
- [x] **Không lộ Secret**: Mật khẩu admin động, khóa API lưu trong biến môi trường máy chủ `.env`, không nhúng secret vào frontend.
- [x] **Bảo vệ Thanh toán Premium**: Chặn user thường kích hoạt sandbox (403), chặn cấp Premium giả khi thiếu khóa store (503).
- [x] **Bảo vệ Quảng cáo thưởng (Rewarded Ads)**: Cơ chế nonce mật mã học 32-byte dùng một lần (chống replay attack), giới hạn 3 lần/24h.
- [x] **Chống Leo thang Đặc quyền (Privilege Escalation)**: Whitelist cập nhật hồ sơ, ngăn chặn ghi đè `role` hoặc `isPremium`.
- [x] **Chống Dò quét Mật khẩu (Brute Force)**: Sliding-window rate limit tối đa 8 lần đăng nhập sai/15 phút.
- [x] **Đổi Mật khẩu & Thu hồi Phiên**: Xác thực mật khẩu cũ bằng `scrypt`, thu hồi toàn bộ token phiên đăng nhập cũ trên các thiết bị khác.
- [x] **Xóa Dữ liệu Cá nhân & Tài khoản (GDPR / Apple Guideline 5.1.1(v))**: Đã có `POST /api/auth/delete-account` và `GET /api/auth/export-data` hoạt động chuẩn xác.

---

## 3. CÁC BƯỚC ĐÓNG GÓI NATIVE TRÊN THIẾT BỊ THỰC TẾ

### Quy trình đóng gói Android (Google Play Store)
1. Cài đặt Android Studio và Android SDK (API 34+).
2. Chạy lệnh đồng bộ mã nguồn sang thư mục native:
   ```bash
   npm run build
   npx cap add android
   npx cap sync android
   ```
3. Mở dự án trong Android Studio:
   ```bash
   npx cap open android
   ```
4. Tạo tệp khóa ký ứng dụng (Keystore):
   ```bash
   keytool -genkey -v -keystore an-tam-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias an-tam-key
   ```
5. Cấu hình `android/app/build.gradle` với `signingConfigs` và thực hiện:
   **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)**.
6. Tải file `.aab` lên Google Play Console (mục Closed Testing hoặc Production Track).

### Quy trình đóng gói iOS (Apple App Store)
1. Yêu cầu máy tính chạy macOS và cài đặt Xcode 15+.
2. Chạy lệnh đồng bộ mã nguồn sang iOS:
   ```bash
   npm run build
   npx cap add ios
   npx cap sync ios
   ```
3. Mở dự án trong Xcode:
   ```bash
   npx cap open ios
   ```
4. Cấu hình Signing & Capabilities trong Xcode: Chọn Team Apple Developer Account, Bundle Identifier `com.antam.meditation`.
5. Bật Capabilities: Background Modes (Audio, AirPlay, and Picture in Picture) để phát âm thanh thiền khi tắt màn hình.
6. Thực hiện **Product > Archive**, sau đó tải bản build lên App Store Connect qua TestFlight.

---

## 4. DANH MỤC THÔNG TIN CẦN THIẾT CHO VIỆC PHÊ DUYỆT STORE (COMPLIANCE)
- [ ] **Chính sách Quyền riêng tư (Privacy Policy URL)**: Cần host công khai URL trang chính sách bảo mật (đã có nội dung chi tiết trong app).
- [ ] **Điều khoản Sử dụng (Terms of Use / EULA)**: Đạt chuẩn Apple Standard EULA cho các gói đăng ký định kỳ (Auto-Renewable Subscriptions).
- [ ] **Tài khoản Kiểm thử dành cho App Review (Reviewer Demo Credentials)**:
  - Email: `demo.reviewer@antam.app`
  - Mật khẩu: Cấu hình sẵn tài khoản có trạng thái người dùng chuẩn để Apple/Google Reviewer đăng nhập kiểm tra toàn bộ tính năng.
- [ ] **Cấu hình Webhook Thông báo Máy chủ (Server Notifications)**:
  - Apple App Store Server Notifications V2 URL trỏ về backend `https://your-domain.com/api/subscription/apple-webhook`.
  - Google Play Real-time Developer Notifications (RTDN via Google Cloud Pub/Sub) trỏ về backend `https://your-domain.com/api/subscription/google-webhook`.
