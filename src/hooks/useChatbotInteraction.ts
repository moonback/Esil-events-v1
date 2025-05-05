import { useState, useCallback } from 'react';
import { Product } from '../types/Product';
import { generateChatbotResponse, generateDynamicSuggestions } from '../services/chatbotService';

/**
 * Options pour le hook useChatbotInteraction
 */
interface UseChatbotInteractionOptions {
  enableCache?: boolean;
}

/**
 * Hook personnalisé pour gérer les interactions avec le chatbot
 */
export const useChatbotInteraction = (options: UseChatbotInteractionOptions = {}) => {
  const { enableCache = false } = options;

  // États pour les suggestions et le chargement
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuggestionsButton, setShowSuggestionsButton] = useState(true);
  const [searchAnchor, setSearchAnchor] = useState<string>('');

  /**
   * Générer une réponse basée sur la question et les produits disponibles
   */
  const generateResponse = useCallback(async (
    question: string,
    products: Product[],
    messageHistory: { text: string, sender: 'user' | 'bot' }[],
    contextualInfo?: string
  ): Promise<{text: string, source?: 'google' | 'fallback' | 'cache'}> => {
    try {
      // Construire un ancrage de recherche enrichi avec le contexte
      let enrichedAnchor = searchAnchor.trim();
      let enhancedQuestion = question;
      
      // Ajouter des informations contextuelles à la question si fournies
      if (contextualInfo) {
        enhancedQuestion = `${contextualInfo}\n\nQuestion: ${question}`;
      }
      
      // Utiliser le service chatbot pour générer une réponse
      const result = await generateChatbotResponse(
        enhancedQuestion, 
        products,
        messageHistory,
        undefined,
        enrichedAnchor || undefined,
        enableCache
      );
      
      if (result.error) {
        return {
          text: `Désolé, je ne peux pas répondre pour le moment: ${result.error}`,
          source: result.source as 'google' | 'fallback' | 'cache' | undefined
        };
      }
      
      return {
        text: result.response || "Désolé, je n'ai pas pu générer une réponse.",
        source: result.source
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      return {
        text: "Désolé, une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer plus tard."
      };
    }
  }, [searchAnchor, enableCache]);

  /**
   * Générer une réponse spécifique pour une comparaison de produits
   */
  const generateComparisonResponse = useCallback(async (
    question: string,
    productsToCompare: Product[],
    products: Product[],
    messageHistory: { text: string, sender: 'user' | 'bot' }[]
  ): Promise<{text: string, source?: 'google' | 'fallback' | 'cache'}> => {
    if (productsToCompare.length < 2) {
      return {
        text: "Je ne peux pas générer de comparaison car je n'ai pas identifié assez de produits à comparer. Veuillez mentionner au moins deux produits."
      };
    }

    try {
      // Ajouter une instruction spécifique pour la comparaison
      const comparisonInstruction = `
[INSTRUCTION SPÉCIALE: COMPARAISON DE PRODUITS]
Veuillez présenter une comparaison détaillée sous forme de tableau entre les produits suivants: ${productsToCompare.map(p => p.name).join(', ')}.

Incluez dans votre comparaison:
1. Prix TTC
2. Caractéristiques techniques principales
3. Avantages et inconvénients
4. Cas d'usage recommandés
5. Disponibilité

Présentez cette comparaison sous forme de tableau markdown pour une meilleure lisibilité.
`;
      
      const enhancedQuestion = `${comparisonInstruction}\n\nQuestion originale: ${question}`;
      
      // Utiliser le service chatbot avec les paramètres spécifiques pour la comparaison
      const result = await generateChatbotResponse(
        enhancedQuestion,
        products,
        messageHistory,
        1200, // Valeur fixe pour les comparaisons
        searchAnchor || undefined,
        enableCache
      );
      
      if (result.error) {
        return {
          text: `Désolé, je ne peux pas générer la comparaison pour le moment: ${result.error}`,
          source: result.source as 'google' | 'fallback' | 'cache' | undefined
        };
      }
      
      return {
        text: result.response || "Désolé, je n'ai pas pu générer la comparaison demandée.",
        source: result.source
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la comparaison:', error);
      return {
        text: "Désolé, une erreur s'est produite lors de la génération de la comparaison. Veuillez réessayer plus tard."
      };
    }
  }, [searchAnchor, enableCache]);

  /**
   * Générer des suggestions de questions basées sur les messages et les produits
   */
  const updateSuggestions = useCallback((products: Product[], messageHistory: { text: string, sender: 'user' | 'bot' }[]) => {
    const newSuggestions = generateDynamicSuggestions(products, messageHistory);
    setSuggestions(newSuggestions);
  }, []);

  return {
    isLoading,
    setIsLoading,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    showSuggestionsButton,
    setShowSuggestionsButton,
    searchAnchor,
    setSearchAnchor,
    generateResponse,
    generateComparisonResponse,
    updateSuggestions,
    enableCache
  };
};