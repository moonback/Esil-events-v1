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

interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

interface GeminiResponse {
  suggestions: Suggestion[];
  summary: string;
  findings?: ResearchResult['findings'];
  analysis?: ReasoningResult['analysis'];
  conclusion?: string;
}

interface ResearchResult {
  findings: Array<{
    category: string;
    products: Array<{
      productId: string;
      relevance: number;
      explanation: string;
    }>;
  }>;
  summary: string;
}

interface ReasoningResult {
  analysis: {
    eventType: string;
    requirements: string[];
    recommendations: Array<{
      productId: string;
      priority: number;
      reasoning: string;
    }>;
  };
  conclusion: string;
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
  availableProducts: Product[],
  maxSuggestions: number = 6
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
    2. Sélectionnez UNIQUEMENT les produits à louer qui correspondent DIRECTEMENT à la demande
    3. Limitez-vous à ${maxSuggestions} produits maximum pertinents pour le contexte de la demande
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

export async function performResearch(
  userQuery: string,
  availableProducts: Product[],
  maxSuggestions: number = 6
): Promise<{ findings: Product[]; explanation: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!userQuery.trim()) {
    throw new Error("La requête ne peut pas être vide.");
  }

  const productsInfo = availableProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    subSubCategory: p.subSubCategory,
    description: p.description,
    technicalSpecs: p.technicalSpecs,
    priceTTC: p.priceTTC
  }));

  const prompt = `
    En tant qu'expert en recherche de produits événementiels, analysez la demande et effectuez une recherche approfondie.
    
    Demande de l'utilisateur: "${userQuery}"
    
    Produits disponibles:
    ${JSON.stringify(productsInfo, null, 2)}
    
    Instructions de recherche:
    1. Analysez la demande en détail pour identifier tous les besoins potentiels
    2. Catégorisez les produits pertinents par type de besoin
    3. Pour chaque produit, évaluez sa pertinence (0-100) et expliquez pourquoi il correspond
    4. Limitez-vous à ${maxSuggestions} produits maximum au total
    5. Fournissez un résumé structuré des résultats
    
    IMPORTANT: Répondez UNIQUEMENT avec un objet JSON valide, sans aucun texte supplémentaire ni backticks.
    Format de réponse attendu:
    {
      "findings": [
        {
          "category": "Type de besoin",
          "products": [
            {
              "productId": "id1",
              "relevance": 85,
              "explanation": "Explication détaillée de la pertinence"
            }
          ]
        }
      ],
      "summary": "Résumé structuré des résultats"
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
        }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40
        }
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
    const parsedResponse = extractJsonFromText(responseText) as unknown as ResearchResult;

    // Vérifier que la réponse contient les champs requis
    if (!parsedResponse.findings || !Array.isArray(parsedResponse.findings) || !parsedResponse.summary) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Filtrer les produits trouvés
    const foundProducts = availableProducts.filter(p => 
      parsedResponse.findings.some(finding => 
        finding.products.some(prod => prod.productId === p.id)
      )
    );

    // Formater l'explication
    const formattedExplanation = formatResearchExplanation(parsedResponse);

    return {
      findings: foundProducts,
      explanation: formattedExplanation
    };
  } catch (error) {
    console.error("Error performing research:", error);
    throw error;
  }
}

export async function performReasoning(
  userQuery: string,
  availableProducts: Product[],
  currentCartItems?: CartItem[],
  maxSuggestions: number = 6
): Promise<{ recommendations: Product[]; explanation: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!userQuery.trim()) {
    throw new Error("La requête ne peut pas être vide.");
  }

  const productsInfo = availableProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    subSubCategory: p.subSubCategory,
    description: p.description,
    technicalSpecs: p.technicalSpecs,
    priceTTC: p.priceTTC
  }));

  const cartInfo = currentCartItems?.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity
  })) || [];

  const prompt = `
    En tant qu'expert en raisonnement événementiel, analysez la demande et fournissez des recommandations logiques.
    
    Demande de l'utilisateur: "${userQuery}"
    
    Produits disponibles:
    ${JSON.stringify(productsInfo, null, 2)}
    
    Panier actuel:
    ${JSON.stringify(cartInfo, null, 2)}
    
    Instructions de raisonnement:
    1. Identifiez le type d'événement et ses besoins spécifiques
    2. Analysez les exigences techniques et logistiques
    3. Évaluez la cohérence avec le panier actuel
    4. Proposez des recommandations prioritaires avec justification
    5. Limitez-vous à ${maxSuggestions} recommandations maximum
    
    IMPORTANT: Répondez UNIQUEMENT avec un objet JSON valide, sans aucun texte supplémentaire ni backticks.
    Format de réponse attendu:
    {
      "analysis": {
        "eventType": "Type d'événement identifié",
        "requirements": ["Liste des besoins identifiés"],
        "recommendations": [
          {
            "productId": "id1",
            "priority": 1,
            "reasoning": "Explication détaillée de la recommandation"
          }
        ]
      },
      "conclusion": "Conclusion et synthèse des recommandations"
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
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.7,
          topK: 40
        }
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
    const parsedResponse = extractJsonFromText(responseText) as unknown as ReasoningResult;

    // Vérifier que la réponse contient les champs requis
    if (!parsedResponse.analysis?.recommendations || !Array.isArray(parsedResponse.analysis.recommendations) || !parsedResponse.conclusion) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Filtrer les produits recommandés
    const recommendedProducts = availableProducts.filter(p => 
      parsedResponse.analysis.recommendations.some(rec => rec.productId === p.id)
    );

    // Formater l'explication
    const formattedExplanation = formatReasoningExplanation(parsedResponse);

    return {
      recommendations: recommendedProducts,
      explanation: formattedExplanation
    };
  } catch (error) {
    console.error("Error performing reasoning:", error);
    throw error;
  }
}

function formatResearchExplanation(research: ResearchResult): string {
  let formattedText = research.summary + '\n\n';
  
  research.findings.forEach((finding, index) => {
    formattedText += `${index + 1}. ${finding.category}:\n`;
    finding.products.forEach((product, pIndex) => {
      formattedText += `   - ${product.explanation} (Pertinence: ${product.relevance}%)\n`;
    });
    formattedText += '\n';
  });
  
  return formattedText;
}

function formatReasoningExplanation(reasoning: ReasoningResult): string {
  let formattedText = `Type d'événement: ${reasoning.analysis.eventType}\n\n`;
  
  formattedText += "Besoins identifiés:\n";
  reasoning.analysis.requirements.forEach((req, index) => {
    formattedText += `${index + 1}. ${req}\n`;
  });
  
  formattedText += "\nRecommandations:\n";
  reasoning.analysis.recommendations.forEach((rec, index) => {
    formattedText += `${index + 1}. ${rec.reasoning}\n`;
  });
  
  formattedText += `\nConclusion: ${reasoning.conclusion}`;
  
  return formattedText;
} 