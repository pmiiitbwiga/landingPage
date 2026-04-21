import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  url?: string;
  schemaMarkup?: object;
}

export const SEO: React.FC<SEOProps> = ({ 
  title = 'Sistem Informasi PMII ITB WIGA', 
  description = 'Portal resmi Pimpinan Komisariat Pergerakan Mahasiswa Islam Indonesia (PMII) Institut Teknologi dan Bisnis Widya Gama Lumajang. Temukan informasi pendaftaran, kegiatan, dan profil organisasi kami.',
  type = 'website',
  image = '/og-image.jpg',
  url = window.location.href,
  schemaMarkup
}) => {
  const fullTitle = title === 'Sistem Informasi PMII ITB WIGA' ? title : `${title} | PMII ITB WIGA`;

  // Default Organization Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PMII ITB WIGA Lumajang",
    "url": "https://pmii-wiga.vercel.app",
    "logo": "https://pmii-wiga.vercel.app/logo.png",
    "description": description
  };

  const schemaToUse = schemaMarkup || defaultSchema;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical Link */}
      <link rel="canonical" href={url} />

      {/* Schema.org Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schemaToUse)}
      </script>
    </Helmet>
  );
};
