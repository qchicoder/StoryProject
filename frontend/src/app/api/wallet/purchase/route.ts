import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { package_id, payment_method, custom_amount, card_telco, card_code, card_seri } = body;

    if (!package_id || !payment_method) {
      return NextResponse.json(
        { success: false, message: 'Thông tin nạp không hợp lệ' },
        { status: 400 }
      );
    }

    const packages: Record<string, { coins: number; price: number; label: string }> = {
      pkg_10: { coins: 20, price: 20000, label: 'Gói Nhập Môn' },
      pkg_50: { coins: 60, price: 50000, label: 'Gói Phổ Thông (+10 xu)' },
      pkg_100: { coins: 130, price: 100000, label: 'Gói Cao Cấp (+30 xu)' },
      pkg_200: { coins: 280, price: 200000, label: 'Gói Đại Gia (+80 xu)' },
    };

    let price = 0;
    let coins = 0;

    if (package_id === 'custom') {
      price = parseInt(custom_amount || 10000);
      if (price < 10000) {
        return NextResponse.json(
          { success: false, message: 'Số tiền nạp tối thiểu là 10.000 VNĐ' },
          { status: 400 }
        );
      }
      if (price > 10000000) {
        return NextResponse.json(
          { success: false, message: 'Số tiền nạp tối đa là 10.000.000 VNĐ trong một lần' },
          { status: 400 }
        );
      }

      const baseCoins = Math.floor(price / 1000);
      if (price >= 200000) {
        coins = Math.floor(baseCoins * 1.4);
      } else if (price >= 100000) {
        coins = Math.floor(baseCoins * 1.3);
      } else if (price >= 50000) {
        coins = Math.floor(baseCoins * 1.2);
      } else {
        coins = baseCoins;
      }
    } else {
      if (!packages[package_id]) {
        return NextResponse.json(
          { success: false, message: 'Gói nạp không hợp lệ' },
          { status: 400 }
        );
      }
      price = packages[package_id].price;
      coins = packages[package_id].coins;
    }

    // Apply 30% discount for scratch cards
    if (payment_method === 'SCRATCH_CARD') {
      coins = Math.floor(coins * 0.7);
    }

    const txnCode = 'VD_' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        paymentMethod: payment_method,
        coinsAmount: coins,
        moneyAmount: price,
        transactionCode: txnCode,
        status: 'PENDING',
        payload: JSON.stringify({ card_telco, card_code, card_seri }),
      },
    });

    const qrUrl = `https://img.vietqr.io/image/MB-123456789-compact2.png?amount=${price}&addInfo=${txnCode}&accountName=VAN%20DAN%20MEDIA`;

    return NextResponse.json({
      success: true,
      message:
        payment_method === 'SCRATCH_CARD'
          ? 'Đã gửi thẻ cào thành công. Đang xử lý gạch thẻ...'
          : 'Khởi tạo đơn hàng nạp xu thành công',
      data: {
        payment_id: payment.id,
        transaction_code: txnCode,
        amount: price,
        coins,
        qr_url: qrUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khởi tạo nạp xu: ' + error.message },
      { status: 500 }
    );
  }
}
