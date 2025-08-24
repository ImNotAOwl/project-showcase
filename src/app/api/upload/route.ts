import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  const formData = await req.formData();

  // Accepte "file" (unique) ou "files" (multiples)
  let files: File[] = [];
  const single = formData.get('file');
  if (single && single instanceof File) files.push(single as File);
  const multi = formData.getAll('files').filter((x) => x instanceof File) as File[];
  if (multi.length) files = files.concat(multi);

  if (!files.length) return NextResponse.json({ error: 'No file(s)' }, { status: 400 });

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const name = `${crypto.randomBytes(8).toString('hex')}.${ext}`;
    await writeFile(path.join(uploadDir, name), bytes);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
