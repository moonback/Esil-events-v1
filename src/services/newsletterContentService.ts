import { ProductFormData } from '../types/Product';

/**
 * Service pour générer du contenu HTML pour les newsletters à l'aide de l'API Gemini
 */

// Interface pour les options de génération de contenu de newsletter
export interface NewsletterContentOptions {
  theme?: string;
  tone?: 'formal' | 'friendly' | 'promotional';
  includeProducts?: boolean;
  selectedProducts?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
  }>;
  targetAudience?: string;
  contentLength?: 'short' | 'medium' | 'long';
}

/**
 * Prépare les données pour la génération de contenu de newsletter
 */
export const prepareNewsletterContentPrompt = (options?: NewsletterContentOptions) => {
  // Adapter le message système en fonction des options
  let systemContent = "Tu es un expert en marketing digital spécialisé dans la création de newsletters pour le secteur événementiel. ";
  systemContent += "Tu excelles dans la rédaction de contenus HTML engageants et optimisés pour les emails marketing. ";
  
  // Ajuster le ton en fonction des options
  if (options?.tone === 'formal') {
    systemContent += "Utilise un ton formel, professionnel et élégant. ";
  } else if (options?.tone === 'friendly') {
    systemContent += "Utilise un ton amical, chaleureux et conversationnel. ";
  } else if (options?.tone === 'promotional') {
    systemContent += "Utilise un ton promotionnel, persuasif et orienté conversion. ";
  } else {
    systemContent += "Ton professionnel mais chaleureux, ";
  }
  
  // Ajouter les principes clés
  systemContent += "Principes clés : créer un contenu visuellement attrayant, utiliser des appels à l'action clairs, structurer le contenu pour une lecture facile, optimiser pour les appareils mobiles. ";
  
  // Définir la structure de base
  systemContent += "Structure : En-tête accrocheur avec logo ESIL Events, introduction personnalisée, ";
  
  // Inclure des produits si l'option est activée
  if (options?.includeProducts !== false) {
    systemContent += "section de mise en avant des produits/services avec images et descriptions, ";
  }
  
  // Compléter la structure
  systemContent += "témoignage client, offre spéciale ou promotion, pied de page avec coordonnées et liens sociaux.";
  
  // Ajuster la longueur du contenu
  if (options?.contentLength === 'short') {
    systemContent += " Génère un contenu concis et direct, en te concentrant sur l'essentiel.";
  } else if (options?.contentLength === 'long') {
    systemContent += " Génère un contenu détaillé et complet, en expliquant tous les aspects de l'offre.";
  }
  
  const systemMessage = {
    role: "system",
    content: systemContent
  };

  // Construire le message utilisateur avec les instructions spécifiques
  let userContent = `Génère un contenu HTML pour une newsletter ESIL Events`;
  
  // Ajouter le thème si spécifié
  if (options?.theme) {
    userContent += ` sur le thème "${options.theme}"`;
  }
  
  userContent += `.\n\n`;
  
  // Ajouter des informations sur l'audience cible si spécifiées
  if (options?.targetAudience) {
    userContent += `AUDIENCE CIBLE:\n${options.targetAudience}\n\n`;
  }
  
  // Ajouter des informations sur les produits sélectionnés si disponibles
  if (options?.selectedProducts && options.selectedProducts.length > 0) {
    userContent += `PRODUITS À INCLURE DANS LA NEWSLETTER:\n`;
    options.selectedProducts.forEach((product, index) => {
      userContent += `Produit ${index + 1}:\n`;
      userContent += `- Nom: ${product.name}\n`;
      userContent += `- Description: ${product.description}\n`;
      userContent += `- Prix: ${product.price.toFixed(2)}€\n`;
      if (product.imageUrl) {
        userContent += `- Image: ${product.imageUrl}\n`;
      }
      userContent += `\n`;
    });
    userContent += `\n`;
  }
  
  // Ajouter les instructions spécifiques
  userContent += `INSTRUCTIONS SPÉCIFIQUES POUR L'IA :\n`;
  userContent += `1. Crée un contenu HTML complet et prêt à l'emploi pour une newsletter.\n`;
  userContent += `2. Utilise une structure responsive adaptée aux emails.\n`;
  userContent += `3. Inclus des styles inline pour assurer la compatibilité avec les clients mail.\n`;
  userContent += `4. Utilise une palette de couleurs élégante (violet #8b5cf6, noir #000000, blanc #ffffff, gris #f3f4f6).\n`;
  userContent += `5. Intègre le logo et la marque ESIL Events centrer url https://esil-events.fr/images/logo.png.\n`;
  userContent += `6. Ajoute des espaces pour insérer des images (avec commentaires <!-- IMAGE: description -->) aux endroits appropriés.\n`;
  userContent += `7. Inclus des appels à l'action clairs et attractifs.\n`;
  userContent += `8. Assure-toi que le contenu soit engageant et orienté conversion.\n`;
  
  // Instructions spécifiques pour les produits
  if (options?.selectedProducts && options.selectedProducts.length > 0) {
    userContent += `9. Intègre les produits fournis dans une section dédiée de la newsletter avec leur nom, description, prix et image.\n`;
    userContent += `10. Pour chaque produit, crée un bloc HTML attrayant avec un bouton "Voir le produit" ou "En savoir plus".\n`;
    userContent += `11. Organise les produits de manière visuellement attrayante, en utilisant une mise en page adaptée au nombre de produits.\n`;
    userContent += `12. Ajoute un pied de page avec les informations légales et un lien de désabonnement.\n`;
    userContent += `13. Fournis uniquement le code HTML complet, sans explications supplémentaires.\n`;
  } else {
    userContent += `9. Ajoute un pied de page avec les informations légales et un lien de désabonnement.\n`;
    userContent += `10. Fournis uniquement le code HTML complet, sans explications supplémentaires.\n`;
  }
  
  const userMessage = {
    role: "user",
    content: userContent
  };

  const messages = [systemMessage, userMessage];

  return { messages };
};

/**
 * Génère du contenu HTML pour une newsletter en utilisant l'API Gemini
 */
export const generateNewsletterContent = async (
  options?: NewsletterContentOptions
): Promise<{ content?: string; error?: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { error: 'Erreur de configuration: Clé API Gemini manquante (VITE_GOOGLE_GEMINI_API_KEY).' };
    }

    const { messages } = prepareNewsletterContentPrompt(options);

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
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Gemini:', errorText);
      return { 
        error: `Erreur lors de la génération du contenu: ${response.status} ${response.statusText}` 
      };
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedContent) {
      return { error: 'Aucun contenu généré par l\'API.' };
    }

    return { content: generatedContent };
  } catch (err) {
    console.error('Erreur détaillée lors de la génération du contenu de newsletter:', err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
};