import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '12');
    const skip = (page - 1) * perPage;

    const where: any = {
      status: {
        in: ['PUBLISHED', 'COMPLETED'],
      },
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { summary: { contains: q } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (type && ['NOVEL', 'COMIC'].includes(type.toUpperCase())) {
      where.contentType = type.toUpperCase();
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const orderBy: any = sort === 'views' 
      ? { viewCount: 'desc' } 
      : { updatedAt: 'desc' };

    const [total, stories] = await Promise.all([
      prisma.story.count({ where }),
      prisma.story.findMany({
        where,
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy,
        skip,
        take: perPage,
      }),
    ]);

    const formattedStories = stories.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      summary: s.summary,
      cover_url: s.coverUrl,
      content_type: s.contentType,
      status: s.status,
      view_count: s.viewCount,
      author_id: s.authorId,
      category_id: s.categoryId,
      is_featured: s.isFeatured,
      author: s.author,
      category: s.category,
      tags: s.tags.map((t) => t.tag),
      updated_at: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        data: formattedStories,
        total,
        current_page: page,
        per_page: perPage,
        last_page: Math.ceil(total / perPage),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách truyện: ' + error.message },
      { status: 500 }
    );
  }
}
