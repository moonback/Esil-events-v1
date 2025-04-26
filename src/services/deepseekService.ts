import { formatDate, getDeliveryTypeLabel, getTimeSlotLabel } from '../utils/formatters';
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
            content: 'Vous êtes un expert en communication événementielle haut de gamme, spécialisé dans la création de réponses sur-mesure pour des demandes de devis d\'événements d\'exception. Votre style d\'écriture allie élégance, raffinement et précision, reflétant l\'identité premium d\'ESIL Events. Votre ton est à la fois sophistiqué, chaleureux et inspirant, créant une expérience de marque distinctive dès le premier contact.'
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
    ✦─────────── RÉCAPITULATIF DEMANDE DE DEVIS ESIL EVENTS ───────────✦
    
    Merci de bien vouloir traiter cette demande de devis avec la plus grande attention. Voici le récapitulatif complet des informations fournies :

INFORMATIONS CLIENT
━━━━━━━━━━━━━━━━━
• Identité: ${quoteRequest.first_name || ''} ${quoteRequest.last_name || ''}
• Coordonnées: 
  - Email: ${quoteRequest.email || 'Non renseigné'}
  - Téléphone: ${quoteRequest.phone || 'Non renseigné'}
• Profil: ${quoteRequest.customer_type === 'professional' ? 'Client Professionnel' : 'Client Particulier'}
• Entreprise: ${quoteRequest.company || 'Non applicable'}
• Adresse de facturation: ${[quoteRequest.billing_address, quoteRequest.postal_code, quoteRequest.city].filter(Boolean).join(', ') || 'Non communiquée'}

DÉTAILS DE L'ÉVÉNEMENT
━━━━━━━━━━━━━━━━━━━━
• Date prévue: ${eventDate}
• Configuration:
  - Durée totale: ${quoteRequest.event_duration || 'À préciser'}
  - Horaires: ${quoteRequest.event_start_time || '?'} à ${quoteRequest.event_end_time || '?'}
  - Nombre de participants: ${quoteRequest.guest_count || 'À confirmer'}
• Environnement: ${quoteRequest.event_location === 'indoor' ? 'Configuration Intérieure' : 'Configuration Extérieure'}
• Brief événement: ${quoteRequest.description || 'Aucune précision fournie'}

COMMANDE PRÉVISIONNELLE
━━━━━━━━━━━━━━━━━━━━━
${quoteRequest.items?.map(item => `• ${item.name}: ${item.quantity} unité(s) × ${item.price}€`).join('\n') || 'Aucun article présélectionné'}
• Estimation budgétaire TTC: ${quoteRequest.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}€

MODALITÉS LOGISTIQUES
━━━━━━━━━━━━━━━━━━━
• Mode: ${getDeliveryTypeLabel(quoteRequest.delivery_type)}
• Planification:
  - Date: ${quoteRequest.delivery_date ? formatDate(quoteRequest.delivery_date) : 'À définir'}
  - Créneau souhaité: ${getTimeSlotLabel(quoteRequest.delivery_time_slot)}
• Point de livraison: ${[quoteRequest.delivery_address, quoteRequest.delivery_postal_code, quoteRequest.delivery_city].filter(Boolean).join(', ') || 'Identique adresse de facturation'}

REMARQUES ADDITIONNELLES
━━━━━━━━━━━━━━━━━━━━━
${quoteRequest.comments || 'Aucune remarque particulière'}

ÉLÉMENTS DE RÉPONSE À INCLURE
━━━━━━━━━━━━━━━━━━━━━━━━━
1. Formule de salutation personnalisée
2. Accusé de réception et contextualisation
3. Présentation des compétences ESIL Events
4. Synthèse des besoins identifiés
5. Analyse des choix ou recommandations
6. Processus et étapes suivantes
7. Proposition de rendez-vous
8. Signature corporative
9. Adaptation stylistique selon profil
10. Strict respect des informations client

✦───────────────────────────────✦
`;
};