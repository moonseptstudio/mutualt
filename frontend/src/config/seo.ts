/**
 * Single source of truth for all SEO metadata.
 *
 * IMPORTANT: the canonical host is the apex domain (no `www`). The TLS
 * certificate on the server does not cover `www.mutualtransfer.lk`, so any
 * canonical/og:url pointing there fails certificate validation for browsers
 * and crawlers alike. Override with VITE_SITE_URL only if that changes.
 */

const rawSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://mutualtransfer.lk';

/** Site origin with no trailing slash, e.g. `https://mutualtransfer.lk`. */
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const SITE_NAME = 'MutualTransfer.lk';
export const ORG_NAME = 'Mutual Transfer Sri Lanka';
export const ORG_LEGAL_NAME = 'MoonSept Studio';
export const TWITTER_HANDLE = '@mutualtransfer';

/** Default social share image (1200x630). Must exist in /public. */
export const OG_IMAGE_PATH = '/og-image.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const LOGO_PATH = '/logo.png';

/** Locales the UI supports, mapped to OpenGraph locale codes. */
export const LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  si: 'si_LK',
  ta: 'ta_LK',
};

/** Build an absolute URL from a site-relative path. */
export const absoluteUrl = (path = '/'): string => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const DEFAULT_TITLE = 'Mutual Transfer Sri Lanka | Government Employee Transfers';
export const DEFAULT_DESCRIPTION =
  'Find mutual transfer partners easily in Sri Lanka. The premier platform connecting Nurses, Doctors, Teachers and all Government Employees for fast, reliable workplace transfers.';
export const DEFAULT_KEYWORDS =
  'Mutual Transfer Sri Lanka, Government Transfers, Nurse Transfer Sri Lanka, Teacher Transfer Sri Lanka, Doctor Transfer Sri Lanka, Government Employee Transfers, mutual transfer Sri Lanka 2026';

/* ─────────────────────────── Structured data ─────────────────────────── */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: ORG_NAME,
  alternateName: SITE_NAME,
  legalName: ORG_LEGAL_NAME,
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl(LOGO_PATH),
    width: 512,
    height: 512,
  },
  image: absoluteUrl(OG_IMAGE_PATH),
  description: DEFAULT_DESCRIPTION,
  areaServed: {
    '@type': 'Country',
    name: 'Sri Lanka',
  },
  sameAs: ['https://www.facebook.com/mutualtransferlk', 'https://twitter.com/mutualtransfer'],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: ORG_NAME,
  alternateName: SITE_NAME,
  url: `${SITE_URL}/`,
  description: DEFAULT_DESCRIPTION,
  inLanguage: ['en', 'si', 'ta'],
  publisher: { '@id': `${SITE_URL}/#organization` },
};

/** Breadcrumbs for a page. Pass the trail after Home, e.g. [['About','/about']]. */
export const breadcrumbSchema = (trail: Array<[string, string]>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'] as [string, string], ...trail].map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: absoluteUrl(path),
  })),
});

export const faqSchema = (items: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});
