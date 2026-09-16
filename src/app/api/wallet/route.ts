import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  let wallet = await prisma.coinWallet.findUnique({
    where: { userId: user.id },
  });

  if (!wallet) {
    wallet = await prisma.coinWallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });
  }

  const packages = [
    { id: 'pkg_10', coins: 20, price: 20000, label: 'Gói Nhập Môn' },
    { id: 'pkg_50', coins: 60, price: 50000, label: 'Gói Phổ Thông (+10 xu)' },
    { id: 'pkg_100', coins: 130, price: 100000, label: 'Gói Cao Cấp (+30 xu)' },
    { id: 'pkg_200', coins: 280, price: 200000, label: 'Gói Đại Gia (+80 xu)' },
  ];

  return NextResponse.json({
    success: true,
    data: {
      balance: wallet.balance,
      packages,
    },
  });
}
