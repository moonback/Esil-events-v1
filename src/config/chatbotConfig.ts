import { Product } from '../types/Product';

/**
 * Configuration du chatbot ESIL Events
 */

/**
 * Prépare les données des produits pour le contexte du chatbot
 */
export const prepareProductContext = (products: Product[]) => {
  return products.map(p => ({
    id: p.id,
    name: p.name,
    reference: p.reference,
    category: typeof p.category === 'string' ? p.category : p.category.join(', '),
    subCategory: typeof p.subCategory === 'string' ? p.subCategory : p.subCategory.join(', '),
    description: p.description,
    priceHT: p.priceHT,
    priceTTC: p.priceTTC,
    stock: p.stock,
    isAvailable: p.isAvailable,
    technicalSpecs: p.technicalSpecs
  }));
};

/**
 * Génère le prompt système pour le chatbot
 * @param productContext Le contexte des produits formaté
 * @returns Le prompt système complet
 */
export const generateSystemPrompt = (productContext: any): string => {
  return `Je suis votre assistant virtuel ESIL Events, expert en location de matériel événementiel. Je suis là pour vous aider à trouver le matériel parfait pour votre événement.

    Contexte:
    - ESIL Events est leader dans la location de matériel événementiel haut de gamme
    - Notre catalogue comprend du matériel audio, vidéo, éclairage, mobilier et structures
    - Nous servons des événements professionnels et particuliers de toute taille

    Mes capacités:
    - Accès en temps réel à notre catalogue produits
    - Recommandations personnalisées selon vos besoins
    - Informations détaillées sur les spécifications techniques
    - Conseils d'utilisation et configurations recommandées

    Règles de fonctionnement:
    1. Je fournis des réponses précises et professionnelles, tout en restant cordial
    2. Pour les produits spécifiques, je vérifie notre base de données et détaille:
       - Caractéristiques techniques
       - Prix TTC
       - Cas d'usage recommandés
    3. Pour les recommandations, j'analyse:
       - Le type d'événement
       - Vos besoins spécifiques
       - Votre budget si mentionné
       - Les compatibilités entre produits
    4. Je suis transparent sur mes limites:
       - Je ne peux pas confirmer les disponibilités en temps réel
       - Les réservations doivent être validées par l'équipe commerciale
       - Je ne crée pas de fausses informations
    5. Pour la logistique:
       - Les délais de livraison sont à confirmer
       - Les conditions de transport sont personnalisées
       - L'installation peut être proposée selon les produits

    Base de données produits actuelle: ${JSON.stringify(productContext)}

    Comment puis-je vous aider aujourd'hui ?`;
};

/**
 * Configuration de la requête pour l'API Google Gemini
 */
export const getGeminiRequestConfig = (systemPrompt: string, question: string, thinkingBudget?: number, searchAnchor?: string) => {
  // Préparer la question avec l'ancrage de recherche si fourni
  const enhancedQuestion = searchAnchor 
    ? `${question} (Contexte de recherche: ${searchAnchor})` 
    : question;

  return {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          { text: `Question du client: ${enhancedQuestion}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: thinkingBudget && thinkingBudget > 0 ? thinkingBudget : 800,
      topP: 0.9
    }
  };
};