import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp email và mật khẩu' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          wallet: user.wallet,
        },
        token,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi đăng nhập: ' + error.message },
      { status: 500 }
    );
  }
}
