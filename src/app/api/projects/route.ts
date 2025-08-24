import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectCreateSchema } from '@/lib/schemas';
import { cookies } from 'next/headers';

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const role = (await cookies()).get('role')?.value;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.project.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
