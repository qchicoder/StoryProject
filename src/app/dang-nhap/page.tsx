'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login' ? { email, password } : { name, email, password };

      const res = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('vandan_token', res.data.token);
      alert(res.message || 'Thành công!');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Lỗi xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = async (gEmail: string, gName: string) => {
    if (!gEmail) {
      alert('Vui lòng nhập địa chỉ email Google');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: gName,
          email: gEmail,
          password: 'google_oauth_secured_pass_123',
        }),
      });

      localStorage.setItem('vandan_token', res.data.token);
      setShowGoogleModal(false);
      window.location.href = '/';
    } catch (err: any) {
      // If already registered, try login
      try {
        const resLogin = await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: gEmail, password: 'google_oauth_secured_pass_123' }),
        });
        localStorage.setItem('vandan_token', resLogin.data.token);
        setShowGoogleModal(false);
        window.location.href = '/';
      } catch {
        setError('Không thể đăng nhập bằng tài khoản Google này');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] font-ui py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Sub-header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-3 border-b border-[#e5e0d8]">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-widest text-[#9f4120] bg-[#ffdbd0] px-2.5 py-0.5 rounded">
              Biên bản thư phòng 2025
            </span>
            <span className="text-[#c5c6cc]">•</span>
            <span className="text-[#44474c]">Không gian thưởng ngoạn tác quyền số hóa</span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#f5f3f3] p-1 rounded-lg">
            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); }}
              className="px-3 py-1 rounded text-[#44474c] hover:text-[#1b1c1c] font-medium"
            >
              Chuyển nhanh: <span className="font-bold text-[#9f4120]">{authMode === 'login' ? 'Đăng ký mới' : 'Đăng nhập'}</span>
            </button>
            <span className="text-[#c5c6cc]">|</span>
            <button
              onClick={() => setShowGoogleModal(true)}
              className="px-3 py-1 text-[#9f4120] font-semibold hover:bg-[#efeded] rounded flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">account_circle</span>
              <span>Duyệt Google</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Auth Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Literary Context & Illustration (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-[#f5f3f3] p-6 lg:p-10 shadow-sm relative overflow-hidden border border-[#e5e0d8]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px] bg-[#9f4120]"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9f4120]">
                  Khởi Sinh Trang Viết
                </span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0a1422] mb-4 leading-tight">
                Nơi những tâm hồn đồng điệu hội ngộ cùng tinh hoa con chữ.
              </h2>

              <p className="font-editorial text-sm text-[#44474c] mb-6 leading-relaxed">
                Bước vào thư các của Văn Đàn để sở hữu thư viện cá nhân hóa, theo dõi các tác phẩm dã sử kinh điển, tiểu thuyết mạng sáng tạo và truyện tranh bản quyền được chuyển ngữ công phu.
              </p>

              {/* Artwork Card */}
              <div className="relative mb-6 rounded-lg overflow-hidden shadow-md">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUXZZfyOdcDvv6ab_4QLtM9wRA2HhlkowM82EPtHBQxvfLGwIn2b_f_sYUz8IzTahY7BhL12mf4oqS3cZJnLbEf128nd60_meKjZP1KV32dgYOwzxIVaCn45SU1DISsL7HVqJgKsKNl-TADmiFhfiMunszYcfRHwM-Gx0RvYr0BAvJWgybWhXWI7n7sSSJL6amEHUJPqJjpCCg4wtxg1iHxMWEKJwAc5v0WCfhXj-y6LbweU4dR7oCKw"
                  alt="Vietnamese literary illustration"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1422]/90 via-[#0a1422]/30 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffdbd0]">
                    Trích tác phẩm tháng Ba
                  </span>
                  <p className="font-editorial text-xs italic text-[#fbf9f9] mt-1">
                    “Ngữ nghĩa nằm ở chỗ sâu kín nhất của lòng người, khi mực ngấm vào thớ giấy, ấy là lúc hồi ức bất tử.”
                  </p>
                  <span className="text-[10px] text-[#e3e2e2] mt-1">— Độc bản lưu trữ Thư Quán Văn Đàn</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#ffffff] rounded-lg shadow-xs border border-[#e5e0d8]">
                  <div className="font-editorial text-lg font-bold text-[#0a1422]">120K+</div>
                  <div className="text-[11px] text-[#44474c] mt-0.5">Độc giả tương tác</div>
                </div>
                <div className="p-3 bg-[#ffffff] rounded-lg shadow-xs border border-[#e5e0d8]">
                  <div className="font-editorial text-lg font-bold text-[#9f4120]">100%</div>
                  <div className="text-[11px] text-[#44474c] mt-0.5">Tác quyền chính ngạch</div>
                </div>
                <div className="p-3 bg-[#ffffff] rounded-lg shadow-xs border border-[#e5e0d8]">
                  <div className="font-editorial text-lg font-bold text-[#0a1422]">4.8k+</div>
                  <div className="text-[11px] text-[#44474c] mt-0.5">Bản thảo lưu chiểu</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e5e0d8] mt-6 flex items-center gap-2 text-xs text-[#44474c]">
              <span className="material-symbols-outlined text-[#9f4120] text-[18px]">verified_user</span>
              <span>Bảo vệ quyền tác giả theo công ước Berne & Pháp luật Việt Nam.</span>
            </div>
          </div>

          {/* Right Column: Interactive Auth Form (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="w-full bg-[#ffffff] border border-[#e5e0d8] rounded-xl p-6 lg:p-10 shadow-md">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#e5e0d8]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#44474c] tracking-wider">Cổng thành viên</span>
                  <h3 className="font-editorial text-2xl font-bold text-[#0a1422] mt-0.5">
                    {authMode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản Độc giả'}
                  </h3>
                </div>

                <div className="flex p-1 bg-[#efeded] rounded-lg">
                  <button
                    onClick={() => { setAuthMode('login'); setError(''); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                      authMode === 'login' ? 'bg-[#1f2937] text-white shadow-sm' : 'text-[#44474c] hover:text-[#1b1c1c]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setError(''); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                      authMode === 'register' ? 'bg-[#1f2937] text-white shadow-sm' : 'text-[#44474c] hover:text-[#1b1c1c]'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>
              </div>

              {/* Google Quick Login Button */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="w-full h-11 bg-[#f5f3f3] hover:bg-[#efeded] text-[#1b1c1c] rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs border border-[#e5e0d8]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                    <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.36 7.34 24 12 24z" fill="#34A853"></path>
                    <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                    <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                  </svg>
                  <span>Tiếp tục nhanh với Google</span>
                </button>

                <div className="relative flex py-4 items-center">
                  <div className="flex-grow h-[1px] bg-[#e3e2e2]"></div>
                  <span className="flex-shrink mx-3 text-[#75777c] text-[10px] uppercase tracking-widest font-semibold">
                    Hoặc dùng thư tín điện tử
                  </span>
                  <div className="flex-grow h-[1px] bg-[#e3e2e2]"></div>
                </div>
              </div>

              {error && (
                <div className="bg-[#ffdad6] text-[#93000a] text-xs p-3 rounded-lg mb-4 border border-[#ba1a1a]/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <div>
                    <label className="block font-medium text-[#1b1c1c] mb-1.5">Bút danh / Tên xưng hô</label>
                    <div className="w-full h-11 px-3.5 bg-[#ffffff] border border-[#c5c6cc] rounded-lg focus-within:border-[#1f2937] transition flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#75777c] text-[18px] select-none flex-shrink-0 leading-none">edit_note</span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ví dụ: Dạ Nguyệt, Nam Phong..."
                        className="w-full h-full bg-transparent text-[#1b1c1c] text-xs focus:outline-none border-none p-0"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-[#1b1c1c] mb-1.5">Địa chỉ Thư điện tử</label>
                  <div className="w-full h-11 px-3.5 bg-[#ffffff] border border-[#c5c6cc] rounded-lg focus-within:border-[#1f2937] transition flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#75777c] text-[18px] select-none flex-shrink-0 leading-none">mail</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="docgia@vandan.vn"
                      className="w-full h-full bg-transparent text-[#1b1c1c] text-xs focus:outline-none border-none p-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#1b1c1c] mb-1.5">Mật khẩu bảo mật</label>
                  <div className="w-full h-11 px-3.5 bg-[#ffffff] border border-[#c5c6cc] rounded-lg focus-within:border-[#1f2937] transition flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#75777c] text-[18px] select-none flex-shrink-0 leading-none">lock</span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-full bg-transparent text-[#1b1c1c] text-xs focus:outline-none border-none p-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#c5c6cc] text-[#1f2937]" />
                    <span className="text-[#44474c]">Lưu phiên đọc 30 ngày trên thiết bị này</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#9f4120] hover:bg-[#732102] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md mt-3 text-xs"
                >
                  <span>{loading ? 'Đang Xử Lý...' : authMode === 'login' ? 'Đăng nhập vào Văn Đàn' : 'Khởi tạo tài khoản Độc giả'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Privilege Feature Cards (4 Columns) */}
        <div className="mt-12 p-6 bg-[#f5f3f3] rounded-xl shadow-xs border border-[#e5e0d8]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e5e0d8] pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9f4120]">Đặc quyền gia nhập</span>
              <h4 className="font-editorial text-lg font-bold text-[#0a1422] mt-0.5">
                Hành trang của mỗi Độc giả tại Văn Đàn
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#44474c]">
              <span className="w-2 h-2 rounded-full bg-[#94d5aa]"></span>
              <span>Khai mở đầy đủ ngay sau xác thực</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#ffffff] p-4 rounded-lg shadow-xs border border-[#e5e0d8]">
              <span className="material-symbols-outlined text-[#9f4120] text-[24px] mb-2">auto_stories</span>
              <div className="font-editorial font-bold text-[#0a1422] text-sm">Tủ sách vô tận</div>
              <p className="text-xs text-[#44474c] mt-1 leading-relaxed">
                Đồng bộ vị trí dòng đọc, chú giải từ vựng và đánh dấu trang qua mọi thiết bị.
              </p>
            </div>
            <div className="bg-[#ffffff] p-4 rounded-lg shadow-xs border border-[#e5e0d8]">
              <span className="material-symbols-outlined text-[#9f4120] text-[24px] mb-2">forum</span>
              <div className="font-editorial font-bold text-[#0a1422] text-sm">Bình phẩm thấu cảm</div>
              <p className="text-xs text-[#44474c] mt-1 leading-relaxed">
                Gửi gắm bình luận trực tiếp bên cạnh từng đoạn văn bản, đối thoại cùng dịch giả.
              </p>
            </div>
            <div className="bg-[#ffffff] p-4 rounded-lg shadow-xs border border-[#e5e0d8]">
              <span className="material-symbols-outlined text-[#9f4120] text-[24px] mb-2">workspace_premium</span>
              <div className="font-editorial font-bold text-[#0a1422] text-sm">Huy hiệu Độc bản</div>
              <p className="text-xs text-[#44474c] mt-1 leading-relaxed">
                Nhận huy chương độc giả kỳ cựu và quyền bỏ phiếu chọn bản thảo dịch tiếp theo.
              </p>
            </div>
            <div className="bg-[#ffffff] p-4 rounded-lg shadow-xs border border-[#e5e0d8]">
              <span className="material-symbols-outlined text-[#9f4120] text-[24px] mb-2">toll</span>
              <div className="font-editorial font-bold text-[#0a1422] text-sm">350 Xu quà tặng</div>
              <p className="text-xs text-[#44474c] mt-1 leading-relaxed">
                Thưởng nóng lượng xu khởi điểm để tự do mở khóa các chương VIP độc quyền.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Google Login Modal (Allows Custom Email Input) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1422]/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-xl shadow-2xl overflow-hidden p-6 border border-[#e5e0d8]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e5e0d8]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                  <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.36 7.34 24 12 24z" fill="#34A853"></path>
                  <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                  <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                </svg>
                <span className="font-semibold text-xs text-[#0a1422]">Xác Thực Đăng Nhập Google</span>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-[#75777c] hover:text-[#1b1c1c]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Custom Google Email Input Form */}
            <div className="space-y-4">
              <div>
                <p className="font-editorial text-base font-bold text-[#0a1422]">Nhập Email Google của bạn</p>
                <p className="text-xs text-[#44474c]">Hệ thống sẽ tự động tạo tài khoản & đăng nhập tức thì</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGoogleSelect(customGoogleEmail, customGoogleEmail.split('@')[0]);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">Địa chỉ Email Gmail của bạn:</label>
                  <input
                    type="email"
                    required
                    placeholder="ví dụ: emailcuaban@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-[#f5f3f3] border border-[#c5c6cc] rounded-lg focus:outline-none focus:border-[#1f2937]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{loading ? 'Đang Xử Lý...' : 'Đăng Nhập Ngay Bằng Google Email Này'}</span>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow h-[1px] bg-[#e3e2e2]"></div>
                <span className="flex-shrink mx-2 text-[#75777c] text-[10px] uppercase font-semibold">Hoặc chọn tài khoản mẫu</span>
                <div className="flex-grow h-[1px] bg-[#e3e2e2]"></div>
              </div>

              {/* Sample list */}
              <div className="space-y-2">
                <div
                  onClick={() => handleGoogleSelect('nguyen.haimy@gmail.com', 'Hải My (Họa Sĩ)')}
                  className="p-2.5 rounded-lg hover:bg-[#f5f3f3] transition-colors cursor-pointer flex items-center justify-between border border-[#e5e0d8]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      alt="Hải My"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#0a1422]">Hải My (Họa Sĩ)</div>
                      <div className="text-[10px] text-[#75777c]">nguyen.haimy@gmail.com</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#75777c]">chevron_right</span>
                </div>

                <div
                  onClick={() => handleGoogleSelect('quocbaotran.lit@gmail.com', 'Trần Quốc Bảo')}
                  className="p-2.5 rounded-lg hover:bg-[#f5f3f3] transition-colors cursor-pointer flex items-center justify-between border border-[#e5e0d8]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                      alt="Trần Quốc Bảo"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#0a1422]">Trần Quốc Bảo</div>
                      <div className="text-[10px] text-[#75777c]">quocbaotran.lit@gmail.com</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#75777c]">chevron_right</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
