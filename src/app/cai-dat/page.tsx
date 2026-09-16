'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { fetchApi } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active Tab: 'reading' | 'privacy' | 'security'
  const [activeTab, setActiveTab] = useState<'reading' | 'privacy' | 'security'>('reading');

  // Reader Preferences & Settings States
  const [readingFont, setReadingFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('16px');
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [lineHeight, setLineHeight] = useState('1.6');
  const [textAlign, setTextAlign] = useState<'justify' | 'left' | 'center'>('justify');
  const [readerWidth, setReaderWidth] = useState<'640px' | '768px' | '960px'>('768px');
  const [paragraphSpacing, setParagraphSpacing] = useState<'0.8rem' | '1.2rem' | '1.8rem'>('1.2rem');
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'page' | 'cafe'>('none');
  const [autoNextChapter, setAutoNextChapter] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [paragraphIndent, setParagraphIndent] = useState(true);

  // Privacy & Notification Settings States
  const [notifyNewChapter, setNotifyNewChapter] = useState(true);
  const [notifyCommentReply, setNotifyCommentReply] = useState(true);
  const [publicLibrary, setPublicLibrary] = useState(true);
  const [showVipBadge, setShowVipBadge] = useState(true);

  // Password Change Form States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
        if (parsed.textAlign) setTextAlign(parsed.textAlign);
        if (parsed.readerWidth) setReaderWidth(parsed.readerWidth);
        if (parsed.paragraphSpacing) setParagraphSpacing(parsed.paragraphSpacing);
        if (parsed.ambientSound) setAmbientSound(parsed.ambientSound);
        if (typeof parsed.autoNextChapter === 'boolean') setAutoNextChapter(parsed.autoNextChapter);
        if (typeof parsed.focusMode === 'boolean') setFocusMode(parsed.focusMode);
        if (typeof parsed.paragraphIndent === 'boolean') setParagraphIndent(parsed.paragraphIndent);
        if (typeof parsed.notifyNewChapter === 'boolean') setNotifyNewChapter(parsed.notifyNewChapter);
        if (typeof parsed.notifyCommentReply === 'boolean') setNotifyCommentReply(parsed.notifyCommentReply);
        if (typeof parsed.publicLibrary === 'boolean') setPublicLibrary(parsed.publicLibrary);
        if (typeof parsed.showVipBadge === 'boolean') setShowVipBadge(parsed.showVipBadge);
      } catch (e) {}
    }

    fetchApi('/me')
      .then((userRes) => {
        setUser(userRes.data);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('Không thể tải thông tin tài khoản.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSaveReaderSettings = () => {
    const prefs = {
      readingFont,
      fontSize,
      readingTheme,
      lineHeight,
      textAlign,
      readerWidth,
      paragraphSpacing,
      ambientSound,
      autoNextChapter,
      focusMode,
      paragraphIndent,
      notifyNewChapter,
      notifyCommentReply,
      publicLibrary,
      showVipBadge,
    };
    localStorage.setItem('vandan_reader_prefs', JSON.stringify(prefs));
    setSuccessMsg('Đã lưu cấu hình trải nghiệm đọc & cài đặt hệ thống thành công!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

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
      setSuccessMsg('Đã cập nhật mật khẩu mới thành công!');
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
      <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] py-16 flex items-center justify-center">
        <div className="text-xs text-[#75777c] dark:text-slate-400 animate-pulse">Đang tải trung tâm cài đặt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f9] dark:bg-[#0f172a] text-[#1b1c1c] dark:text-slate-100 font-ui py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#75777c] dark:text-slate-400 border-b border-[#e5e0d8] dark:border-slate-800 pb-4">
          <Link href="/" className="hover:text-[#9f4120] dark:hover:text-amber-400">Trang chủ</Link>
          <span>/</span>
          <Link href="/ho-so" className="hover:text-[#9f4120] dark:hover:text-amber-400">Hồ sơ cá nhân</Link>
          <span>/</span>
          <span className="font-semibold text-[#0a1422] dark:text-slate-200">Cài đặt tài khoản & Đọc truyện</span>
        </div>

        {/* Page Title & Back to Profile link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0a1422] dark:text-slate-100 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[28px]">settings</span>
              <span>Cài Đặt Hệ Thống & Trải Nghiệm</span>
            </h1>
            <p className="text-xs text-[#75777c] dark:text-slate-400 mt-1">
              Tùy chỉnh cấu hình đọc truyện nâng cao, thông báo riêng tư và bảo mật tài khoản.
            </p>
          </div>
          <Link
            href="/ho-so"
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-[#9f4120] dark:text-amber-400 bg-[#ffdbd0]/50 dark:bg-amber-950/40 hover:bg-[#ffdbd0] dark:hover:bg-amber-900/60 border border-[#9f4120]/30 dark:border-amber-500/40 px-3.5 py-2 rounded-xl transition"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Về Hồ Sơ Cá Nhân</span>
          </Link>
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

        {/* NAVIGATION TABS FOR SETTINGS */}
        <div className="bg-[#f5f3f3] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-[#334155] rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1 transition-colors">
          <button
            type="button"
            onClick={() => setActiveTab('reading')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reading'
                ? 'bg-[#9f4120] text-white shadow-xs'
                : 'text-[#44474c] dark:text-slate-300 hover:bg-[#f5f3f3] dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            <span>Trải Nghiệm Đọc</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-[#9f4120] text-white shadow-xs'
                : 'text-[#44474c] dark:text-slate-300 hover:bg-[#f5f3f3] dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            <span>Thông Báo & Quyền Riêng Tư</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#9f4120] text-white shadow-xs'
                : 'text-[#44474c] dark:text-slate-300 hover:bg-[#f5f3f3] dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            <span>Bảo Mật & Mật Khẩu</span>
          </button>
        </div>

        {/* TAB 1: READING PREFERENCES (TÍNH NĂNG ĐỌC TRUYỆN ĐẦY ĐỦ VÀ NÂNG CAO) */}
        {activeTab === 'reading' && (
          <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in transition-colors">
            <div className="border-b border-[#e5e0d8] dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#0a1422] dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">auto_stories</span>
                  <span>Cấu Hình Trải Nghiệm Đọc Truyện</span>
                </h3>
                <p className="text-xs text-[#75777c] dark:text-slate-400 mt-1">
                  Tùy chỉnh giao diện đọc truyện mặc định theo sở thích cá nhân của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveReaderSettings}
                className="bg-[#0a1422] dark:bg-slate-800 hover:bg-[#9f4120] dark:hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Lưu Cài Đặt Đọc</span>
              </button>
            </div>

            {/* SECTION 1: PHÔNG CHỮ & KÍCH THƯỚC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font Family Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">font_download</span>
                  <span>Phông chữ đọc mặc định</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Inter', label: 'Inter (Hiện đại)' },
                    { id: 'Merriweather', label: 'Merriweather (Serif)' },
                    { id: 'Roboto', label: 'Roboto (Truyền thống)' },
                    { id: 'Lora', label: 'Lora (Nghệ thuật)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setReadingFont(f.id)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-left ${
                        readingFont === f.id
                          ? 'bg-[#ffdbd0]/30 dark:bg-amber-950/40 border-[#9f4120] dark:border-amber-500 text-[#9f4120] dark:text-amber-400 font-bold ring-2 ring-[#ffdbd0]/50 dark:ring-amber-500/20'
                          : 'bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">format_size</span>
                  <span>Kích thước chữ (Font Size)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['14px', '16px', '18px', '20px'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFontSize(s)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        fontSize === s
                          ? 'bg-[#9f4120] dark:bg-amber-600 text-white border-[#9f4120] dark:border-amber-600'
                          : 'bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">palette</span>
                  <span>Giao diện màu đọc mặc định</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'Trắng Sáng', bg: 'bg-white border-[#e5e0d8] text-[#0a1422]' },
                    { id: 'sepia', label: 'Vàng Kem (Sepia)', bg: 'bg-[#fbf0d9] border-[#d9c5a0] text-[#5c4018]' },
                    { id: 'dark', label: 'Tối Đêm (Dark)', bg: 'bg-[#1b1c1c] border-[#334155] text-white' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setReadingTheme(t.id as any)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1 ${t.bg} ${
                        readingTheme === t.id ? 'ring-2 ring-[#9f4120] border-[#9f4120]' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Height Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">format_line_spacing</span>
                  <span>Khoảng cách dòng (Line Height)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1.4', label: 'Gọn (1.4)' },
                    { id: '1.6', label: 'Chuẩn (1.6)' },
                    { id: '1.8', label: 'Thoáng (1.8)' },
                  ].map((lh) => (
                    <button
                      key={lh.id}
                      type="button"
                      onClick={() => setLineHeight(lh.id)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        lineHeight === lh.id
                          ? 'bg-[#9f4120] dark:bg-amber-600 text-white border-[#9f4120] dark:border-amber-600'
                          : 'bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-800'
                      }`}
                    >
                      {lh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NEW FEATURE 1: CĂN LỀ VĂN BẢN (Text Alignment) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">format_align_justify</span>
                  <span>Căn lề đoạn văn (Text Alignment)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'justify', label: 'Căn đều (Sách in)', icon: 'format_align_justify' },
                    { id: 'left', label: 'Căn trái (Mặc định)', icon: 'format_align_left' },
                    { id: 'center', label: 'Căn giữa (Thơ)', icon: 'format_align_center' },
                  ].map((ta) => (
                    <button
                      key={ta.id}
                      type="button"
                      onClick={() => setTextAlign(ta.id as any)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                        textAlign === ta.id
                          ? 'bg-[#9f4120] dark:bg-amber-600 text-white border-[#9f4120] dark:border-amber-600'
                          : 'bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{ta.icon}</span>
                      <span className="truncate">{ta.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* NEW FEATURE 2: CHIỀU RỘNG KHUNG ĐỌC (Reader Width) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">fit_screen</span>
                  <span>Chiều rộng trang đọc (Reader Width)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '640px', label: 'Gọn (640px)' },
                    { id: '768px', label: 'Chuẩn (768px)' },
                    { id: '960px', label: 'Rộng (960px)' },
                  ].map((rw) => (
                    <button
                      key={rw.id}
                      type="button"
                      onClick={() => setReaderWidth(rw.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        readerWidth === rw.id
                          ? 'bg-[#9f4120] dark:bg-amber-600 text-white border-[#9f4120] dark:border-amber-600'
                          : 'bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-800'
                      }`}
                    >
                      {rw.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NEW FEATURE 3: KHOẢNG CÁCH ĐOẠN VĂN (Paragraph Spacing) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">segment</span>
                  <span>Khoảng cách giữa các đoạn văn</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '0.8rem', label: 'Gọn (0.8rem)' },
                    { id: '1.2rem', label: 'Vừa (1.2rem)' },
                    { id: '1.8rem', label: 'Thoáng (1.8rem)' },
                  ].map((ps) => (
                    <button
                      key={ps.id}
                      type="button"
                      onClick={() => setParagraphSpacing(ps.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        paragraphSpacing === ps.id
                          ? 'bg-[#9f4120] dark:bg-amber-600 text-white border-[#9f4120] dark:border-amber-600'
                          : 'bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-800'
                      }`}
                    >
                      {ps.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NEW FEATURE 4: ÂM THANH MÔI TRƯỜNG ĐỌC SÁCH (Ambient Audio) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">graphic_eq</span>
                  <span>Âm thanh đọc sách (Ambient Audio)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'Tắt âm', icon: 'volume_off' },
                    { id: 'rain', label: '🌧️ Đêm Mưa', icon: 'water_drop' },
                    { id: 'page', label: '📖 Lật Sách', icon: 'menu_book' },
                    { id: 'cafe', label: '☕ Cà Phê', icon: 'local_cafe' },
                  ].map((as) => (
                    <button
                      key={as.id}
                      type="button"
                      onClick={() => setAmbientSound(as.id as any)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1 ${
                        ambientSound === as.id
                          ? 'bg-[#9f4120] dark:bg-amber-600 text-white border-[#9f4120] dark:border-amber-600'
                          : 'bg-[#f5f3f3] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#efeded] dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{as.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: TOGGLE SWITCHES NÂNG CAO */}
            <div className="pt-6 border-t border-[#e5e0d8] dark:border-slate-800 space-y-4">
              <h4 className="font-editorial text-sm font-bold text-[#0a1422] dark:text-slate-200">Tính năng đọc nâng cao</h4>

              {/* Toggle 1: Auto Next Chapter */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f9] dark:bg-slate-800/40 border border-[#e5e0d8] dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">swap_calls</span>
                  <div>
                    <span className="text-xs font-bold text-[#0a1422] dark:text-slate-100 block">Tự động chuyển sang chương mới</span>
                    <span className="text-[11px] text-[#75777c] dark:text-slate-400">Tự động tải chương kế tiếp khi cuộn tới cuối trang</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoNextChapter(!autoNextChapter)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                    autoNextChapter ? 'bg-[#9f4120] dark:bg-amber-600' : 'bg-[#e5e0d8] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white keep-white transition-transform shadow-xs ${
                      autoNextChapter ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Reading Focus Mode (Zen Mode) */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f9] dark:bg-slate-800/40 border border-[#e5e0d8] dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">filter_center_focus</span>
                  <div>
                    <span className="text-xs font-bold text-[#0a1422] dark:text-slate-100 block">Chế độ Đọc Tập Trung (Zen Focus Mode)</span>
                    <span className="text-[11px] text-[#75777c] dark:text-slate-400">Tự động ẩn thanh Header và các công cụ khi cuộn xuống đọc để tránh xao nhãng</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFocusMode(!focusMode)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                    focusMode ? 'bg-[#9f4120] dark:bg-amber-600' : 'bg-[#e5e0d8] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white keep-white transition-transform shadow-xs ${
                      focusMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Paragraph Indentation */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f9] dark:bg-slate-800/40 border border-[#e5e0d8] dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">format_indent_increase</span>
                  <div>
                    <span className="text-xs font-bold text-[#0a1422] dark:text-slate-100 block">Thụt lề 2 ô đầu dòng đoạn văn</span>
                    <span className="text-[11px] text-[#75777c] dark:text-slate-400">Tự động lùi đầu dòng mỗi đoạn văn như sách in tiểu thuyết</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setParagraphIndent(!paragraphIndent)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                    paragraphIndent ? 'bg-[#9f4120] dark:bg-amber-600' : 'bg-[#e5e0d8] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white keep-white transition-transform shadow-xs ${
                      paragraphIndent ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRIVACY & NOTIFICATIONS */}
        {activeTab === 'privacy' && (
          <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in transition-colors">
            <div className="border-b border-[#e5e0d8] dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#0a1422] dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">notifications_active</span>
                  <span>Cài Đặt Thông Báo & Quyền Riêng Tư</span>
                </h3>
                <p className="text-xs text-[#75777c] dark:text-slate-400 mt-1">
                  Quản lý quyền riêng tư hồ sơ và thông báo cập nhật từ Văn Đàn.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveReaderSettings}
                className="bg-[#0a1422] dark:bg-slate-800 hover:bg-[#9f4120] dark:hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Lưu Cài Đặt</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle 1: New Chapter Notifications */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f9] dark:bg-slate-800/40 border border-[#e5e0d8] dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">notifications</span>
                  <div>
                    <span className="text-xs font-bold text-[#0a1422] dark:text-slate-100 block">Thông báo chương mới</span>
                    <span className="text-[11px] text-[#75777c] dark:text-slate-400">Nhận thông báo tức thì khi truyện đang theo dõi cập nhật chương mới</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyNewChapter(!notifyNewChapter)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                    notifyNewChapter ? 'bg-[#9f4120] dark:bg-amber-600' : 'bg-[#e5e0d8] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white keep-white transition-transform shadow-xs ${
                      notifyNewChapter ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Comment Replies */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f9] dark:bg-slate-800/40 border border-[#e5e0d8] dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">chat_bubble</span>
                  <div>
                    <span className="text-xs font-bold text-[#0a1422] dark:text-slate-100 block">Thông báo phản hồi bình luận</span>
                    <span className="text-[11px] text-[#75777c] dark:text-slate-400">Nhận báo khi độc giả khác trả lời hoặc thả tim bình luận của bạn</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyCommentReply(!notifyCommentReply)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                    notifyCommentReply ? 'bg-[#9f4120] dark:bg-amber-600' : 'bg-[#e5e0d8] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white keep-white transition-transform shadow-xs ${
                      notifyCommentReply ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Public Library */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f9] dark:bg-slate-800/40 border border-[#e5e0d8] dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">visibility</span>
                  <div>
                    <span className="text-xs font-bold text-[#0a1422] dark:text-slate-100 block">Công khai Tủ Truyện cá nhân</span>
                    <span className="text-[11px] text-[#75777c] dark:text-slate-400">Cho phép người dùng khác xem danh sách truyện bạn đang theo dõi</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPublicLibrary(!publicLibrary)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                    publicLibrary ? 'bg-[#9f4120] dark:bg-amber-600' : 'bg-[#e5e0d8] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white keep-white transition-transform shadow-xs ${
                      publicLibrary ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4: Show VIP Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f9] dark:bg-slate-800/40 border border-[#e5e0d8] dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">military_tech</span>
                  <div>
                    <span className="text-xs font-bold text-[#0a1422] dark:text-slate-100 block">Hiển thị Huy hiệu VIP khi bình luận</span>
                    <span className="text-[11px] text-[#75777c] dark:text-slate-400">Hiển thị danh hiệu VIP kế bên bút danh trong phần bình luận truyện</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVipBadge(!showVipBadge)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 relative shrink-0 ${
                    showVipBadge ? 'bg-[#9f4120] dark:bg-amber-600' : 'bg-[#e5e0d8] dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white keep-white transition-transform shadow-xs ${
                      showVipBadge ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD CHANGE */}
        {activeTab === 'security' && (
          <div className="bg-[#ffffff] dark:bg-[#1e293b] border border-[#e5e0d8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in transition-colors">
            <div className="border-b border-[#e5e0d8] dark:border-slate-800 pb-4">
              <h3 className="font-editorial text-lg font-bold text-[#0a1422] dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9f4120] dark:text-amber-400 text-[20px]">lock_reset</span>
                <span>Đổi Mật Khẩu Bảo Mật</span>
              </h3>
              <p className="text-xs text-[#75777c] dark:text-slate-400 mt-1">Bảo vệ tài khoản của bạn bằng cách cập nhật mật khẩu định kỳ.</p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300">Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  className="w-full bg-[#f5f3f3] dark:bg-slate-800 border border-[#e5e0d8] dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-[#0a1422] dark:text-slate-100 focus:outline-none focus:border-[#9f4120] dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#44474c] dark:text-slate-300">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full bg-[#f5f3f3] dark:bg-slate-800 border border-[#e5e0d8] dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-[#0a1422] dark:text-slate-100 focus:outline-none focus:border-[#9f4120] dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !password}
                className="bg-[#9f4120] dark:bg-amber-600 hover:bg-[#732102] dark:hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>{saving ? 'Đang Lưu...' : 'Cập Nhật Mật Khẩu'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
