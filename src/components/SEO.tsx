import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'music.song' | 'music.album' | 'music.playlist' | 'profile';
  structuredData?: object;
  noindex?: boolean;
  canonical?: string;
  imageWidth?: string;
  imageHeight?: string;
}

export const SEO = ({
  title = 'HEADY.FM - Commercial-Free Indie Rock Radio',
  description = 'Stream commercial-free music 24/7 on HEADY.FM. Discover underground music, your favorite tracks, emerging artists, and deep cuts without interruptions.',
  image = 'https://heady.fm/og-image.png',
  url = 'https://heady.fm',
  type = 'website',
  structuredData,
  noindex = false,
  canonical,
  imageWidth = '1200',
  imageHeight = '630',
}: SEOProps) => {
  const fullTitle = title.includes('HEADY.FM') ? title : `${title} | HEADY.FM`;
  const canonicalUrl = canonical || url;
  
  // Ensure image URL is absolute
  const absoluteImageUrl = image.startsWith('http') ? image : `https://heady.fm${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      <meta property="og:image:width" content={imageWidth} />
      <meta property="og:image:height" content={imageHeight} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="HEADY.FM" />
      <meta property="og:locale" content="en_US" />

      {/* Additional Music-specific tags */}
      {type === 'music.song' && (
        <>
          <meta property="music:duration" content="180" />
          <meta property="music:musician" content={url} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@headyradio" />
      <meta name="twitter:creator" content="@headyradio" />

      {/* Additional SEO tags */}
      <meta name="author" content="HEADY.FM" />
      <meta name="keywords" content="indie music, indie rock, alternative music, underground music, independent radio, commercial-free radio, music streaming" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

