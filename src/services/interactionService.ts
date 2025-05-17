import { useNavigate } from 'react-router-dom';

// Types pour les données
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Moodboard {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

// Données de placeholder
export const placeholderProducts: Product[] = [
  {
    id: '1',
    title: 'Chaises de réception',
    description: 'Lot de 50 chaises pliantes élégantes pour événements',
    price: 250,
    imageUrl: '/images/products/chairs.jpg'
  },
  {
    id: '2',
    title: 'Table de buffet',
    description: 'Table de buffet pliante 180x75cm',
    price: 120,
    imageUrl: '/images/products/buffet-table.jpg'
  },
  {
    id: '3',
    title: 'Éclairage LED',
    description: 'Kit d\'éclairage LED professionnel pour événements',
    price: 350,
    imageUrl: '/images/products/led-lights.jpg'
  }
];

export const placeholderMoodboards: Moodboard[] = [
  {
    id: '1',
    title: 'Mariage Élégant',
    description: 'Inspiration pour un mariage élégant et moderne',
    images: [
      '/images/moodboards/wedding-1.jpg',
      '/images/moodboards/wedding-2.jpg',
      '/images/moodboards/wedding-3.jpg'
    ],
    tags: ['Élégant', 'Moderne', 'Romantique']
  },
  {
    id: '2',
    title: 'Événement d\'Entreprise',
    description: 'Ambiance professionnelle pour événements d\'entreprise',
    images: [
      '/images/moodboards/corporate-1.jpg',
      '/images/moodboards/corporate-2.jpg',
      '/images/moodboards/corporate-3.jpg'
    ],
    tags: ['Professionnel', 'Moderne', 'Corporate']
  }
];

export const defaultChecklists: Record<string, ChecklistItem[]> = {
  'mariage': [
    { id: '1', text: 'Réserver la salle', completed: false, category: 'Logistique' },
    { id: '2', text: 'Confirmer le nombre d\'invités', completed: false, category: 'Invités' },
    { id: '3', text: 'Commander le matériel', completed: false, category: 'Matériel' },
    { id: '4', text: 'Choisir le traiteur', completed: false, category: 'Catering' },
    { id: '5', text: 'Réserver la musique', completed: false, category: 'Animation' }
  ],
  'entreprise': [
    { id: '1', text: 'Réserver la salle de conférence', completed: false, category: 'Logistique' },
    { id: '2', text: 'Préparer la présentation', completed: false, category: 'Contenu' },
    { id: '3', text: 'Commander le matériel audiovisuel', completed: false, category: 'Matériel' },
    { id: '4', text: 'Organiser le catering', completed: false, category: 'Catering' },
    { id: '5', text: 'Préparer les badges', completed: false, category: 'Logistique' }
  ]
};

// Fonctions d'interaction
export const handleProductClick = (productId: string) => {
  const navigate = useNavigate();
  navigate(`/product/${productId}`);
};

export const handleMoodboardClick = (moodboardId: string) => {
  const navigate = useNavigate();
  navigate(`/moodboard/${moodboardId}`);
};

export const getProductDetails = (productId: string): Product | undefined => {
  return placeholderProducts.find(p => p.id === productId);
};

export const getMoodboardDetails = (moodboardId: string): Moodboard | undefined => {
  return placeholderMoodboards.find(m => m.id === moodboardId);
};

export const getChecklistForEventType = (eventType: string): ChecklistItem[] => {
  return defaultChecklists[eventType] || defaultChecklists['mariage'];
};

// Hook pour utiliser les fonctions d'interaction
export const useInteractionService = () => {
  const navigate = useNavigate();

  return {
    handleProductClick: (productId: string) => navigate(`/product/${productId}`),
    handleMoodboardClick: (moodboardId: string) => navigate(`/moodboard/${moodboardId}`),
    getProductDetails,
    getMoodboardDetails,
    getChecklistForEventType
  };
}; 