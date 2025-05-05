import { ProductFormData } from '../types/Product';

/**
 * Service pour générer des descriptions de produits à l'aide de l'API Google Gemini
 * (Remplacement de l'API Deepseek suite à un problème de solde insuffisant)
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
• Prix TTC: ${productData.priceTTC || 'Non spécifié'}€

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1. Rédige une description détaillée et attrayante du produit en 3-4 paragraphes (MAXIMUM 1500 caractères au total).
2. Mets en valeur les caractéristiques premium et l'élégance du produit.
3. Décris l'impact visuel et pratique que ce produit peut avoir sur un événement.
4. Suggère des utilisations idéales et des combinaisons possibles avec d'autres produits.
5. Optimise pour le SEO :
   - Utilise le nom du produit dans le premier paragraphe
   - Inclus la catégorie et sous-catégorie naturellement dans le texte
   - Intègre les mots-clés "location", "événement", "ESIL-events" stratégiquement
   - Utilise des variations sémantiques des mots-clés principaux
   - Structure le texte avec des phrases courtes et des paragraphes bien définis
   - Maintiens une densité de mots-clés optimale (2-3%)
6. N'invente pas de détails techniques non fournis.
7. Utilise un ton professionnel mais engageant.
8. Fournis uniquement la description, sans phrases d'introduction.
9. IMPORTANT: La description complète ne doit pas dépasser 1500 caractères, espaces compris.
11. Ajoute des liens internes naturels vers d'autres catégories de produits pertinentes.
`
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Prépare la requête pour l'API Google Gemini
 */
const prepareGeminiRequest = (productData: Partial<ProductFormData>) => {
  const systemPrompt = `Tu es un expert en rédaction de descriptions de produits pour ESIL-events Créateur d'Événements Inoubliables, entreprise spécialisée dans la création d'événements de A à Z incluant location de mobilier, installation, régie son & lumière, et animation.

En tant qu'expert en marketing événementiel et rédaction SEO, ta mission est de créer des descriptions qui :
- Captent immédiatement l'attention du lecteur
- Mettent en avant l'exclusivité et le prestige de la marque ESIL-events
- Créent une connexion émotionnelle avec le client potentiel
- Optimisent le référencement naturel
- Convertissent les visiteurs en clients

Structure attendue :
1. Accroche percutante mettant en avant la valeur unique du produit
2. Description détaillée incluant matériaux, finitions, dimensions et spécifications techniques
3. Bénéfices concrets pour l'événement (ambiance, praticité, impact visuel)
4. Suggestions d'utilisations et de combinaisons avec d'autres produits/services ESIL
5. Call-to-action subtil encourageant la location

Points clés à respecter :
- Ton professionnel mais chaleureux
- Vocabulaire premium et élégant
- Mise en valeur de l'expertise ESIL-events
- Focus sur l'expérience client
- Intégration naturelle des mots-clés SEO`;

  const userQuestion = `Génère une description détaillée et persuasive pour ce produit :

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
• Prix TTC: ${productData.priceTTC || 'Non spécifié'}€

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1. Rédige une description captivante en 3-4 paragraphes (MAXIMUM 1500 caractères).
2. Commence par une accroche forte qui met en valeur l'unicité du produit.
3. Détaille les caractéristiques premium et l'impact sur l'ambiance de l'événement.
4. Suggère des scénarios d'utilisation concrets et des combinaisons avec d'autres produits ESIL.
5. Intègre naturellement les mots-clés SEO pertinents (densité 2-3%).
6. Utilise uniquement les informations fournies, sans invention.
7. Adopte un ton professionnel mais engageant qui inspire confiance.
8. Termine par une suggestion subtile incitant à la location.
9. CRUCIAL: Respecte la limite de 1500 caractères, espaces compris.
10. IMPORTANT: Optimise pour le SEO avec des phrases naturelles et bien structurées.`;

  return {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          { text: `Question du client: ${userQuestion}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8, // Slightly increased for more creative variations
      maxOutputTokens: 1000, // Increased to ensure full description generation
      topP: 0.95, // Slightly increased for more diverse outputs
      topK: 40 // Added for better response quality
    }
  };
};
/**
 * Fonction pour effectuer une requête API Google Gemini avec retry
 */
async function makeGeminiApiRequest(requestBody: any, apiKey: string, retryCount = 0, maxRetries = 3): Promise<any> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
      
      // Si on a atteint le nombre maximum de tentatives, lancer une erreur
      if (retryCount >= maxRetries) {
        throw new Error(`Erreur API Google (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Tentative Google API ${retryCount + 1}/${maxRetries} échouée. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Réessayer
      return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (retryCount < maxRetries) {
      // Attendre avant de réessayer
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Erreur lors de la tentative Google API ${retryCount + 1}/${maxRetries}. Nouvelle tentative dans ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Réessayer
      return makeGeminiApiRequest(requestBody, apiKey, retryCount + 1, maxRetries);
    }
    throw error;
  }
}

/**
 * Génère une description pour un produit en utilisant l'API Google Gemini
 */
export const generateProductDescription = async (productData: Partial<ProductFormData>): Promise<{ description?: string; error?: string }> => {
  try {
    // Essayer d'abord avec l'API Gemini
    const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return { error: 'Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }

    // Préparer la requête pour Gemini
    const requestBody = prepareGeminiRequest(productData);

    // Appeler l'API Gemini
    const data = await makeGeminiApiRequest(requestBody, geminiApiKey);
    let generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

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