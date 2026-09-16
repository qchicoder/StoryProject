import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const paymentId = parseInt(id);

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId: user.id },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy giao dịch' },
        { status: 404 }
      );
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'Giao dịch đã được cộng xu thành công trước đó',
      });
    }

    const updatedWallet = await prisma.$transaction(async (tx) => {
      // Mark payment as success
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS' },
      });

      // Credit wallet
      const wallet = await tx.coinWallet.upsert({
        where: { userId: user.id },
        update: {
          balance: { increment: payment.coinsAmount },
        },
        create: {
          userId: user.id,
          balance: payment.coinsAmount,
        },
      });

      // Record transaction
      await tx.coinTransaction.create({
        data: {
          walletId: wallet.id,
          amount: payment.coinsAmount,
          type: 'PURCHASE',
          description: `Nạp xu qua ${payment.paymentMethod} (Mã: ${payment.transactionCode})`,
          referenceId: payment.transactionCode,
        },
      });

      return wallet;
    });

    return NextResponse.json({
      success: true,
      message: 'Xác nhận thanh toán thành công! Đã cộng xu vào ví.',
      data: {
        new_balance: updatedWallet.balance,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi xác nhận thanh toán: ' + error.message },
      { status: 500 }
    );
  }
}
