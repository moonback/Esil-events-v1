import { Product } from '../types/Product';

/**
 * Service pour gérer les interactions du chatbot avec l'API DeepSeek
 */

interface ChatbotResponse {
  response?: string;
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
export const generateChatbotResponse = async (question: string, products: Product[]): Promise<ChatbotResponse> => {
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

    const requestBody = {
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