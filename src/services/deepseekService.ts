import { QuoteRequest } from './quoteRequestService';

// Configuration pour l'API DeepSeek
interface DeepseekConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

// État initial de la configuration
const defaultConfig: DeepseekConfig = {
  apiKey: '',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 1000,
  enabled: false
};

// Gestionnaire de configuration pour DeepSeek
export const deepseekConfig = {
  // Clé pour le stockage local
  storageKey: 'deepseek_config',
  
  // Configuration par défaut
  ...defaultConfig,
  
  // Charger la configuration depuis le stockage local
  loadConfig(): DeepseekConfig {
    try {
      const storedConfig = localStorage.getItem(this.storageKey);
      if (storedConfig) {
        return { ...defaultConfig, ...JSON.parse(storedConfig) };
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration DeepSeek:', error);
    }
    return defaultConfig;
  },
  
  // Sauvegarder la configuration dans le stockage local
  saveConfig(config: Partial<DeepseekConfig>): void {
    try {
      const currentConfig = this.loadConfig();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.storageKey, JSON.stringify(newConfig));
      
      // Mettre à jour les propriétés de l'objet courant
      Object.assign(this, newConfig);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration DeepSeek:', error);
    }
  }
};

// Initialiser la configuration au chargement
try {
  const config = deepseekConfig.loadConfig();
  Object.assign(deepseekConfig, config);
} catch (error) {
  console.error('Erreur lors de l\'initialisation de la configuration DeepSeek:', error);
}

/**
 * Génère une réponse à une demande de devis en utilisant l'API DeepSeek
 */
export const generateAIResponse = async (quoteRequest: QuoteRequest): Promise<string> => {
  const config = deepseekConfig.loadConfig();
  
  if (!config.apiKey || !config.enabled) {
    throw new Error('La configuration de l\'API DeepSeek n\'est pas complète ou est désactivée');
  }
  
  try {
    // Construire le prompt pour l'API DeepSeek
    const prompt = buildPrompt(quoteRequest);
    
    // Appeler l'API DeepSeek
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant professionnel spécialisé dans la rédaction de réponses personnalisées pour des demandes de devis d\'événements. Votre ton est courtois, professionnel et chaleureux.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API DeepSeek: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erreur lors de la génération de la réponse:', error);
    throw error;
  }
};

/**
 * Construit un prompt pour l'API DeepSeek basé sur les informations de la demande de devis
 */
const buildPrompt = (quoteRequest: QuoteRequest): string => {
  const eventDate = quoteRequest.event_date 
    ? new Date(quoteRequest.event_date).toLocaleDateString('fr-FR') 
    : '[date non spécifiée]';
  
  return `
    Rédige une réponse professionnelle et personnalisée pour une demande de devis avec les informations suivantes:
    
    Client: ${quoteRequest.first_name} ${quoteRequest.last_name}
    Type de client: ${quoteRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}
    ${quoteRequest.company ? `Société: ${quoteRequest.company}` : ''}
    Email: ${quoteRequest.email}
    Téléphone: ${quoteRequest.phone || 'Non fourni'}
    
    Détails de l'événement:
    Date: ${eventDate}
    Durée: ${quoteRequest.event_duration || 'Non spécifiée'}
    Nombre d'invités: ${quoteRequest.guest_count || 'Non spécifié'}
    Lieu: ${quoteRequest.event_location === 'indoor' ? 'Intérieur' : quoteRequest.event_location === 'outdoor' ? 'Extérieur' : 'Non spécifié'}
    Description: ${quoteRequest.description || 'Non fournie'}
    
    La réponse doit:
    1. Être adressée personnellement au client
    2. Remercier pour la demande de devis
    3. Confirmer la réception des détails de l'événement
    4. Mentionner que nous préparons une offre personnalisée
    5. Indiquer un délai de réponse (48 heures)
    6. Inviter le client à nous contacter pour toute question
    7. Se terminer par une formule de politesse et la signature "L'équipe ESIL Events"
  `;
};