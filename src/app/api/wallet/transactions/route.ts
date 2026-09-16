import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  const wallet = await prisma.coinWallet.findUnique({
    where: { userId: user.id },
  });

  if (!wallet) {
    return NextResponse.json({
      success: true,
      data: { data: [], total: 0, current_page: 1, last_page: 1 },
    });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '15');
  const skip = (page - 1) * perPage;

  const [total, transactions] = await Promise.all([
    prisma.coinTransaction.count({ where: { walletId: wallet.id } }),
    prisma.coinTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      data: transactions.map((t) => ({
        id: t.id,
        wallet_id: t.walletId,
        amount: t.amount,
        type: t.type,
        description: t.description,
        reference_id: t.referenceId,
        created_at: t.createdAt.toISOString(),
      })),
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    },
  });
}
