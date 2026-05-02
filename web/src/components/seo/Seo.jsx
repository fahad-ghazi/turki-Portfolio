import { Helmet } from 'react-helmet-async';

const SITE_URL = (import.meta.env?.VITE_PUBLIC_SITE_URL || 'https://turkighazi.com').replace(/\/$/, '');
const DEFAULT_TITLE = 'تركي غازي — مصمم بصري بالذكاء الاصطناعي';
const DEFAULT_DESCRIPTION =
  'تركي غازي — مصمم ومبدع بصري متخصص في صناعة العوالم السينمائية والإعلانات والأزياء والعقار والتراث باستخدام الذكاء الاصطناعي.';
const DEFAULT_OG_IMAGE =
  'https://media.base44.com/images/public/user_685b19d62576f664d63bade4/a3a81c251_IMG_0264.jpg';

function absoluteUrl(input, fallback) {
  if (!input) return fallback;
  if (/^https?:\/\//i.test(input)) return input;
  return `${SITE_URL}${input.startsWith('/') ? '' : '/'}${input}`;
}

/**
 * Per-route SEO + Open Graph + Twitter card metadata.
 *
 * Usage:
 *   <Seo title="الأفلام" description="..." canonical="/films" />
 *
 * - title: appended after the brand suffix automatically
 * - description: kept under 160 chars in callers
 * - canonical: relative path or absolute URL
 * - ogImage: relative path or absolute URL
 * - lang: "ar" | "en" — drives <html lang> and <html dir>
 * - jsonLd: optional Schema.org payload (Person, CreativeWork, etc.)
 * - noIndex: true to emit <meta name="robots" content="noindex,nofollow">
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage,
  ogType = 'website',
  lang = 'ar',
  jsonLd,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} — تركي غازي` : DEFAULT_TITLE;
  const url = absoluteUrl(canonical || '/', SITE_URL);
  const image = absoluteUrl(ogImage, DEFAULT_OG_IMAGE);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <Helmet>
      <html lang={lang} dir={dir} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={lang === 'ar' ? 'ar_SA' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
