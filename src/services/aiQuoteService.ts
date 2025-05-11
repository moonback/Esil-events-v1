import { GoogleGenerativeAI } from '@google/generative-ai';

interface QuoteRequest {
  event_type: string;
  guest_count: number;
  event_date?: string;
  budget?: number;
  style: string;
  specific_needs?: string;
}

interface ProductSuggestion {
  type: 'product' | 'package';
  id: string;
  name: string;
  reason: string;
  estimated_price_per_unit?: number;
  estimated_total_price?: number;
  items_included?: string[];
}

interface AIResponse {
  suggestions: ProductSuggestion[];
  additional_tips: string;
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '');

export const generateQuoteSuggestions = async (request: QuoteRequest): Promise<AIResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Construct the prompt
    const prompt = `
Tu es un assistant virtuel expert d'ESIL Events. Ton rôle est d'aider les utilisateurs à composer une première liste de matériel pour leur événement en posant des questions ciblées et en faisant des suggestions personnalisées issues de notre catalogue.

Contexte de la demande :
- Type d'événement : ${request.event_type}
- Nombre d'invités : ${request.guest_count}
${request.event_date ? `- Date de l'événement : ${request.event_date}` : ''}
${request.budget ? `- Budget : ${request.budget}€` : ''}
- Style souhaité : ${request.style}
${request.specific_needs ? `- Besoins spécifiques : ${request.specific_needs}` : ''}

En te basant sur ces informations, propose 3 packages pertinents et jusqu'à 5 produits individuels complémentaires. Pour chaque suggestion, explique en une phrase pourquoi elle convient à l'événement de l'utilisateur. Si le budget est spécifié, essaie de respecter cette contrainte.

Présente tes suggestions au format JSON suivant :
{
  "suggestions": [
    {
      "type": "product" | "package",
      "id": "string",
      "name": "string",
      "reason": "string",
      "estimated_price_per_unit": number (si type=product),
      "estimated_total_price": number (si type=package),
      "items_included": string[] (si type=package)
    }
  ],
  "additional_tips": "string"
}

Assure-toi que la réponse est un JSON valide et que tous les champs requis sont présents.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response text by removing markdown code block syntax
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(cleanedText) as AIResponse;
      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', cleanedText);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error generating quote suggestions:', error);
    throw new Error('Failed to generate quote suggestions');
  }
};