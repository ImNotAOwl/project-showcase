import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectUpdateSchema } from '@/lib/schemas';
import { cookies } from "next/headers";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const role = (await cookies()).get('role')?.value;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data };
  if (data.repoUrl) {
    data.githubLinks = Array.from(new Set([...(data.githubLinks ?? []), data.repoUrl]));
    delete data.repoUrl;
  }
  try {
    const updated = await prisma.project.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const role = (await cookies()).get('role')?.value;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

