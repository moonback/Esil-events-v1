import { Category, Subcategory, SubSubcategory } from './categoryService';

/**
 * Service pour générer du contenu SEO à l'aide de l'API Gemini de Google
 */

// Interface pour les options de génération SEO
export interface SeoGenerationOptions {
  language?: 'fr' | 'en';
  focusKeywords?: string[];
  targetLength?: 'short' | 'medium' | 'long';
}

/**
 * Prépare les données pour la génération de contenu SEO
 */
export const prepareSeoContentPrompt = (
  item: Partial<Category | Subcategory | SubSubcategory>,
  itemType: 'category' | 'subcategory' | 'subsubcategory',
  options?: SeoGenerationOptions
) => {
  const systemMessage = {
    role: "system",
    content: "Tu es un expert en SEO spécialisé dans l'optimisation de contenu pour les sites e-commerce et événementiels. Génère du contenu SEO optimisé pour les catégories de produits. Principes clés : Utiliser des mots-clés pertinents, créer des titres accrocheurs, rédiger des descriptions informatives et persuasives, inclure des mots-clés secondaires naturellement. Structure : Titre SEO optimisé (60-70 caractères), méta-description (150-160 caractères), liste de mots-clés pertinents séparés par des virgules."
  };

  // Déterminer le niveau hiérarchique pour le contexte
  let hierarchyContext = '';
  if (itemType === 'subcategory' && (item as Subcategory).name) {
    hierarchyContext = `Cette sous-catégorie appartient à la catégorie principale "${(item as Subcategory).name}".`;
  } else if (itemType === 'subsubcategory' && (item as SubSubcategory).name) {
    hierarchyContext = `Cette sous-sous-catégorie appartient à la sous-catégorie "${(item as SubSubcategory).name}".`;
  }

  // Ajuster le message en fonction des options
  let lengthInstruction = '';
  if (options?.targetLength === 'short') {
    lengthInstruction = 'Génère un contenu concis et direct.';
  } else if (options?.targetLength === 'long') {
    lengthInstruction = 'Génère un contenu détaillé et approfondi.';
  }

  // Ajouter des mots-clés de focus si fournis
  let keywordsInstruction = '';
  if (options?.focusKeywords && options.focusKeywords.length > 0) {
    keywordsInstruction = `Assure-toi d'inclure ces mots-clés importants: ${options.focusKeywords.join(', ')}.`;
  }

  const userMessage = {
    role: "user",
    content: `Génère du contenu SEO optimisé pour cette ${itemType === 'category' ? 'catégorie' : itemType === 'subcategory' ? 'sous-catégorie' : 'sous-sous-catégorie'} de produits :

INFORMATIONS:
• Nom: ${item.name || 'Non spécifié'}
• Slug: ${item.slug || 'Non spécifié'}
• Description actuelle: ${item.description || 'Non spécifiée'}
${hierarchyContext}

INSTRUCTIONS SPÉCIFIQUES POUR L'IA :
1. Génère un titre SEO optimisé (60-70 caractères maximum).
2. Génère une méta-description SEO (150-160 caractères maximum) qui soit informative et persuasive.
3. Génère une liste de 5-10 mots-clés pertinents séparés par des virgules.
4. ${lengthInstruction}
5. ${keywordsInstruction}
6. Assure-toi que le contenu soit optimisé pour le référencement tout en restant naturel et informatif.
7. Fournis le résultat au format JSON avec les clés suivantes: "seo_title", "seo_description", "seo_keywords".
`
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Génère du contenu SEO pour une catégorie, sous-catégorie ou sous-sous-catégorie
 */
export const generateSeoContent = async (
  item: Partial<Category | Subcategory | SubSubcategory>,
  itemType: 'category' | 'subcategory' | 'subsubcategory',
  options?: SeoGenerationOptions
): Promise<{ seoContent?: { seo_title: string; seo_description: string; seo_keywords: string }; error?: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { error: 'Erreur de configuration: Clé API Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }

    const { messages } = prepareSeoContentPrompt(item, itemType, options);

    // Adapter le format des messages pour Gemini
    const prompt = messages.map(msg => msg.content).join('\n\n');
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.95,
        responseMimeType: "application/json"
      }
    };

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
      throw new Error(`Erreur API (${response.status}): ${errorData?.error?.message || response.statusText || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    // Analyser le contenu JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      // Si le contenu n'est pas un JSON valide, essayer d'extraire manuellement
      const titleMatch = generatedContent.match(/"seo_title"\s*:\s*"([^"]+)"/i);
      const descriptionMatch = generatedContent.match(/"seo_description"\s*:\s*"([^"]+)"/i);
      const keywordsMatch = generatedContent.match(/"seo_keywords"\s*:\s*"([^"]+)"/i);
      
      parsedContent = {
        seo_title: titleMatch ? titleMatch[1] : '',
        seo_description: descriptionMatch ? descriptionMatch[1] : '',
        seo_keywords: keywordsMatch ? keywordsMatch[1] : ''
      };
    }

    return { 
      seoContent: {
        seo_title: parsedContent.seo_title || '',
        seo_description: parsedContent.seo_description || '',
        seo_keywords: parsedContent.seo_keywords || ''
      } 
    };
  } catch (err: any) {
    console.error('Erreur détaillée lors de la génération du contenu SEO:', err);
    return { error: `Erreur lors de la génération du contenu SEO: ${err.message}` };
  }
};