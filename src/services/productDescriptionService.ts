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
    content: "Tu es un expert en rédaction de descriptions de produits pour ESIL-events Créateur d'Événements Inoubliables, entreprise spécialisée dans la création d'événements de A à Z incluant location de mobilier, installation, régie son & lumière, et animation. Génère des descriptions détaillées, persuasives et SEO-friendly pour les produits. Principes clés : Ton professionnel, mettre en valeur les caractéristiques premium, souligner l'exclusivité et la qualité des produits ESIL, décrire l'impact visuel et pratique sur l'événement. Structure : Description physique détaillée, matériaux et finitions, dimensions, utilisations recommandées, avantages pour l'événement, caractéristiques techniques importantes, suggestions de combinaisons avec d'autres services ESIL (son, lumière, animation)."
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
• Description: ${productData.description || 'Non spécifiée'}
• Images: ${productData.images?.join(', ') || 'Aucune image'}
• Prix HT: ${productData.priceHT || 'Non spécifié'}€
• Couleurs disponibles: ${productData.colors?.join(', ') || 'Non spécifiées'}
• Spécifications techniques: ${Object.entries(productData.technicalSpecs || {}).map(([key, value]) => `${key}: ${value}`).join(', ') || 'Non spécifiées'}
. Prix TTC: ${productData.priceTTC || 'Non spécifié'}€

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1. Rédige une description détaillée et attrayante du produit en 3-4 paragraphes (MAXIMUM 1500 caractères au total).
2. Mets en valeur les caractéristiques premium et l'élégance du produit.
3. Décris l'impact visuel et pratique que ce produit peut avoir sur un événement.
4. Suggère des utilisations idéales et des combinaisons possibles avec d'autres produits.
5. Inclus des mots-clés pertinents pour le SEO.
6. N'invente pas de détails techniques non fournis.
7. Utilise un ton professionnel mais engageant.
8. Fournis uniquement la description, sans phrases d'introduction comme "Voici la description suggérée :".
9. IMPORTANT: La description complète ne doit pas dépasser 1500 caractères, espaces compris.
10. IMPORTANT: Optimise la description pour le référencement naturel en incluant les mots-clés pertinents de manière naturelle et en respectant une densité de mots-clés appropriée (2-3%).
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
      max_tokens: 600, // Réduit pour s'assurer que la réponse reste dans les limites
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
    let generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    // Tronquer la description si elle dépasse 1500 caractères
    if (generatedContent.length > 1500) {
      // Trouver le dernier point avant la limite de 1500 caractères
      const lastPeriodIndex = generatedContent.lastIndexOf('.', 1500);
      if (lastPeriodIndex > 0) {
        generatedContent = generatedContent.substring(0, lastPeriodIndex + 1);
      } else {
        // Si pas de point trouvé, simplement tronquer à 1500
        generatedContent = generatedContent.substring(0, 1500);
      }
    }

    return { description: generatedContent };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération de la description:', err);
    return { error: `Erreur lors de la génération de la description: ${err.message}` };
  }
};