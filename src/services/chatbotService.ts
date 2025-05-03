import { Product } from '../types/Product';

/**
 * Service pour gérer les interactions du chatbot avec l'API DeepSeek
 */

interface ChatbotResponse {
  response?: string;
  error?: string;
}

interface SuggestionResponse {
  suggestions: string[];
  error?: string;
}

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
 * Génère une réponse du chatbot basée sur la question de l'utilisateur et les produits disponibles
 */
/**
 * Génère des suggestions de questions basées sur les produits disponibles et l'historique des conversations
 */
export const generateDynamicSuggestions = (products: Product[], messageHistory: {text: string, sender: 'user' | 'bot'}[] = []): string[] => {
  // Suggestions par défaut si aucun produit n'est disponible
  const defaultSuggestions = [
    "Quels sont vos produits les plus populaires pour un mariage ?",
    "Avez-vous des systèmes de sonorisation disponibles ?",
    "Comment fonctionne la livraison du matériel ?",
    "Quels sont vos tarifs pour la location d'éclairage ?"
  ];

  // Si pas de produits, retourner les suggestions par défaut
  if (!products || products.length === 0) {
    return defaultSuggestions;
  }

  // Extraire les catégories uniques des produits
  const categories = new Set<string>();
  products.forEach(product => {
    if (typeof product.category === 'string') {
      categories.add(product.category);
    } else if (Array.isArray(product.category)) {
      product.category.forEach(cat => categories.add(cat));
    }
  });

  // Générer des suggestions basées sur les catégories disponibles
  const categorySuggestions = Array.from(categories).slice(0, 3).map(category => 
    `Quels produits proposez-vous dans la catégorie ${category} ?`
  );

  // Générer des suggestions basées sur les produits populaires ou récents
  const productSuggestions = products
    .slice(0, 5)
    .map(product => `Pouvez-vous me donner plus d'informations sur ${product.name} ?`);

  // Analyser l'historique des messages pour des suggestions contextuelles
  let contextualSuggestions: string[] = [];
  
  if (messageHistory.length > 0) {
    // Extraire le dernier message du bot
    const lastBotMessage = messageHistory.filter(msg => msg.sender === 'bot').pop();
    
    if (lastBotMessage) {
      // Si le dernier message du bot mentionne un produit, suggérer des questions de suivi
      const mentionedProducts = products.filter(product => 
        lastBotMessage.text.toLowerCase().includes(product.name.toLowerCase())
      );
      
      if (mentionedProducts.length > 0) {
        contextualSuggestions = [
          `Quel est le prix de location de ${mentionedProducts[0].name} ?`,
          `Est-ce que ${mentionedProducts[0].name} est disponible pour ce week-end ?`,
          `Avez-vous des produits similaires à ${mentionedProducts[0].name} ?`
        ];
      }
      
      // Si le message mentionne des prix, suggérer des questions sur le budget
      if (lastBotMessage.text.includes('€') || lastBotMessage.text.toLowerCase().includes('prix') || lastBotMessage.text.toLowerCase().includes('tarif')) {
        contextualSuggestions.push("Proposez-vous des réductions pour les locations de longue durée ?");
      }
      
      // Si le message mentionne la livraison
      if (lastBotMessage.text.toLowerCase().includes('livraison') || lastBotMessage.text.toLowerCase().includes('transport')) {
        contextualSuggestions.push("Quels sont vos délais de livraison habituels ?");
      }
    }
  }

  // Combiner et filtrer les suggestions pour éviter les doublons
  const allSuggestions = [...contextualSuggestions, ...categorySuggestions, ...productSuggestions, ...defaultSuggestions];
  const uniqueSuggestions = Array.from(new Set(allSuggestions));
  
  // Retourner un maximum de 4 suggestions
  return uniqueSuggestions.slice(0, 4);
};

export const generateChatbotResponse = async (question: string, products: Product[], useReasoningMode: boolean): Promise<ChatbotResponse> => {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return { error: "Erreur de configuration: Clé API DeepSeek manquante (VITE_DEEPSEEK_API_KEY)." };
    }

    // Limiter le nombre de produits pour éviter de dépasser la limite de tokens
    const limitedProducts = products.slice(0, 50);
    const productContext = prepareProductContext(limitedProducts);

    const systemMessage = {
      role: "system",
      content: `Tu es un assistant virtuel pour ESIL Events, spécialiste de la location de matériel événementiel. 
      Tu as accès à la base de données des produits et tu dois aider les clients à trouver les produits qui correspondent à leurs besoins.
      
      Voici les règles à suivre:
      1. Réponds aux questions des clients de manière précise, professionnelle et conviviale.
      2. Si on te demande des informations sur un produit spécifique, cherche-le dans la base de données et fournis les détails pertinents.
      3. Si on te demande des recommandations, suggère des produits adaptés en fonction des critères mentionnés.
      4. Si tu ne connais pas la réponse ou si le produit demandé n'est pas dans la base de données, propose de contacter l'équipe commerciale.
      5. Mentionne toujours les prix TTC des produits quand tu les recommandes.
      6. N'invente jamais de produits ou de caractéristiques qui ne sont pas dans la base de données.
      7. Si on te demande des informations sur la disponibilité ou la livraison, indique que ces informations sont à confirmer avec l'équipe commerciale.
      
      Voici les informations sur nos produits (limité aux 50 premiers): ${JSON.stringify(productContext)}`
    };

    const userMessage = {
      role: "user",
      content: question
    };

    // Configuration de la requête en fonction du mode de raisonnement
    const requestBody = useReasoningMode
      ? {
          model: "deepseek-reasoner",
          messages: [systemMessage, userMessage],
          temperature: 0.5, // Température plus basse pour des réponses plus précises
          max_tokens: 800, // Plus de tokens pour permettre un raisonnement détaillé
          top_p: 0.9,
          plugins: [{ type: "reasoner" }] // Activation du plugin de raisonnement
        }
      : {
          model: "deepseek-chat",
          messages: [systemMessage, userMessage],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.95
        };

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData;
      try {
        const errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { error: { message: `Erreur ${response.status}: ${response.statusText}. Réponse non JSON.` } };
      }
      throw new Error(`Erreur API (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    return { response: generatedContent };
  } catch (error: any) {
    console.error('Erreur lors de la génération de la réponse du chatbot:', error);
    return { 
      error: `Désolé, une erreur s'est produite: ${error.message || 'Erreur inconnue'}. Veuillez réessayer plus tard.`
    };
  }
};