// Idempotent content seed: turns the bundled categories.json + films.json
// into PortfolioProject + Film rows in the DB. Safe to call repeatedly —
// it upserts by id, so re-running just refreshes existing rows without
// duplicating them.
//
// The JSON files were extracted once from the legacy
// web/src/components/feed/categoriesData.jsx and filmsData.jsx, so the
// initial deploy lights up with the full historical catalog. From there
// the admin manages everything from /admin → projects/films.

import type { PrismaClient } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface CategoryItem {
  id: string;
  type?: string;
  src?: string;
  poster?: string;
  alt?: string;
  title?: string;
  description?: string;
  descriptionEn?: string;
}

interface Category {
  id: string;
  title?: string;
  titleEn?: string;
  subtitle?: string;
  seoDescription?: string;
  coverImage?: string;
  items: CategoryItem[];
}

interface FilmRow {
  id: string;
  title: string;
  duration?: string;
  year?: string;
  description?: string;
  videoUrl?: string;
  thumbnail: string;
}

function readJson<T>(name: string): T {
  // In dev (tsx) we resolve relative to src/seed; in prod (built) the json
  // is also alongside the compiled file because we COPY it in the Dockerfile.
  // Try both paths.
  const candidates = [
    resolve(__dirname, name),
    resolve(__dirname, '..', '..', 'src', 'seed', name),
  ];
  for (const p of candidates) {
    try {
      return JSON.parse(readFileSync(p, 'utf-8')) as T;
    } catch {
      // fall through
    }
  }
  throw new Error(`Seed file not found: ${name}`);
}

export async function seedContentIfEmpty(
  prisma: PrismaClient,
  log: FastifyBaseLogger,
): Promise<{ projects: number; films: number; skipped: boolean }> {
  const [projectCount, filmCount] = await Promise.all([
    prisma.portfolioProject.count(),
    prisma.film.count(),
  ]);

  if (projectCount > 0 && filmCount > 0) {
    log.debug({ projectCount, filmCount }, 'seed-content: tables already populated, skipping');
    return { projects: 0, films: 0, skipped: true };
  }

  log.info({ projectCount, filmCount }, 'seed-content: bootstrapping from bundled JSON');
  return seedContentForce(prisma, log);
}

export async function seedContentForce(
  prisma: PrismaClient,
  log: FastifyBaseLogger,
): Promise<{ projects: number; films: number; skipped: false }> {
  const categories = readJson<Category[]>('categories.json');
  const films = readJson<FilmRow[]>('films.json');

  let projectsUpserted = 0;
  for (const category of categories) {
    let order = 0;
    for (const item of category.items) {
      if (!item.id || !item.title) continue;
      const data = {
        title: item.title,
        shortDescription: item.description ?? null,
        detailedDescription: item.descriptionEn ?? null,
        workType: category.id,
        altText: item.alt ?? null,
        images: item.src ? [item.src] : [],
        videoUrl: item.type === 'video' ? item.src ?? null : null,
        publishStatus: 'published' as const,
        displayOrder: order,
      };
      await prisma.portfolioProject.upsert({
        where: { id: item.id },
        create: { id: item.id, ...data },
        update: data,
      });
      projectsUpserted += 1;
      order += 1;
    }
  }

  let filmsUpserted = 0;
  let order = 0;
  for (const film of films) {
    if (!film.id || !film.title) continue;
    const data = {
      title: film.title,
      description: film.description ?? null,
      duration: film.duration ?? null,
      year: film.year ?? null,
      videoUrl: film.videoUrl ?? null,
      thumbnail: film.thumbnail,
      publishStatus: 'published' as const,
      displayOrder: order,
    };
    await prisma.film.upsert({
      where: { id: film.id },
      create: { id: film.id, ...data },
      update: data,
    });
    filmsUpserted += 1;
    order += 1;
  }

  log.info(
    { projects: projectsUpserted, films: filmsUpserted },
    'seed-content: done',
  );
  return { projects: projectsUpserted, films: filmsUpserted, skipped: false };
}
