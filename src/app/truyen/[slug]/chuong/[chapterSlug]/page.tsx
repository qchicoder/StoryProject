'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function ChapterReaderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const chapterSlug = params.chapterSlug as string;

  const [chapterData, setChapterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [fontSize, setFontSize] = useState(19);
  const [fontFamily, setFontFamily] = useState<'Literata' | 'Inter'>('Literata');
  const [theme, setTheme] = useState<'warm' | 'light' | 'dark'>('warm');
  const [showSettings, setShowSettings] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [textAlign, setTextAlign] = useState<'justify' | 'left' | 'center'>('justify');
  const [readerWidth, setReaderWidth] = useState('768px');
  const [lineHeightVal, setLineHeightVal] = useState(1.8);
  const [paragraphIndent, setParagraphIndent] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vandan_reader_prefs');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.readingFont) setFontFamily(p.readingFont === 'Merriweather' || p.readingFont === 'Lora' ? 'Literata' : 'Inter');
        if (p.fontSize) setFontSize(parseInt(p.fontSize) || 19);
        if (p.readingTheme) setTheme(p.readingTheme === 'sepia' ? 'warm' : (p.readingTheme as any));
        if (p.textAlign) setTextAlign(p.textAlign);
        if (p.readerWidth) setReaderWidth(p.readerWidth);
        if (p.lineHeight) setLineHeightVal(parseFloat(p.lineHeight) || 1.8);
        if (typeof p.paragraphIndent === 'boolean') setParagraphIndent(p.paragraphIndent);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchApi(`/stories/${slug}/chapters/${chapterSlug}`)
      .then((chRes) => {
        setChapterData(chRes.data);
      })
      .catch(() => {
        // Fallback to legacy lookup if needed
        return fetchApi(`/stories/${slug}`)
          .then((storyRes) => {
            const story = storyRes.data.story;
            const targetChapter = story.chapters.find(
              (c: any) => c.slug === chapterSlug || `chuong-${c.chapter_number}` === chapterSlug
            );
            if (targetChapter) {
              return fetchApi(`/chapters/${targetChapter.id}`);
            }
            throw new Error('Chương không tồn tại');
          })
          .then((chRes) => {
            setChapterData(chRes.data);
          });
      })
      .catch((err) => console.error('Lỗi khi tải chương:', err))
      .finally(() => setLoading(false));
  }, [slug, chapterSlug]);

  const handleUnlock = async () => {
    if (!chapterData) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('vandan_token') : null;
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản để mở khóa chương VIP.');
      window.location.href = '/dang-nhap';
      return;
    }
    setUnlocking(true);
    try {
      const res = await fetchApi(`/chapters/${chapterData.id}/unlock`, { method: 'POST' });
      if (res.data?.chapter) {
        setChapterData((prev: any) => ({
          ...prev,
          is_unlocked: true,
          content: res.data.chapter.content,
          comic_images: res.data.chapter.comic_images,
        }));
      } else {
        const updatedRes = await fetchApi(`/chapters/${chapterData.id}`);
        setChapterData(updatedRes.data);
      }
    } catch (err: any) {
      setShowCoinsModal(true);
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] text-[#1b1c1c] dark:text-slate-100 font-ui py-12">
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center animate-pulse space-y-6">
          <div className="w-48 h-6 bg-[#e5e0d8] dark:bg-slate-800 rounded-lg"></div>
          <div className="w-80 h-8 bg-[#e5e0d8] dark:bg-slate-800 rounded-lg"></div>
          <div className="w-full space-y-3.5 pt-8">
            <div className="h-4 bg-[#e5e0d8]/80 dark:bg-slate-800/80 rounded w-full"></div>
            <div className="h-4 bg-[#e5e0d8]/80 dark:bg-slate-800/80 rounded w-11/12"></div>
            <div className="h-4 bg-[#e5e0d8]/80 dark:bg-slate-800/80 rounded w-4/5"></div>
            <div className="h-4 bg-[#e5e0d8]/80 dark:bg-slate-800/80 rounded w-full"></div>
            <div className="h-4 bg-[#e5e0d8]/80 dark:bg-slate-800/80 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!chapterData) {
    return <div className="py-24 text-center text-xs text-red-600">Không tìm thấy nội dung chương.</div>;
  }

  const themeStyles = {
    warm: 'bg-[#F7F5F0] text-[#242424]',
    light: 'bg-[#FAFAFA] text-[#1F2937]',
    dark: 'bg-[#161618] text-[#E2E0D8]',
  };

  const canvasBg = {
    warm: 'bg-[#FFFDF8] border-[#E5E0D8]',
    light: 'bg-[#FFFFFF] border-[#E5E0D8]',
    dark: 'bg-[#1F1F23] border-[#2E2E34]',
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeStyles[theme]}`}>
      {/* 1. Ultra-thin Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-300/40">
        <div className="h-full bg-[#9f4120] transition-all duration-150" style={{ width: '65%' }}></div>
      </div>

      {/* 2. Stitch Sticky Top Reader Navigation Bar */}
      <header className="sticky top-16 z-40 bg-[#FFFDF8]/95 backdrop-blur-sm border-b border-[#E5E0D8] py-2.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-xs font-ui">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/truyen/${chapterData.story_slug}`}
              className="flex items-center gap-1 text-[#75777c] hover:text-[#1b1c1c] font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">Chi tiết tác phẩm</span>
            </Link>
            <span className="text-[#c5c6cc] hidden sm:inline">/</span>
            <div className="min-w-0 flex items-center gap-2">
              <h2 className="font-editorial text-xs font-bold text-[#0a1422] truncate" title={chapterData.story_title}>
                {chapterData.story_title}
              </h2>
              <span className="hidden md:inline-block text-[10px] text-[#75777c] bg-[#efeded] px-2 py-0.5 rounded font-semibold">
                Chương {chapterData.chapter_number}
              </span>
            </div>
          </div>

          {/* Right: Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-1.5 rounded hover:bg-[#efeded] text-[#75777c] hover:text-[#9f4120] transition-colors flex items-center gap-1"
              title="Ghim vị trí đọc"
            >
              <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'text-[#9f4120]' : ''}`}>
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
              <span className="hidden md:inline">{isBookmarked ? 'Đã ghim' : 'Ghim vị trí'}</span>
            </button>

            <Link
              href="/cai-dat"
              className="px-3 py-1.5 rounded-lg border border-[#e5e0d8] bg-[#FFFDF8] hover:bg-[#efeded] text-[#1b1c1c] font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#9f4120]">tune</span>
              <span>Tùy biến đọc (Aa)</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 4. Main Reading Canvas Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
        <article className={`w-full rounded-xl border p-6 sm:p-12 shadow-sm transition-all ${canvasBg[theme]}`} style={{ maxWidth: readerWidth }}>
          {/* Header */}
          <div className="text-center pb-8 border-b border-[#e5e0d8]/50 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9f4120] bg-[#fe8861]/20 px-2 py-0.5 rounded">
              {chapterData.content_type === 'NOVEL' ? 'Tiểu Thuyết Dã Sử' : 'Comic Webtoon'}
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0a1422] pt-1">
              {chapterData.title}
            </h1>
            <p className="text-xs text-[#75777c]">Tác phẩm: {chapterData.story_title}</p>
          </div>

          {/* Unlocked Reading vs Paid Lock Screen */}
          {chapterData.is_unlocked ? (
            <div className="pt-8">
              {chapterData.content_type === 'NOVEL' ? (
                <div
                  className={`space-y-6 ${fontFamily === 'Literata' ? 'font-editorial' : 'font-ui'} ${paragraphIndent ? '[&>p]:indent-6' : ''}`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: lineHeightVal, textAlign: textAlign as any }}
                  dangerouslySetInnerHTML={{ __html: chapterData.content }}
                />
              ) : (
                <div className="space-y-3 max-w-xl mx-auto">
                  {chapterData.comic_images?.map((img: any) => (
                    <div key={img.id} className="rounded-lg overflow-hidden shadow border border-[#e5e0d8]">
                      <img src={img.image_url} alt={`Trang ${img.order_index}`} className="w-full h-auto object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Paid Lock Screen matching Stitch Screen 5fdb8865fc514c7fafca1645de34d7a1 */
            <div className="py-12 my-6 bg-[#f5f3f3] border border-[#9f4120]/30 rounded-xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#9f4120]/10 text-[#9f4120] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>

              <div className="space-y-1">
                <h3 className="font-editorial text-xl font-bold text-[#0a1422]">
                  Chương Này Được Khóa Bản Quyền
                </h3>
                <p className="text-xs text-[#75777c] max-w-sm mx-auto">
                  Mở khóa để tiếp tục thưởng thức tác phẩm và trực tiếp ủng hộ tác giả phát hành thêm chương mới.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#ffffff] border border-[#e5e0d8] px-4 py-2 rounded-lg text-xs font-bold text-[#9f4120]">
                <span className="material-symbols-outlined text-[18px]">toll</span>
                <span>Giá Mở Khóa: {chapterData.coin_price} Xu</span>
              </div>

              <div>
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="w-full max-w-xs bg-[#9f4120] hover:bg-[#732102] text-white text-xs font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>{unlocking ? 'Đang Xử Lý...' : `Mở Khóa Ngay (${chapterData.coin_price} Xu)`}</span>
                </button>
              </div>
            </div>
          )}
        </article>

        {/* Chapter Navigation Buttons */}
        <div className="w-full max-w-[720px] flex items-center justify-between pt-8 mt-6 border-t border-[#e5e0d8] text-xs font-ui">
          {chapterData.prev_chapter ? (
            <Link
              href={`/truyen/${slug}/chuong/chuong-${chapterData.prev_chapter.chapter_number}`}
              className="flex items-center gap-1 px-4 py-2 border border-[#1f2937] text-[#1f2937] font-semibold rounded-lg hover:bg-[#efeded] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Chương Trước</span>
            </Link>
          ) : (
            <span className="text-[#75777c]">Hết chương trước</span>
          )}

          {chapterData.next_chapter ? (
            <Link
              href={`/truyen/${slug}/chuong/chuong-${chapterData.next_chapter.chapter_number}`}
              className="flex items-center gap-1 px-4 py-2 bg-[#1f2937] text-white font-semibold rounded-lg hover:bg-[#0a1422] transition-colors"
            >
              <span>Chương Tiếp</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          ) : (
            <span className="text-[#75777c]">Đã đến chương mới nhất</span>
          )}
        </div>
      </main>

      {/* Insufficient Coins Custom Modal Window */}
      {showCoinsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-editorial text-xl font-bold text-[#1F2937]">
                Số dư xu bạn không có đủ
              </h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                Vui lòng nạp thêm Xu vào Ví Độc Giả để tiếp tục thưởng thức chương sách bản quyền này.
              </p>
            </div>

            {/* 2 Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {/* Green Button: Nạp thêm xu */}
              <Link
                href="/vi-xu"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-ui text-xs font-bold py-3 px-4 rounded-lg shadow transition flex items-center justify-center gap-1.5"
              >
                <span>Nạp thêm xu</span>
              </Link>

              {/* Red Button with 'X': Hủy */}
              <button
                onClick={() => setShowCoinsModal(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-ui text-xs font-bold py-3 px-4 rounded-lg shadow transition flex items-center justify-center gap-1.5"
              >
                <span>Hủy ✕</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
