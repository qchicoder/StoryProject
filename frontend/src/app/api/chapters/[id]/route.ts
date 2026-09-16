import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNum = !isNaN(parseInt(id));

    const chapter = await prisma.chapter.findFirst({
      where: isNum ? { id: parseInt(id) } : { slug: id },
      include: {
        story: {
          include: {
            author: true,
          },
        },
        textContent: true,
        comicImages: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy chương' }, { status: 404 });
    }

    // Increment view count
    await prisma.chapter.update({
      where: { id: chapter.id },
      data: { viewCount: { increment: 1 } },
    });

    const user = await getAuthUser(request);
    let isUnlocked = true;

    if (chapter.isPaid) {
      if (!user) {
        isUnlocked = false;
      } else {
        const unlock = await prisma.chapterUnlock.findUnique({
          where: {
            userId_chapterId: {
              userId: user.id,
              chapterId: chapter.id,
            },
          },
        });

        if (!unlock && user.role !== 'ADMIN') {
          isUnlocked = false;
        }
      }
    }

    // Record reading progress & history
    if (user) {
      await prisma.readingProgress.upsert({
        where: {
          userId_storyId: {
            userId: user.id,
            storyId: chapter.storyId,
          },
        },
        update: {
          lastChapterId: chapter.id,
          lastReadAt: new Date(),
        },
        create: {
          userId: user.id,
          storyId: chapter.storyId,
          lastChapterId: chapter.id,
          lastReadAt: new Date(),
        },
      });

      await prisma.readingHistory.create({
        data: {
          userId: user.id,
          storyId: chapter.storyId,
          chapterId: chapter.id,
          readAt: new Date(),
        },
      });
    }

    // Navigation (prev & next chapter)
    const prevChapter = await prisma.chapter.findFirst({
      where: {
        storyId: chapter.storyId,
        chapterNumber: { lt: chapter.chapterNumber },
      },
      orderBy: { chapterNumber: 'desc' },
      select: { id: true, chapterNumber: true, slug: true },
    });

    const nextChapter = await prisma.chapter.findFirst({
      where: {
        storyId: chapter.storyId,
        chapterNumber: { gt: chapter.chapterNumber },
      },
      orderBy: { chapterNumber: 'asc' },
      select: { id: true, chapterNumber: true, slug: true },
    });

    const responseData: any = {
      id: chapter.id,
      story_id: chapter.storyId,
      story_title: chapter.story.title,
      story_slug: chapter.story.slug,
      content_type: chapter.story.contentType,
      chapter_number: chapter.chapterNumber,
      title: chapter.title,
      is_paid: chapter.isPaid,
      coin_price: chapter.coinPrice,
      is_unlocked: isUnlocked,
      prev_chapter: prevChapter
        ? { id: prevChapter.id, chapter_number: prevChapter.chapterNumber, slug: prevChapter.slug }
        : null,
      next_chapter: nextChapter
        ? { id: nextChapter.id, chapter_number: nextChapter.chapterNumber, slug: nextChapter.slug }
        : null,
    };

    if (isUnlocked) {
      if (chapter.story.contentType === 'NOVEL') {
        responseData.content = chapter.textContent?.content || '';
      } else {
        responseData.comic_images = chapter.comicImages.map((ci) => ({
          id: ci.id,
          chapter_id: ci.chapterId,
          image_url: ci.imageUrl,
          order_index: ci.orderIndex,
        }));
      }
    } else {
      responseData.content_preview = `Nội dung chương này được khóa bản quyền (Giá: ${chapter.coinPrice} xu). Vui lòng mở khóa để xem tiếp.`;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải chương: ' + error.message },
      { status: 500 }
    );
  }
}
