import { z } from 'zod';

// Per-entity Zod schemas for the admin generic CRUD endpoint. The
// generic handler in routes/admin/entities.ts looks up these schemas
// by entity slug and parses incoming bodies before they reach Prisma.
// This catches type mismatches (e.g. someone PATCHing images: "string"
// instead of string[]) with a clean 400 instead of a 500 from Prisma.
//
// We use .partial() on update so callers can PATCH a single field. On
// create we accept the full schema (fields not marked .optional() are
// required).

const publishStatus = z.enum(['draft', 'review', 'published', 'archived']);
const blogStatus = z.enum(['idea', 'draft', 'review', 'published', 'archived']);

export const portfolioProjectSchema = z.object({
  title: z.string().min(1).max(200),
  short_description: z.string().max(2000).nullable().optional(),
  detailed_description: z.string().max(20000).nullable().optional(),
  work_type: z.string().max(80).nullable().optional(),
  tools_used: z.array(z.string().max(80)).optional(),
  year: z.string().max(20).nullable().optional(),
  images: z.array(z.string().max(800)).optional(),
  video_url: z.string().max(800).nullable().optional(),
  keywords: z.array(z.string().max(80)).optional(),
  alt_text: z.string().max(400).nullable().optional(),
  publish_status: publishStatus.optional(),
  display_order: z.number().int().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  canonical_url: z.string().max(800).nullable().optional(),
  schema_markup: z.string().max(20000).nullable().optional(),
  aeo_answer: z.string().max(4000).nullable().optional(),
  cta_text: z.string().max(200).nullable().optional(),
});

export const filmSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).nullable().optional(),
  duration: z.string().max(20).nullable().optional(),
  year: z.string().max(20).nullable().optional(),
  video_url: z.string().max(800).nullable().optional(),
  thumbnail: z.string().max(800),
  display_order: z.number().int().optional(),
  publish_status: publishStatus.optional(),
});

export const characterSchema = z.object({
  code: z.string().max(40).nullable().optional(),
  name: z.string().min(1).max(120),
  name_en: z.string().max(120).nullable().optional(),
  role: z.string().max(400).nullable().optional(),
  tone: z.string().max(400).nullable().optional(),
  bio: z.string().max(4000).nullable().optional(),
  profile_story: z.string().max(4000).nullable().optional(),
  cover: z.string().min(1).max(800),
  accent: z.string().max(20).nullable().optional(),
  images: z.array(z.string().max(800)).default([]),
  publish_status: publishStatus.optional(),
  display_order: z.number().int().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().max(200).nullable().optional(),
  seo_title: z.string().max(300).nullable().optional(),
  meta_title: z.string().max(300).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  h1: z.string().max(300).nullable().optional(),
  h2_sections: z.array(z.string().max(300)).optional(),
  h3_sections: z.array(z.string().max(300)).optional(),
  executive_summary: z.string().max(4000).nullable().optional(),
  content: z.string().max(200000).nullable().optional(),
  faq: z.any().optional(),
  schema_markup: z.string().max(20000).nullable().optional(),
  sources: z.array(z.string().max(800)).optional(),
  cta_text: z.string().max(200).nullable().optional(),
  hero_image: z.string().max(800).nullable().optional(),
  alt_text: z.string().max(400).nullable().optional(),
  keywords: z.array(z.string().max(80)).optional(),
  internal_links: z.array(z.string().max(400)).optional(),
  publish_status: blogStatus.optional(),
  aeo_direct_answer: z.string().max(4000).nullable().optional(),
  aeo_definition: z.string().max(4000).nullable().optional(),
  aeo_bullets: z.array(z.string().max(400)).optional(),
  quotable_summary: z.string().max(4000).nullable().optional(),
});

export const mediaAssetSchema = z.object({
  title: z.string().min(1).max(200),
  file_url: z.string().min(1).max(800),
  media_type: z.enum(['image', 'video']).optional(),
  category: z.string().max(80).nullable().optional(),
  alt_text: z.string().max(400).nullable().optional(),
  thumbnail_url: z.string().max(800).nullable().optional(),
  format: z.string().max(40).nullable().optional(),
  optimization_status: z
    .enum(['original', 'compressed', 'webp_ready', 'avif_ready'])
    .optional(),
  usage_page: z.string().max(120).nullable().optional(),
  publish_status: publishStatus.optional(),
});

export const siteContentSchema = z.object({
  key: z.string().min(1).max(120),
  page: z.string().min(1).max(120),
  section: z.string().max(120).nullable().optional(),
  type: z.enum(['text', 'title', 'description', 'button', 'link', 'image', 'video', 'social']).optional(),
  label: z.string().max(200).nullable().optional(),
  value: z.string().max(20000).nullable().optional(),
  alt_text: z.string().max(400).nullable().optional(),
  order: z.number().int().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

// For entities that admins shouldn't directly mutate via the generic
// CRUD (analytics_events, project_interactions are append-only logs;
// site_errors gets dedup-handled), we leave the schema permissive.
export const SCHEMAS_BY_ENTITY: Record<string, { create: z.ZodTypeAny; update: z.ZodTypeAny } | undefined> = {
  portfolio_projects: { create: portfolioProjectSchema, update: portfolioProjectSchema.partial() },
  films: { create: filmSchema, update: filmSchema.partial() },
  blog_posts: { create: blogPostSchema, update: blogPostSchema.partial() },
  media_assets: { create: mediaAssetSchema, update: mediaAssetSchema.partial() },
  site_content: { create: siteContentSchema, update: siteContentSchema.partial() },
  characters: { create: characterSchema, update: characterSchema.partial() },
  // permissive for the rest:
  // analytics_events, project_interactions, site_errors, seo_issues,
  // source_ideas, lead_requests
};
