# NHẬT KÝ THAY ĐỔI VÀ NÂNG CẤP (CHANGELOG)
Tất cả các thay đổi quan trọng đối với dự án **AN TÂM — Thiền Định & Phật Pháp Chánh Niệm** được ghi nhận tại đây theo chuẩn Semantic Versioning.

---

## [v4.3.0] - 2026-10-29
### Phiên bản Đột Phá Thị Trường & Chánh Niệm Toàn Diện (Market Dominance Release)

#### 4 Tính Năng Đột Phá Khác Biệt Thị Trường:
1. **"Góc Nhìn Tỉnh Thức" (Mindful Lens - AI Camera Nhận Diện Trạng Thái)**
   - Phân tích độ căng cơ mặt, nhịp chớp mắt và ước lượng nhịp tim (BPM) thông qua camera trước trực tiếp trên trình duyệt (bảo mật tuyệt đối, không lưu trữ video).
   - Tự động tính toán Chỉ số Căng Thẳng (Stress Level Index 1-100) và đối chiếu tuệ giác Phật học (Kinh Hai Mũi Tên, Kinh Pháp Cú, Thiền Sư Thích Nhất Hạnh).
   - Đề xuất khoảng lặng tức thì (60s xả áp lực) hoặc thỉnh 3 tiếng Đại Hồng Chung 108Hz định tâm.
   - Hỗ trợ thanh trượt tự đánh giá bảo đảm riêng tư khi người dùng không muốn bật camera.

2. **"Vườn Tâm An" (Gamification Chánh Niệm - Sen Nở & Trồng Cây Bồ Đề)**
   - Mỗi phút thiền định hoặc bài nhật ký biết ơn tự động tích lũy thành "Giọt nước chánh niệm" mát lành.
   - Chăm sóc và quan sát các giai đoạn sinh trưởng của mầm cây: Hạt mầm -> Đâm chồi -> Búp sen -> Sen nở ngát hương -> Giác ngộ viên mãn.
   - Cơ chế tạo động lực tích cực, loại bỏ áp lực trừng phạt chuỗi ngày streak tiêu cực.
   - Hệ thống huy hiệu chánh niệm: *Mầm Thiện Khởi Sanh*, *Đóa Sen Ngát Hương*, *Bóng Mát Bồ Đề*, *Tâm Bất Biến*.
   - Cho phép gieo thêm các giống cây thiền môn: Sen hồng, Cây Bồ Đề, Rừng Trúc, Hoa Nhài.

3. **"Không Gian Thiền Tương Tác Âm Thanh 3D / Dual-Carrier Binaural Beats"**
   - Trình tổng hợp sóng não 2 tai: Delta (2.5Hz - Ngủ sâu tái tạo), Theta (6Hz - Thiền sâu tĩnh giác), Alpha (10Hz - Thư giãn sáng tạo), Gamma (40Hz - Minh triết sáng suốt).
   - Tần số sóng gốc linh hoạt: 216Hz (Âm thiêng Om), 432Hz (Tần số tự nhiên), 528Hz (Tần số chuyển hóa).
   - Bộ xoay âm thanh vòm 360° (Spatial Audio Orbit Panner) chuyển động nhẹ nhàng quanh luân xa vương miện khi đeo tai nghe stereo.

4. **"Chia Sẻ Hạt Lành Ẩn Danh & Thả Đóa Sen Từ Bi" (Anonymous Compassion Feed & Lotus Blessing)**
   - Mở rộng bảng tin cộng đồng: Hoàn toàn không có bình luận phán xét hay độc hại.
   - Nút "Tặng một đóa sen lành 🪷" (`POST /api/community/wishes/:id/bless`) kèm tiếng chuông xoay thanh tịnh và tăng biến đếm số sen từ bi nâng đỡ tinh thần người gửi.

#### Nâng Cấp Kiến Trúc & Vận Hành:
- **Offline Batch Sync Engine (`/api/sync/offline-batch`)**:
  - Hàng đợi cục bộ tự động lưu giữ phiên thiền, nhật ký và hành động tưới cây khi mất mạng.
  - Tự động kích hoạt đồng bộ khi thiết bị kết nối mạng trở lại (`navigator.onLine`).
- **Cá Nhân Hóa Thời Gian Thực (`/api/user/smart-recommendations`)**:
  - AI tự động đánh giá thời gian trong ngày và trạng thái tâm hồn gần nhất để hiển thị thẻ đề xuất chánh niệm chuẩn xác trên đầu trang chủ.
- **Xác Thực Biên Lai Store Server-to-Server (`/api/subscription/verify-store-receipt`)**:
  - Ngăn chặn hoàn toàn việc client tự ý giả mạo trạng thái Premium; tích hợp luồng kiểm tra khóa App Store Server API / Google Play RTDN.
- **Mở rộng Schema CSDL PostgreSQL**:
  - Thêm bảng `zen_garden_plants`, `zen_garden_badges`, `mindful_lens_logs`, `community_compassion_wishes` vào `migrations/001_production_schema.sql`.
- **Bộ Kiểm Thử Tự Động**: Mở rộng từ 15 lên **20/20 test kịch bản tự động (100% PASS)**.

---

## [v4.2.0] - 2026-10-29
### Phiên bản Ứng viên Phát hành Thương mại (Commercial Release Candidate)

#### Đã thêm & Nâng cấp (5 Trụ cột Chánh niệm Chuyên sâu):
1. **Trụ cột 1: Trợ lý Pháp thoại Chuyên sâu (Deep RAG Buddhist AI)**
   - Mở rộng kho tàng kinh điển (`src/data/knowledgeBase.ts`) với các trích dẫn nguyên văn đối chiếu Pali - Việt: Kinh Kim Cương (Vô ngã tướng), Kinh Pháp Cú (Phẩm Song Yếu & Phẩm Tâm), Thích Nhất Hạnh (Chuyển hóa cơn giận & Chánh niệm tỉnh thức), Kinh Hai Mũi Tên (Sallatha Sutta), và Kinh Giáo Thọ Thi Ca La Việt (Sigalovada Sutta - cân bằng công việc gia đình).
   - 6 chủ đề tham vấn đời sống: *Áp lực công việc*, *Chuyển hóa nóng giận*, *Mất mát chia ly*, *Mất ngủ lo âu*, *Quan hệ gia đình*, *Tìm kiếm bình an nội tâm*.
   - Rút ngắn timeout AI từ 25s xuống 6s với cơ chế RAG local fallback trả về các đoạn kinh tương ứng khi mạng gián đoạn.
   - Thêm API đánh giá chất lượng câu trả lời của AI: `POST /api/ai/feedback`.

2. **Trụ cột 2: Hệ sinh thái Vi chánh niệm (Micro-Mindfulness Ecosystem)**
   - Cung cấp 6 bài tập 1–2 phút cho người bận rộn: *Xả stress 60 giây*, *Hạ nhiệt cơn giận*, *Định tâm trước cuộc họp*, *Thư giãn mắt & vai gáy*, *Trở về với hiện tại*, *Buông bỏ âu lo trước khi ngủ*.
   - Đồng hồ đếm ngược SVG vòng tròn mượt mà, hỗ trợ phản hồi rung haptic xúc giác.
   - Tính năng **Chuông Chánh niệm Thông minh**: thiết lập nhắc nhở chánh niệm định kỳ mỗi 30/60/120 phút qua `GET /api/user/mindfulness-bell` và `PUT /api/user/mindfulness-bell`.

3. **Trụ cột 3: Không gian Thiền định Đa tầng (Immersive Zen Spaces)**
   - Nâng cấp bộ tổng hợp Web Audio từ 4 lên 9 kênh độc lập không phụ thuộc file âm thanh mạng:
     - Chuông xoay Tây Tạng (Tibetan Singing Bowl)
     - Đại hồng chung 108Hz (Deep Temple Bell)
     - Tiếng Mõ gỗ trầm ấm (Wooden Bell)
     - Chuông gió tre trúc (Bamboo Wind Chime)
     - Gió trúc xào xạc (Bamboo Wind)
     - Sóng biển vỗ bờ êm dịu (Ocean Waves)
     - Tiếng chim rừng sớm mai (Morning Birds)
     - Mưa thiền trên mái lá (Pure Rain)
     - Sóng não Theta 6Hz định tâm sâu (Theta Drone Binaural Beat)
   - Lưu trữ cấu hình âm thanh tùy chỉnh người dùng qua `POST /api/user/sound-presets` và `GET /api/user/sound-presets`.
   - Sinh mã chia sẻ không gian thiền định định dạng `ANTAM-XXXXX` và nạp cấu hình qua `GET /api/community/sound-presets/:code`.
   - Chế độ Hẹn giờ tắt dịu dần (Fade-out Sleep Timer 15, 30, 45, 60 phút) giúp người dùng chìm vào giấc ngủ êm dịu không bị giật mình.

4. **Trụ cột 4: Hành trình Chuyển hóa Cảm xúc (Emotional Transformation Journey)**
   - Nhật ký cảm xúc bằng giọng nói (Voice Journaling) tích hợp Web Speech API, tự động nhận diện tiếng Việt và chuyển thành văn bản, người dùng kiểm tra trước khi lưu.
   - Đánh giá cường độ cảm xúc theo thang đo 1–5 điểm.
   - Ghi nhận trạng thái cảm xúc Trước/Sau buổi thiền để đối chiếu hiệu quả trị liệu.
   - API phân tích Báo cáo Xu hướng Cảm xúc `GET /api/user/emotional-trends`.

5. **Trụ cột 5: Cộng đồng "Gieo Hạt Lành" (Metta & Gratitude Community)**
   - Tính năng **Rút Thẻ Thông Điệp Từ Bi** mỗi ngày (`GET /api/community/wishes/random`).
   - Gửi lời nguyện lành cầu an cho mọi người (`POST /api/community/wishes`) với bộ lọc từ ngữ khiếm nhã (profanity filtering) và giới hạn tần suất (rate limiting) nghiêm ngặt.
   - Cơ chế báo cáo bài viết không phù hợp (`POST /api/community/wishes/:id/report`).

6. **Kiểm thử Toàn diện & Bảo mật**:
   - Mở rộng bộ kiểm thử tự động từ 10 lên **15 kịch bản tích hợp & bảo mật**, đạt tỷ lệ đạt 100% (15/15 PASS).

---

## [v4.0.0] - 2026-10-28
### Đột phá Kiến trúc & Bảo mật Production-Ready (Production Security & Architecture Release)

#### Đã sửa (Security & Bug Fixes):
- **[P0] Loại bỏ lỗ hổng cấp Premium giả mạo**:
  - Tách bạch hoàn toàn giữa Sandbox QA Testing và Production Store Verification.
  - Chặn tài khoản thường tự ý kích hoạt gói dùng thử sandbox bằng mã HTTP 403 Forbidden.
  - Chặn cấp Premium khống khi thiếu chứng chỉ StoreKit/Google Play bằng mã HTTP 503.
- **[P0] Xóa bỏ mật khẩu tĩnh của quản trị viên**:
  - Khởi tạo mật khẩu admin ngẫu nhiên mật mã 24-byte hoặc nạp từ `ADMIN_INITIAL_PASSWORD`.
  - Băm mật khẩu bằng thuật toán mật mã `scrypt` với muối ngẫu nhiên (salt 16 bytes).
- **[P0] Chống tấn công Replay quảng cáo thưởng (Rewarded Ad Fraud)**:
  - Bổ sung endpoint `POST /api/ads/start-session` phát hành nonce mật mã 32-byte có thời hạn 5 phút.
  - Tiêu thụ và hủy nonce ngay sau lần xác nhận đầu tiên, ngăn chặn hoàn toàn việc gọi lại.
  - Áp dụng giới hạn tần suất tối đa 3 lần nhận thưởng trong 24 giờ cho mỗi tài khoản.
- **[P1] Chống leo thang đặc quyền (Privilege Escalation)**:
  - Áp dụng whitelist tại `PUT /api/auth/profile`, chỉ cho phép sửa `name` và `selectedGoals`.
  - Loại bỏ hoàn toàn khả năng tiêm `role` hoặc `isPremium` từ client.
- **[P1] Bảo vệ xác thực & Quản lý phiên**:
  - Bổ sung sliding-window rate limit (tối đa 8 lần đăng nhập sai/15 phút).
  - Bổ sung API đổi mật khẩu `POST /api/auth/change-password` với cơ chế thu hồi tức thì mọi phiên đăng nhập khác của người dùng.
  - Bổ sung API đặt lại mật khẩu `POST /api/auth/reset-password` và `POST /api/auth/reset-password-confirm` sử dụng token mật mã 32-byte băm SHA-256.
- **[P1] Chống gian lận thời lượng thiền & spam request**:
  - Kiểm tra tính hợp lệ của `durationMinutes` (1 - 180 phút).
  - Áp dụng cooldown 15 giây giữa hai lần gửi phiên liên tiếp, chống spam click hoặc cày streak ảo.
- **[P2] Ngăn chặn hỏng dữ liệu khi ghi tệp (Atomic Write)**:
  - Triển khai ghi nguyên tử qua file tạm `.temp` và tráo đổi tệp bằng `fs.renameSync`.
  - Tự động tạo bản sao lưu snapshot kép `data/database.backup.json` sau mỗi lần cập nhật.
- **[P2] Chuẩn hóa đường dẫn hình ảnh**:
  - Đồng bộ toàn bộ hình ảnh chuẩn sang `public/assets/images/`.
  - Khắc phục lỗi ảnh gãy khi ứng dụng chạy trên bản đóng gói Vite production.

#### Đã thêm (New Features & Capabilities):
- **Web Audio Sound Engine**:
  - Bổ sung bộ tổng hợp âm thanh chuông xoay Tây Tạng (Singing Bowl), tiếng mõ gỗ thiền môn (Wooden Bell), và tiếng mưa rừng thanh tịnh (Pure Rain) tạo hoàn toàn bằng Web Audio API không phụ thuộc mạng.
  - Tích hợp `@capacitor/haptics` tạo nhịp rung phản hồi xúc giác nhẹ nhàng khi bắt đầu và kết thúc hơi thở.
  - Tích hợp MediaSession API hỗ trợ hiển thị điều khiển phát âm thanh trên màn hình khóa điện thoại.
- **RAG Buddhist Knowledge Base**:
  - Tích hợp kho kinh điển tra cứu trích dẫn nguyên văn (`src/data/knowledgeBase.ts`) với các bản kinh Phật học kinh điển: Bát Nhã Ba La Mật Đa Tâm Kinh, Kinh Từ Bi (Metta Sutta), Kinh Pháp Cú (Dhammapada), Kinh Tứ Niệm Xứ (Satipatthana Sutta).
  - Bổ sung cơ chế Rate Limiting và timeout bảo vệ 25 giây cho các cuộc gọi AI Google Gemini.
- **PostgreSQL Production Migration**:
  - Cung cấp tệp schema DDL quan hệ đầy đủ `migrations/001_production_schema.sql` với bảng, khóa ngoại, chỉ mục hiệu năng, kiểu enum và chính sách Row Level Security (RLS).
  - Hướng dẫn chuyển đổi dữ liệu từ JSON sang PostgreSQL trong `DATABASE_MIGRATION.md`.
- **Bộ Kiểm thử Tự động Chuyên sâu**:
  - Cung cấp test suite `tests/security-suite.ts` bao phủ 10 kịch bản kiểm thử bảo mật then chốt, tích hợp vào lệnh `npm test`.

---

## [v3.2.0] - 2026-10-27
- Thiết kế giao diện Chánh niệm AN TÂM phong cách thiền tối giản, thanh tịnh.
- Tích hợp bài tập thở 4 nhịp (Box Breathing), thở 4-7-8 và hơi thở tĩnh tâm.
- Tạo nhật ký cảm xúc (Mood Journal) và chuỗi ngày thực hành (Daily Streaks).
- Xây dựng mô-đun kết nối sản phẩm văn hóa Phật giáo (Affiliate Marketplace).
- Cấu hình ban đầu Capacitor cho nền tảng di động.
