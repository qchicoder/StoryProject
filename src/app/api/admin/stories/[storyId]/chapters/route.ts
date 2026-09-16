import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Từ chối truy cập' }, { status: 403 });
  }

  try {
    const { storyId } = await params;
    const id = parseInt(storyId);

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tác phẩm' }, { status: 404 });
    }

    const body = await request.json();
    const { chapter_number, title, is_paid, coin_price, content, images } = body;

    if (!chapter_number || !title) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp số chương và tiêu đề' },
        { status: 400 }
      );
    }

    const chapterNum = parseInt(chapter_number);
    const slug = `chuong-${chapterNum}`;

    const chapter = await prisma.chapter.create({
      data: {
        storyId: story.id,
        chapterNumber: chapterNum,
        title,
        slug,
        isPaid: !!is_paid,
        coinPrice: coin_price ? parseInt(coin_price) : 0,
        status: 'PUBLISHED',
      },
    });

    if (story.contentType === 'NOVEL') {
      await prisma.chapterContent.create({
        data: {
          chapterId: chapter.id,
          content: content || '<p>Nội dung đang được cập nhật...</p>',
        },
      });
    } else if (story.contentType === 'COMIC' && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        await prisma.comicImage.create({
          data: {
            chapterId: chapter.id,
            imageUrl: images[i],
            orderIndex: i + 1,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thêm chương mới thành công!',
        data: chapter,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi thêm chương: ' + error.message },
      { status: 500 }
    );
  }
}
