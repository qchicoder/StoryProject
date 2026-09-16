import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Từ chối truy cập' }, { status: 403 });
  }

  const ads = await prisma.advertisement.findMany();
  return NextResponse.json({
    success: true,
    data: ads,
  });
}
