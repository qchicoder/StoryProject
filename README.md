# Truyện Vui - Nền tảng Đọc Truyện Trực Tuyến

Truyện Vui là nền tảng đọc truyện chữ và truyện tranh (comic) trực tuyến, cung cấp trải nghiệm mượt mà, tốc độ cao và thân thiện với người dùng. Dự án được xây dựng với kiến trúc Fullstack hiện đại, hỗ trợ hệ thống thanh toán (ví xu), mở khóa chương truyện, và các tính năng tương tác độc giả (bình luận, đánh giá, theo dõi).

## 🌟 Tính năng nổi bật

- **Đọc truyện mượt mà:** Hỗ trợ đọc cả truyện chữ (Novel) và truyện tranh (Comic).
- **Hệ thống người dùng & Ví:** Đăng ký, đăng nhập, nạp xu và sử dụng xu để mở khóa chương VIP.
- **Tương tác:** Bình luận, thích, theo dõi truyện, lưu lịch sử đọc và đánh dấu trang (bookmark).
- **CMS Quản trị:** Trang quản trị dành riêng cho Admin/Author để đăng truyện, quản lý người dùng và duyệt báo cáo.
- **Tối ưu SEO & Hiệu suất:** Render phía server (SSR) với Next.js App Router giúp SEO tốt nhất.

## 💻 Tech Stack (Công nghệ sử dụng)

- **Frontend & Backend:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Host trên [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** CSS / Thiết kế giao diện hiện đại
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

## 🤝 Hợp tác & Phát triển (Collaborators)

Dự án này được phát triển, tối ưu kiến trúc và duy trì bởi sự hợp tác của:
- **qchicoder (Chí)** - Lead Developer / Owner
- **[Lâm Quốc Bảo (LQuocBao)](https://github.com/LQuocBao)** từ **[ValcoreTech]** - Co-Developer & Collaborator

Cảm ơn sự đồng hành và đóng góp mạnh mẽ từ đội ngũ ValcoreTech để xây dựng nên một kiến trúc hệ thống tuyệt vời này!

## 🚀 Hướng dẫn cài đặt (Local Development)

### 1. Yêu cầu hệ thống
- Node.js 18.x trở lên
- Git

### 2. Cài đặt dự án

Clone repository về máy:
```bash
git clone https://github.com/qchicoder/StoryProject.git
cd StoryProject
```

Cài đặt các thư viện (dependencies):
```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc của dự án và điền các thông tin bảo mật (Xin cấp quyền từ Owner nếu bạn không có):
```env
# Kết nối đến Database Supabase (Pooler - Dành cho query)
DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Kết nối Direct (Dành cho việc migrate/push cấu trúc)
DIRECT_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Chuỗi bí mật JWT
JWT_SECRET="truyenvui-super-secret-jwt-key-2026-xyz"
```

### 4. Khởi tạo Database (Prisma)

Đẩy cấu trúc bảng lên database:
```bash
npx prisma db push
```

Tạo dữ liệu mẫu (Seeder - Nạp hơn 100 truyện mẫu):
```bash
npm run db:seed
```

### 5. Chạy Server Development

```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## ☁️ Deployment (Vercel)

Dự án được cấu hình sẵn 100% để deploy trực tiếp lên **Vercel**. 
Chỉ cần liên kết kho lưu trữ GitHub này với Vercel, sau đó thiết lập 3 biến môi trường (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`) trong mục **Settings > Environment Variables** của Vercel là hệ thống sẽ tự động build và online hoàn hảo.

## ⚖️ Bản quyền & Giấy phép (License & Copyright)

© 2026 Truyện Vui. All rights reserved. 

Khung kiến trúc và bộ source code này được thiết kế, tối ưu và sở hữu độc quyền bởi **qchicoder** cùng **ValcoreTech**. Mọi hành vi sao chép, phân phối, hoặc sử dụng mã nguồn này cho mục đích thương mại mà không có sự đồng ý bằng văn bản từ chủ sở hữu đều bị nghiêm cấm.
