# HƯỚNG DẪN TRIỂN KHAI VÀ VẬN HÀNH (DEPLOYMENT GUIDE)
**Dự án**: AN TÂM — Thiền Định & Phật Pháp Chánh Niệm  
**Phiên bản**: v4.0 Production Ready  

---

## 1. YÊU CẦU MÔI TRƯỜNG VẬN HÀNH
- **Node.js**: Phiên bản 20.x hoặc 22.x LTS.
- **npm** hoặc **bun**: Quản lý gói thư viện.
- **Biến môi trường**: Cấu hình trong `.env` theo mẫu từ `.env.example`.
- **Cổng dịch vụ**: Mặc định cổng 3000 (hoặc qua biến `PORT`).

---

## 2. CÁC BƯỚC CÀI ĐẶT VÀ KHỞI CHẠY CỤC BỘ

### Bước 1: Cài đặt thư viện phụ thuộc
```bash
npm install
```

### Bước 2: Thiết lập biến môi trường
Tạo tệp `.env` dựa trên `.env.example`:
```bash
cp .env.example .env
```
Điền khóa `GEMINI_API_KEY` từ Google AI Studio.

### Bước 3: Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Máy chủ Express kết hợp Vite Dev Server sẽ chạy tại `http://localhost:3000`.

---

## 3. ĐÓNG GÓI VÀ TRIỂN KHAI SẢN XUẤT (PRODUCTION DEPLOYMENT)

### Bước 1: Build gói phân phối tĩnh
```bash
npm run build
```
Lệnh này sẽ biên dịch TypeScript và đóng gói các tài nguyên frontend vào thư mục `dist/`.

### Bước 2: Khởi động máy chủ Production
```bash
npm start
```
(Lệnh này thực thi `node server.ts` phục vụ API cùng toàn bộ tệp tĩnh từ `dist/`).

### Bước 3: Triển khai trên Google Cloud Run hoặc Docker
Ứng dụng tương thích hoàn hảo với Docker container:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 4. CHIẾN LƯỢC SAO LƯU DỮ LIỆU (DATABASE BACKUP)
1. **Sao lưu tự động kép**: Sau mỗi thao tác ghi, hệ thống tạo bản sao tại `data/database.backup.json`.
2. **Kích hoạt sao lưu thủ công qua API**:
   Quản trị viên có thể gửi yêu cầu `POST /api/admin/backup` với Bearer token của tài khoản admin.
3. **Chuyển đổi sang PostgreSQL / Supabase**:
   Xem chi tiết trong tệp `DATABASE_MIGRATION.md` và script `migrations/001_production_schema.sql`.
