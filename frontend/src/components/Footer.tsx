import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#FFFDF8] border-t border-[#E5E0D8] py-12 mt-16 text-[#242424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-editorial text-2xl font-bold tracking-tight text-[#1F2937]">
              Văn Đàn
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest bg-[#C65D3A] text-white px-1.5 py-0.5 rounded">
              Đọc Số
            </span>
          </div>
          <p className="text-xs text-[#777777] leading-relaxed">
            Nền tảng đọc tiểu thuyết dã sử & truyện tranh webtoon đương đại hàng đầu Việt Nam. Tôn vinh giá trị văn học & tinh thần sáng tạo.
          </p>
        </div>

        <div>
          <h4 className="font-editorial text-sm font-semibold text-[#1F2937] mb-3">Khám Phá</h4>
          <ul className="space-y-2 text-xs text-[#777777]">
            <li><Link href="/tim-kiem?type=NOVEL" className="hover:text-[#C65D3A]">Tiểu Thuyết Chữ</Link></li>
            <li><Link href="/tim-kiem?type=COMIC" className="hover:text-[#C65D3A]">Truyện Tranh Webtoon</Link></li>
            <li><Link href="/top-truyen" className="hover:text-[#C65D3A]">Bảng Xếp Hạng Văn Đàn</Link></li>
            <li><Link href="/tim-kiem?category=da-su-co-trang" className="hover:text-[#C65D3A]">Dã Sử & Cổ Trang</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-editorial text-sm font-semibold text-[#1F2937] mb-3">Tài Khoản & Dịch Vụ</h4>
          <ul className="space-y-2 text-xs text-[#777777]">
            <li><Link href="/vi-xu" className="hover:text-[#C65D3A]">Nạp Xu & Ví Độc Giả</Link></li>
            <li><Link href="/tu-sach" className="hover:text-[#C65D3A]">Tủ Sách Cá Nhân</Link></li>
            <li><Link href="/tu-sach" className="hover:text-[#C65D3A]">Lịch Sử Đọc</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-editorial text-sm font-semibold text-[#1F2937] mb-3">Chính Sách & Liên Hệ</h4>
          <p className="text-xs text-[#777777] leading-relaxed mb-2">
            Email: contact@truyenvui.vn<br />
            Hotline: 1900 6868
          </p>
          <p className="text-[11px] text-[#777777]">
            © 2026 Văn Đàn Reading Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
