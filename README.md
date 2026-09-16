# 📚 TRUYENVUI - Nền Tảng Đọc Truyện & Webtoon Fullstack (Next.js 16 + Prisma)

Chào mừng bạn đến với mã nguồn của dự án **TRUYENVUI** (StoryProject). Đây là hệ thống website đọc truyện chữ (Novel) và truyện tranh (Webtoon/Comic) bản quyền cao cấp, được xây dựng theo kiến trúc **Next.js Fullstack** hiện đại nhất, sẵn sàng triển khai 100% trên **Vercel** với chi phí 0đ.

---

## 🏗 Kiến Trúc Hệ Thống (Unified Fullstack)

Toàn bộ hệ sinh thái (Giao diện người dùng + Backend API + Cơ sở dữ liệu ORM) nằm gọn gàng bên trong thư mục `frontend/`:

```text
📦 TRUYENVUI
 └── 📁 frontend/
      ├── 📁 prisma/
      │    ├── schema.prisma   # 18 Bảng cơ sở dữ liệu (User, Story, Chapter, Wallet...)
      │    └── seed.ts         # Script nạp 100+ truyện, 15 danh mục, 10 tác giả
      ├── 📁 src/
      │    ├── 📁 app/
      │    │    ├── 📁 api/    # Toàn bộ 24 RESTful API Route Handlers (Auth, Wallet, Stories...)
      │    │    └── ...        # Các trang giao diện (Trang chủ, Đọc truyện, Tủ sách, Ví xu...)
      │    └── 📁 lib/
      │         ├── auth.ts    # JWT Authentication & Băm mật khẩu Bcrypt
      │         └── prisma.ts  # Singleton Prisma Client tối ưu Serverless
      └── package.json
```

---

## ✨ Tính Năng Nổi Bật

- **Đọc Truyện Chữ & Truyện Tranh (Webtoon)**: Tối ưu cuộn dọc, chuyển chương mượt mà, lưu lịch sử đọc.
- **Hệ Thống Ví Xu & VIP Tiers**: Nạp VNĐ (VietQR, Momo, Chuyển khoản, Thẻ cào) tự động quy đổi thành Xu.
- **Khóa Chương Bản Quyền (Paywall)**: Các chương VIP (từ chương 3) yêu cầu mở khóa bằng Xu với giao dịch an toàn (ACID Transaction).
- **Phân Quyền & Quản Trị**: Quản lý Admin CMS, thống kê doanh thu, thêm truyện và chương mới.
- **Tủ Sách Cá Nhân**: Theo dõi truyện, đánh dấu chương đã đọc, lưu vị trí đọc gần nhất.
- **Sẵn Sàng Cho AI**: Nền tảng TypeScript chuẩn bị sẵn sàng để tích hợp Vercel AI SDK làm Trợ lý chat và AI Gợi ý truyện.

---

## 🚀 Hướng Dẫn Triển Khai Lên Vercel (100% Miễn Phí)

1. Đăng nhập vào [Vercel.com](https://vercel.com) và kết nối với kho lưu trữ GitHub của bạn (`StoryProject`).
2. Trong phần cấu hình dự án:
   - **Framework Preset**: Chọn `Next.js`.
   - **Root Directory**: Chọn `frontend`.
3. (Tùy chọn) Phần **Environment Variables**:
   - `DATABASE_URL`: Điền link kết nối PostgreSQL từ **Supabase** hoặc **Neon.tech** (miễn phí).
   - `JWT_SECRET`: Điền một chuỗi bí mật bất kỳ để ký token đăng nhập.
4. Bấm **Deploy**. Vercel sẽ tự động build toàn bộ Frontend + Backend API + Prisma Client!

---

## 💻 Hướng Dẫn Chạy Cục Bộ (Localhost)

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt các thư viện:
```bash
npm install
```

3. Khởi tạo cơ sở dữ liệu và nạp dữ liệu mẫu (100+ truyện):
```bash
npx prisma db push
npm run db:seed
```

4. Khởi chạy máy chủ:
```bash
npm run dev
```

Truy cập: `http://localhost:3000` để trải nghiệm!
- **Tài khoản Admin**: `admin@truyenvui.vn` / `password`
- **Tài khoản Độc Giả**: `user@truyenvui.vn` / `password`
