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
 * Helper pour générer les instructions contextuelles communes
 */
const buildContextualInstructions = (
  productData: Partial<ProductFormData>,
  categories?: { category?: Category; subCategory?: Subcategory },
  options?: ProductSeoGenerationOptions
) => {
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
  let lengthInstruction = 'Génère un contenu équilibré, optimisé pour le référencement et la conversion.';
  if (options?.targetLength === 'short') {
    lengthInstruction = 'Génère un contenu concis et direct, idéal pour les recherches mobiles.';
  } else if (options?.targetLength === 'long') {
    lengthInstruction = 'Génère un contenu détaillé et approfondi, riche en mots-clés secondaires.';
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

  return {
    categoryContext,
    lengthInstruction,
    keywordsInstruction,
    audienceInstruction,
    eventTypeInstruction,
    technicalSpecsText
  };
};

/**
 * Prépare les données pour la génération de contenu SEO spécifique aux produits
 */
export const prepareProductSeoPrompt = (
  productData: Partial<ProductFormData>,
  categories?: { category?: Category; subCategory?: Subcategory },
  options?: ProductSeoGenerationOptions
) => {
  const {
    categoryContext,
    lengthInstruction,
    keywordsInstruction,
    audienceInstruction,
    eventTypeInstruction,
    technicalSpecsText
  } = buildContextualInstructions(productData, categories, options);

  const systemMessage = {
    role: "system",
    content: "Tu es un expert en SEO spécialisé dans l'optimisation de contenu pour les sites de location de matériel événementiel. Tu excelles dans la création de métadonnées SEO pour des produits de location destinés aux événements professionnels et particuliers. Tu as une expertise approfondie dans le domaine de l'événementiel, couvrant tous les aspects : Location de matériel, Installation professionnelle, Régie Son & Lumière, et Animation événementielle. Tu comprends parfaitement les intentions de recherche des organisateurs d'événements et sais comment optimiser le contenu pour maximiser la visibilité dans les moteurs de recherche tout en maintenant un taux de conversion élevé. Tu maîtrises les dernières tendances SEO, les algorithmes de Google, et les meilleures pratiques en matière de référencement local pour le marché français de l'événementiel. Tu sais adapter le ton et le vocabulaire selon le type d'événement (mariage, séminaire d'entreprise, salon professionnel, etc.) et le public cible (particuliers, entreprises, institutions)."
  };

  const userMessage = {
    role: "user",
    content: `Génère du contenu SEO hautement optimisé et performant pour ce produit de location événementielle premium :

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

CONTEXTE MARKETING & POSITIONNEMENT:
• ESIL-events est le leader incontesté dans la création d'événements haut de gamme en France, offrant une solution complète et intégrée : location de mobilier design, systèmes de sonorisation professionnelle, éclairage architectural, jeux d'arcade et équipements vidéo premium, installation experte, régie technique son & lumière de pointe, et services d'animation sur-mesure.
• Notre collection exclusive de produits et équipements premium est méticuleusement sélectionnée et entretenue pour créer des expériences événementielles exceptionnelles, innovantes et inoubliables.
• Notre réseau logistique couvre l'ensemble de la France, avec une expertise particulière en région parisienne et Île-de-France.
• Notre clientèle exclusive comprend des professionnels de l'événementiel renommés et des particuliers exigeants en quête d'excellence.
• ${audienceInstruction}
• ${eventTypeInstruction}

DIRECTIVES SEO SPÉCIFIQUES:
1. Crée un titre SEO percutant (60-70 caractères) intégrant:
   - Les mots-clés principaux en début de titre
   - Une proposition de valeur unique
   - Un élément déclencheur d'action

2. Développe une méta-description SEO optimale (150-160 caractères) incluant:
   - Une accroche émotionnelle forte
   - Les bénéfices clés du produit
   - Un appel à l'action convaincant
   - Les éléments différenciateurs (qualité premium, service personnalisé)

3. Génère une liste stratégique de 8-10 mots-clés comprenant:
   - Des termes spécifiques au produit et ses caractéristiques premium
   - Des mots-clés liés aux événements haut de gamme
   - Des variations géographiques ciblées (Paris, Île-de-France, France)
   - Des termes de recherche liés à la location et au service national
   - Des long-tail keywords pertinents

4. ${lengthInstruction}
5. ${keywordsInstruction}

EXIGENCES ADDITIONNELLES:
• Optimise le contenu pour les derniers algorithmes Google (E-E-A-T)
• Intègre naturellement les mots-clés de conversion
• Mets en avant notre expertise régionale et nationale
• Souligne notre positionnement premium et exclusif
• Respecte les bonnes pratiques SEO 2025

FORMAT DE RÉPONSE:
Fournis le résultat au format JSON structuré avec les clés:
{
  "seo_title": "Titre optimisé",
  "seo_description": "Description persuasive",
  "seo_keywords": "liste, de, mots-clés, pertinents"
}
`
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Prépare la requête pour l'API Google Gemini
 */
const prepareGeminiRequest = (productData: Partial<ProductFormData>, categories?: { category?: Category; subCategory?: Subcategory }, options?: ProductSeoGenerationOptions) => {
  const {
    categoryContext,
    lengthInstruction,
    keywordsInstruction,
    audienceInstruction,
    eventTypeInstruction,
    technicalSpecsText
  } = buildContextualInstructions(productData, categories, options);

  const systemPrompt = "Tu es un expert en SEO spécialisé dans l'optimisation de contenu pour les sites de location de matériel événementiel. Tu excelles dans la création de métadonnées SEO pour des produits de location destinés aux événements professionnels et particuliers. Tu as une expertise approfondie dans le domaine de l'événementiel, couvrant tous les aspects : Location de matériel, Installation professionnelle, Régie Son & Lumière, et Animation événementielle. Tu comprends parfaitement les intentions de recherche des organisateurs d'événements et sais comment optimiser le contenu pour maximiser la visibilité dans les moteurs de recherche tout en maintenant un taux de conversion élevé. Tu maîtrises les dernières tendances SEO, les algorithmes de Google, et les meilleures pratiques en matière de référencement local pour le marché français de l'événementiel. Tu sais adapter le ton et le vocabulaire selon le type d'événement (mariage, séminaire d'entreprise, salon professionnel, etc.) et le public cible (particuliers, entreprises, institutions).";

  const userQuestion = `Génère du contenu SEO optimisé pour ce produit de location événementielle :

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
• Notre expertise s'étend sur toute la France, avec une présence forte en région PARISIENNE.
• Nous servons une clientèle exigeante composée de professionnels de l'événementiel et de particuliers.
• ${audienceInstruction}
• ${eventTypeInstruction}

INSTRUCTIONS SPÉCIFIQUES:
1. Génère un titre SEO optimisé (60-70 caractères maximum) qui soit accrocheur et contienne les mots-clés principaux.
2. Génère une méta-description SEO (150-160 caractères maximum) qui soit informative, persuasive et incite à l'action.
3. Génère une liste de 5-10 mots-clés pertinents séparés par des virgules, incluant:
   - Des mots-clés liés au produit lui-même
   - Des mots-clés liés à l'usage événementiel
   - Des termes de recherche géographiques (Région parisienne, Île-de-France, Livraison France entière)
   - Des termes liés à la location/prestation et au service national
4. ${lengthInstruction}
5. ${keywordsInstruction}
6. Assure-toi que le contenu soit optimisé pour le référencement tout en restant naturel et persuasif.
7. Inclus des termes liés à la qualité premium et à l'exclusivité.
8. Mentionne notre expertise régionale et notre service personnalisé.
9. Fournis le résultat au format JSON avec les clés suivantes: "seo_title", "seo_description", "seo_keywords".`;

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
      temperature: 0.7,
      maxOutputTokens: 800,
      topP: 0.9
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
 * Génère du contenu SEO optimisé pour un produit en utilisant l'API Google Gemini
 */
export const generateProductSeo = async (
  productData: Partial<ProductFormData>,
  categories?: { category?: Category; subCategory?: Subcategory },
  options?: ProductSeoGenerationOptions
): Promise<{ seoContent?: { seo_title: string; seo_description: string; seo_keywords: string }; error?: string }> => {
  try {
    // Utiliser l'API Google Gemini
    const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return { error: 'Erreur de configuration: Clé API Google Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }

    // Préparer la requête pour Gemini
    const requestBody = prepareGeminiRequest(productData, categories, options);

    // Appeler l'API Gemini
    const data = await makeGeminiApiRequest(requestBody, geminiApiKey);
    let generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    // Analyser le contenu JSON
    let parsedContent;
    try {
      // Essayer de trouver un objet JSON dans la réponse
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : generatedContent;
      parsedContent = JSON.parse(jsonString);
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