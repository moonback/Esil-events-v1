import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'ESIL Events - Votre Partenaire Événementiel',
  description = 'ESIL Events vous accompagne dans l\'organisation de vos événements professionnels et particuliers. Découvrez nos services sur mesure.',
  keywords = 'événementiel, organisation événements, ESIL Events, événements professionnels, événements particuliers',
  image = '/images/logo.png',
  url = 'https://esil-events.fr',
  type = 'website'
}) => {
  const siteTitle = title ? `${title} | ESIL Events` : 'ESIL Events';

  return (
    <Helmet>
      {/* Balises meta de base */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
      <link rel="canonical" href={url} />
      <link rel="icon" href="/favicon.ico" />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ESIL Events" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Autres balises importantes */}
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="ESIL Events" />
      
      {/* Balises supplémentaires pour le SEO */}
      <meta name="geo.region" content="FR" />
      <meta name="geo.placename" content="Paris" />
      <meta name="geo.position" content="48.856614;2.352222" />
      <meta name="ICBM" content="48.856614, 2.352222" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="apple-mobile-web-app-title" content="ESIL Events" />
      <meta name="application-name" content="ESIL Events" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="format-detection" content="telephone=no" />
      <link rel="alternate" hrefLang="fr" href="https://esil-events.fr/" />
      
      {/* Structured Data / Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ESIL Events",
          "url": "https://esil-events.fr",
          "logo": `${url}/images/logo.png`,
          "description": description,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "FR"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+33-XXX-XXX-XXX",
            "contactType": "customer service"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
