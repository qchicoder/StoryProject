import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const story = await prisma.story.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          select: {
            id: true,
            storyId: true,
            chapterNumber: true,
            title: true,
            slug: true,
            isPaid: true,
            coinPrice: true,
            viewCount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy tác phẩm này' },
        { status: 404 }
      );
    }

    // Increment views
    await prisma.story.update({
      where: { id: story.id },
      data: { viewCount: { increment: 1 } },
    });

    const user = await getAuthUser(request);
    let isFollowing = false;

    if (user) {
      const follow = await prisma.follow.findUnique({
        where: {
          userId_storyId: {
            userId: user.id,
            storyId: story.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    const formattedStory = {
      id: story.id,
      title: story.title,
      slug: story.slug,
      summary: story.summary,
      cover_url: story.coverUrl,
      content_type: story.contentType,
      status: story.status,
      view_count: story.viewCount + 1,
      author_id: story.authorId,
      category_id: story.categoryId,
      is_featured: story.isFeatured,
      author: story.author,
      category: story.category,
      tags: story.tags.map((t) => t.tag),
      chapters: story.chapters.map((ch) => ({
        id: ch.id,
        story_id: ch.storyId,
        chapter_number: ch.chapterNumber,
        title: ch.title,
        slug: ch.slug,
        is_paid: ch.isPaid,
        coin_price: ch.coinPrice,
        view_count: ch.viewCount,
        status: ch.status,
        created_at: ch.createdAt.toISOString(),
      })),
      updated_at: story.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        story: formattedStory,
        is_following: isFollowing,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải chi tiết truyện: ' + error.message },
      { status: 500 }
    );
  }
}
