import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatbotConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  quickReplies: {
    eventTypes: {
      [key: string]: string[];
    };
    generic: string[];
  };
  eventTypes: {
    id: string;
    name: string;
    description: string;
    styles: string[];
    themes: string[];
  }[];
  styles: {
    id: string;
    name: string;
    description: string;
    keywords: string[];
  }[];
  themes: {
    id: string;
    name: string;
    description: string;
    keywords: string[];
  }[];
}

// Configuration par défaut
const defaultConfig: ChatbotConfig = {
  id: 'default',
  name: 'Assistant Événementiel',
  description: 'Assistant spécialisé dans la location de matériel pour événements',
  systemPrompt: `Tu es un assistant expert en événementiel, spécialisé dans la location de matériel pour événements.
Ton rôle est d'aider les utilisateurs à planifier leurs événements en leur suggérant le matériel approprié.

Directives importantes :
1. Sois professionnel, amical et précis dans tes recommandations
2. Pose des questions pertinentes pour mieux comprendre les besoins
3. Adapte tes suggestions en fonction du contexte (budget, nombre d'invités, style, etc.)
4. Propose des solutions créatives et personnalisées
5. N'hésite pas à suggérer des combinaisons de matériel complémentaires
6. Prends en compte les tendances actuelles en décoration événementielle`,
  quickReplies: {
    eventTypes: {
      mariage: [
        'Quel style de mariage recherchez-vous ?',
        'Avez-vous un thème ou une palette de couleurs en tête ?',
        'Quel est votre budget pour la décoration ?',
        'Combien d\'invités prévoyez-vous ?'
      ],
      entreprise: [
        'Quel type d\'événement d\'entreprise ?',
        'Combien de participants seront présents ?',
        'Avez-vous besoin de matériel audiovisuel ?',
        'Souhaitez-vous une décoration particulière ?'
      ]
    },
    generic: [
      'Avez-vous des questions spécifiques sur le matériel ?',
      'Souhaitez-vous voir des exemples de décoration ?',
      'Avez-vous besoin d\'aide pour la planification ?'
    ]
  },
  eventTypes: [
    {
      id: 'mariage',
      name: 'Mariage',
      description: 'Cérémonie et réception de mariage',
      styles: ['moderne', 'classique', 'rustique', 'bohème'],
      themes: ['romantique', 'naturel', 'vintage', 'luxe']
    },
    {
      id: 'entreprise',
      name: 'Événement d\'entreprise',
      description: 'Conférences, séminaires, team building',
      styles: ['moderne', 'industriel', 'minimaliste'],
      themes: ['professionnel', 'innovant', 'dynamique']
    }
  ],
  styles: [
    {
      id: 'moderne',
      name: 'Moderne',
      description: 'Style contemporain et épuré',
      keywords: ['moderne', 'contemporain', 'épuré', 'minimaliste']
    },
    {
      id: 'classique',
      name: 'Classique',
      description: 'Style traditionnel et élégant',
      keywords: ['classique', 'traditionnel', 'élégant', 'raffiné']
    }
  ],
  themes: [
    {
      id: 'romantique',
      name: 'Romantique',
      description: 'Ambiance douce et romantique',
      keywords: ['romantique', 'douceur', 'sentimental', 'tendre']
    },
    {
      id: 'naturel',
      name: 'Naturel',
      description: 'Inspiration nature et organique',
      keywords: ['naturel', 'organique', 'bois', 'végétal']
    }
  ]
};

// Clé de stockage local
const STORAGE_KEY = 'chatbot_config';

export const useAdminService = () => {
  // Charger la configuration
  const loadConfig = (): ChatbotConfig => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  };

  // Sauvegarder la configuration
  const saveConfig = (config: ChatbotConfig): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  };

  // Mettre à jour le prompt système
  const updateSystemPrompt = (prompt: string): void => {
    const config = loadConfig();
    config.systemPrompt = prompt;
    saveConfig(config);
  };

  // Ajouter un type d'événement
  const addEventType = (eventType: ChatbotConfig['eventTypes'][0]): void => {
    const config = loadConfig();
    config.eventTypes.push(eventType);
    saveConfig(config);
  };

  // Mettre à jour un type d'événement
  const updateEventType = (id: string, updates: Partial<ChatbotConfig['eventTypes'][0]>): void => {
    const config = loadConfig();
    const index = config.eventTypes.findIndex(et => et.id === id);
    if (index !== -1) {
      config.eventTypes[index] = { ...config.eventTypes[index], ...updates };
      saveConfig(config);
    }
  };

  // Supprimer un type d'événement
  const deleteEventType = (id: string): void => {
    const config = loadConfig();
    config.eventTypes = config.eventTypes.filter(et => et.id !== id);
    saveConfig(config);
  };

  // Ajouter des réponses rapides pour un type d'événement
  const addQuickReplies = (eventType: string, replies: string[]): void => {
    const config = loadConfig();
    config.quickReplies.eventTypes[eventType] = replies;
    saveConfig(config);
  };

  // Réinitialiser la configuration
  const resetConfig = (): void => {
    saveConfig(defaultConfig);
  };

  return {
    loadConfig,
    saveConfig,
    updateSystemPrompt,
    addEventType,
    updateEventType,
    deleteEventType,
    addQuickReplies,
    resetConfig
  };
}; 