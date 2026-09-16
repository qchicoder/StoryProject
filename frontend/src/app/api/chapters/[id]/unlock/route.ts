import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Bạn cần đăng nhập để mở khóa chương.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const chapterId = parseInt(id);

  if (isNaN(chapterId)) {
    return NextResponse.json(
      { success: false, message: 'ID chương không hợp lệ' },
      { status: 400 }
    );
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      story: true,
      textContent: true,
      comicImages: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json(
      { success: false, message: 'Không tìm thấy chương này' },
      { status: 404 }
    );
  }

  if (!chapter.isPaid) {
    return NextResponse.json({
      success: true,
      message: 'Chương này hoàn toàn miễn phí.',
    });
  }

  // Check if already unlocked
  const alreadyUnlocked = await prisma.chapterUnlock.findUnique({
    where: {
      userId_chapterId: {
        userId: user.id,
        chapterId: chapter.id,
      },
    },
  });

  if (alreadyUnlocked) {
    return NextResponse.json({
      success: true,
      message: 'Bạn đã mở khóa chương này trước đó.',
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.coinWallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet || wallet.balance < chapter.coinPrice) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // Deduct coins
      const updatedWallet = await tx.coinWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: chapter.coinPrice },
        },
      });

      // Record transaction
      await tx.coinTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -chapter.coinPrice,
          type: 'SPEND',
          description: `Mở khóa ${chapter.story.title} - ${chapter.title}`,
          referenceId: `CHAPTER_${chapter.id}`,
        },
      });

      // Create unlock record
      await tx.chapterUnlock.create({
        data: {
          userId: user.id,
          chapterId: chapter.id,
          coinsSpent: chapter.coinPrice,
        },
      });

      return updatedWallet;
    });

    return NextResponse.json({
      success: true,
      message: 'Mở khóa chương thành công!',
      data: {
        remaining_balance: result.balance,
        chapter: {
          id: chapter.id,
          content: chapter.story.contentType === 'NOVEL' ? chapter.textContent?.content || '' : null,
          comic_images: chapter.story.contentType === 'COMIC' ? chapter.comicImages : null,
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_BALANCE') {
      const currentWallet = await prisma.coinWallet.findUnique({ where: { userId: user.id } });
      return NextResponse.json(
        {
          success: false,
          message: 'Số dư xu không đủ để mở khóa chương. Vui lòng nạp thêm xu!',
          required_coins: chapter.coinPrice,
          current_balance: currentWallet ? currentWallet.balance : 0,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Lỗi giao dịch: ' + error.message },
      { status: 500 }
    );
  }
}
