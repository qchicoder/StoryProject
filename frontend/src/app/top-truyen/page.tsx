'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Story, Category } from '@/types';
import { fetchApi } from '@/lib/api';

interface TopicColumn {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  headerGradient: string;
  badgeBg: string;
  filterFn: (story: Story) => boolean;
}

export default function TopStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      fetchApi('/stories?sort=views'),
      fetchApi('/categories').catch(() => ({ data: [] })),
    ])
      .then(([storiesRes, categoriesRes]) => {
        setStories(storiesRes.data.data || []);
        setCategories(categoriesRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Define column topics with accurate filtering criteria
  const topicColumns: TopicColumn[] = [
    {
      id: 'all',
      title: 'BXH Tổng Hợp',
      subtitle: 'Được đọc nhiều nhất toàn viện',
      icon: 'military_tech',
      headerGradient: 'from-[#9f4120] to-[#d97706]',
      badgeBg: 'bg-[#9f4120]',
      filterFn: () => true,
    },
    {
      id: 'tien-hiep',
      title: 'Tiên Hiệp & Huyền Huyễn',
      subtitle: 'Tu chân, pháp bảo, huyền ảo',
      icon: 'auto_awesome',
      headerGradient: 'from-[#1e3a8a] to-[#3b82f6]',
      badgeBg: 'bg-[#1e3a8a]',
      filterFn: (s) => {
        const cat = (s.category?.name || '').toLowerCase();
        const slug = (s.category?.slug || '').toLowerCase();
        const title = (s.title || '').toLowerCase();
        return (
          cat.includes('tiên') ||
          cat.includes('huyền') ||
          slug.includes('tien') ||
          slug.includes('huyen') ||
          title.includes('tiên') ||
          title.includes('huyễn') ||
          title.includes('chuyển sinh') ||
          title.includes('huyết mạch') ||
          title.includes('tôn thượng')
        );
      },
    },
    {
      id: 'da-su',
      title: 'Dã Sử & Cổ Trang',
      subtitle: 'Lịch sử Đại Việt, triều đình',
      icon: 'auto_stories',
      headerGradient: 'from-[#065f46] to-[#10b981]',
      badgeBg: 'bg-[#065f46]',
      filterFn: (s) => {
        const cat = (s.category?.name || '').toLowerCase();
        const slug = (s.category?.slug || '').toLowerCase();
        const title = (s.title || '').toLowerCase();
        return (
          cat.includes('dã sử') ||
          cat.includes('cổ trang') ||
          slug.includes('da-su') ||
          slug.includes('co-trang') ||
          title.includes('tây sơn') ||
          title.includes('sương phủ') ||
          title.includes('triều đóa')
        );
      },
    },
    {
      id: 'webtoon',
      title: 'Truyện Tranh Webtoon',
      subtitle: 'Comic, Manhua, Manhwa sắc nét',
      icon: 'palette',
      headerGradient: 'from-[#831843] to-[#ec4899]',
      badgeBg: 'bg-[#831843]',
      filterFn: (s) => {
        const cat = (s.category?.name || '').toLowerCase();
        const slug = (s.category?.slug || '').toLowerCase();
        const title = (s.title || '').toLowerCase();
        return (
          s.content_type === 'COMIC' ||
          cat.includes('tranh') ||
          cat.includes('webtoon') ||
          slug.includes('webtoon') ||
          slug.includes('manh') ||
          slug.includes('comic') ||
          title.includes('hồn linh') ||
          title.includes('webtoon')
        );
      },
    },
  ];

  // Helper to get stories for a specific topic column
  const getTopicStories = (column: TopicColumn): Story[] => {
    const filtered = stories.filter(column.filterFn);
    const sorted = [...filtered].sort((a, b) => b.view_count - a.view_count);

    if (column.id === 'all') {
      return sorted.slice(0, 5);
    }

    if (sorted.length >= 3) {
      if (sorted.length < 5) {
        const extra = stories.filter((s) => !sorted.some((item) => item.id === s.id));
        return [...sorted, ...extra].slice(0, 5);
      }
      return sorted.slice(0, 5);
    }

    // Fallback if small dataset
    const extra = stories.filter((s) => !sorted.some((item) => item.id === s.id));
    return [...sorted, ...extra].slice(0, 5);
  };

  // Visible columns based on tab selection
  const visibleColumns = selectedTopic === 'all'
    ? topicColumns
    : topicColumns.filter((col) => col.id === selectedTopic || col.id === 'all');

  return (
    <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] text-[#1b1c1c] dark:text-slate-100 font-ui py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        {/* Page Header Banner */}
        <div className="bg-[#f5f3f3] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xs transition-colors">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdbd0] dark:bg-amber-950/60 text-[#9f4120] dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              <span>Bảng Xếp Hạng Độc Giả</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0a1422] dark:text-slate-100 tracking-tight">
              Bảng Vàng Văn Đàn Theo Chủ Đề
            </h1>
            <p className="text-xs sm:text-sm text-[#44474c] dark:text-slate-400 mt-2 leading-relaxed">
              Tổng hợp những kiệt tác được độc giả đón đọc nhiều nhất tuần qua, phân chia chi tiết theo từng chủ đề và thể loại.
            </p>
          </div>
        </div>

        {/* Filter Tabs Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#e5e0d8] dark:border-slate-800 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedTopic === 'all'
                  ? 'bg-[#9f4120] dark:bg-amber-600 text-white shadow-md font-bold'
                  : 'bg-[#f5f3f3] dark:bg-slate-800 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-700 hover:text-[#0a1422] dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Tất cả cột chủ đề</span>
            </button>

            {topicColumns.slice(1).map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedTopic(col.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedTopic === col.id
                    ? 'bg-[#9f4120] dark:bg-amber-600 text-white shadow-md font-bold'
                    : 'bg-[#f5f3f3] dark:bg-slate-800 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-700 hover:text-[#0a1422] dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{col.icon}</span>
                <span>{col.title}</span>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-[#75777c] dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#9f4120] dark:bg-amber-400 animate-pulse"></span>
            <span>Cập nhật 1 giờ trước</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((colIdx) => (
              <div key={colIdx} className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="h-14 bg-[#efeded] dark:bg-slate-800 rounded-xl"></div>
                <div className="h-44 bg-[#efeded] dark:bg-slate-800 rounded-xl"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((rowIdx) => (
                    <div key={rowIdx} className="h-16 bg-[#efeded] dark:bg-slate-800 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Multi-Column Grid Layout */
          <div className={`grid grid-cols-1 ${visibleColumns.length > 1 ? 'md:grid-cols-2 xl:grid-cols-4' : 'max-w-2xl mx-auto'} gap-6`}>
            {visibleColumns.map((col) => {
              const columnStories = getTopicStories(col);
              const top1 = columnStories[0];
              const restList = columnStories.slice(1);

              return (
                <div
                  key={col.id}
                  className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Column Header Banner */}
                    <div className={`p-4 bg-gradient-to-r ${col.headerGradient} text-white relative`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[22px]">{col.icon}</span>
                          <h3 className="font-editorial text-base font-bold leading-tight">{col.title}</h3>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          TOP 5
                        </span>
                      </div>
                      <p className="text-[11px] opacity-85 mt-1">{col.subtitle}</p>
                    </div>

                    {/* Top 1 Highlight Card (Hoàn toàn đồng bộ màu Dark/Light Mode) */}
                    {top1 && (
                      <div className="p-4 border-b border-[#e5e0d8] dark:border-slate-800/80 bg-[#fbf9f9] dark:bg-slate-900/60">
                        <Link href={`/truyen/${top1.slug}`} className="group block">
                          <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/9] shadow-xs">
                            <img
                              src={top1.cover_url || 'https://via.placeholder.com/300x170'}
                              alt={top1.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#d97706] text-white flex items-center justify-center font-editorial font-bold text-xs shadow-md border border-white">
                              #1
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#0a1422]/80 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">visibility</span>
                              <span>{top1.view_count.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#9f4120] dark:text-amber-400 bg-[#ffdbd0] dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                              {top1.content_type}
                            </span>
                            <span className="text-[10px] text-[#75777c] dark:text-slate-400 truncate">• {top1.category?.name || 'Tổng hợp'}</span>
                          </div>

                          <h4 className="font-editorial text-sm font-bold text-[#0a1422] dark:text-slate-100 group-hover:text-[#9f4120] dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                            {top1.title}
                          </h4>
                          <p className="text-[11px] text-[#44474c] dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {top1.summary || 'Tác phẩm đang tạo sức hút lớn trong tuần...'}
                          </p>
                        </Link>
                      </div>
                    )}

                    {/* Rank #2 to #5 List (Rõ nét 100%, không bị vòng tròn trắng che chữ) */}
                    <div className="p-2 divide-y divide-[#f5f3f3] dark:divide-slate-800/60 bg-white dark:bg-[#1e293b]">
                      {restList.map((story, idx) => {
                        const rankNum = idx + 2;
                        const rankBadgeColor =
                          rankNum === 2
                            ? 'bg-[#475569] text-white font-bold'
                            : rankNum === 3
                            ? 'bg-[#92400e] text-white font-bold'
                            : 'bg-[#ffdbd0] dark:bg-slate-800 text-[#9f4120] dark:text-amber-400 border border-[#9f4120]/20 dark:border-slate-700 font-bold';

                        return (
                          <Link
                            key={story.id}
                            href={`/truyen/${story.slug}`}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f5f3f3] dark:hover:bg-slate-800/80 transition-colors group"
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-editorial shrink-0 ${rankBadgeColor}`}
                            >
                              #{rankNum}
                            </span>

                            <img
                              src={story.cover_url || 'https://via.placeholder.com/80'}
                              alt={story.title}
                              className="w-10 h-12 rounded object-cover shrink-0 border border-[#e5e0d8] dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform"
                            />

                            <div className="flex-1 min-w-0">
                              <h5 className="font-editorial text-xs font-bold text-[#0a1422] dark:text-slate-100 group-hover:text-[#9f4120] dark:group-hover:text-amber-400 transition-colors truncate">
                                {story.title}
                              </h5>
                              <div className="flex items-center justify-between text-[10px] text-[#75777c] dark:text-slate-400 mt-0.5">
                                <span className="truncate max-w-[90px]">{story.category?.name || 'Văn Đàn'}</span>
                                <span className="font-semibold text-[#44474c] dark:text-slate-300 shrink-0">
                                  👁 {story.view_count.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column Footer Action */}
                  <div className="p-3 border-t border-[#e5e0d8] dark:border-slate-800 bg-[#fbf9f9] dark:bg-slate-900/50 text-center">
                    <Link
                      href={`/tim-kiem${col.id !== 'all' ? `?category=${col.id}` : ''}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#9f4120] dark:text-amber-400 hover:text-[#732102] dark:hover:text-amber-300 transition-colors"
                    >
                      <span>Xem đầy đủ chủ đề này</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
