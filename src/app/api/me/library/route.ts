import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  const follows = await prisma.follow.findMany({
    where: { userId: user.id },
    include: {
      story: {
        include: {
          author: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const readingProgress = await prisma.readingProgress.findMany({
    where: { userId: user.id },
    include: {
      story: {
        include: {
          author: true,
        },
      },
      chapter: true,
    },
    orderBy: { lastReadAt: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: {
      follows: follows.map((f) => ({
        id: f.id,
        user_id: f.userId,
        story_id: f.storyId,
        story: {
          ...f.story,
          cover_url: f.story.coverUrl,
          content_type: f.story.contentType,
          view_count: f.story.viewCount,
          is_featured: f.story.isFeatured,
        },
      })),
      reading_progress: readingProgress.map((rp) => ({
        id: rp.id,
        user_id: rp.userId,
        story_id: rp.storyId,
        last_chapter_id: rp.lastChapterId,
        last_read_at: rp.lastReadAt,
        story: {
          ...rp.story,
          cover_url: rp.story.coverUrl,
          content_type: rp.story.contentType,
          view_count: rp.story.viewCount,
        },
        chapter: rp.chapter,
      })),
    },
  });
}
