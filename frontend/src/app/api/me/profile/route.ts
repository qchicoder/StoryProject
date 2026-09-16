import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hashPassword } from '@/lib/auth';

export async function PUT(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, avatar, password } = body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (avatar) dataToUpdate.avatar = avatar;
    if (password && password.length >= 6) {
      dataToUpdate.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      include: {
        wallet: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin tài khoản thành công',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        wallet: updatedUser.wallet,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật thông tin: ' + error.message },
      { status: 500 }
    );
  }
}
