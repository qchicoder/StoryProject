import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');
  const skip = (page - 1) * perPage;

  const [total, histories] = await Promise.all([
    prisma.readingHistory.count({ where: { userId: user.id } }),
    prisma.readingHistory.findMany({
      where: { userId: user.id },
      include: {
        story: {
          include: {
            author: true,
          },
        },
        chapter: true,
      },
      orderBy: { readAt: 'desc' },
      skip,
      take: perPage,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      data: histories.map((h) => ({
        id: h.id,
        user_id: h.userId,
        story_id: h.storyId,
        chapter_id: h.chapterId,
        read_at: h.readAt,
        story: {
          ...h.story,
          cover_url: h.story.coverUrl,
          content_type: h.story.contentType,
          view_count: h.story.viewCount,
        },
        chapter: h.chapter,
      })),
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    },
  });
}
