import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabaseClient';
import { Product } from '../types/Product';

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
    console.log('Starting quote suggestions generation with request:', request);

    // First, fetch relevant products from Supabase with more specific filtering
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_available', true);

    // Add category filtering based on event type
    const eventTypeToCategory: Record<string, string[]> = {
      'Séminaire': ['Mobilier', 'Sonorisation', 'Éclairage', 'Écrans'],
      'Soirée d\'entreprise': ['Mobilier', 'Sonorisation', 'Éclairage', 'Décoration'],
      'Mariage': ['Mobilier', 'Décoration', 'Éclairage', 'Sonorisation'],
      'Anniversaire': ['Mobilier', 'Décoration', 'Éclairage', 'Jeux'],
      'Festival': ['Sonorisation', 'Éclairage', 'Écrans', 'Mobilier'],
      'Autre': []
    };

    const relevantCategories = eventTypeToCategory[request.event_type] || [];
    console.log('Relevant categories for event type:', request.event_type, ':', relevantCategories);

    if (relevantCategories.length > 0) {
      query = query.in('category', relevantCategories);
    }

    // Add budget filtering if specified
    if (request.budget) {
      const maxPrice = request.budget * 1.2; // Allow 20% margin
      query = query.lte('price_ttc', maxPrice);
      console.log('Budget filter applied:', request.budget, '€ (max:', maxPrice, '€)');
    }

    // Log the final query
    console.log('Executing Supabase query...');
    let { data: products, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Failed to fetch products from database: ${error.message}`);
    }

    if (!products || products.length === 0) {
      console.log('No products found with current filters, trying without category filter...');
      
      // Try again without category filter
      const { data: allProducts, error: allProductsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (allProductsError) {
        console.error('Error fetching all products:', allProductsError);
        throw new Error(`Failed to fetch products: ${allProductsError.message}`);
      }

      if (!allProducts || allProducts.length === 0) {
        console.error('No products found in database at all');
        throw new Error('No products available in the database');
      }

      console.log('Found', allProducts.length, 'products without category filter');
      products = allProducts;
    } else {
      console.log('Found', products.length, 'products with category filter');
    }

    // Convert products to the format expected by the AI with more context
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      subCategory: product.sub_category,
      description: product.description,
      price_ttc: product.price_ttc,
      technical_specs: product.technical_specs,
      colors: product.colors,
      stock: product.stock
    }));

    console.log('Formatted products for AI:', formattedProducts.length);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Construct the prompt with enhanced context
    const prompt = `
Tu es un assistant virtuel expert d'ESIL Events. Ton rôle est d'aider les utilisateurs à composer une première liste de matériel pour leur événement en posant des questions ciblées et en faisant des suggestions personnalisées issues de notre catalogue.

Contexte de la demande :
- Type d'événement : ${request.event_type}
- Nombre d'invités : ${request.guest_count}
${request.event_date ? `- Date de l'événement : ${request.event_date}` : ''}
${request.budget ? `- Budget : ${request.budget}€` : ''}
- Style souhaité : ${request.style}
${request.specific_needs ? `- Besoins spécifiques : ${request.specific_needs}` : ''}

Voici notre catalogue de produits disponibles, filtré pour correspondre au mieux à votre événement :
${JSON.stringify(formattedProducts, null, 2)}

Instructions pour les suggestions :
1. Pour un événement de ${request.guest_count} personnes, assurez-vous de suggérer des quantités appropriées
2. Privilégiez les produits qui correspondent au style "${request.style}"
3. ${request.budget ? `Respectez le budget de ${request.budget}€` : 'Proposez des options à différents prix'}
4. Créez des packages cohérents qui fonctionnent bien ensemble
5. Incluez des produits essentiels pour ce type d'événement

En te basant sur ces informations et notre catalogue, propose 3 packages pertinents et jusqu'à 5 produits individuels complémentaires. Pour chaque suggestion, explique en une phrase pourquoi elle convient à l'événement de l'utilisateur.

Présente tes suggestions au format JSON suivant :
{
  "suggestions": [
    {
      "type": "product" | "package",
      "id": "string (doit correspondre à un ID de produit existant)",
      "name": "string",
      "reason": "string",
      "estimated_price_per_unit": number (si type=product),
      "estimated_total_price": number (si type=package),
      "items_included": string[] (si type=package)
    }
  ],
  "additional_tips": "string (conseils spécifiques pour l'événement, considérations logistiques, etc.)"
}

Assure-toi que :
1. Les IDs des produits correspondent à des produits existants dans notre catalogue
2. Les prix correspondent aux prix réels des produits
3. La réponse est un JSON valide
4. Tous les champs requis sont présents
5. Les suggestions sont adaptées à la taille de l'événement
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response text by removing markdown code block syntax
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(cleanedText) as AIResponse;
      
      // Verify that all product IDs exist in our database
      const validSuggestions = parsedResponse.suggestions.filter(suggestion => {
        const productExists = products.some(p => p.id === suggestion.id);
        if (!productExists) {
          console.warn(`Product with ID ${suggestion.id} not found in database`);
        }
        return productExists;
      });

      return {
        ...parsedResponse,
        suggestions: validSuggestions
      };
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