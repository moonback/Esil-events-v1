import { ProductFormData } from '../types/Product';
import { Category, Subcategory } from './categoryService';

/**
 * Service pour générer du contenu SEO optimisé pour les produits
 */

// Interface pour les options de génération SEO
export interface ProductSeoGenerationOptions {
  language?: 'fr' | 'en';
  focusKeywords?: string[];
  targetLength?: 'short' | 'medium' | 'long';
  includeCompetitors?: boolean;
  targetAudience?: string;
  eventType?: string;
}

/**
 * Prépare les données pour la génération de contenu SEO spécifique aux produits
 */
export const prepareProductSeoPrompt = (
  productData: Partial<ProductFormData>,
  categories?: { category?: Category; subCategory?: Subcategory },
  options?: ProductSeoGenerationOptions
) => {
  const systemMessage = {
    role: "system",
    content: "Tu es un expert en SEO spécialisé dans l'optimisation de contenu pour les sites de location journalier d'événementiel. Tu excelles dans la création de métadonnées SEO pour des produits de location destinés aux événements professionnels et particuliers.Votre événement de A à Z : Location, Installation, Régie Son & Lumière, Animation. Tu comprends parfaitement les intentions de recherche des organisateurs d'événements et sais comment optimiser le contenu pour maximiser la visibilité dans les moteurs de recherche tout en maintenant un taux de conversion élevé."
  };

  // Déterminer le contexte de catégorie pour enrichir le prompt
  let categoryContext = '';
  if (categories?.category) {
    categoryContext = `Ce produit appartient à la catégorie principale "${categories.category.name}"`;
    if (categories.subCategory) {
      categoryContext += ` et à la sous-catégorie "${categories.subCategory.name}"`;
    }
    categoryContext += '.';
  }

  // Ajuster le message en fonction des options
  let lengthInstruction = '';
  if (options?.targetLength === 'short') {
    lengthInstruction = 'Génère un contenu concis et direct, idéal pour les recherches mobiles.';
  } else if (options?.targetLength === 'long') {
    lengthInstruction = 'Génère un contenu détaillé et approfondi, riche en mots-clés secondaires.';
  } else {
    lengthInstruction = 'Génère un contenu équilibré, optimisé pour le référencement et la conversion.';
  }

  // Ajouter des mots-clés de focus si fournis
  let keywordsInstruction = '';
  if (options?.focusKeywords && options.focusKeywords.length > 0) {
    keywordsInstruction = `Assure-toi d'inclure ces mots-clés importants: ${options.focusKeywords.join(', ')}. Intègre-les naturellement dans le titre et la description.`;
  }

  // Ajouter des informations sur le public cible si fournies
  let audienceInstruction = '';
  if (options?.targetAudience) {
    audienceInstruction = `Ce produit cible principalement: ${options.targetAudience}. Adapte le ton et le vocabulaire en conséquence.`;
  }

  // Ajouter des informations sur le type d'événement si fourni
  let eventTypeInstruction = '';
  if (options?.eventType) {
    eventTypeInstruction = `Ce produit est particulièrement adapté pour les événements de type: ${options.eventType}. Mentionne cet usage spécifique.`;
  }

  // Informations techniques pour enrichir le contenu
  const technicalSpecsText = productData.technicalSpecs ? 
    Object.entries(productData.technicalSpecs).map(([key, value]) => `${key}: ${value}`).join(', ') : 
    'Non spécifiées';

  const userMessage = {
    role: "user",
    content: `Génère du contenu SEO optimisé pour ce produit de location événementielle :

INFORMATIONS PRODUIT:
• Nom: ${productData.name || 'Non spécifié'}
• Référence: ${productData.reference || 'Non spécifiée'}
• Catégorie: ${productData.category || 'Non spécifiée'}
• Sous-catégorie: ${productData.subCategory || 'Non spécifiée'}
• Sous-sous-catégorie: ${productData.subSubCategory || 'Non spécifiée'}
• Description actuelle: ${productData.description || 'Non spécifiée'}
• Prix: ${productData.priceHT || 'Non spécifié'}€ HT
• Couleurs disponibles: ${productData.colors?.join(', ') || 'Non spécifiées'}
• Spécifications techniques: ${technicalSpecsText}
${categoryContext}

CONTEXTE MARKETING:
• ESIL-events est spécialisé dans la création d'événements de A à Z incluant location de mobilier, installation, régie son & lumière, et animation.
• Nos produits sont premium et destinés à créer des événements inoubliables.
• ${audienceInstruction}
• ${eventTypeInstruction}

INSTRUCTIONS SPÉCIFIQUES:
1. Génère un titre SEO optimisé (60-70 caractères maximum) qui soit accrocheur et contienne les mots-clés principaux.
2. Génère une méta-description SEO (150-160 caractères maximum) qui soit informative, persuasive et incite à l'action.
3. Génère une liste de 5-10 mots-clés pertinents séparés par des virgules, incluant:
   - Des mots-clés liés au produit lui-même
   - Des mots-clés liés à l'usage événementiel
   - Des termes de recherche géographiques (France, régions françaises)
   - Des termes liés à la location/prestation
4. ${lengthInstruction}
5. ${keywordsInstruction}
6. Assure-toi que le contenu soit optimisé pour le référencement tout en restant naturel et persuasif.
7. Inclus des termes liés à la qualité premium et à l'exclusivité.
8. Fournis le résultat au format JSON avec les clés suivantes: "seo_title", "seo_description", "seo_keywords".
`
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Génère du contenu SEO optimisé pour un produit
 */
export const generateProductSeo = async (
  productData: Partial<ProductFormData>,
  categories?: { category?: Category; subCategory?: Subcategory },
  options?: ProductSeoGenerationOptions
): Promise<{ seoContent?: { seo_title: string; seo_description: string; seo_keywords: string }; error?: string }> => {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return { error: 'Erreur de configuration: Clé API DeepSeek manquante (VITE_DEEPSEEK_API_KEY).' };
    }

    const { messages } = prepareProductSeoPrompt(productData, categories, options);

    const requestBody = {
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
      response_format: { type: "json_object" }
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
    console.error('Erreur détaillée lors de la génération du contenu SEO pour le produit:', err);
    return { error: `Erreur lors de la génération du contenu SEO: ${err.message}` };
  }
};