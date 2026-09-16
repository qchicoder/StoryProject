'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function LibraryPage() {
  const [follows, setFollows] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/me/library')
      .then((res) => {
        setFollows(res.data.follows || []);
        setProgress(res.data.reading_progress || []);
      })
      .catch((err) => console.error('Lỗi tải tủ sách:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#777777]">Đang tải Tủ Sách của bạn...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div className="border-b border-[#E5E0D8] pb-4">
        <h1 className="font-editorial text-2xl font-bold text-[#1F2937]">
          Tủ Sách & Lịch Sử Đọc Của Tôi
        </h1>
        <p className="text-xs text-[#777777]">Quản lý các tác phẩm bạn đang theo dõi và tiến trình đọc gần đây</p>
      </div>

      {/* Section 1: Reading Progress */}
      <div>
        <h2 className="font-editorial text-lg font-bold text-[#1F2937] mb-4">
          📖 Tiến Trình Đọc Dở Gần Đây
        </h2>

        {progress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-lg p-4 flex gap-4 items-center shadow-sm"
              >
                <div className="w-16 h-24 bg-[#EFECE5] rounded overflow-hidden flex-shrink-0">
                  <img
                    src={item.story?.cover_url || 'https://via.placeholder.com/150'}
                    alt={item.story?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-editorial text-sm font-semibold text-[#1F2937] truncate">
                    {item.story?.title}
                  </h3>
                  <p className="text-xs text-[#777777]">
                    Đang đọc: <strong className="text-[#C65D3A]">{item.chapter?.title}</strong>
                  </p>
                  <p className="text-[10px] text-[#777777]">
                    Cập nhật: {new Date(item.last_read_at).toLocaleDateString('vi-VN')}
                  </p>
                  {item.chapter && item.story && (
                    <Link
                      href={`/truyen/${item.story.slug}/chuong/${item.chapter.slug}`}
                      className="inline-block bg-[#1F2937] text-white text-[11px] font-semibold px-3 py-1 rounded mt-2 hover:bg-[#C65D3A] transition"
                    >
                      Đọc Tiếp →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] p-6 rounded text-center text-xs text-[#777777]">
            Bạn chưa có lịch sử đọc tác phẩm nào.
          </div>
        )}
      </div>

      {/* Section 2: Followed Stories */}
      <div>
        <h2 className="font-editorial text-lg font-bold text-[#1F2937] mb-4">
          ♥ Tác Phẩm Đang Theo Dõi ({follows.length})
        </h2>

        {follows.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {follows.map((item) => (
              <Link
                key={item.id}
                href={`/truyen/${item.story?.slug}`}
                className="group bg-[#FFFDF8] border border-[#E5E0D8] rounded overflow-hidden hover:border-[#1F2937] transition flex flex-col"
              >
                <div className="aspect-[2/3] w-full relative overflow-hidden bg-[#EFECE5]">
                  <img
                    src={item.story?.cover_url || 'https://via.placeholder.com/300x450'}
                    alt={item.story?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="p-2.5 flex-1">
                  <h3 className="font-editorial text-xs font-semibold text-[#1F2937] line-clamp-1">
                    {item.story?.title}
                  </h3>
                  <p className="text-[10px] text-[#777777]">{item.story?.author?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] p-6 rounded text-center text-xs text-[#777777]">
            Bạn chưa theo dõi tác phẩm nào vào Tủ Sách.
          </div>
        )}
      </div>
    </div>
  );
}
