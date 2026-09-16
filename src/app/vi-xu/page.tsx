'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

interface RankTier {
  id: string;
  name: string;
  minCoins: number;
  badgeBg: string;
  badgeTextColor: string;
  icon: string;
  benefits: string[];
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  // Payment Method Selection State
  const [selectedPkgForPayment, setSelectedPkgForPayment] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'VIETQR' | 'MOMO' | 'BANK_TRANSFER' | 'SCRATCH_CARD'>('VIETQR');
  const [cardTelco, setCardTelco] = useState<'VIETTEL' | 'VINAPHONE' | 'MOBIFONE'>('VIETTEL');
  const [cardCode, setCardCode] = useState('');
  const [cardSeri, setCardSeri] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const handleOpenPaymentModal = (pkg: any) => {
    setSelectedPkgForPayment(pkg);
    setSelectedMethod('VIETQR');
    setCardCode('');
    setCardSeri('');
  };

  const handleExecutePurchase = async () => {
    if (!selectedPkgForPayment) return;

    if (selectedMethod === 'SCRATCH_CARD') {
      if (!cardCode.trim() || !cardSeri.trim()) {
        alert('Vui lòng nhập đầy đủ Mã thẻ cào và Số Seri thẻ.');
        return;
      }
    }

    setSubmittingPayment(true);
    try {
      const res = await fetchApi('/wallet/purchase', {
        method: 'POST',
        body: JSON.stringify({
          package_id: selectedPkgForPayment.id,
          payment_method: selectedMethod,
          card_telco: selectedMethod === 'SCRATCH_CARD' ? cardTelco : undefined,
          card_code: selectedMethod === 'SCRATCH_CARD' ? cardCode : undefined,
          card_seri: selectedMethod === 'SCRATCH_CARD' ? cardSeri : undefined,
        }),
      });
      setPaymentData({ ...res.data, method: selectedMethod });
      setSelectedPkgForPayment(null);
    } catch (err: any) {
      alert(err.message || 'Vui lòng đăng nhập để nạp xu');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // VIP Rank Tiers Definition
  const rankTiers: RankTier[] = [
    {
      id: 'bronze',
      name: '🥉 Độc Giả Tân Thủ',
      minCoins: 0,
      badgeBg: 'bg-[#92400e]/10 border-[#92400e]/30 text-[#92400e]',
      badgeTextColor: 'text-[#92400e]',
      icon: 'military_tech',
      benefits: [
        'Đọc toàn bộ chương truyện công khai miễn phí',
        'Đăng bình luận & thảo luận với cộng đồng độc giả',
      ],
    },
    {
      id: 'silver',
      name: '🥈 Độc Giả Tri Âm (Silver VIP)',
      minCoins: 100,
      badgeBg: 'bg-[#475569]/10 border-[#475569]/30 text-[#334155]',
      badgeTextColor: 'text-[#334155]',
      icon: 'workspace_premium',
      benefits: [
        '🚫 ĐẶC QUYỀN: Đọc mượt mà 100% không quảng cáo (Mở từ mốc 100 Xu)',
        'Giảm 5% xu khi mở khóa các chương VIP bản quyền',
        'Huy hiệu Tri Âm lấp lánh bên cạnh bút danh',
      ],
    },
    {
      id: 'gold',
      name: '🥇 Độc Giả Thư Bác (Gold VIP)',
      minCoins: 300,
      badgeBg: 'bg-[#d97706]/15 border-[#d97706]/40 text-[#b45309]',
      badgeTextColor: 'text-[#b45309]',
      icon: 'stars',
      benefits: [
        'Bao gồm toàn bộ đặc quyền Đọc Không Quảng Cáo',
        'Tặng thêm 10% Xu thưởng vĩnh viễn khi nạp mọi gói',
        'Đọc sớm trước 24 giờ các chương mới dịch/chuyển ngữ',
        'Huy hiệu Thư Bác Kim Cánh hoàng gia cao cấp',
      ],
    },
    {
      id: 'diamond',
      name: '👑 Độc Giả Thần Thạch (Diamond VIP)',
      minCoins: 1000,
      badgeBg: 'bg-[#7c3aed]/15 border-[#7c3aed]/40 text-[#6d28d9]',
      badgeTextColor: 'text-[#6d28d9]',
      icon: 'diamond',
      benefits: [
        'Bao gồm toàn bộ đặc quyền Đọc Không Quảng Cáo',
        'Giảm 15% giá mở khóa tất cả chương VIP',
        'Đọc sớm trước 48 giờ chương mới nhất',
        'Tặng 20% Xu bonus khi nạp mọi gói VietQR',
      ],
    },
  ];

  useEffect(() => {
    Promise.all([
      fetchApi('/wallet'),
      fetchApi('/wallet/transactions')
    ])
      .then(([walletRes, txnRes]) => {
        setBalance(walletRes.data.balance || 0);
        setPackages(walletRes.data.packages || []);
        setTransactions(txnRes.data.data || []);
      })
      .catch((err) => console.error('Lỗi tải thông tin ví:', err))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (pkgId: string) => {
    try {
      const res = await fetchApi('/wallet/purchase', {
        method: 'POST',
        body: JSON.stringify({ package_id: pkgId, payment_method: 'VIETQR' }),
      });
      setPaymentData(res.data);
    } catch (err: any) {
      alert(err.message || 'Vui lòng đăng nhập để nạp xu');
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentData) return;
    setVerifying(true);
    try {
      const res = await fetchApi(`/wallet/verify/${paymentData.payment_id}`, { method: 'POST' });
      alert(res.message);
      setBalance(res.data.new_balance);
      setPaymentData(null);

      // Refresh transactions
      const txnRes = await fetchApi('/wallet/transactions');
      setTransactions(txnRes.data.data || []);
    } catch (err: any) {
      alert(err.message || 'Xác nhận thất bại');
    } finally {
      setVerifying(false);
    }
  };

  // Determine current Rank & Next Rank
  const currentRank = rankTiers.slice().reverse().find((r) => balance >= r.minCoins) || rankTiers[0];
  const nextRank = rankTiers.find((r) => r.minCoins > balance);
  const neededCoins = nextRank ? nextRank.minCoins - balance : 0;

  // Accurately map progress percentage across 4 milestone steps (0, 100, 300, 1000 Xu)
  let progressPercent = 0;
  if (balance >= 1000) {
    progressPercent = 100;
  } else if (balance >= 300) {
    const ratio = (balance - 300) / (1000 - 300);
    progressPercent = 66.6 + ratio * 33.4;
  } else if (balance >= 100) {
    const ratio = (balance - 100) / (300 - 100);
    progressPercent = 33.3 + ratio * 33.3;
  } else {
    const ratio = balance / 100;
    progressPercent = Math.max(5, ratio * 33.3);
  }

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#777777] animate-pulse">Đang tải thông tin Ví Xu...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 font-ui text-[#1b1c1c]">
      {/* Wallet Balance Header Banner */}
      <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold text-[#75777c] uppercase tracking-wider">
            Số Dư Ví Độc Giả
          </span>
          <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#9f4120] flex items-center justify-center sm:justify-start gap-2">
            <span className="material-symbols-outlined text-[32px] text-[#9f4120]">toll</span>
            <span>{balance.toLocaleString()} Xu</span>
          </div>
          <p className="text-xs text-[#44474c]">
            Xu dùng để mở khóa các chương tiểu thuyết & truyện tranh bản quyền cao cấp.
          </p>
        </div>

        {/* Current VIP Badge */}
        <div className={`p-4 rounded-xl border text-center space-y-1 shadow-2xs shrink-0 ${currentRank.badgeBg}`}>
          <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
            <span className="material-symbols-outlined text-[18px]">{currentRank.icon}</span>
            <span>{currentRank.name}</span>
          </div>
          <div className="text-[11px] font-medium opacity-90">Đẳng cấp thành viên hiện tại</div>
        </div>
      </div>

      {/* VIP RANK PROGRESS BAR SECTION */}
      <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-3">
          <h2 className="font-editorial text-lg font-bold text-[#0a1422] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9f4120] text-[20px]">military_tech</span>
            <span>Tiến Trình Thăng Hạng Độc Giả</span>
          </h2>
          {nextRank ? (
            <span className="text-xs font-semibold text-[#9f4120] flex flex-wrap items-center gap-1">
              <span>Còn thiếu <strong className="text-[#0a1422] font-bold">{neededCoins} Xu</strong> để lên</span>
              <strong className="text-[#9f4120]">{nextRank.name}</strong>
              {nextRank.minCoins === 100 && (
                <span className="bg-[#10b981]/15 text-[#047857] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#10b981]/30">
                  🚫 Đạt Không Quảng Cáo
                </span>
              )}
            </span>
          ) : (
            <span className="text-xs font-bold text-[#10b981]">🎉 Đã đạt cấp độ Kim Cương tối cao!</span>
          )}
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="w-full bg-[#f5f3f3] h-4 rounded-full overflow-hidden border border-[#e5e0d8] p-0.5">
            <div
              className="bg-gradient-to-r from-[#9f4120] via-[#d97706] to-[#10b981] h-full rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Tier Milestones Indicators */}
          <div className="grid grid-cols-4 gap-1 text-center text-[11px] font-semibold text-[#75777c]">
            <div className={balance >= 0 ? 'text-[#9f4120] font-bold' : ''}>Tân Thủ (0 Xu)</div>
            <div className={balance >= 100 ? 'text-[#334155] font-bold' : ''}>Tri Âm (100 Xu)</div>
            <div className={balance >= 300 ? 'text-[#b45309] font-bold' : ''}>Thư Bác (300 Xu)</div>
            <div className={balance >= 1000 ? 'text-[#6d28d9] font-bold' : ''}>Thần Thạch (1,000 Xu)</div>
          </div>
        </div>
      </div>

      {/* Package Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-xl font-bold text-[#0a1422]">
            Chọn Gói Nạp Xu Qua VietQR
          </h2>
          <span className="text-xs text-[#75777c]">Xác nhận tự động 24/7</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => {
            const isSilverVIPPackage = pkg.coins >= 100 && pkg.coins < 300;
            const isGoldRechargePackage = pkg.coins >= 300;

            return (
              <div
                key={pkg.id}
                className={`bg-[#FFFDF8] border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-all group relative overflow-hidden ${isGoldRechargePackage || isSilverVIPPackage
                    ? 'border-[#d97706] ring-2 ring-[#ffdbd0]'
                    : 'border-[#E5E0D8] hover:border-[#9f4120]'
                  }`}
              >
                {isSilverVIPPackage && (
                  <span className="absolute top-0 right-0 bg-[#334155] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-bl-lg shadow-xs">
                    🚫 Không QC (100 Xu)
                  </span>
                )}
                {isGoldRechargePackage && (
                  <span className="absolute top-0 right-0 bg-[#d97706] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-bl-lg shadow-xs">
                    ★ Lên VIP 300 Xu
                  </span>
                )}

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-[#f5f3f3] text-[#0a1422] px-2.5 py-1 rounded-full border border-[#E5E0D8]">
                    {pkg.label}
                  </span>
                  <div className="font-editorial text-2xl font-bold text-[#0a1422] mt-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[24px] text-[#9f4120]">toll</span>
                    <span>{pkg.coins} Xu</span>
                  </div>
                  <div className="text-sm font-bold text-[#9f4120] mt-1">
                    {pkg.price.toLocaleString()} VNĐ
                  </div>
                  {isSilverVIPPackage && (
                    <p className="text-[10px] text-[#334155] font-bold mt-2 leading-snug">
                      ✨ Nạp gói này mở khóa ngay Đọc Không Quảng Cáo!
                    </p>
                  )}
                  {isGoldRechargePackage && (
                    <p className="text-[10px] text-[#b45309] font-bold mt-2 leading-snug">
                      🔥 Nạp gói này thăng hạng ngay Độc Giả Thư Bác VIP!
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleOpenPaymentModal(pkg)}
                  className="w-full bg-[#0a1422] group-hover:bg-[#9f4120] text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  <span>Nạp Ngay</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANK TIERS & BENEFITS DETAIL GRID */}
      <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#E5E0D8] pb-4">
          <h2 className="font-editorial text-xl font-bold text-[#0a1422] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9f4120] text-[24px]">stars</span>
            <span>Quyền Lợi & Đặc Quyền Đẳng Cấp Độc Giả</span>
          </h2>
          <p className="text-xs text-[#75777c] mt-1">Tích lũy xu nạp để mở khóa các đặc quyền VIP độc quyền tại Văn Đàn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rankTiers.map((tier) => {
            const isCurrent = currentRank.id === tier.id;

            return (
              <div
                key={tier.id}
                className={`p-5 rounded-2xl border transition-all ${isCurrent
                    ? 'bg-[#ffdbd0]/20 border-[#9f4120] ring-2 ring-[#ffdbd0] shadow-sm'
                    : 'bg-[#fbf9f9] border-[#e5e0d8]'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#9f4120]">{tier.icon}</span>
                    <h3 className="font-editorial text-base font-bold text-[#0a1422]">{tier.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tier.badgeBg}`}>
                    Mốc {tier.minCoins} Xu
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-[#44474c] pl-1">
                  {tier.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent && (
                  <div className="mt-3 pt-2 border-t border-[#9f4120]/20 text-[11px] font-bold text-[#9f4120] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Đẳng cấp hiện tại của bạn</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      {selectedPkgForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] dark:bg-[#1e293b] border border-[#E5E0D8] dark:border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPkgForPayment(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#f5f3f3] dark:bg-slate-800 hover:bg-[#efeded] dark:hover:bg-slate-700 flex items-center justify-center text-[#777777] dark:text-slate-300 font-bold transition text-xs"
            >
              ✕
            </button>

            <div className="text-center space-y-0.5">
              <h3 className="font-editorial text-lg font-bold text-[#0a1422] dark:text-slate-100">
                Chọn Phương Thức Thanh Toán
              </h3>
              <p className="text-[11px] text-[#75777c] dark:text-slate-400">
                Vui lòng chọn kênh thanh toán bạn muốn dùng để nạp Xu
              </p>
            </div>

            {/* Selected Package Banner */}
            <div className="bg-[#ffdbd0]/30 dark:bg-amber-950/40 border border-[#9f4120]/30 dark:border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#9f4120] dark:text-amber-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-[#9f4120]/20 dark:border-amber-500/30">
                  {selectedPkgForPayment.label}
                </span>
                <div className="text-xs font-bold text-[#0a1422] dark:text-slate-100 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#9f4120] dark:text-amber-400">toll</span>
                  <span>{selectedPkgForPayment.coins} Xu</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#75777c] dark:text-slate-400 block">Số tiền</span>
                <span className="text-sm font-bold text-[#9f4120] dark:text-amber-400">
                  {selectedPkgForPayment.price.toLocaleString()} VNĐ
                </span>
              </div>
            </div>

            {/* Payment Method Options (Compact 2x2 Grid) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0a1422] dark:text-slate-200 block">
                Phương thức thanh toán:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* Option 1: VietQR */}
                <div
                  onClick={() => setSelectedMethod('VIETQR')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${selectedMethod === 'VIETQR'
                      ? 'bg-[#9f4120]/10 dark:bg-amber-500/20 border-[#9f4120] dark:border-amber-500 text-[#9f4120] dark:text-amber-400 font-bold ring-1 ring-[#9f4120]'
                      : 'bg-[#fbf9f9] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#f5f3f3] dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#9f4120] dark:text-amber-400 shrink-0">qr_code_2</span>
                  <div className="text-left overflow-hidden">
                    <div className="text-xs font-bold truncate">VietQR Auto</div>
                    <div className="text-[10px] text-[#75777c] dark:text-slate-400 truncate">Quét mã QR 24/7</div>
                  </div>
                </div>

                {/* Option 2: MoMo */}
                <div
                  onClick={() => setSelectedMethod('MOMO')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${selectedMethod === 'MOMO'
                      ? 'bg-[#9f4120]/10 dark:bg-amber-500/20 border-[#9f4120] dark:border-amber-500 text-[#9f4120] dark:text-amber-400 font-bold ring-1 ring-[#9f4120]'
                      : 'bg-[#fbf9f9] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#f5f3f3] dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#a50064] dark:text-pink-400 shrink-0">account_balance_wallet</span>
                  <div className="text-left overflow-hidden">
                    <div className="text-xs font-bold truncate">Ví MoMo</div>
                    <div className="text-[10px] text-[#75777c] dark:text-slate-400 truncate">Ứng dụng MoMo</div>
                  </div>
                </div>

                {/* Option 3: Bank Transfer */}
                <div
                  onClick={() => setSelectedMethod('BANK_TRANSFER')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${selectedMethod === 'BANK_TRANSFER'
                      ? 'bg-[#9f4120]/10 dark:bg-amber-500/20 border-[#9f4120] dark:border-amber-500 text-[#9f4120] dark:text-amber-400 font-bold ring-1 ring-[#9f4120]'
                      : 'bg-[#fbf9f9] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#f5f3f3] dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#1e293b] dark:text-slate-300 shrink-0">account_balance</span>
                  <div className="text-left overflow-hidden">
                    <div className="text-xs font-bold truncate">STK Ngân Hàng</div>
                    <div className="text-[10px] text-[#75777c] dark:text-slate-400 truncate">Chuyển thủ công</div>
                  </div>
                </div>

                {/* Option 4: Scratch Card */}
                <div
                  onClick={() => setSelectedMethod('SCRATCH_CARD')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${selectedMethod === 'SCRATCH_CARD'
                      ? 'bg-[#9f4120]/10 dark:bg-amber-500/20 border-[#9f4120] dark:border-amber-500 text-[#9f4120] dark:text-amber-400 font-bold ring-1 ring-[#9f4120]'
                      : 'bg-[#fbf9f9] dark:bg-slate-800/60 border-[#e5e0d8] dark:border-slate-700 text-[#44474c] dark:text-slate-300 hover:bg-[#f5f3f3] dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#d97706] dark:text-amber-400 shrink-0">credit_card</span>
                  <div className="text-left overflow-hidden">
                    <div className="text-xs font-bold truncate">Thẻ Cào (-30%)</div>
                    <div className="text-[10px] text-[#75777c] dark:text-slate-400 truncate">Viettel, Vina, Mobi</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scratch Card Specific Input Fields */}
            {selectedMethod === 'SCRATCH_CARD' && (
              <div className="bg-[#f7f4ef] dark:bg-slate-800/90 border border-[#e5e0d8] dark:border-slate-700 p-3 rounded-xl space-y-2.5 animate-fade-in text-left">
                <div className="text-[11px] text-[#0a1422] dark:text-amber-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#9f4120] dark:text-amber-400">info</span>
                    Chiết khấu 30%:
                  </span>
                  <span className="text-[#9f4120] dark:text-amber-400 font-extrabold text-xs">
                    Thực nhận {Math.floor(selectedPkgForPayment.coins * 0.7)} Xu
                  </span>
                </div>

                {/* Telco selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#44474c] dark:text-slate-300">Chọn nhà mạng:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['VIETTEL', 'VINAPHONE', 'MOBIFONE'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCardTelco(t)}
                        className={`py-1 text-[11px] font-bold rounded-lg border transition ${cardTelco === t
                            ? 'bg-[#9f4120] dark:bg-amber-600 text-white border-[#9f4120] dark:border-amber-600'
                            : 'bg-white dark:bg-slate-900 text-[#44474c] dark:text-slate-300 border-[#e5e0d8] dark:border-slate-700 hover:bg-[#f5f3f3] dark:hover:bg-slate-800'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card PIN & Seri (2-column layout) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#44474c] dark:text-slate-300">Mã thẻ (PIN):</label>
                    <input
                      type="text"
                      value={cardCode}
                      onChange={(e) => setCardCode(e.target.value)}
                      placeholder="Mã số tráng bạc..."
                      className="w-full bg-white dark:bg-slate-900 border border-[#e5e0d8] dark:border-slate-700 text-[#0a1422] dark:text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9f4120] dark:focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#44474c] dark:text-slate-300">Số Seri thẻ:</label>
                    <input
                      type="text"
                      value={cardSeri}
                      onChange={(e) => setCardSeri(e.target.value)}
                      placeholder="Mã Seri trên thẻ..."
                      className="w-full bg-white dark:bg-slate-900 border border-[#e5e0d8] dark:border-slate-700 text-[#0a1422] dark:text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9f4120] dark:focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Purchase Button */}
            <button
              onClick={handleExecutePurchase}
              disabled={submittingPayment}
              className="w-full bg-[#9f4120] dark:bg-amber-600 hover:bg-[#732102] dark:hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 mt-1"
            >
              <span className="material-symbols-outlined text-[17px]">
                {selectedMethod === 'SCRATCH_CARD' ? 'credit_card' : 'payments'}
              </span>
              <span>
                {submittingPayment
                  ? 'Đang Khởi Tạo Giao Dịch...'
                  : selectedMethod === 'SCRATCH_CARD'
                    ? `Nạp Thẻ Cào (Nhận ${Math.floor(selectedPkgForPayment.coins * 0.7)} Xu)`
                    : `Xác Nhận Thanh Toán (${selectedPkgForPayment.price.toLocaleString()} VNĐ)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* VietQR Modal */}
      {paymentData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] dark:bg-[#1e293b] border border-[#E5E0D8] dark:border-slate-800 text-[#0a1422] dark:text-slate-100 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setPaymentData(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#f5f3f3] dark:bg-slate-800 hover:bg-[#efeded] dark:hover:bg-slate-700 flex items-center justify-center text-[#777777] dark:text-slate-300 font-bold transition text-xs"
            >
              ✕
            </button>

            <h3 className="font-editorial text-xl font-bold text-[#0a1422] dark:text-slate-100">
              Cổng Thanh Toán VietQR
            </h3>

            <div className="bg-white p-3 rounded-xl border border-[#E5E0D8] dark:border-slate-700 inline-block shadow-sm">
              <img
                src={paymentData.qr_url}
                alt="VietQR Payment"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>

            <div className="bg-[#f5f3f3] dark:bg-slate-900 border border-[#E5E0D8] dark:border-slate-800 p-3 rounded-xl text-xs text-left space-y-1 font-mono">
              <div><strong className="text-[#777777] dark:text-slate-400">Số tiền:</strong> <span className="text-[#9f4120] dark:text-amber-400 font-bold">{paymentData.amount.toLocaleString()} VNĐ</span></div>
              <div><strong className="text-[#777777] dark:text-slate-400">Số xu nhận:</strong> <span className="font-bold text-amber-500">🪙 {paymentData.coins} Xu</span></div>
              <div><strong className="text-[#777777] dark:text-slate-400">Nội dung CK:</strong> <span className="bg-yellow-100 dark:bg-amber-900/60 text-yellow-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-bold">{paymentData.transaction_code}</span></div>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={verifying}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{verifying ? 'Đang Kiểm Tra Hotlline Giao Dịch...' : 'Tôi Đã Thanh Toán (Xác Nhận Xu Ngay)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-[#FFFDF8] border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="font-editorial text-lg font-bold text-[#0a1422] mb-4 pb-2 border-b border-[#E5E0D8]">
          Lịch Sử Giao Dịch Xu
        </h3>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E0D8] text-[#75777c]">
                  <th className="py-2.5">Thời gian</th>
                  <th className="py-2.5">Nội dung</th>
                  <th className="py-2.5 text-right">Số xu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#fbf9f9]">
                    <td className="py-3 text-[#75777c]">
                      {new Date(t.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 font-medium text-[#0a1422]">{t.description}</td>
                    <td
                      className={`py-3 text-right font-bold ${t.amount > 0 ? 'text-[#10b981]' : 'text-[#9f4120]'
                        }`}
                    >
                      {t.amount > 0 ? `+${t.amount}` : t.amount} Xu
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#75777c]">Chưa có lịch sử giao dịch.</div>
        )}
      </div>
    </div>
  );
}
