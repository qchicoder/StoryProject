'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Story, Comment } from '@/types';
import { fetchApi } from '@/lib/api';

export default function StoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'about'>('chapters');

  useEffect(() => {
    if (!slug) return;
    fetchApi(`/stories/${slug}`)
      .then((res) => {
        setStory(res.data.story);
        setIsFollowing(res.data.is_following);
      })
      .catch((err) => console.error('Error fetching story detail:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleToggleFollow = async () => {
    if (!story) return;
    try {
      const res = await fetchApi(`/stories/${story.id}/follow`, { method: 'POST' });
      setIsFollowing(res.is_following);
    } catch (err: any) {
      alert(err.message || 'Vui lòng đăng nhập để theo dõi truyện!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] py-20 text-center text-xs text-[#75777c] dark:text-slate-400 animate-pulse">
        Đang tải thông tin chi tiết tác phẩm...
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] py-20 text-center text-xs text-red-600 dark:text-rose-400 font-semibold">
        Không tìm thấy tác phẩm yêu cầu.
      </div>
    );
  }

  const firstChapter = story.chapters && story.chapters.length > 0 ? story.chapters[0] : null;

  return (
    <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] text-[#1b1c1c] dark:text-slate-100 font-ui py-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Story Banner Header Hero Card */}
        <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-sm transition-colors">
          {/* Cover Image Container */}
          <div className="w-48 sm:w-52 h-72 flex-shrink-0 relative rounded-xl overflow-hidden shadow-md border border-[#e5e0d8] dark:border-slate-700 mx-auto md:mx-0 group">
            <img
              src={story.cover_url || 'https://via.placeholder.com/300x450'}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Story Main Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold">
              <span className="bg-[#9f4120] dark:bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                {story.content_type === 'NOVEL' ? 'TIỂU THUYẾT' : 'TRUYỆN TRANH'}
              </span>
              <span className="text-[#75777c] dark:text-slate-500">•</span>
              <span className="text-[#9f4120] dark:text-amber-400 font-semibold">{story.category?.name}</span>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0a1422] dark:text-slate-100 tracking-tight leading-tight">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#75777c] dark:text-slate-400">
              <span>Tác giả: <strong className="text-[#0a1422] dark:text-slate-200">{story.author?.name || 'Văn Đàn'}</strong></span>
              <span>•</span>
              <span>👁 {story.view_count.toLocaleString()} lượt xem</span>
              <span>•</span>
              <span>
                Trạng thái:{' '}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                    story.status === 'COMPLETED'
                      ? 'bg-[#10b981] text-white shadow-2xs'
                      : 'bg-[#2563eb] text-white shadow-2xs'
                  }`}
                >
                  {story.status === 'COMPLETED' ? 'Đã Hoàn Thành' : 'Đang Cập Nhật'}
                </span>
              </span>
            </div>

            {/* Story Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
                {story.tags.map((tag) => (
                  <span key={tag.id} className="text-[11px] bg-[#f5f3f3] dark:bg-slate-800 border border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 px-2.5 py-0.5 rounded-lg font-medium">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Summary */}
            <p className="text-xs sm:text-sm text-[#44474c] dark:text-slate-300 line-clamp-3 leading-relaxed font-ui pt-3 border-t border-[#e5e0d8] dark:border-slate-800">
              {story.summary}
            </p>

            {/* Action Buttons: Read & Follow */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              {firstChapter && (
                <Link
                  href={`/truyen/${story.slug}/chuong/${firstChapter.slug}`}
                  className="bg-[#9f4120] dark:bg-amber-600 hover:bg-[#732102] dark:hover:bg-amber-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 transform hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  <span>Đọc Từ Đầu (Chương 1)</span>
                </Link>
              )}

              <button
                onClick={handleToggleFollow}
                className={`text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 transform hover:scale-[1.02] ${
                  isFollowing
                    ? 'bg-emerald-600 dark:bg-emerald-600 text-white border border-emerald-600 shadow-md hover:bg-emerald-700'
                    : 'bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-500/50 hover:bg-amber-100 dark:hover:bg-slate-700 shadow-sm'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isFollowing ? 'text-white' : '!text-amber-900 dark:!text-amber-400'}`}>
                  {isFollowing ? 'bookmark_added' : 'bookmark_add'}
                </span>
                <span className={isFollowing ? 'text-white' : '!text-amber-900 dark:!text-amber-400'}>
                  {isFollowing ? '✓ Đã Theo Dõi Tủ Sách' : '+ Theo Dõi Tủ Sách'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-[#e5e0d8] dark:border-slate-800 flex gap-8 font-editorial text-sm font-bold">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'chapters'
                ? 'border-[#9f4120] dark:border-amber-400 text-[#9f4120] dark:text-amber-400'
                : 'border-transparent text-[#75777c] dark:text-slate-400 hover:text-[#0a1422] dark:hover:text-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            <span>Danh Sách Chương ({story.chapters?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'about'
                ? 'border-[#9f4120] dark:border-amber-400 text-[#9f4120] dark:text-amber-400'
                : 'border-transparent text-[#75777c] dark:text-slate-400 hover:text-[#0a1422] dark:hover:text-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>Giới Thiệu Tác Phẩm</span>
          </button>
        </div>

        {/* Tab 1: Chapter List */}
        {activeTab === 'chapters' && (
          <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl divide-y divide-[#e5e0d8] dark:divide-slate-800/80 shadow-sm overflow-hidden transition-colors">
            {story.chapters && story.chapters.length > 0 ? (
              story.chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/truyen/${story.slug}/chuong/${ch.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-[#f5f3f3] dark:hover:bg-slate-800/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-editorial text-sm font-bold text-[#0a1422] dark:text-slate-100 group-hover:text-[#9f4120] dark:group-hover:text-amber-400 transition-colors">
                      {ch.title}
                    </span>
                    {ch.is_paid && (
                      <span className="text-xs bg-[#fff4ed] dark:bg-amber-950/60 border border-[#ffc5b2] dark:border-amber-500/50 text-[#7c2d12] dark:text-[#fde68a] px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 shadow-2xs">
                        🪙 {ch.coin_price} Xu (Bản quyền)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#75777c] dark:text-slate-400 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>{ch.view_count.toLocaleString()}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#75777c] dark:text-slate-400">Chưa có chương nào được phát hành.</div>
            )}
          </div>
        )}

        {/* Tab 2: About Story */}
        {activeTab === 'about' && (
          <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 font-ui text-sm text-[#44474c] dark:text-slate-200 leading-relaxed shadow-sm transition-colors space-y-3">
            <h3 className="font-editorial text-lg font-bold text-[#0a1422] dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">auto_stories</span>
              <span>Tóm Tắt Chi Tiết Tác Phẩm</span>
            </h3>
            <p className="whitespace-pre-line">{story.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
