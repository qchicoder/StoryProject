import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Bạn không có quyền truy cập trang quản trị.' },
      { status: 403 }
    );
  }

  try {
    const [totalUsers, totalStories, totalChapters, payments, latestPayments] = await Promise.all([
      prisma.user.count(),
      prisma.story.count(),
      prisma.chapter.count(),
      prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        select: { moneyAmount: true },
      }),
      prisma.payment.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + p.moneyAmount, 0);

    return NextResponse.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_stories: totalStories,
        total_chapters: totalChapters,
        total_revenue: totalRevenue,
        latest_payments: latestPayments.map((p) => ({
          id: p.id,
          user_id: p.userId,
          payment_method: p.paymentMethod,
          coins_amount: p.coinsAmount,
          money_amount: p.moneyAmount,
          transaction_code: p.transactionCode,
          status: p.status,
          created_at: p.createdAt.toISOString(),
          user: p.user,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi tải thống kê: ' + error.message },
      { status: 500 }
    );
  }
}
