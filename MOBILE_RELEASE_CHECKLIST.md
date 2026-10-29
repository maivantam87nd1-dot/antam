# CHECKLIST PHÁT HÀNH DI ĐỘNG (MOBILE RELEASE CHECKLIST)
**Ứng dụng**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**App ID**: `app.antam.mindfulness`  
**Nền tảng**: Android (Google Play) & iOS (Apple App Store)

---

## 1. CẤU HÌNH NỀN TẢNG CHUNG (CAPACITOR & PWA)
- [x] Tệp cấu hình `capacitor.config.ts` chứa `appId: 'app.antam.mindfulness'` và `appName: 'AN TÂM'`.
- [x] Web manifest `public/manifest.json` đầy đủ tên, icon 512x512 maskable, màu chủ đạo `#101D35`.
- [x] Hỗ trợ Safe Area insets trên iOS và Android cạnh-đến-cạnh (edge-to-edge).
- [x] Trình phát âm thanh tích hợp `navigator.mediaSession` để điều khiển phát/dừng trên màn hình khóa và tai nghe Bluetooth.
- [x] Rung phản hồi xúc giác (Haptic Feedback) qua API rung nhịp nhàng phù hợp cho bài tập thở và chuông thiền.

---

## 2. CHECKLIST PHÁT HÀNH GOOGLE PLAY (ANDROID)
- [ ] **Application ID**: `app.antam.mindfulness`.
- [ ] **Min SDK**: API Level 24 (Android 7.0) trở lên; **Target SDK**: API Level 34 (Android 14) hoặc mới nhất theo quy định Google Play.
- [ ] **Khóa ký ứng dụng (Keystore Signing)**:
  - Tạo keystore bản phát hành: `keytool -genkey -v -keystore antam-release.jks -alias antam -keyalg RSA -keysize 2048 -validity 10000`.
  - Cấu hình chữ ký trong `android/app/build.gradle`.
- [ ] **Đóng gói Android App Bundle (.aab)**:
  - Thực thi: `npx cap sync android` và mở Android Studio để tạo tệp `.aab`.
- [ ] **Khai báo An Toàn Dữ Liệu (Data Safety Declaration)**:
  - Dữ liệu thu thập: Địa chỉ email (tài khoản), nhật ký tâm trạng (lưu trữ tùy chọn), tương tác ứng dụng (analytics).
  - Không bán dữ liệu người dùng cho bên thứ ba.
  - Hỗ trợ cơ chế xóa tài khoản trực tiếp trong ứng dụng (`/api/auth/delete-account`).
- [ ] **Google Play Billing**:
  - Đăng ký sản phẩm trong Google Play Console: gói tháng (`antam_premium_monthly`) và gói năm (`antam_premium_yearly`).
  - Cung cấp Service Account JSON cho server để xác thực biên lai.

---

## 3. CHECKLIST PHÁT HÀNH APPLE APP STORE (IOS)
- [ ] **Bundle Identifier**: `app.antam.mindfulness`.
- [ ] **Chứng chỉ ký (Apple Developer Provisioning Profile & Certificates)**:
  - Cấu hình Distribution Certificate và App Store Provisioning Profile trong Apple Developer Portal.
- [ ] **Quyền năng ứng dụng (Capabilities)**:
  - `Audio, AirPlay, and Picture in Picture` (Background Audio playback).
  - `Push Notifications` (Thông báo chuông chánh niệm).
- [ ] **Apple In-App Purchase (StoreKit 2)**:
  - Khai báo Auto-Renewable Subscription trong App Store Connect: gói tháng và gói năm.
  - Hỗ trợ nút "Khôi phục giao dịch mua" (Restore Purchases) nổi bật trên giao diện thanh toán (đã triển khai).
- [ ] **Quy định Quyền Riêng Tư & Xóa Tài Khoản (Guideline 5.1.1)**:
  - Bắt buộc có chức năng xóa tài khoản hoàn toàn ngay trong ứng dụng (đã triển khai tại trang Cá Nhân).
  - Khai báo Privacy Manifest (`PrivacyInfo.xcprivacy`).
- [ ] **Đóng gói iOS Archive**:
  - Thực thi: `npx cap sync ios` và mở Xcode để Archive bản phát hành lên TestFlight.

---

## 4. QUY TRÌNH KIỂM THỬ XÉT DUYỆT (REVIEW PREPARATION)
1. Cung cấp tài khoản thử nghiệm dành cho Reviewer:
   - Email: `reviewer@antam.app`
   - Quyền: Có thể kích hoạt Sandbox Testing Mode để kiểm tra toàn bộ tính năng Premium.
2. Cung cấp đường dẫn Chính sách quyền riêng tư và Điều khoản dịch vụ công khai.
3. Đảm bảo tuyên bố miễn trừ y tế rõ ràng: Ứng dụng chánh niệm và thư giãn tinh thần, không thay thế chẩn đoán y khoa.
