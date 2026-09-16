import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Bạn cần đăng nhập để theo dõi truyện.' }, { status: 401 });
  }

  const { id } = await params;
  const storyId = parseInt(id);

  if (isNaN(storyId)) {
    return NextResponse.json({ success: false, message: 'ID truyện không hợp lệ' }, { status: 400 });
  }

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy truyện' }, { status: 404 });
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      userId_storyId: {
        userId: user.id,
        storyId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    return NextResponse.json({
      success: true,
      is_following: false,
      message: 'Đã bỏ theo dõi truyện',
    });
  } else {
    await prisma.follow.create({
      data: {
        userId: user.id,
        storyId,
      },
    });
    return NextResponse.json({
      success: true,
      is_following: true,
      message: 'Đã theo dõi truyện vào tủ sách',
    });
  }
}
