import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải tags: ' + error.message },
      { status: 500 }
    );
  }
}
