import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapterId = parseInt(id);

    const comments = await prisma.comment.findMany({
      where: {
        chapterId: isNaN(chapterId) ? undefined : chapterId,
        parentId: null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải bình luận: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Bạn cần đăng nhập để bình luận.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const chapterId = parseInt(id);
    const body = await request.json();
    const { content, parent_id } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nội dung bình luận không được để trống' },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy chương' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        storyId: chapter.storyId,
        chapterId: chapter.id,
        parentId: parent_id ? parseInt(parent_id) : null,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bình luận thành công',
      data: comment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi gửi bình luận: ' + error.message },
      { status: 500 }
    );
  }
}
