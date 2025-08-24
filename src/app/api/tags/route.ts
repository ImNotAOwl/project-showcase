import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Pipeline : éclate le tableau tags, regroupe par valeur, re-projette en liste
  const pipeline = [
    { $unwind: '$tags' },
    { $group: { _id: '$tags' } },
    { $project: { _id: 0, tag: '$_id' } },
    { $sort: { tag: 1 } },
  ];

  const res = (await prisma.project.aggregateRaw({ pipeline })) as unknown as Array<{
    tag: string;
  }>;
  const tags = res.map((r) => r.tag);
  return NextResponse.json(tags);
}
