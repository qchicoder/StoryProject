'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Story, Category } from '@/types';
import { fetchApi } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpeningBook, setIsOpeningBook] = useState(false);
  const [followedStoryIds, setFollowedStoryIds] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      fetchApi('/stories'),
      fetchApi('/categories')
    ])
      .then(([storiesRes, categoriesRes]) => {
        const storiesList = Array.isArray(storiesRes.data)
          ? storiesRes.data
          : storiesRes.data?.data || [];
        setStories(storiesList);
        setCategories(categoriesRes.data || []);
      })
      .catch((err) => console.error('Lỗi khi tải trang chủ:', err))
      .finally(() => setLoading(false));

    // Fetch user followed library if logged in
    const token = localStorage.getItem('vandan_token');
    if (token) {
      fetchApi('/me/library')
        .then((res) => {
          const follows = res.data?.follows || [];
          setFollowedStoryIds(follows.map((f: any) => f.story_id));
        })
        .catch(() => {});
    }
  }, []);

  const handleToggleFollow = async (e: React.MouseEvent, storyId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('vandan_token');
    if (!token) {
      alert('Vui lòng đăng nhập để theo dõi tác phẩm vào tủ sách.');
      router.push('/dang-nhap');
      return;
    }

    try {
      const res = await fetchApi(`/stories/${storyId}/follow`, { method: 'POST' });
      if (res.is_following) {
        setFollowedStoryIds((prev) => [...prev, storyId]);
      } else {
        setFollowedStoryIds((prev) => prev.filter((id) => id !== storyId));
      }
      alert(res.message || (res.is_following ? 'Đã theo dõi vào Tủ Sách' : 'Đã bỏ theo dõi'));
    } catch (err: any) {
      alert(err.message || 'Thao tác theo dõi thất bại.');
    }
  };

  // Filter featured novels or all novels
  const featuredNovels = stories.filter((s) => s.is_featured && s.content_type === 'NOVEL');
  const heroStories = featuredNovels.length > 0 ? featuredNovels : stories.filter((s) => s.content_type === 'NOVEL');

  // Auto slide every 5 seconds (Pauses when user hovers mouse over banner)
  useEffect(() => {
    if (heroStories.length <= 1 || isPaused || isOpeningBook) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroStories.length, isPaused, isOpeningBook]);

  const currentHero = heroStories[currentSlide] || stories[0];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroStories.length) % heroStories.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroStories.length);
  };

  const handleOpenBook = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    setIsOpeningBook(true);
    setTimeout(() => {
      router.push(`/truyen/${slug}`);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Banner Section (Carousel with Smooth Horizontal Slide Transition) */}
      {heroStories.length > 0 ? (
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative bg-[#FFFDF8] border border-[#E5E0D8] rounded-lg p-6 sm:p-8 shadow-sm group overflow-hidden min-h-[340px]"
        >
          {/* Top Bar Controls (Badge & Indicators) */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]/60 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C65D3A]">
              <span>★ TÁC PHẨM ĐỦ BẢN QUYỀN NỔI BẬT</span>
            </div>

            {heroStories.length > 1 && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-[#777777]">
                  {currentSlide + 1} / {heroStories.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {heroStories.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        idx === currentSlide ? 'w-7 bg-[#C65D3A]' : 'w-2.5 bg-[#E5E0D8] hover:bg-[#1F2937]'
                      }`}
                      title={`Chuyển sang tiểu thuyết ${idx + 1}`}
                    />
                  ))}
                </div>
                {/* Arrow Nav Buttons */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={handlePrevSlide}
                    className="w-7 h-7 rounded-full border border-[#E5E0D8] bg-white hover:bg-[#1F2937] hover:text-white text-[#1F2937] flex items-center justify-center text-xs font-bold transition shadow-sm"
                    title="Tiểu thuyết trước"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="w-7 h-7 rounded-full border border-[#E5E0D8] bg-white hover:bg-[#1F2937] hover:text-white text-[#1F2937] flex items-center justify-center text-xs font-bold transition shadow-sm"
                    title="Tiểu thuyết kế tiếp"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sliding Track */}
          <div className="w-full overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroStories.map((hero) => {
                const isHeroFollowed = followedStoryIds.includes(hero.id);

                return (
                  <div
                    key={hero.id}
                    className="w-full flex-shrink-0 flex flex-col md:flex-row gap-8 items-center px-1"
                  >
                    {/* 3D Book Cover & Opening Effect */}
                    <div
                      className="book-wrapper w-48 sm:w-56 h-72 sm:h-80 flex-shrink-0 relative cursor-pointer"
                      onClick={(e) => handleOpenBook(e, hero.slug)}
                    >
                      <div
                        className={`w-full h-full rounded-md overflow-hidden shadow-xl border border-black/10 transition-all duration-500 book-cover-3d ${
                          isOpeningBook && hero.id === currentHero.id ? 'opening' : ''
                        }`}
                      >
                        <img
                          src={hero.cover_url || 'https://via.placeholder.com/300x400'}
                          alt={hero.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-[#1F2937] text-[#FFFDF8] text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow">
                          TIỂU THUYẾT
                        </span>
                      </div>

                      {/* Opening Book Pages Layer */}
                      {isOpeningBook && hero.id === currentHero.id && (
                        <div className="absolute inset-0 bg-[#FFFDF8] border-2 border-[#C65D3A] rounded-md shadow-2xl flex items-center justify-center p-4 animate-book-open z-20">
                          <div className="text-center space-y-2">
                            <span className="text-2xl">📖</span>
                            <p className="font-editorial text-xs font-bold text-[#1F2937]">Đang mở trang sách...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-4 w-full">
                      <div className="text-xs font-semibold text-[#C65D3A]">
                        {hero.category?.name || 'Dã Sử & Cổ Trang'}
                      </div>

                      <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1F2937] leading-tight">
                        {hero.title}
                      </h1>

                      <p className="text-xs sm:text-sm text-[#777777] line-clamp-3 leading-relaxed font-ui min-h-[60px]">
                        {hero.summary}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#777777] pt-2">
                        <span>
                          Tác giả: <strong className="text-[#1F2937]">{hero.author?.name || 'Tác giả Văn Đàn'}</strong>
                        </span>
                        <span>•</span>
                        <span>👁 {(hero.view_count || 0).toLocaleString()} lượt đọc</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {/* Button with Pulse Zoom Loop on Hover & 3D Book Opening Effect on Click */}
                        <button
                          onClick={(e) => handleOpenBook(e, hero.slug)}
                          className="hover-pulse-button bg-[#C65D3A] hover:bg-[#a84c2d] text-[#FFFDF8] font-ui text-xs font-semibold px-5 py-2.5 rounded transition shadow-md flex items-center gap-2"
                        >
                          <span>📖</span>
                          <span>Đọc Ngay Chương 1</span>
                        </button>

                        <Link
                          href={`/truyen/${hero.slug}`}
                          className="border border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-white font-ui text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-2xs"
                        >
                          Xem Chi Tiết
                        </Link>

                        {/* Interactive Follow Button on Hero Slider */}
                        <button
                          onClick={(e) => handleToggleFollow(e, hero.id)}
                          className={`font-ui text-xs font-semibold px-4 py-2.5 rounded-lg border transition flex items-center gap-1.5 shadow-2xs ${
                            isHeroFollowed
                              ? 'bg-[#10b981] text-white border-[#10b981] shadow-xs'
                              : 'border-[#9f4120] text-[#9f4120] hover:bg-[#9f4120] hover:text-white dark:border-[#fb923c] dark:text-[#fb923c] dark:hover:bg-[#fb923c] dark:hover:text-slate-950'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isHeroFollowed ? 'bookmark_added' : 'bookmark_add'}
                          </span>
                          <span>{isHeroFollowed ? '✓ Đã Theo Dõi' : '+ Theo Dõi'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="h-80 bg-[#FFFDF8] border border-[#E5E0D8] rounded-lg animate-pulse p-8"></div>
      )}

      {/* Category Chips Bar */}
      <section className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E5E0D8] dark:border-slate-800">
        <span className="text-xs font-semibold text-[#1F2937] dark:text-slate-300 mr-2">Thể Loại:</span>
        <Link href="/tim-kiem" className="bg-[#1F2937] dark:bg-[#9f4120] text-white text-xs px-3 py-1 rounded shadow-2xs font-semibold">
          Tất Cả
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/tim-kiem?category=${cat.slug}`}
            className="bg-[#f5f3f3] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-[#242424] text-xs px-3 py-1 rounded-lg border border-[#e5e0d8] dark:border-slate-700 transition font-medium flex items-center gap-1.5"
          >
            <span>{cat.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#9f4120]/60 dark:bg-amber-400/60"></span>
          </Link>
        ))}
      </section>

      {/* Main Grid & Leaderboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content (3 Columns) */}
        <div className="lg:col-span-3 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-editorial text-2xl font-bold text-[#1F2937]">
                Tác Phẩm Mới Cập Nhật
              </h2>
              <Link href="/tim-kiem" className="text-xs font-semibold text-[#C65D3A] hover:underline">
                Xem tất cả →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-md h-64 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {stories.map((story) => {
                  const isFollowed = followedStoryIds.includes(story.id);

                  return (
                    <Link
                      key={story.id}
                      href={`/truyen/${story.slug}`}
                      className="group bg-[#FFFDF8] border border-[#E5E0D8] rounded-md overflow-hidden hover:border-[#1F2937] transition flex flex-col relative"
                    >
                      <div className="aspect-[2/3] w-full relative overflow-hidden bg-[#EFECE5]">
                        <img
                          src={story.cover_url || 'https://via.placeholder.com/300x450'}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 bg-[#1F2937]/90 text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shadow">
                          {story.content_type === 'NOVEL' ? 'Tiểu Thuyết' : 'Comic'}
                        </span>

                        {/* Quick Follow Bookmark Badge on Story Card */}
                        <button
                          onClick={(e) => handleToggleFollow(e, story.id)}
                          title={isFollowed ? 'Bỏ theo dõi' : 'Theo dõi vào tủ sách'}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition shadow-md ${
                            isFollowed ? 'bg-[#10b981] text-white' : 'bg-black/60 text-white hover:bg-[#9f4120]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isFollowed ? 'bookmark_added' : 'bookmark_add'}
                          </span>
                        </button>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                        <h3 className="font-editorial text-sm font-semibold text-[#1F2937] line-clamp-1 group-hover:text-[#C65D3A] transition">
                          {story.title}
                        </h3>
                        <p className="text-[11px] text-[#777777]">
                          {story.author?.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#777777] pt-2 border-t border-[#E5E0D8]/50">
                          <span className="bg-[#ffdbd0]/50 dark:bg-amber-950/50 text-[#9f4120] dark:text-amber-400 font-bold px-1.5 py-0.5 rounded border border-[#9f4120]/20 dark:border-amber-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9f4120] dark:bg-amber-400"></span>
                            <span>{story.category?.name || 'Tiên Hiệp'}</span>
                          </span>
                          <span>👁 {story.view_count.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (1 Column) */}
        <aside className="space-y-8">
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-lg p-5">
            <h3 className="font-editorial text-lg font-bold text-[#1F2937] mb-4 pb-2 border-b border-[#E5E0D8] flex items-center justify-between">
              <span>🏆 Bảng Vàng Độc Giả</span>
              <span className="text-[10px] font-normal text-[#777777]">Tuần</span>
            </h3>

            <div className="space-y-4">
              {stories.slice(0, 5).map((story, idx) => (
                <Link
                  key={story.id}
                  href={`/truyen/${story.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-editorial text-xs font-bold ${
                      idx === 0
                        ? 'bg-[#C65D3A] text-white'
                        : idx === 1
                        ? 'bg-[#1F2937] text-white'
                        : 'bg-[#EFECE5] text-[#242424]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-editorial text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#C65D3A] transition">
                      {story.title}
                    </h4>
                    <p className="text-[10px] text-[#777777]">👁 {story.view_count.toLocaleString()} lượt đọc</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
