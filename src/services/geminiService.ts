import { Product } from '../types/Product';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiRequestPayload {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
}

interface GeminiResponsePart {
  text: string;
}

interface GeminiResponseCandidate {
  content: {
    parts: GeminiResponsePart[];
    role: string;
  };
}

interface GeminiAPIResponse {
  candidates?: GeminiResponseCandidate[];
  promptFeedback?: any;
}

interface Suggestion {
  productId: string;
  reason: string;
}

interface GeminiResponse {
  suggestions: Suggestion[];
  summary: string;
}

function extractJsonFromText(text: string): GeminiResponse {
  // Supprimer les backticks et le mot "json" s'ils sont présents
  const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.log('Raw text:', text);
    console.log('Cleaned text:', jsonStr);
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

function formatExplanation(suggestions: Suggestion[], summary: string): string {
  let formattedText = summary + '\n\n';
  
  suggestions.forEach((suggestion, index) => {
    formattedText += `${index + 1}. ${suggestion.reason}\n`;
  });
  
  return formattedText;
}

export async function getProductSuggestions(
  userQuery: string,
  availableProducts: Product[]
): Promise<{ suggestions: Product[]; explanation: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!userQuery.trim()) {
    throw new Error("La requête ne peut pas être vide.");
  }

  // Préparer les données des produits pour le prompt
  const productsInfo = availableProducts.map(p => ({
    id: p.id,
    name: p.name,
    reference: p.reference,
    category: p.category,
    subCategory: p.subCategory,
    subSubCategory: p.subSubCategory,
    description: p.description,
    priceHT: p.priceHT,
    priceTTC: p.priceTTC,
    images: p.images,
    mainImageIndex: p.mainImageIndex,
    colors: p.colors,
    technicalSpecs: p.technicalSpecs,
    technicalDocUrl: p.technicalDocUrl,
    videoUrl: p.videoUrl,
    isAvailable: p.isAvailable,
    slug: p.slug,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    seo_keywords: p.seo_keywords
  }));

  const prompt = `
    Expert en location de matériel événementiel, analysez la demande et proposez les produits adaptés.
    
    Demande de l'utilisateur: "${userQuery}"
    
    Produits disponibles:
    ${JSON.stringify(productsInfo, null, 2)}
    
    Instructions importantes:
    1. Analysez précisément la demande de l'utilisateur
    2. Sélectionnez UNIQUEMENT les produitsa louer qui correspondent DIRECTEMENT à la demande
    3. Limitez-vous à 6 produits maximum pertinent pour le context de la demande
    4. Pour chaque produit, expliquez brièvement pourquoi il correspond à la demande en utilisant les informations détaillées disponibles (caractéristiques techniques, catégories, etc.)
    5. Fournissez un résumé concis de la sélection
    
    IMPORTANT: Répondez UNIQUEMENT avec un objet JSON valide, sans aucun texte supplémentaire ni backticks.
    Format de réponse attendu:
    {
      "suggestions": [
        {
          "productId": "id1",
          "reason": "Explication détaillée utilisant les caractéristiques techniques et catégories du produit (max 3 phrases)"
        }
      ],
      "summary": "Résumé concis en 2-3 phrases maximum"
    }
  `;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.statusText}`);
    }

    const data: GeminiAPIResponse = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const parsedResponse = extractJsonFromText(responseText);

    // Vérifier que la réponse contient les champs requis
    if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions) || !parsedResponse.summary) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Filtrer les produits suggérés
    const suggestedProducts = availableProducts.filter(p => 
      parsedResponse.suggestions.some(s => s.productId === p.id)
    );

    // Formater l'explication
    const formattedExplanation = formatExplanation(parsedResponse.suggestions, parsedResponse.summary);

    return {
      suggestions: suggestedProducts,
      explanation: formattedExplanation
    };
  } catch (error) {
    console.error("Error getting product suggestions:", error);
    throw error;
  }
} 