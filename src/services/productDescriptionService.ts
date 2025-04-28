import { ProductFormData } from '../types/Product';

/**
 * Service pour générer des descriptions de produits à l'aide de l'API Deepseek
 */

/**
 * Prépare les données pour la génération de description de produit
 */
export const prepareProductDescriptionPrompt = (productData: Partial<ProductFormData>) => {
  const systemMessage = {
    role: "system",
    content: "Tu es un expert en rédaction de descriptions de produits pour ESIL Events, spécialiste de la location de mobilier événementiel premium. Génère des descriptions détaillées, persuasives et SEO-friendly pour les produits. Principes clés : Ton professionnel, mettre en valeur les caractéristiques premium, souligner l'exclusivité et la qualité des produits ESIL Events, décrire l'impact visuel et pratique du mobilier sur un événement. Structure : Description physique détaillée, matériaux et finitions, dimensions, utilisations recommandées, avantages pour l'événement, caractéristiques techniques importantes."
  };

  const userMessage = {
    role: "user",
    content: `Génère une description détaillée et persuasive pour ce produit :

PRODUIT:
• Nom: ${productData.name || 'Non spécifié'}
• Référence: ${productData.reference || 'Non spécifiée'}
• Catégorie: ${productData.category || 'Non spécifiée'}
• Sous-catégorie: ${productData.subCategory || 'Non spécifiée'}
• Sous-sous-catégorie: ${productData.subSubCategory || 'Non spécifiée'}
• Prix HT: ${productData.priceHT || 'Non spécifié'}€
• Couleurs disponibles: ${productData.colors?.join(', ') || 'Non spécifiées'}
• Spécifications techniques: ${Object.entries(productData.technicalSpecs || {}).map(([key, value]) => `${key}: ${value}`).join(', ') || 'Non spécifiées'}

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1. Rédige une description détaillée et attrayante du produit en 3-4 paragraphes (300-500 caractères).
2. Mets en valeur les caractéristiques premium et l'élégance du produit.
3. Décris l'impact visuel et pratique que ce produit peut avoir sur un événement.
4. Suggère des utilisations idéales et des combinaisons possibles avec d'autres produits.
5. Inclus des mots-clés pertinents pour le SEO.
6. N'invente pas de détails techniques non fournis.
7. Utilise un ton professionnel mais engageant.
8. Fournis uniquement la description, sans phrases d'introduction comme "Voici la description suggérée :".
`
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Génère une description pour un produit
 */
export const generateProductDescription = async (productData: Partial<ProductFormData>): Promise<{ description?: string; error?: string }> => {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return { error: 'Erreur de configuration: Clé API DeepSeek manquante (VITE_DEEPSEEK_API_KEY).' };
    }

    const { messages } = prepareProductDescriptionPrompt(productData);

    const requestBody = {
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
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

    return { description: generatedContent };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération de la description:', err);
    return { error: `Erreur lors de la génération de la description: ${err.message}` };
  }
};