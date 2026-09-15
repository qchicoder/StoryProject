'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Story, Category } from '@/types';
import { fetchApi } from '@/lib/api';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialType = searchParams.get('type') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hoveredStoryId, setHoveredStoryId] = useState<number | null>(null);

  // Synchronize searchParams from URL when navigating
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedType(searchParams.get('type') || '');
  }, [searchParams]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('truyenvui_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchApi('/categories')
      .then((res) => setCategories(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    let params = new URLSearchParams();
    params.append('per_page', '60'); // Fetch up to 60 items so search/category filters return full results
    if (query) params.append('q', query);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedType) params.append('type', selectedType);

    fetchApi(`/stories?${params.toString()}`)
      .then((res) => setStories(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, selectedCategory, selectedType]);

  // Save new search query to history
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1 && typeof window !== 'undefined') {
      const updated = [val.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== val.trim().toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem('truyenvui_recent_searches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('truyenvui_recent_searches');
    }
  };

  // Determine if user has an active filter or search query
  const hasActiveFilter = Boolean(query.trim() || selectedCategory || selectedType);
  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  // Top Most Read Stories
  const mostReadStories = [...stories]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Search & Filter Header Banner */}
      <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F2937]">
            Khám Phá & Tra Cứu Tác Phẩm
          </h1>
          {hasActiveFilter && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('');
                setSelectedType('');
              }}
              className="text-xs font-semibold text-[#C65D3A] hover:underline flex items-center gap-1"
            >
              <span>✕ Đặt lại tất cả bộ lọc</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#75777c] text-[18px]">search</span>
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm (tên truyện, tác giả)..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#242424] focus:outline-none focus:border-[#1F2937]"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#F7F5F0] border border-[#D8D1C5] rounded-lg p-2.5 text-xs text-[#242424] font-medium"
          >
            <option value="">Tất Cả Định Dạng (Novels & Comics)</option>
            <option value="NOVEL">Chỉ Tiểu Thuyết Chữ</option>
            <option value="COMIC">Chỉ Webtoon Comic</option>
          </select>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E5E0D8]">
          <button
            onClick={() => setSelectedCategory('')}
            className={`text-xs px-3.5 py-1.5 rounded-lg transition font-medium ${
              selectedCategory === ''
                ? 'bg-[#1F2937] text-white shadow-xs font-bold'
                : 'bg-[#EFECE5] text-[#242424] hover:bg-[#E5E0D8]'
            }`}
          >
            Tất Cả Thể Loại
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`text-xs px-3.5 py-1.5 rounded-lg transition font-medium ${
                selectedCategory === cat.slug
                  ? 'bg-[#C65D3A] text-white shadow-xs font-bold'
                  : 'bg-[#EFECE5] text-[#242424] hover:bg-[#E5E0D8]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* WHEN FILTERING: SHOW SEARCH RESULTS IMMEDIATELY AT TOP */}
      {hasActiveFilter && (
        <div className="space-y-4">
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C65D3A]">search</span>
              <span>
                {query
                  ? `Kết quả tìm kiếm cho từ khóa: "${query}"`
                  : activeCategoryObj
                  ? `Danh sách tác phẩm thể loại: "${activeCategoryObj.name}"`
                  : 'Danh sách tác phẩm phù hợp bộ lọc'}
              </span>
            </h2>
            <span className="text-xs font-bold text-[#C65D3A] bg-[#ffdbd0] px-3 py-1 rounded-full">
              {loading ? 'Đang tìm...' : `Tìm thấy ${stories.length} tác phẩm`}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#777777]">Đang lọc danh sách tác phẩm...</div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/truyen/${story.slug}`}
                  className="group bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl overflow-hidden hover:border-[#C65D3A] hover:shadow-md transition flex flex-col"
                >
                  <div className="aspect-[2/3] w-full relative overflow-hidden bg-[#EFECE5]">
                    <img
                      src={story.cover_url || 'https://via.placeholder.com/300x450'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-[#1F2937]/90 text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shadow">
                      {story.content_type === 'NOVEL' ? 'Tiểu Thuyết' : 'Comic'}
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                    <div>
                      <h3 className="font-editorial text-xs font-bold text-[#1F2937] line-clamp-1 group-hover:text-[#C65D3A] transition">
                        {story.title}
                      </h3>
                      <p className="text-[10px] text-[#777777] truncate mt-0.5">{story.author?.name}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#777777] pt-2 border-t border-[#E5E0D8]/50 mt-2">
                      <span className="truncate max-w-[80px] font-medium text-[#C65D3A]">{story.category?.name}</span>
                      <span>👁 {story.view_count.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-[48px] text-[#75777c]">search_off</span>
              <p className="text-sm font-semibold text-[#1F2937]">Không tìm thấy tác phẩm nào phù hợp!</p>
              <p className="text-xs text-[#777777]">Hãy thử đổi từ khóa tìm kiếm hoặc chọn thể loại khác.</p>
            </div>
          )}
        </div>
      )}

      {/* FEATURED ACCORDION SECTION (Visible when browsing or at top when no filter active) */}
      <section className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <h2 className="font-editorial text-lg font-bold text-[#1F2937] flex items-center gap-2">
            <span>🔥 Sách Được Đọc Nhiều Nhất Gần Đây</span>
          </h2>
          <span className="text-[11px] text-[#777777]">Rê chuột vào cuốn sách để xem hiệu ứng mở rộng</span>
        </div>

        {/* Accordion Flex Container */}
        <div
          onMouseLeave={() => setHoveredStoryId(null)}
          className="flex flex-col sm:flex-row gap-4 py-2 overflow-hidden h-[280px]"
        >
          {mostReadStories.map((story, idx) => {
            const isHovered = hoveredStoryId === story.id;
            const hasAnyHovered = hoveredStoryId !== null;
            const isOtherHovered = hasAnyHovered && !isHovered;

            return (
              <Link
                key={story.id}
                href={`/truyen/${story.slug}`}
                onMouseEnter={() => setHoveredStoryId(story.id)}
                className={`relative rounded-lg overflow-hidden transition-all duration-500 ease-out h-full ${
                  isHovered
                    ? 'flex-[4] sm:flex-[5] bg-[#FFFDF8] border-2 border-[#C65D3A] shadow-2xl z-20 scale-[1.01]'
                    : isOtherHovered
                    ? 'flex-[0.8] sm:flex-[1] opacity-80 border border-[#E5E0D8]'
                    : 'flex-1 border border-[#E5E0D8]'
                }`}
              >
                {isHovered ? (
                  /* EXPANDED HOVER STATE */
                  <div className="w-full h-full p-4 flex flex-row gap-4 items-center animate-fade-in bg-[#FFFDF8]">
                    <div className="w-36 sm:w-44 h-full flex-shrink-0 relative rounded overflow-hidden shadow-md border border-black/10">
                      <img
                        src={story.cover_url || 'https://via.placeholder.com/300x450'}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                          idx === 0
                            ? 'bg-[#C65D3A] text-white'
                            : idx === 1
                            ? 'bg-[#1F2937] text-white'
                            : 'bg-[#EFECE5] text-[#1F2937] border border-[#E5E0D8]'
                        }`}
                      >
                        #{idx + 1} TOP
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 h-full flex flex-col justify-between py-1 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider bg-[#1F2937] text-white px-2.5 py-0.5 rounded shadow-sm">
                            {story.content_type === 'NOVEL' ? 'Tiểu Thuyết' : 'Comic'}
                          </span>
                          <span className="text-xs sm:text-sm text-[#C65D3A] font-bold">
                            {story.category?.name}
                          </span>
                        </div>

                        <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1F2937] leading-tight line-clamp-1">
                          {story.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#4B5563] line-clamp-3 leading-relaxed font-ui">
                          {story.summary}
                        </p>

                        <p className="text-xs sm:text-sm text-[#1F2937] font-semibold">
                          Tác giả: <span className="font-medium text-[#4B5563]">{story.author?.name}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
                        <span className="text-xs sm:text-sm text-[#C65D3A] font-bold flex items-center gap-1">
                          👁 {(story.view_count || 0).toLocaleString()} lượt đọc
                        </span>
                        <span className="bg-[#C65D3A] hover:bg-[#a84c2d] text-white text-xs sm:text-sm font-bold px-5 py-2 rounded shadow-md transition">
                          Đọc Ngay →
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* COMPACT NORMAL STATE */
                  <div className="w-full h-full relative group cursor-pointer bg-[#EFECE5]">
                    <img
                      src={story.cover_url || 'https://via.placeholder.com/300x450'}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 flex flex-col justify-between text-white">
                      <div className="flex justify-start">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                            idx === 0
                              ? 'bg-[#C65D3A] text-white'
                              : idx === 1
                              ? 'bg-[#1F2937] text-white'
                              : 'bg-[#FFFDF8] text-[#1F2937]'
                          }`}
                        >
                          #{idx + 1} TOP
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-editorial text-xs font-bold line-clamp-1 drop-shadow-sm">
                          {story.title}
                        </h3>
                        <div className="flex items-center justify-between text-[9px] opacity-90">
                          <span>👁 {(story.view_count || 0).toLocaleString()}</span>
                          <span>{story.content_type === 'NOVEL' ? 'Tiểu Thuyết' : 'Comic'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT SEARCHES & SUGGESTIONS */}
      <section className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <h2 className="font-editorial text-lg font-bold text-[#1F2937] flex items-center gap-2">
            <span>🕒 Sách & Từ Khóa Tìm Gần Đây</span>
          </h2>
          {recentSearches.length > 0 && (
            <button
              onClick={clearRecentSearches}
              className="text-[11px] text-[#C65D3A] hover:underline"
            >
              Xóa lịch sử tìm kiếm
            </button>
          )}
        </div>

        {recentSearches.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-[#777777]">Các từ khóa bạn đã tìm kiếm gần đây:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(term)}
                  className="bg-[#F7F5F0] hover:bg-[#EFECE5] text-[#1F2937] text-xs px-3 py-1.5 rounded-full border border-[#E5E0D8] transition flex items-center gap-1.5"
                >
                  <span>🔍</span>
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#777777] italic">
            Chưa có lịch sử tìm kiếm nào gần đây. Hãy nhập từ khóa trên khung tìm kiếm để lưu lại!
          </div>
        )}

        {/* Quick Suggestion Cards */}
        <div className="pt-3 border-t border-[#E5E0D8]/60">
          <p className="text-xs font-semibold text-[#1F2937] mb-3">Gợi Ý Tìm Nhanh Tác Phẩm Nổi Bật:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stories.slice(0, 3).map((s) => (
              <div
                key={s.id}
                onClick={() => setQuery(s.title)}
                className="bg-[#F7F5F0] hover:bg-[#EFECE5] p-3 rounded-lg border border-[#E5E0D8] cursor-pointer transition flex items-center gap-3"
              >
                <img
                  src={s.cover_url || ''}
                  alt={s.title}
                  className="w-10 h-14 object-cover rounded shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-editorial text-xs font-semibold text-[#1F2937] truncate">{s.title}</h4>
                  <p className="text-[10px] text-[#777777]">{s.author?.name}</p>
                  <span className="text-[9px] text-[#C65D3A] font-semibold">🔍 Nhấn để lọc nhanh</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN ALL STORIES GRID (Visible when NO active filter) */}
      {!hasActiveFilter && (
        <div className="space-y-4">
          <h2 className="font-editorial text-xl font-bold text-[#1F2937] border-b border-[#E5E0D8] pb-2">
            Tất Cả Tác Phẩm Đã Sát Thực Bản Quyền
          </h2>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#777777]">Đang tải danh sách tác phẩm...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/truyen/${story.slug}`}
                  className="group bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl overflow-hidden hover:border-[#1F2937] shadow-2xs hover:shadow-md transition flex flex-col"
                >
                  <div className="aspect-[2/3] w-full relative overflow-hidden bg-[#EFECE5]">
                    <img
                      src={story.cover_url || 'https://via.placeholder.com/300x450'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-[#1F2937]/90 text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shadow">
                      {story.content_type === 'NOVEL' ? 'Tiểu Thuyết' : 'Comic'}
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                    <div>
                      <h3 className="font-editorial text-xs font-bold text-[#1F2937] line-clamp-1 group-hover:text-[#C65D3A] transition">
                        {story.title}
                      </h3>
                      <p className="text-[10px] text-[#777777] truncate mt-0.5">{story.author?.name}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#777777] pt-2 border-t border-[#E5E0D8]/50 mt-2">
                      <span className="truncate max-w-[80px] font-medium text-[#C65D3A]">{story.category?.name}</span>
                      <span>👁 {story.view_count.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
