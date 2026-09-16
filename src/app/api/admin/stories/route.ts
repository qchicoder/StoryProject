import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Từ chối truy cập' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '15');
  const skip = (page - 1) * perPage;

  const [total, stories] = await Promise.all([
    prisma.story.count(),
    prisma.story.findMany({
      include: {
        author: true,
        category: true,
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: perPage,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      data: stories.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        summary: s.summary,
        cover_url: s.coverUrl,
        content_type: s.contentType,
        status: s.status,
        view_count: s.viewCount,
        is_featured: s.isFeatured,
        author: s.author,
        category: s.category,
        chapters_count: s._count.chapters,
        updated_at: s.updatedAt.toISOString(),
      })),
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    },
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Từ chối truy cập' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, summary, cover_url, content_type, author_id, category_id, is_featured } = body;

    if (!title || !author_id || !category_id) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp đầy đủ tên truyện, tác giả và thể loại' },
        { status: 400 }
      );
    }

    const slug = `${slugify(title)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const story = await prisma.story.create({
      data: {
        title,
        slug,
        summary: summary || '',
        coverUrl: cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        contentType: content_type || 'NOVEL',
        status: 'PUBLISHED',
        authorId: parseInt(author_id),
        categoryId: parseInt(category_id),
        isFeatured: !!is_featured,
      },
      include: {
        author: true,
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo tác phẩm mới thành công!',
        data: {
          id: story.id,
          title: story.title,
          slug: story.slug,
          summary: story.summary,
          cover_url: story.coverUrl,
          content_type: story.contentType,
          status: story.status,
          is_featured: story.isFeatured,
          author: story.author,
          category: story.category,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo truyện: ' + error.message },
      { status: 500 }
    );
  }
}
