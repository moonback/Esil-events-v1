// Fonction serverless pour le chatbot
// Cette fonction reçoit les messages du chatbot, interroge la base de données Supabase
// et appelle l'API du modèle de langage pour générer une réponse

const { createClient } = require('@supabase/supabase-js');

// Initialisation du client Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.VITE_GOOGLE_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!geminiApiKey) {
  throw new Error('Missing Google Gemini API Key');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Analyse l'intention de l'utilisateur à partir de son message
 * @param {string} message Le message de l'utilisateur
 * @returns {string} Le type d'intention identifié
 */
const analyzeIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Recherche de produits
  if (
    lowerMessage.includes('cherche') ||
    lowerMessage.includes('recherche') ||
    lowerMessage.includes('trouve') ||
    lowerMessage.includes('avez-vous') ||
    lowerMessage.includes('avez vous') ||
    lowerMessage.includes('proposez') ||
    lowerMessage.includes('vendez')
  ) {
    return 'product_search';
  }
  
  // Information sur un produit
  if (
    lowerMessage.includes('information') ||
    lowerMessage.includes('détail') ||
    lowerMessage.includes('caractéristique') ||
    lowerMessage.includes('spécification') ||
    lowerMessage.includes('prix de') ||
    lowerMessage.includes('coûte') ||
    lowerMessage.includes('disponible')
  ) {
    return 'product_info';
  }
  
  // Question générale par défaut
  return 'general_question';
};

/**
 * Extrait les mots-clés pertinents d'un message
 * @param {string} message Le message de l'utilisateur
 * @returns {string[]} Un tableau de mots-clés
 */
const extractKeywords = (message) => {
  // Liste de mots à ignorer (articles, prépositions, etc.)
  const stopWords = [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux',
    'et', 'ou', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
    'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur',
    'pour', 'par', 'en', 'dans', 'sur', 'sous', 'avec', 'sans', 'chez',
    'qui', 'que', 'quoi', 'dont', 'où', 'comment', 'pourquoi', 'quand',
    'est', 'sont', 'sera', 'seront', 'était', 'étaient', 'avoir', 'avez',
    'cherche', 'recherche', 'information', 'détail', 'besoin', 'veux', 'voudrais'
  ];
  
  // Nettoyer et tokenizer le message
  const words = message
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/);
  
  // Filtrer les mots vides et les mots trop courts
  return words
    .filter(word => !stopWords.includes(word) && word.length > 2)
    .slice(0, 5); // Limiter à 5 mots-clés maximum
};

/**
 * Recherche des produits dans Supabase
 * @param {string} query La requête de recherche
 * @returns {Promise<Array>} Les produits trouvés
 */
const searchProducts = async (query) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Formater les données pour le chatbot
    return data.map((product) => ({
      id: product.id,
      name: product.name,
      reference: product.reference,
      category: product.category,
      subCategory: product.sub_category,
      subSubCategory: product.sub_sub_category || '',
      description: product.description,
      priceHT: parseFloat(product.price_ht),
      priceTTC: parseFloat(product.price_ttc),
      stock: product.stock,
      isAvailable: product.is_available,
      images: product.images || [],
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

/**
 * Prépare le prompt pour le modèle de langage
 * @param {string} message Le message de l'utilisateur
 * @param {Array} history L'historique de la conversation
 * @param {string} productContext Le contexte des produits trouvés
 * @returns {string} Le prompt formaté
 */
const preparePrompt = (message, history, productContext) => {
  const historyText = history
    .slice(-6) // Limiter à 6 derniers messages pour éviter un prompt trop long
    .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  return `
    Tu es un assistant chatbot pour ESIL Events, une entreprise de location de matériel événementiel.
    Ton but est d'aider les utilisateurs à trouver des produits, obtenir des informations et faire des suggestions.
    Sois amical, professionnel et concis. Utilise les informations de la base de données fournies lorsque c'est pertinent.

    Historique de la conversation:
    ${historyText}

    Informations produits pertinentes (si disponibles):
    ${productContext}

    Question de l'utilisateur: ${message}

    Ta réponse:
  `;
};

/**
 * Appelle l'API Google Gemini pour générer une réponse
 * @param {string} prompt Le prompt à envoyer à l'API
 * @returns {Promise<string>} La réponse générée
 */
const callGeminiApi = async (prompt) => {
  try {
    // Préparer la requête pour Gemini
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
        maxOutputTokens: 800,
        topP: 0.9
      }
    };

    // Appeler l'API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Google (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedContent) {
      throw new Error("La réponse de l'API est vide ou mal structurée.");
    }

    return generatedContent;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

/**
 * Handler de la fonction serverless
 */
exports.handler = async (event, context) => {
  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Analyser le corps de la requête
    const { message, history } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Message is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // 1. Analyser l'intention
    const intent = analyzeIntent(message);

    // 2. Rechercher des produits pertinents si nécessaire
    let productContext = '';
    if (intent === 'product_search' || intent === 'product_info') {
      const keywords = extractKeywords(message);
      if (keywords.length > 0) {
        const products = await searchProducts(keywords.join(' '));

        if (products.length > 0) {
          productContext = `Voici quelques produits pertinents trouvés dans la base de données:\n`;
          productContext += products.slice(0, 3).map(p =>
            `- ${p.name} (Réf: ${p.reference}, Prix: ${p.priceTTC.toFixed(2)}€, Stock: ${p.stock > 0 ? 'Disponible' : 'Indisponible'}): ${p.description.substring(0, 100)}...`
          ).join('\n');
          productContext += `\nRéponds à la question de l'utilisateur en te basant sur ces informations si elles sont pertinentes. Sinon, indique que tu n'as pas trouvé d'information spécifique mais propose d'explorer les catégories.`;
        } else {
          productContext = "Aucun produit spécifique correspondant n'a été trouvé dans la base de données. Propose à l'utilisateur d'explorer les catégories ou de reformuler sa question.";
        }
      }
    }

    // 3. Préparer le prompt
    const prompt = preparePrompt(message, history || [], productContext);

    // 4. Appeler l'API du LLM
    const llmResponse = await callGeminiApi(prompt);

    // 5. Renvoyer la réponse
    return {
      statusCode: 200,
      body: JSON.stringify({ response: llmResponse }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error: ${error.message}` }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};