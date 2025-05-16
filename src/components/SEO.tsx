import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  product?: {
    id: string;
    name: string;
    reference: string;
    category: string;
    sub_category?: string;
    sub_sub_category?: string;
    description?: string;
    price_ht: number;
    price_ttc: number;
    stock: number;
    is_available: boolean;
    images?: string[];
    technical_specs?: Record<string, any>;
    technical_doc_url?: string;
    video_url?: string;
    colors?: string[];
    main_image_index?: number;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    slug: string;
  };
}

const SEO: React.FC<SEOProps> = ({
  title = 'ESIL Events - Votre Partenaire Événementiel',
  description = 'ESIL Events vous accompagne dans l\'organisation de vos événements professionnels et particuliers. Découvrez nos services sur mesure.',
  keywords = 'événementiel, organisation événements, ESIL Events, événements professionnels, événements particuliers',
  image = '/images/logo.png',
  url = 'https://esil-events.fr',
  type = 'website',
  product
}) => {
  const siteTitle = title ? `${title} | ESIL Events` : 'ESIL Events';
  const productImage = product?.images && product.images.length > 0 
    ? (product.main_image_index !== undefined && product.main_image_index >= 0 && product.main_image_index < product.images.length 
      ? product.images[product.main_image_index] 
      : product.images[0])
    : image;

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
      <meta property="og:image" content={productImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ESIL Events" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={productImage} />

      {/* Autres balises importantes */}
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="ESIL Events" />
      
      {/* Balises supplémentaires pour le SEO */}
      <meta name="geo.region" content="FR" />
      <meta name="geo.position" content="48.856614;2.352222" />
      <meta name="ICBM" content="48.856614, 2.352222" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="apple-mobile-web-app-title" content="ESIL Events" />
      <meta name="application-name" content="ESIL Events" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="format-detection" content="telephone=no" />
      <link rel="alternate" hrefLang="fr" href="https://esil-events.fr/" />
      
      {/* Structured Data / Schema.org */}
      {product ? (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description || product.seo_description,
            "image": productImage,
            "sku": product.reference,
            "brand": {
              "@type": "Brand",
              "name": "ESIL Events"
            },
            "offers": {
              "@type": "Offer",
              "price": product.price_ttc,
              "priceCurrency": "EUR",
              "availability": product.is_available 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              "url": url
            },
            "category": [
              product.category,
              product.sub_category,
              product.sub_sub_category
            ].filter(Boolean).join(" > "),
            "additionalProperty": [
              {
                "@type": "PropertyValue",
                "name": "Prix HT",
                "value": product.price_ht
              },
              {
                "@type": "PropertyValue",
                "name": "Stock",
                "value": product.stock
              },
              ...(product.colors ? [{
                "@type": "PropertyValue",
                "name": "Couleurs disponibles",
                "value": product.colors.join(", ")
              }] : []),
              ...(product.technical_specs ? Object.entries(product.technical_specs).map(([key, value]) => ({
                "@type": "PropertyValue",
                "name": key,
                "value": value
              })) : [])
            ]
          })}
        </script>
      ) : (
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
              "streetAddress": "7 Rue de la Cellophane",
              "addressLocality": "Mantes-la-Ville",
              "postalCode": "78711",
              "addressCountry": "FR"
            
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33-620-461-385",
              "contactType": "customer service"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
