'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Story Form state
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [contentType, setContentType] = useState<'NOVEL' | 'COMIC'>('NOVEL');

  // New Chapter Form state
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [coinPrice, setCoinPrice] = useState(5);
  const [novelContent, setNovelContent] = useState('');
  const [comicImagesText, setComicImagesText] = useState('');

  useEffect(() => {
    Promise.all([
      fetchApi('/admin/stats'),
      fetchApi('/admin/stories')
    ])
      .then(([statsRes, storiesRes]) => {
        setStats(statsRes.data);
        setStories(storiesRes.data.data || []);
      })
      .catch((err) => console.error('Lỗi tải Admin CMS:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/stories', {
        method: 'POST',
        body: JSON.stringify({
          title,
          summary,
          cover_url: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          content_type: contentType,
          author_id: 1,
          category_id: 1,
          is_featured: true,
        }),
      });

      alert(res.message);
      setShowStoryModal(false);
      setTitle('');
      setSummary('');
      setCoverUrl('');

      // Refresh story list
      const updated = await fetchApi('/admin/stories');
      setStories(updated.data.data || []);
    } catch (err: any) {
      alert(err.message || 'Thêm tác phẩm thất bại');
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;

    const payload: any = {
      chapter_number: chapterNumber,
      title: chapterTitle,
      is_paid: isPaid,
      coin_price: isPaid ? coinPrice : 0,
    };

    if (selectedStory.content_type === 'NOVEL') {
      payload.content = novelContent;
    } else {
      payload.images = comicImagesText.split('\n').map((url) => url.trim()).filter(Boolean);
    }

    try {
      const res = await fetchApi(`/admin/stories/${selectedStory.id}/chapters`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      alert(res.message);
      setSelectedStory(null);
      setChapterTitle('');
      setNovelContent('');
      setComicImagesText('');
    } catch (err: any) {
      alert(err.message || 'Thêm chương thất bại');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#777777]">Đang tải Văn Đàn CMS...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="font-editorial text-2xl font-bold text-[#1F2937]">
            Văn Đàn CMS — Quản Lý Vận Hành
          </h1>
          <p className="text-xs text-[#777777]">Bảng điều khiển quản trị tác phẩm, chương truyện và doanh thu</p>
        </div>
        <button
          onClick={() => setShowStoryModal(true)}
          className="bg-[#C65D3A] hover:bg-[#a84c2d] text-white text-xs font-bold px-4 py-2.5 rounded transition"
        >
          + Thêm Tác Phẩm Mới
        </button>
      </div>

      {/* Overview Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] p-4 rounded-lg">
            <span className="text-[11px] font-semibold text-[#777777]">Tổng Độc Giả</span>
            <div className="font-editorial text-2xl font-bold text-[#1F2937] mt-1">{stats.total_users}</div>
          </div>
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] p-4 rounded-lg">
            <span className="text-[11px] font-semibold text-[#777777]">Tổng Tác Phẩm</span>
            <div className="font-editorial text-2xl font-bold text-[#1F2937] mt-1">{stats.total_stories}</div>
          </div>
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] p-4 rounded-lg">
            <span className="text-[11px] font-semibold text-[#777777]">Tổng Số Chương</span>
            <div className="font-editorial text-2xl font-bold text-[#1F2937] mt-1">{stats.total_chapters}</div>
          </div>
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] p-4 rounded-lg">
            <span className="text-[11px] font-semibold text-[#777777]">Doanh Thu Nạp Xu</span>
            <div className="font-editorial text-2xl font-bold text-[#C65D3A] mt-1">
              {Number(stats.total_revenue).toLocaleString()} VNĐ
            </div>
          </div>
        </div>
      )}

      {/* Story Management Table */}
      <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-lg p-6 space-y-4">
        <h2 className="font-editorial text-lg font-bold text-[#1F2937]">Danh Sách Tác Phẩm</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-ui">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[#777777]">
                <th className="py-2.5">Tác Phẩm</th>
                <th className="py-2.5">Loại</th>
                <th className="py-2.5">Tác Giả</th>
                <th className="py-2.5">Số Chương</th>
                <th className="py-2.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {stories.map((story) => (
                <tr key={story.id} className="hover:bg-[#F7F5F0]">
                  <td className="py-3 font-semibold text-[#1F2937]">{story.title}</td>
                  <td className="py-3">
                    <span className="bg-[#EFECE5] text-[#242424] text-[10px] px-2 py-0.5 rounded border border-[#E5E0D8]">
                      {story.content_type}
                    </span>
                  </td>
                  <td className="py-3 text-[#777777]">{story.author?.name}</td>
                  <td className="py-3">{story.chapters_count} chương</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedStory(story);
                        setChapterNumber((story.chapters_count || 0) + 1);
                      }}
                      className="bg-[#1F2937] text-white text-[11px] px-3 py-1 rounded hover:bg-[#C65D3A] transition"
                    >
                      + Thêm Chương
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-editorial text-lg font-bold text-[#1F2937]">Thêm Tác Phẩm Mới</h3>
            <form onSubmit={handleCreateStory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tên Tác Phẩm</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Loại Nội Dung</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2"
                >
                  <option value="NOVEL">Tiểu Thuyết Chữ</option>
                  <option value="COMIC">Truyện Tranh Webtoon</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tóm Tắt Tác Phẩm</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Link Ảnh Bìa (URL)</label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#C65D3A] text-white py-2 rounded font-bold">
                  Tạo Tác Phẩm
                </button>
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="px-4 border border-[#E5E0D8] rounded text-[#777777]"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-editorial text-lg font-bold text-[#1F2937]">
              Soạn Thảo Chương Mới — {selectedStory.title}
            </h3>

            <form onSubmit={handleCreateChapter} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Chương Số</label>
                  <input
                    type="number"
                    required
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(Number(e.target.value))}
                    className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tiêu Đề Chương</label>
                  <input
                    type="text"
                    required
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2"
                    placeholder="Chương 1: Bắt Đầu..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#F7F5F0] p-3 rounded border border-[#E5E0D8]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                  />
                  <span className="font-semibold">Khóa Bản Quyền (Tính Xu)</span>
                </label>
                {isPaid && (
                  <div className="flex items-center gap-1">
                    <span>Giá Xu:</span>
                    <input
                      type="number"
                      value={coinPrice}
                      onChange={(e) => setCoinPrice(Number(e.target.value))}
                      className="w-16 bg-white border border-[#D8D1C5] rounded p-1 text-center font-bold text-[#C65D3A]"
                    />
                  </div>
                )}
              </div>

              {selectedStory.content_type === 'NOVEL' ? (
                <div>
                  <label className="block font-semibold mb-1">Nội Dung Tiểu Thuyết (HTML / Text)</label>
                  <textarea
                    rows={8}
                    value={novelContent}
                    onChange={(e) => setNovelContent(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2 font-editorial"
                    placeholder="<p>Nhập nội dung chương tiểu thuyết...</p>"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold mb-1">Danh Sách Link Ảnh Comic (Mỗi dòng 1 URL)</label>
                  <textarea
                    rows={6}
                    value={comicImagesText}
                    onChange={(e) => setComicImagesText(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#D8D1C5] rounded p-2 font-mono text-[11px]"
                    placeholder="https://image1.jpg&#10;https://image2.jpg"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#1F2937] text-white py-2.5 rounded font-bold hover:bg-[#C65D3A]">
                  Phát Hành Chương
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="px-4 border border-[#E5E0D8] rounded text-[#777777]"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
