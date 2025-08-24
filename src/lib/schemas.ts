import { z } from 'zod';

const url = z.string().url('URL invalide');
const urlOptional = url
  .or(z.literal(''))
  .optional()
  .transform((v) => (v === '' ? undefined : v));

const urlOrPath = z.string().refine(
  (val) => {
    try {
      new URL(val, 'http://localhost');
      return true;
    } catch {
      return false;
    }
  },
  { message: 'URL invalide' }
);

export const projectCreateSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional().default(''),
  status: z.enum(['idea', 'in_progress', 'done']).optional().default('idea'),
  tags: z.array(z.string()).optional().default([]),
  siteUrl: urlOptional,
  imageUrl: urlOptional,
  repoUrl: urlOptional,
  githubLinks: z.array(url).optional().default([]),
  screenshots: z.array(urlOrPath).optional().default([]),
  section: z.string().min(1).optional().default('Expériences Professionnelles'),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const projectUpdateSchema = projectCreateSchema.partial();
