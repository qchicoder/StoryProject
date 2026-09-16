'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { fetchApi } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form states
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');
  const [avatarTab, setAvatarTab] = useState<'device' | 'presets'>('device');

  // Password Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reader Preferences & Settings States
  const [readingFont, setReadingFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('16px');
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [lineHeight, setLineHeight] = useState('1.6');
  const [autoNextChapter, setAutoNextChapter] = useState(true);

  // Privacy & Notification Settings States
  const [notifyNewChapter, setNotifyNewChapter] = useState(true);
  const [notifyCommentReply, setNotifyCommentReply] = useState(true);
  const [publicLibrary, setPublicLibrary] = useState(true);
  const [showVipBadge, setShowVipBadge] = useState(true);

  // Stats & Library States
  const [followCount, setFollowCount] = useState(0);
  const [followedStories, setFollowedStories] = useState<any[]>([]);
  const [readingProgressList, setReadingProgressList] = useState<any[]>([]);
  const [activeLibraryTab, setActiveLibraryTab] = useState<'follows' | 'progress'>('follows');

  const optimizeImgUrl = (url?: string | null, width = 300) => {
    if (!url) return 'https://via.placeholder.com/300x450';
    if (url.includes('images.unsplash.com')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?w=${width}&q=75&auto=format`;
    }
    return url;
  };

  const handleUnfollowStory = async (e: React.MouseEvent, storyId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetchApi(`/stories/${storyId}/follow`, { method: 'POST' });
      if (!res.is_following) {
        setFollowedStories((prev) => prev.filter((item) => item.story_id !== storyId));
        setFollowCount((prev) => Math.max(0, prev - 1));
        setSuccessMsg('Đã bỏ theo dõi tác phẩm khỏi tủ sách.');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Thao tác bỏ theo dõi thất bại.');
    }
  };

  // Clean basic preset avatars
  const basicAvatars = [
    {
      name: 'Hải My (Họa Sĩ)',
      url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Mặc Định Văn Đàn',
      url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Thanh Nhã (Nữ Độc Giả)',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Minh Triết (Thư Sinh)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Cổ Phong (Thư Phòng)',
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Nghệ Thuật Cổ Độc',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem('vandan_token');
    if (!token) {
      router.push('/dang-nhap');
      return;
    }

    // Load saved reader preferences
    const savedPrefs = localStorage.getItem('vandan_reader_prefs');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.readingFont) setReadingFont(parsed.readingFont);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.readingTheme) setReadingTheme(parsed.readingTheme);
        if (parsed.lineHeight) setLineHeight(parsed.lineHeight);
        if (typeof parsed.autoNextChapter === 'boolean') setAutoNextChapter(parsed.autoNextChapter);
        if (typeof parsed.notifyNewChapter === 'boolean') setNotifyNewChapter(parsed.notifyNewChapter);
        if (typeof parsed.notifyCommentReply === 'boolean') setNotifyCommentReply(parsed.notifyCommentReply);
        if (typeof parsed.publicLibrary === 'boolean') setPublicLibrary(parsed.publicLibrary);
        if (typeof parsed.showVipBadge === 'boolean') setShowVipBadge(parsed.showVipBadge);
      } catch (e) {}
    }

    Promise.all([
      fetchApi('/me'),
      fetchApi('/me/library').catch(() => ({ data: { follows: [] } })),
    ])
      .then(([userRes, libraryRes]) => {
        const u = userRes.data;
        setUser(u);
        setName(u.name || '');
        setTempName(u.name || '');
        setAvatar(u.avatar || '');
        setTempAvatar(u.avatar || '');

        const follows = libraryRes.data?.follows || [];
        const progress = libraryRes.data?.reading_progress || [];
        setFollowedStories(follows);
        setReadingProgressList(progress);
        setFollowCount(follows.length);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSaveReaderSettings = () => {
    const prefs = {
      readingFont,
      fontSize,
      readingTheme,
      lineHeight,
      autoNextChapter,
      notifyNewChapter,
      notifyCommentReply,
      publicLibrary,
      showVipBadge,
    };
    localStorage.setItem('vandan_reader_prefs', JSON.stringify(prefs));
    setSuccessMsg('Đã lưu cấu hình trải nghiệm đọc & cài đặt tài khoản thành công!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Handle file upload from phone / device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setTempAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Name Inline
  const handleSaveName = async () => {
    if (!tempName.trim()) {
      setErrorMsg('Bút danh không được để trống.');
      return;
    }
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetchApi('/me/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: tempName.trim() }),
      });
      setUser(res.data);
      setName(res.data.name);
      setIsEditingName(false);
      setSuccessMsg('Đã cập nhật bút danh thành công!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể cập nhật bút danh.');
    } finally {
      setSaving(false);
    }
  };

  // Save Avatar from Modal
  const handleSaveAvatar = async () => {
    if (!tempAvatar) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetchApi('/me/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar: tempAvatar }),
      });
      setUser(res.data);
      setAvatar(res.data.avatar);
      setShowAvatarModal(false);
      setSuccessMsg('Đã cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể cập nhật ảnh đại diện.');
    } finally {
      setSaving(false);
    }
  };

  // Save Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetchApi('/me/profile', {
        method: 'PUT',
        body: JSON.stringify({ password }),
      });

      setUser(res.data);
      setSuccessMsg('Đã đổi mật khẩu tài khoản thành công!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] py-16 flex items-center justify-center">
        <div className="text-xs text-[#75777c] animate-pulse">Đang tải thông tin hồ sơ...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] text-[#1b1c1c] dark:text-slate-100 font-ui py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#75777c] dark:text-slate-400 border-b border-[#e5e0d8] dark:border-slate-800 pb-4">
          <Link href="/" className="hover:text-[#9f4120] dark:hover:text-amber-400">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-[#0a1422] dark:text-slate-200">Hồ sơ cá nhân</span>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="bg-[#ecfdf5] dark:bg-emerald-950/60 border border-[#a7f3d0] dark:border-emerald-700/60 text-[#047857] dark:text-emerald-300 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-[#fef2f2] dark:bg-rose-950/60 border border-[#fecaca] dark:border-rose-800/60 text-[#b91c1c] dark:text-rose-300 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* HERO USER PROFILE CARD */}
        <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* AVATAR WITH HOVER EDIT PENCIL OVERLAY */}
            <div
              className="relative group flex-shrink-0 cursor-pointer"
              onClick={() => {
                setTempAvatar(avatar);
                setShowAvatarModal(true);
              }}
            >
              <img
                src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-[#ffdbd0] dark:border-slate-700 shadow-md transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#10b981] border-2 border-white dark:border-slate-800 rounded-full"></span>

              {/* Hover Pencil Overlay - ONLY VISIBLE ON HOVER */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-0.5 shadow-md">
                <span className="material-symbols-outlined text-[24px]">edit</span>
                <span>Đổi ảnh</span>
              </div>
            </div>

            {/* USER INFO & INLINE NAME EDIT */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              {/* NAME INLINE EDITING WITH PENCIL AT END */}
              <div className="relative inline-flex items-center gap-2 group max-w-full">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="font-editorial text-xl sm:text-2xl font-bold text-[#0a1422] dark:text-slate-100 bg-[#f5f3f3] dark:bg-slate-800 border border-[#9f4120] dark:border-amber-500 rounded-lg px-3 py-1 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="w-8 h-8 rounded-lg bg-[#9f4120] text-white flex items-center justify-center hover:bg-[#732102] transition"
                      title="Lưu bút danh"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                    <button
                      onClick={() => {
                        setTempName(user?.name || '');
                        setIsEditingName(false);
                      }}
                      className="w-8 h-8 rounded-lg bg-[#efeded] dark:bg-slate-700 text-[#44474c] dark:text-slate-300 flex items-center justify-center hover:bg-[#e5e0d8] dark:hover:bg-slate-600 transition"
                      title="Hủy"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                    <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0a1422] dark:text-slate-100 group-hover:text-[#9f4120] dark:group-hover:text-amber-400 transition-colors">
                      {user?.name}
                    </h2>
                    {/* Pencil icon at end of name - HIDDEN WHEN NOT HOVERED */}
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#9f4120] dark:text-amber-400 hover:bg-[#ffdbd0] dark:hover:bg-amber-950/40 p-1 rounded-full flex items-center justify-center"
                      title="Chỉnh sửa bút danh"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                )}
              </div>

              {/* EMAIL & ROLE */}
              <p className="text-xs text-[#75777c] dark:text-slate-400 font-medium">{user?.email}</p>

              {/* DYNAMIC VIP RANK BADGE COMPUTED FROM BALANCE */}
              {(() => {
                const bal = user?.wallet?.balance ?? 0;
                let rankTitle = '🥉 ĐỘC GIẢ TÂN THỦ';
                let subtext = 'Thành viên mới Văn Đàn';
                let badgeStyle = 'bg-[#92400e]/15 text-[#92400e] border-[#92400e]/30 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50';
                let rankIcon = 'military_tech';

                if (user?.role === 'ADMIN') {
                  rankTitle = '👑 QUẢN TRỊ VIÊN';
                  subtext = 'Bá Chủ Thư Viện';
                  badgeStyle = 'bg-[#0a1422] text-[#ffdbd0] border-[#9f4120] dark:bg-slate-900 dark:text-amber-300 dark:border-amber-500';
                  rankIcon = 'admin_panel_settings';
                } else if (bal >= 1000) {
                  rankTitle = '👑 ĐỘC GIẢ THẦN THẠCH';
                  subtext = 'Thành viên Diamond VIP (1,000+ Xu)';
                  badgeStyle = 'bg-gradient-to-r from-[#7c3aed] to-[#4c1d95] text-white border-[#6d28d9] shadow-xs';
                  rankIcon = 'diamond';
                } else if (bal >= 300) {
                  rankTitle = '🥇 ĐỘC GIẢ THƯ BÁC';
                  subtext = 'Thành viên Gold VIP (300+ Xu)';
                  badgeStyle = 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white border-[#d97706] shadow-xs';
                  rankIcon = 'stars';
                } else if (bal >= 100) {
                  rankTitle = '🥈 ĐỘC GIẢ TRI ÂM';
                  subtext = 'Thành viên Silver VIP (100+ Xu - 🚫 Không QC)';
                  badgeStyle = 'bg-[#334155] text-white border-[#1e293b] shadow-xs';
                  rankIcon = 'workspace_premium';
                }

                return (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${badgeStyle}`}>
                      <span className="material-symbols-outlined text-[13px]">{rankIcon}</span>
                      <span>{rankTitle}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#75777c] dark:text-slate-400">• {subtext}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* QUICK STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#e5e0d8] dark:border-slate-800">
            <Link href="/vi-xu" className="p-4 bg-[#fbf9f9] dark:bg-slate-800/50 hover:bg-[#ffdbd0]/40 dark:hover:bg-slate-800 rounded-xl border border-[#e5e0d8] dark:border-slate-700/60 transition text-center group shadow-2xs">
              <div className="text-base font-bold text-[#9f4120] dark:text-amber-400 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">toll</span>
                <span>{user?.wallet?.balance ?? 0}</span>
              </div>
              <div className="text-xs font-semibold text-[#44474c] dark:text-slate-300 mt-1 group-hover:text-[#9f4120] dark:group-hover:text-amber-400">Số Dư Xu (Nạp Xu)</div>
            </Link>

            <Link href="/tu-sach" className="p-4 bg-[#fbf9f9] dark:bg-slate-800/50 hover:bg-[#efeded] dark:hover:bg-slate-800 rounded-xl border border-[#e5e0d8] dark:border-slate-700/60 transition text-center group shadow-2xs">
              <div className="text-base font-bold text-[#0a1422] dark:text-slate-100 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                <span>{followCount}</span>
              </div>
              <div className="text-xs font-semibold text-[#44474c] dark:text-slate-300 mt-1 group-hover:text-[#0a1422] dark:group-hover:text-slate-100">Truyện Theo Dõi</div>
            </Link>

            <div className="p-4 bg-[#fbf9f9] dark:bg-slate-800/50 rounded-xl border border-[#e5e0d8] dark:border-slate-700/60 text-center shadow-2xs col-span-2 sm:col-span-1">
              <div className="text-base font-bold text-[#10b981] flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                <span>Đã Xác Thực</span>
              </div>
              <div className="text-xs font-semibold text-[#44474c] dark:text-slate-300 mt-1">Trạng Thái Tài Khoản</div>
            </div>
          </div>
        </div>

        {/* FOLLOWED LIBRARY & SAVED BOOKS SECTION */}
        <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e0d8] dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffdbd0] dark:bg-amber-950/60 text-[#9f4120] dark:text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">bookmark</span>
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-[#0a1422] dark:text-slate-100">
                  Tủ Sách Theo Dõi & Đã Lưu
                </h3>
                <p className="text-xs text-[#75777c] dark:text-slate-400">
                  Danh sách các tác phẩm bạn đã bấm Theo Dõi hoặc Đang Đọc Dở
                </p>
              </div>
            </div>

            {/* Tab Selector Buttons */}
            <div className="flex items-center gap-1 bg-[#f5f3f3] dark:bg-slate-800 p-1 rounded-xl border border-[#e5e0d8] dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveLibraryTab('follows')}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  activeLibraryTab === 'follows'
                    ? 'bg-[#9f4120] dark:bg-amber-600 text-white shadow-xs'
                    : 'text-[#75777c] dark:text-slate-300 hover:text-[#0a1422] dark:hover:text-white'
                }`}
              >
                Truyện Theo Dõi ({followedStories.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveLibraryTab('progress')}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  activeLibraryTab === 'progress'
                    ? 'bg-[#9f4120] dark:bg-amber-600 text-white shadow-xs'
                    : 'text-[#75777c] dark:text-slate-300 hover:text-[#0a1422] dark:hover:text-white'
                }`}
              >
                Đang Đọc Dở ({readingProgressList.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Followed Stories Grid */}
          {activeLibraryTab === 'follows' && (
            <div>
              {followedStories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {followedStories.map((item) => {
                    const story = item.story;
                    if (!story) return null;

                    return (
                      <div
                        key={item.id}
                        className="group bg-[#fbf9f9] dark:bg-slate-800/60 border border-[#e5e0d8] dark:border-slate-700/60 rounded-xl overflow-hidden flex flex-col justify-between relative shadow-2xs hover:shadow-md transition duration-200"
                      >
                        {/* Cover Image */}
                        <Link href={`/truyen/${story.slug}`} className="aspect-[2/3] w-full relative overflow-hidden bg-[#EFECE5] block">
                          <img
                            src={optimizeImgUrl(story.cover_url, 300)}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                          <span className="absolute top-2 left-2 bg-[#1F2937]/90 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow">
                            {story.content_type === 'NOVEL' ? 'Tiểu Thuyết' : 'Comic'}
                          </span>

                          {/* Unfollow Button */}
                          <button
                            type="button"
                            onClick={(e) => handleUnfollowStory(e, story.id)}
                            title="Bỏ theo dõi tác phẩm"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 shadow transition"
                          >
                            <span className="material-symbols-outlined text-[14px]">bookmark_remove</span>
                          </button>
                        </Link>

                        {/* Info */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <Link href={`/truyen/${story.slug}`} className="font-editorial text-xs font-bold text-[#0a1422] dark:text-slate-100 line-clamp-1 hover:text-[#9f4120] dark:hover:text-amber-400 transition">
                              {story.title}
                            </Link>
                            <p className="text-[11px] text-[#75777c] dark:text-slate-400 line-clamp-1 mt-0.5">
                              {story.author?.name || 'Văn Đàn'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#e5e0d8]/60 dark:border-slate-700/50 flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-[#9f4120] dark:text-amber-400 bg-[#ffdbd0]/40 dark:bg-amber-950/40 px-2 py-0.5 rounded truncate">
                              {story.category?.name || 'Tủ Sách'}
                            </span>
                            <Link
                              href={`/truyen/${story.slug}`}
                              className="text-[10px] font-bold text-white bg-[#9f4120] dark:bg-amber-600 hover:bg-[#732102] px-2.5 py-1 rounded-md transition shrink-0"
                            >
                              Đọc Sách
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3 bg-[#fbf9f9] dark:bg-slate-800/40 rounded-xl border border-dashed border-[#e5e0d8] dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-[#ffdbd0]/60 dark:bg-amber-950/40 text-[#9f4120] dark:text-amber-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[24px]">bookmark_border</span>
                  </div>
                  <p className="text-xs text-[#75777c] dark:text-slate-400 font-medium">
                    Bạn chưa nhấn Theo Dõi cuốn sách nào vào tủ sách.
                  </p>
                  <Link
                    href="/tim-kiem"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#9f4120] dark:bg-amber-600 hover:bg-[#732102] px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    <span>Khám Phá Sách Mới</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Reading Progress Grid */}
          {activeLibraryTab === 'progress' && (
            <div>
              {readingProgressList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {readingProgressList.map((rp) => {
                    const story = rp.story;
                    const chapter = rp.chapter;
                    if (!story) return null;

                    return (
                      <div
                        key={rp.id}
                        className="bg-[#fbf9f9] dark:bg-slate-800/60 border border-[#e5e0d8] dark:border-slate-700/60 rounded-xl p-4 flex gap-4 items-center shadow-2xs hover:shadow-sm transition"
                      >
                        <Link href={`/truyen/${story.slug}`} className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-[#e5e0d8] dark:border-slate-700 shadow-xs block">
                          <img src={optimizeImgUrl(story.cover_url, 200)} alt={story.title} className="w-full h-full object-cover" />
                        </Link>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Link href={`/truyen/${story.slug}`} className="font-editorial text-sm font-bold text-[#0a1422] dark:text-slate-100 truncate block hover:text-[#9f4120] dark:hover:text-amber-400">
                            {story.title}
                          </Link>

                          {chapter && (
                            <div className="text-xs font-semibold text-[#9f4120] dark:text-amber-400 bg-[#ffdbd0]/30 dark:bg-amber-950/40 px-2 py-0.5 rounded inline-block">
                              Đang dừng ở: Chương {chapter.chapter_number}
                            </div>
                          )}

                          <p className="text-[11px] text-[#75777c] dark:text-slate-400">
                            Tác giả: {story.author?.name || 'Văn Đàn'}
                          </p>

                          {chapter && (
                            <Link
                              href={`/truyen/${story.slug}/chuong/${chapter.slug || `chuong-${chapter.chapter_number}`}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#9f4120] dark:bg-amber-600 hover:bg-[#732102] px-3 py-1.5 rounded-lg transition shadow-2xs mt-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                              <span>Đọc Tiếp Chương {chapter.chapter_number}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3 bg-[#fbf9f9] dark:bg-slate-800/40 rounded-xl border border-dashed border-[#e5e0d8] dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-[#ffdbd0]/60 dark:bg-amber-950/40 text-[#9f4120] dark:text-amber-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[24px]">history_edu</span>
                  </div>
                  <p className="text-xs text-[#75777c] dark:text-slate-400 font-medium">
                    Chưa có lịch sử đọc dở tác phẩm nào.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DIRECT SETTINGS ACCESS BANNER */}
        <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbd0]/60 dark:bg-amber-950/60 text-[#9f4120] dark:text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">settings</span>
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#0a1422] dark:text-slate-100">Cài Đặt Hệ Thống & Trải Nghiệm</h3>
                <p className="text-xs text-[#75777c] dark:text-slate-400 mt-0.5">
                  Tùy chỉnh phông chữ đọc, kích thước chữ, giao diện màu đọc, cài đặt thông báo & đổi mật khẩu tài khoản.
                </p>
              </div>
            </div>
            <Link
              href="/cai-dat"
              className="bg-[#9f4120] dark:bg-amber-600 hover:bg-[#732102] dark:hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 shrink-0"
            >
              <span>Mở Trung Tâm Cài Đặt</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL POPUP FOR CHOOSING / UPLOADING AVATAR */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#e5e0d8]">
            <div className="flex items-center justify-between border-b border-[#e5e0d8] pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#0a1422] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9f4120] text-[22px]">account_circle</span>
                <span>Thay Đổi Ảnh Đại Diện</span>
              </h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 rounded-full bg-[#f5f3f3] hover:bg-[#efeded] flex items-center justify-center text-[#44474c]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* TAB SELECTOR: Upload from device vs Presets */}
            <div className="flex border-b border-[#e5e0d8]">
              <button
                type="button"
                onClick={() => setAvatarTab('device')}
                className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
                  avatarTab === 'device'
                    ? 'border-[#9f4120] text-[#9f4120]'
                    : 'border-transparent text-[#75777c] hover:text-[#0a1422]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">smartphone</span>
                <span>Tải ảnh từ điện thoại / máy tính</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
                  avatarTab === 'presets'
                    ? 'border-[#9f4120] text-[#9f4120]'
                    : 'border-transparent text-[#75777c] hover:text-[#0a1422]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">face</span>
                <span>Ảnh đại diện cơ bản</span>
              </button>
            </div>

            {/* TAB CONTENT 1: FILE UPLOAD FROM PHONE / DEVICE */}
            {avatarTab === 'device' ? (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#9f4120]/40 bg-[#ffdbd0]/20 hover:bg-[#ffdbd0]/50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#ffdbd0] text-[#9f4120] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">upload_file</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0a1422]">Nhấn để chọn ảnh từ thư viện điện thoại / máy tính</p>
                    <p className="text-[11px] text-[#75777c] mt-0.5">Hỗ trợ ảnh định dạng JPG, PNG, WEBP</p>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB CONTENT 2: CLEAN BASIC PRESETS LIST */
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#44474c]">Danh sách ảnh đại diện cơ bản:</label>
                <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1 py-1">
                  {basicAvatars.map((item, idx) => {
                    const isSelected = tempAvatar === item.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTempAvatar(item.url)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[20px] transition-all text-left ${
                          isSelected
                            ? 'bg-[#ffdbd0]/30 border-2 border-[#9f4120] ring-2 ring-[#ffdbd0]'
                            : 'bg-[#f0ece9] hover:bg-[#e7e2de] border border-[#e5e0d8]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover border border-[#d6d0c7] shadow-2xs shrink-0"
                          />
                          <span className="font-bold text-sm text-[#1b1c1c]">{item.name}</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[#9f4120] font-bold text-[20px]">
                            check_circle
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PREVIEW & CONFIRM BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-[#e5e0d8]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#75777c]">Xem trước:</span>
                <img
                  src={tempAvatar || avatar}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#9f4120] shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f5f3f3] hover:bg-[#efeded] text-xs font-semibold text-[#44474c]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#9f4120] hover:bg-[#732102] text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>{saving ? 'Đang lưu...' : 'Áp Dụng Ảnh'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
