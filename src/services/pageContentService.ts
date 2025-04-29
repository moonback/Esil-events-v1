import { PageFormData } from './pageService';

/**
 * Service pour générer du contenu de page à l'aide de l'API Deepseek
 */

/**
 * Prépare les données pour la génération de contenu de page
 */
export const preparePageContentPrompt = (pageData: Partial<PageFormData>) => {
  const systemMessage = {
    role: "system",
    content: "Tu es un expert en rédaction de contenu web pour ESIL Events, spécialiste de la location de mobilier événementiel premium. Génère du contenu détaillé, persuasif et SEO-friendly pour les pages du site. Principes clés : Ton professionnel, mettre en valeur l'expertise et les services d'ESIL Events, souligner l'exclusivité et la qualité des produits, décrire l'impact des services sur la réussite des événements. Structure : Introduction captivante, corps du texte informatif et engageant, conclusion avec appel à l'action."
  };

  const userMessage = {
    role: "user",
    content: `Génère un contenu détaillé et persuasif pour cette page :

PAGE:
• Titre: ${pageData.title || 'Non spécifié'}
• URL: ${pageData.slug || 'Non spécifiée'}
• Mots-clés SEO: ${pageData.meta_keywords || 'Non spécifiés'}
• Description SEO: ${pageData.meta_description || 'Non spécifiée'}

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1. Rédige un contenu détaillé et attrayant pour la page en plusieurs paragraphes (minimum 3).
2. Structure le contenu avec des sous-titres pertinents (utilise les balises <h2> et <h3>).
3. Mets en valeur l'expertise d'ESIL Events dans le domaine de l'événementiel.
4. Inclus des appels à l'action pertinents (contact, demande de devis, etc.).
5. Optimise le contenu pour le référencement avec les mots-clés fournis.
6. Utilise un ton professionnel mais engageant.
7. Fournis le contenu au format HTML avec des balises appropriées (paragraphes, titres, listes).
8. N'invente pas de détails spécifiques sur l'entreprise non fournis.
`
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Génère du contenu pour une page
 */
export const generatePageContent = async (pageData: Partial<PageFormData>): Promise<{ content?: string; error?: string }> => {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return { error: 'Erreur de configuration: Clé API DeepSeek manquante (VITE_DEEPSEEK_API_KEY).' };
    }

    const { messages } = preparePageContentPrompt(pageData);

    const requestBody = {
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
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

    return { content: generatedContent };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération du contenu:', err);
    return { error: `Erreur lors de la génération du contenu: ${err.message}` };
  }
};