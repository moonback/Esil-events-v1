export const seoConfig = {
  defaultTitle: 'ESIL Events - Votre Partenaire Événementiel',
  titleTemplate: '%s | ESIL Events',
  defaultDescription: 'ESIL Events vous accompagne dans l\'organisation de vos événements professionnels et particuliers. Découvrez nos services sur mesure.',
  defaultKeywords: 'événementiel, organisation événements, ESIL Events, événements professionnels, événements particuliers, organisation mariage, séminaires entreprise, conférences',
  siteUrl: 'https://esil-events.fr', 
  defaultImage: '/images/logo.png',
  social: {
    facebook: 'https://facebook.com/esilevents', 
    instagram: 'https://instagram.com/esilevents',
  },
  organization: {
    name: 'ESIL Events',
    logo: '/images/logo.png',
    contactEmail: 'contact@esil-events.fr',
    phone: '+33-620-461-385',
    address: {
      street: '7 Rue de la Cellophane', 
      city: 'Mantes-la-Ville',
      postalCode: '78711',
      country: 'France'
    }
  }
} as const;
