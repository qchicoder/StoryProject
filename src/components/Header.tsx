'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Category } from '@/types';
import { fetchApi } from '@/lib/api';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [recentCategories, setRecentCategories] = useState<string[]>([]);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setShowCategoryMenu(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setShowCategoryMenu(false);
    }, 300); // 300ms buffer delay so menu doesn't snap closed prematurely
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vandan_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }

      try {
        const saved = localStorage.getItem('vandan_recent_categories');
        if (saved) {
          setRecentCategories(JSON.parse(saved));
        } else {
          // Default initial recent categories
          const defaultRecents = ['da-su-co-trang', 'tien-hiep', 'truyen-tranh-webtoon', 'huyen-huan'];
          setRecentCategories(defaultRecents);
          localStorage.setItem('vandan_recent_categories', JSON.stringify(defaultRecents));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vandan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vandan_theme', 'light');
    }
  };

  const handleCategorySelect = (slug: string) => {
    setShowCategoryMenu(false);
    if (!slug) return;
    const updated = [slug, ...recentCategories.filter((s) => s !== slug)].slice(0, 6);
    setRecentCategories(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vandan_recent_categories', JSON.stringify(updated));
      } catch (e) { }
    }
  };

  useEffect(() => {
    fetchApi('/categories')
      .then((res) => setCategories(res.data || []))
      .catch(console.error);

    const token = localStorage.getItem('vandan_token');
    if (token) {
      fetchApi('/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('vandan_token');
          setUser(null);
        });
    }

    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch { }
    localStorage.removeItem('vandan_token');
    setUser(null);
    window.location.href = '/';
  };

  const allGenreList = [
    { name: 'Tất cả thể loại', slug: '' },
    { name: 'Dã Sử & Cổ Trang', slug: 'da-su-co-trang' },
    { name: 'Truyện Tranh Webtoon', slug: 'truyen-tranh-webtoon' },
    { name: 'Tiên Hiệp', slug: 'tien-hiep' },
    { name: 'Huyền Huyễn', slug: 'huyen-huan' },
    { name: 'Đô Thị', slug: 'do-thi' },
    { name: 'Ngôn Tình', slug: 'ngon-tinh' },
    { name: 'Chuyển Sinh', slug: 'chuyen-sinh' },
    { name: 'Xuyên Không', slug: 'xuyen-khong' },
    { name: 'Manhua', slug: 'manhua' },
    { name: 'Manhwa', slug: 'manhwa' },
    { name: 'Hành Động (Action)', slug: 'action' },
    { name: 'Phiêu Lưu (Adventure)', slug: 'adventure' },
    { name: 'Võ Thuật (Martial Arts)', slug: 'martial-arts' },
    { name: 'Hài Hước (Comedy)', slug: 'comedy' },
    { name: 'Trinh Thám', slug: 'mystery' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fbf9f9]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e5e0d8]">
      <div className="h-16 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#9f4120] text-white flex items-center justify-center font-editorial font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-[#0a1422] leading-none">
                Văn Đàn
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#9f4120] tracking-widest mt-0.5">
                Đọc Số
              </span>
            </div>
          </Link>

          {/* Navigation Links - Clean & Essential */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-[#44474c] dark:text-slate-300">
            <Link href="/" className="px-3 py-1.5 hover:text-[#1b1c1c] dark:hover:text-white hover:bg-[#efeded] dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap">
              Trang chủ
            </Link>

            {/* Mega Dropdown for Thể Loại */}
            <div
              className="relative py-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="px-3 py-1.5 hover:text-[#1b1c1c] dark:hover:text-white hover:bg-[#efeded] dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span>Thể loại</span>
                <span className="text-[10px]">▾</span>
              </button>

              {/* 4-Column Mega Dropdown Menu with Hover Bridge */}
              {showCategoryMenu && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute top-full left-0 -mt-1 pt-2 w-[660px] sm:w-[720px] z-50 animate-slide-up origin-top-left"
                >
                  <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 transition-colors">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e0d8] dark:border-slate-800">
                      <span className="font-editorial text-base font-bold text-[#0a1422] dark:text-slate-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[22px]">category</span>
                        <span>Danh Mục Thể Loại</span>
                      </span>
                      <span className="text-xs text-[#75777c] dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9f4120] dark:bg-amber-400 animate-pulse"></span>
                        <span>Chủ đề bạn tìm gần đây</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-2.5 gap-y-2">
                      {allGenreList.map((genre, idx) => {
                        const isRecent = recentCategories.includes(genre.slug) && genre.slug !== '';
                        return (
                          <Link
                            key={idx}
                            href={genre.slug ? `/tim-kiem?category=${genre.slug}` : '/tim-kiem'}
                            onClick={() => handleCategorySelect(genre.slug)}
                            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-between font-medium border ${
                              isRecent
                                ? 'text-[#9f4120] dark:text-amber-400 font-bold bg-[#ffdbd0]/50 dark:bg-amber-950/50 border-[#9f4120]/30 dark:border-amber-500/40 hover:bg-[#ffdbd0]/80 dark:hover:bg-amber-900/70 shadow-2xs'
                                : 'text-[#1b1c1c] dark:text-slate-200 bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700/60 hover:bg-[#ffdbd0]/30 dark:hover:bg-slate-800 hover:text-[#9f4120] dark:hover:text-amber-400'
                            }`}
                          >
                            <span className="truncate text-[12.5px] sm:text-xs">{genre.name}</span>
                            <span
                              title={isRecent ? 'Chủ đề bạn đã tìm kiếm gần đây' : `Thể loại ${genre.name}`}
                              className={`w-2 h-2 rounded-full shrink-0 ml-1 transition-all ${
                                isRecent
                                  ? 'bg-[#9f4120] dark:bg-amber-400 animate-pulse shadow-xs'
                                  : 'bg-[#9f4120]/50 dark:bg-amber-400/50'
                              }`}
                            ></span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/top-truyen" className="px-3 py-1.5 hover:text-[#1b1c1c] dark:hover:text-white hover:bg-[#efeded] dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap">
              Bảng xếp hạng
            </Link>
          </nav>
        </div>

        {/* Search bar (Expanded width) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md xl:max-w-xl mx-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery) window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery)}`;
            }}
            className="w-full flex items-center bg-[#ffffff] px-4 h-10 rounded-xl shadow-xs border border-[#e5e0d8] focus-within:border-[#9f4120] transition-all"
          >
            <span className="material-symbols-outlined text-[#75777c] text-[20px] mr-2">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm tên truyện, tác giả, thể loại, từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-xs text-[#1b1c1c] placeholder:text-[#75777c]"
            />
          </form>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle Switch (Nút gạt chuyển động êm ái 600ms) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDarkMode ? 'Đang bật Giao diện Tối (Nhấn để gạt về Sáng)' : 'Đang bật Giao diện Sáng (Nhấn để gạt sang Tối)'}
            className={`group relative inline-flex h-8 w-20 items-center rounded-full p-1 transition-all duration-600 ease-in-out border shadow-inner cursor-pointer shrink-0 select-none active:scale-95 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 shadow-inner shadow-black/60 hover:border-slate-500'
                : 'bg-[#e5e0d8] border-[#d6d0c7] shadow-inner shadow-black/5 hover:border-amber-400/60'
            }`}
          >
            {/* Background Icons */}
            <span
              className={`material-symbols-outlined text-[15px] absolute left-2 transition-all duration-600 select-none ${
                isDarkMode
                  ? 'text-slate-400 opacity-60 scale-90'
                  : 'opacity-0 scale-75'
              }`}
            >
              light_mode
            </span>
            <span
              className={`material-symbols-outlined text-[15px] absolute right-2 transition-all duration-600 select-none ${
                isDarkMode
                  ? 'opacity-0 scale-75'
                  : 'text-[#75777c] opacity-60 scale-90'
              }`}
            >
              dark_mode
            </span>

            {/* Sliding Knob (Gạt chậm mượt 600ms với easing nảy êm) */}
            <span
              className={`inline-flex h-6 w-6 rounded-full shadow-md transform transition-all duration-600 ease-[cubic-bezier(0.34,1.3,0.64,1)] items-center justify-center z-10 ${
                isDarkMode
                  ? 'translate-x-12 bg-slate-800 border border-slate-600 text-amber-300 shadow-[0_2px_6px_rgba(0,0,0,0.4)]'
                  : 'translate-x-0 bg-white border border-amber-200 text-amber-500 shadow-[0_2px_6px_rgba(245,158,11,0.25)]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[14px] transition-transform duration-600 ease-in-out ${
                  isDarkMode ? 'rotate-[360deg] text-amber-300' : 'rotate-0 text-amber-500'
                }`}
              >
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </span>
          </button>

          {user && user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1F2937] text-white text-xs font-semibold hover:bg-[#0a1422] transition-colors"
            >
              CMS Quản trị
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Prominent Highlighted Nạp Xu Box - Nổi bật cực kỳ rõ nét ở cả Light & Dark mode */}
              <Link
                href="/vi-xu"
                className="flex items-center gap-1.5 text-xs font-black bg-[#fff4ed] dark:bg-[#2c1a0e] border border-[#ffc5b2] dark:border-[#b45309]/70 hover:bg-[#ffeade] dark:hover:bg-[#3d2311] px-3.5 py-1.5 rounded-xl shadow-xs transition-all transform hover:scale-[1.03]"
              >
                <span className="material-symbols-outlined text-[17px] text-[#ea580c] dark:text-[#fbbf24] font-bold">toll</span>
                <span className="font-extrabold text-xs text-[#7c2d12] dark:text-[#fde68a] tracking-wide">{user.wallet?.balance ?? 0} Xu</span>
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#ea580c] dark:bg-[#f59e0b] text-white dark:text-[#18181b] text-[10px] font-black ml-0.5 shadow-xs">
                  +
                </span>
              </Link>

              {/* USER AVATAR & HOVER DROPDOWN MENU */}
              <div className="relative group py-1">
                <Link
                  href="/ho-so"
                  className="flex items-center gap-2 bg-[#f0ece9] hover:bg-[#e7e2de] border border-[#e5e0d8] px-3 py-1.5 rounded-2xl transition-all shadow-2xs group-hover:border-[#9f4120]/40"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#d6d0c7] shrink-0"
                  />
                  <span className="text-xs font-bold text-[#1b1c1c] max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#75777c] group-hover:text-[#9f4120] group-hover:rotate-180 transition-transform">
                    expand_more
                  </span>
                </Link>

                {/* HOVER DROPDOWN LIST */}
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#FFFDF8] border border-[#e5e0d8] rounded-2xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50 space-y-1">
                  {/* User info mini header */}
                  <div className="px-3 py-2 border-b border-[#e5e0d8] mb-1">
                    <p className="text-xs font-bold text-[#0a1422] truncate">{user.name}</p>
                    <p className="text-[10px] text-[#75777c] truncate">{user.email}</p>
                  </div>

                  {/* Item 1: Hồ sơ */}
                  <Link
                    href="/ho-so"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0a1422] hover:bg-[#ffdbd0]/40 hover:text-[#9f4120] transition-colors whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#9f4120] shrink-0">person</span>
                    <span>Hồ Sơ Cá Nhân</span>
                  </Link>

                  {/* Item 2: Cài đặt */}
                  <Link
                    href="/cai-dat"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0a1422] hover:bg-[#ffdbd0]/40 hover:text-[#9f4120] transition-colors whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#75777c] shrink-0">settings</span>
                    <span>Cài Đặt Tài Khoản</span>
                  </Link>

                  {/* Item 3: Ví Xu & VIP */}
                  <Link
                    href="/vi-xu"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0a1422] hover:bg-[#ffdbd0]/40 hover:text-[#9f4120] transition-colors whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#d97706] shrink-0">toll</span>
                    <div className="flex items-center justify-between flex-1 gap-2">
                      <span className="whitespace-nowrap">Ví Xu & Hạng VIP</span>
                      <span className="text-[10px] font-bold text-[#9f4120] bg-[#ffdbd0] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        {user.wallet?.balance ?? 0} Xu
                      </span>
                    </div>
                  </Link>

                  <div className="border-t border-[#e5e0d8] my-1" />

                  {/* Item 4: Đăng xuất */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#b91c1c] hover:bg-[#fef2f2] transition-colors text-left whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#b91c1c] shrink-0">logout</span>
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              className="bg-[#9f4120] hover:bg-[#732102] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">account_circle</span>
              <span className="whitespace-nowrap">Gia Nhập Văn Đàn</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
