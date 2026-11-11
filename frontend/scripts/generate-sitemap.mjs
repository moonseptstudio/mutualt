/**
 * Generates public/sitemap.xml from a single route list so it can never drift
 * out of date again.
 *
 * `lastmod` comes from the mtime of each route's source file, falling back to
 * the build date. Run via `npm run build` (the prebuild hook) or directly:
 *   node scripts/generate-sitemap.mjs
 */
import { writeFileSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://mutualtransfer.lk').replace(/\/+$/, '');

/**
 * Only indexable, publicly reachable pages belong here.
 * /login, /forgot-password, /admin/* and every authenticated route are
 * deliberately excluded - they are noindex and/or robots-disallowed, and
 * listing a noindex URL in a sitemap is a Search Console error.
 */
const routes = [
  { path: '/', source: 'src/pages/web/HomePage.tsx', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', source: 'src/pages/web/AboutPage.tsx', changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing', source: 'src/pages/web/PricingPage.tsx', changefreq: 'monthly', priority: '0.8' },
  { path: '/register', source: 'src/pages/web/AuthPage.tsx', changefreq: 'monthly', priority: '0.7' },
];

const isoDay = (d) => new Date(d).toISOString().slice(0, 10);
const today = isoDay(Date.now());

const lastmodFor = (source) => {
  if (!source) return today;
  const file = resolve(root, source);
  if (!existsSync(file)) return today;
  try {
    return isoDay(statSync(file).mtime);
  } catch {
    return today;
  }
};

const body = routes
  .map(({ path, source, changefreq, priority }) => {
    const loc = `${SITE_URL}${path}`;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmodFor(source)}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const out = resolve(root, 'public/sitemap.xml');
writeFileSync(out, xml, 'utf8');
console.log(`sitemap: ${routes.length} urls -> public/sitemap.xml (${SITE_URL})`);
