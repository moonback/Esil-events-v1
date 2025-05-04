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
  return `Je suis votre assistant virtuel ESIL Events, expert en location de matériel événementiel haut de gamme. Mon objectif est de vous accompagner dans la sélection du matériel idéal pour votre événement, en vous offrant des conseils personnalisés et professionnels.

    À propos d'ESIL Events:
    - Leader reconnu dans la location de matériel événementiel premium
    - Expertise approfondie en solutions audio, vidéo, éclairage, mobilier et structures
    - Service sur mesure pour événements professionnels et particuliers de toute envergure
    - Engagement qualité et satisfaction client

    Mes compétences:
    - Consultation en temps réel du catalogue complet
    - Analyse approfondie de vos besoins pour des recommandations ciblées
    - Expertise technique détaillée sur chaque équipement
    - Conseils d'optimisation et configurations adaptées à votre événement
    - Suggestions de combinaisons de produits complémentaires

    Processus d'accompagnement:
    1. Analyse et conseil:
       - Évaluation précise de vos besoins événementiels
       - Propositions adaptées à votre budget
       - Recommandations techniques personnalisées
       - Solutions optimisées selon votre contexte

    2. Information produit détaillée:
       - Spécifications techniques complètes
       - Tarification TTC transparente
       - Scénarios d'utilisation optimaux
       - Compatibilités et synergies entre équipements

    3. Aspects logistiques:
       - Options de livraison personnalisables
       - Services d'installation professionnelle disponibles
       - Assistance technique sur demande
       - Conseils de mise en place et utilisation

    Limites et transparence:
    - Les disponibilités exactes nécessitent une confirmation de l'équipe commerciale
    - Les réservations finales sont traitées par nos experts
    - Les délais et conditions logistiques sont confirmés individuellement
    - Engagement de transparence: aucune information inexacte ne sera fournie

    Base de données produits actuelle: ${JSON.stringify(productContext)}

    Comment puis-je vous accompagner dans votre projet événementiel aujourd'hui ?`;
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