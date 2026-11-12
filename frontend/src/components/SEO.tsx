import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  LOCALE_MAP,
  DEFAULT_DESCRIPTION,
  absoluteUrl,
} from '../config/seo';

interface SEOProps {
  /** Page title without the brand suffix, e.g. "About Us". */
  title: string;
  description?: string;
  keywords?: string;
  /** Site-relative path for canonical + og:url, e.g. "/about". */
  path?: string;
  /** Escape hatch for a fully-qualified canonical URL. */
  canonicalUrl?: string;
  /** Absolute URL or site-relative path to the share image. */
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article' | 'profile';
  /** Keep this page out of search results (private, auth and error pages). */
  noindex?: boolean;
  /** Append " | MutualTransfer.lk" to the title. Set false for an exact title. */
  appendSiteName?: boolean;
  /** One JSON-LD object or several. */
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  path,
  canonicalUrl,
  ogImage = OG_IMAGE_PATH,
  ogImageAlt,
  ogType = 'website',
  noindex = false,
  appendSiteName = true,
  structuredData,
}) => {
  const { i18n } = useTranslation();
  const language = (i18n?.resolvedLanguage || i18n?.language || 'en').split('-')[0];

  const fullTitle =
    appendSiteName && !title.toLowerCase().includes(SITE_NAME.toLowerCase())
      ? `${title} | ${SITE_NAME}`
      : title;

  // Canonical: explicit URL wins, then path, then nothing (never guess from
  // window.location — query strings and hashes create duplicate canonicals).
  const canonical = canonicalUrl ? absoluteUrl(canonicalUrl) : path ? absoluteUrl(path) : undefined;
  const imageUrl = absoluteUrl(ogImage);
  const ogLocale = LOCALE_MAP[language] ?? LOCALE_MAP.en;
  const alternateLocales = Object.entries(LOCALE_MAP)
    .filter(([code]) => code !== language)
    .map(([, locale]) => locale);

  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Indexing */}
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />
      {noindex && <meta name="googlebot" content="noindex, nofollow" />}

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content={ogImageAlt || fullTitle} />
      <meta property="og:locale" content={ogLocale} />
      {alternateLocales.map((locale) => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={ogImageAlt || fullTitle} />

      {/* Canonical + language alternates. The UI switches language client-side
          on the same URL, so every locale shares one canonical URL and
          x-default points at it. */}
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <link rel="alternate" hrefLang="x-default" href={canonical} />}

      {!canonical && <link rel="canonical" href={`${SITE_URL}/`} />}

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
