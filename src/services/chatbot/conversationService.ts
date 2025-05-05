/**
 * Service de gestion du contexte de conversation pour le chatbot
 * Permet de stocker et récupérer le contexte de conversation pour une meilleure continuité des échanges
 */

import { optimizeConversationHistory, ConversationMessage } from '../../utils/conversationUtils';

/**
 * Interface pour gérer le contexte de conversation
 */
export interface ConversationContext {
  recentMessages: { text: string, sender: 'user' | 'bot' }[];
  keyTopics: string[];
  lastInteractionTimestamp: number;
}

// Clé de stockage pour le contexte de conversation dans localStorage
const CONVERSATION_CONTEXT_KEY = 'chatbot_conversation_context';

/**
 * Sauvegarde le contexte de conversation dans localStorage
 * @param messages L'historique des messages à sauvegarder
 */
export const saveConversationContext = (messages: { text: string, sender: 'user' | 'bot' }[]): void => {
  try {
    if (!messages || messages.length === 0) return;
    
    // Extraire les sujets clés des derniers messages (mots importants)
    const extractKeyTopics = (msgs: { text: string, sender: 'user' | 'bot' }[]): string[] => {
      // Combiner tous les textes des messages
      const allText = msgs.map(m => m.text.toLowerCase()).join(' ');
      
      // Filtrer les mots courants et garder les mots significatifs
      const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'pour', 'dans', 'sur', 'avec', 'sans', 'vous', 'nous', 'ils', 'elles', 'je', 'tu', 'il', 'elle', 'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'votre', 'notre', 'leur']);
      
      // Extraire les mots, filtrer les mots courts et communs
      const words = allText.split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word))
        .map(word => word.replace(/[.,?!;:()]/g, ''));
      
      // Compter la fréquence des mots
      const wordFrequency: Record<string, number> = {};
      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
      
      // Trier par fréquence et prendre les 10 plus fréquents
      return Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
    };
    
    const context: ConversationContext = {
      recentMessages: messages.slice(-10), // Garder les 10 derniers messages
      keyTopics: extractKeyTopics(messages.slice(-15)), // Analyser les 15 derniers messages pour les sujets
      lastInteractionTimestamp: Date.now()
    };
    
    localStorage.setItem(CONVERSATION_CONTEXT_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du contexte de conversation:', error);
  }
};

/**
 * Récupère le contexte de conversation depuis localStorage
 * @returns Le contexte de conversation ou null si non disponible
 */
export const getConversationContext = (): ConversationContext | null => {
  try {
    const data = localStorage.getItem(CONVERSATION_CONTEXT_KEY);
    if (!data) return null;
    
    return JSON.parse(data) as ConversationContext;
  } catch (error) {
    console.error('Erreur lors de la récupération du contexte de conversation:', error);
    return null;
  }
};

/**
 * Optimise l'historique des messages pour l'envoi à l'API
 * Sélectionne intelligemment les messages les plus pertinents en utilisant l'utilitaire optimizeConversationHistory
 * @param messages L'historique des messages à optimiser
 * @param maxMessages Nombre maximum de messages à conserver (défaut: 12)
 * @returns L'historique optimisé avec uniquement les messages les plus pertinents
 */
export const optimizeMessageHistory = (messages: { text: string, sender: 'user' | 'bot' }[], maxMessages: number = 12): { text: string, sender: 'user' | 'bot' }[] => {
  if (!messages || messages.length === 0) return messages;
  
  // Si l'historique est déjà inférieur à la limite, le retourner tel quel
  if (messages.length <= maxMessages) return messages;
  
  // Convertir les messages au format attendu par optimizeConversationHistory
  const conversationMessages: ConversationMessage[] = messages.map(msg => ({
    text: msg.text,
    sender: msg.sender,
    timestamp: new Date() // Ajouter un timestamp pour le tri chronologique
  }));
  
  // Utiliser la fonction optimizeConversationHistory des utilitaires de conversation
  const optimizedMessages = optimizeConversationHistory(conversationMessages, maxMessages);
  
  // Reconvertir au format attendu par le reste du code
  return optimizedMessages.map(msg => ({
    text: msg.text,
    sender: msg.sender
  }));
};