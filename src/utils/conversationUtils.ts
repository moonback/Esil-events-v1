/**
 * Utilitaires pour la gestion avancée du contexte de conversation
 */

/**
 * Interface pour un message de conversation
 */
export interface ConversationMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp?: Date | number;
}

/**
 * Interface pour un message avec score de pertinence
 */
interface ScoredMessage extends ConversationMessage {
  score: number;
  keywords?: string[];
}

/**
 * Mots courants à filtrer lors de l'extraction de mots-clés
 */
const COMMON_WORDS = new Set([
  // Français
  'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'pour', 'dans', 'sur',
  'avec', 'sans', 'vous', 'nous', 'ils', 'elles', 'je', 'tu', 'il', 'elle', 'ce', 'cette', 'ces',
  'mon', 'ton', 'son', 'votre', 'notre', 'leur', 'que', 'qui', 'quoi', 'dont', 'où', 'comment',
  'pourquoi', 'quand', 'est', 'sont', 'sera', 'seront', 'était', 'étaient', 'avoir', 'avez', 'avons',
  'plus', 'moins', 'très', 'peu', 'beaucoup', 'trop', 'assez', 'tout', 'tous', 'toute', 'toutes',
  // Anglais
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
  'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'should', 'now'
]);

/**
 * Extrait les mots-clés significatifs d'un texte
 * @param text Le texte à analyser
 * @param minLength Longueur minimale des mots à considérer
 * @returns Un tableau de mots-clés significatifs
 */
export const extractKeywords = (text: string, minLength: number = 4): string[] => {
  if (!text || typeof text !== 'string') return [];
  
  // Normaliser le texte (minuscules, sans ponctuation)
  const normalizedText = text.toLowerCase().replace(/[.,?!;:()\[\]{}"']/g, ' ');
  
  // Diviser en mots et filtrer
  const words = normalizedText.split(/\s+/)
    .filter(word => 
      word.length >= minLength && 
      !COMMON_WORDS.has(word) &&
      !/^\d+$/.test(word) // Exclure les nombres
    );
  
  // Compter la fréquence des mots
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Trier par fréquence et retourner les mots-clés
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15) // Limiter aux 15 mots les plus fréquents
    .map(entry => entry[0]);
};

/**
 * Calcule un score de pertinence pour un message
 * @param message Le message à évaluer
 * @param conversationKeywords Mots-clés globaux de la conversation
 * @param recentMessages Messages récents pour le contexte
 * @returns Un score de pertinence
 */
export const calculateMessageRelevance = (
  message: ConversationMessage,
  conversationKeywords: string[] = [],
  recentMessages: ConversationMessage[] = []
): number => {
  let score = 0;
  
  // 1. Longueur du message (les messages plus longs sont souvent plus informatifs)
  const lengthScore = Math.min(message.text.length / 50, 5); // Max 5 points
  score += lengthScore;
  
  // 2. Présence de questions (importantes pour comprendre les intentions)
  if (message.sender === 'user' && message.text.includes('?')) {
    score += 3;
  }
  
  // 3. Réponses du bot contenant des informations spécifiques
  if (message.sender === 'bot') {
    // Réponses contenant des chiffres (prix, dates, etc.)
    if (/\d+/.test(message.text)) score += 2;
    
    // Réponses contenant des listes ou des points structurés
    if (message.text.includes('•') || message.text.includes('-') || /\d+\./.test(message.text)) {
      score += 2;
    }
    
    // Réponses contenant des informations mises en évidence
    if (message.text.includes('**') || message.text.includes('__')) {
      score += 1.5;
    }
  }
  
  // 4. Pertinence par rapport aux mots-clés de la conversation
  if (conversationKeywords.length > 0) {
    const messageKeywords = extractKeywords(message.text);
    const keywordOverlap = messageKeywords.filter(keyword => 
      conversationKeywords.some(ck => ck.includes(keyword) || keyword.includes(ck))
    ).length;
    
    score += keywordOverlap * 1.5; // 1.5 points par mot-clé partagé
  }
  
  // 5. Pertinence par rapport aux messages récents
  if (recentMessages.length > 0) {
    const messageKeywords = extractKeywords(message.text);
    
    // Calculer la pertinence par rapport à chaque message récent
    let recentRelevance = 0;
    recentMessages.forEach(recentMsg => {
      const recentKeywords = extractKeywords(recentMsg.text);
      const overlap = messageKeywords.filter(keyword => 
        recentKeywords.some(rk => rk.includes(keyword) || keyword.includes(rk))
      ).length;
      
      recentRelevance += overlap * 0.5; // 0.5 point par mot-clé partagé avec les messages récents
    });
    
    score += recentRelevance;
  }
  
  return score;
};

/**
 * Optimise l'historique des messages pour l'envoi à l'API
 * Sélectionne intelligemment les messages les plus pertinents
 * @param messages L'historique complet des messages
 * @param maxMessages Nombre maximum de messages à retourner
 * @returns Un historique optimisé des messages
 */
export const optimizeConversationHistory = (
  messages: ConversationMessage[],
  maxMessages: number = 12
): ConversationMessage[] => {
  if (!messages || messages.length === 0) return [];
  if (messages.length <= maxMessages) return messages;
  
  // Toujours inclure le premier message (souvent le message de bienvenue avec contexte)
  const firstMessage = messages[0];
  
  // Toujours inclure les derniers messages (contexte immédiat)
  const lastMessagesCount = Math.min(5, Math.floor(maxMessages / 2));
  const lastMessages = messages.slice(-lastMessagesCount);
  
  // Nombre de messages intermédiaires à sélectionner
  const middleMessagesToSelect = maxMessages - lastMessagesCount - 1; // -1 pour le premier message
  
  // Si aucun message intermédiaire n'est nécessaire
  if (middleMessagesToSelect <= 0) {
    return [firstMessage, ...lastMessages];
  }
  
  // Pour les messages intermédiaires, sélectionner les plus pertinents
  const middleMessages = messages.slice(1, -lastMessagesCount);
  
  // Extraire les mots-clés globaux de la conversation
  const allText = messages.map(msg => msg.text).join(' ');
  const conversationKeywords = extractKeywords(allText);
  
  // Calculer les scores de pertinence pour les messages intermédiaires
  const scoredMiddleMessages: ScoredMessage[] = middleMessages.map(msg => ({
    ...msg,
    score: calculateMessageRelevance(msg, conversationKeywords, lastMessages),
    keywords: extractKeywords(msg.text)
  }));
  
  // Sélectionner les messages intermédiaires les plus pertinents
  const selectedMiddleMessages = scoredMiddleMessages
    .sort((a, b) => b.score - a.score)
    .slice(0, middleMessagesToSelect);
  
  // Trier les messages sélectionnés par ordre chronologique
  const allSelectedMessages = [
    firstMessage,
    ...selectedMiddleMessages,
    ...lastMessages
  ];
  
  // Trier par ordre chronologique si les timestamps sont disponibles
  if (allSelectedMessages[0].timestamp) {
    return allSelectedMessages.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp) || 0;
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp) || 0;
      return timeA - timeB;
    });
  }
  
  return allSelectedMessages;
};

/**
 * Compresse l'historique des messages en combinant des messages similaires
 * @param messages L'historique des messages
 * @param similarityThreshold Seuil de similarité pour combiner des messages
 * @returns Un historique compressé
 */
export const compressConversationHistory = (
  messages: ConversationMessage[],
  similarityThreshold: number = 0.7
): ConversationMessage[] => {
  if (!messages || messages.length <= 3) return messages;
  
  const result: ConversationMessage[] = [];
  let i = 0;
  
  while (i < messages.length) {
    const current = messages[i];
    result.push(current);
    
    // Ne pas compresser les 3 derniers messages pour préserver le contexte immédiat
    if (i >= messages.length - 3) {
      i++;
      continue;
    }
    
    // Chercher des messages consécutifs similaires du même expéditeur
    let j = i + 1;
    let combinedText = current.text;
    let combined = false;
    
    while (j < messages.length - 3 && messages[j].sender === current.sender) {
      const next = messages[j];
      const currentKeywords = extractKeywords(combinedText);
      const nextKeywords = extractKeywords(next.text);
      
      // Calculer la similarité entre les messages
      const overlap = currentKeywords.filter(kw => 
        nextKeywords.some(nkw => nkw.includes(kw) || kw.includes(nkw))
      ).length;
      
      const similarity = overlap / Math.max(currentKeywords.length, nextKeywords.length, 1);
      
      // Si les messages sont suffisamment similaires, les combiner
      if (similarity >= similarityThreshold) {
        combinedText += '\n' + next.text;
        j++;
        combined = true;
      } else {
        break;
      }
    }
    
    // Mettre à jour le texte du message si des combinaisons ont été effectuées
    if (combined) {
      result[result.length - 1] = {
        ...current,
        text: combinedText
      };
      i = j;
    } else {
      i++;
    }
  }
  
  return result;
};

/**
 * Formate l'historique des messages pour l'API
 * @param messages L'historique des messages
 * @returns L'historique formaté
 */
export const formatConversationHistoryForAPI = (messages: ConversationMessage[]): string => {
  if (!messages || messages.length === 0) return '';
  
  return messages.map(msg => 
    `${msg.sender === 'user' ? 'Client' : 'Assistant'}: ${msg.text}`
  ).join('\n\n');
};

/**
 * Prépare l'historique des messages de manière optimale pour l'API
 * @param messages L'historique complet des messages
 * @param maxTokens Nombre maximum de tokens à utiliser
 * @returns L'historique optimisé et formaté
 */
export const prepareOptimizedConversationHistory = (
  messages: ConversationMessage[],
  maxTokens: number = 2000
): string => {
  if (!messages || messages.length === 0) return '';
  
  // Estimer la taille en tokens (approximation: 1 token ≈ 4 caractères)
  const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
  
  // Optimiser l'historique
  const optimizedMessages = optimizeConversationHistory(messages);
  
  // Compresser l'historique si nécessaire
  const compressedMessages = compressConversationHistory(optimizedMessages);
  
  // Formater l'historique
  const formattedHistory = formatConversationHistoryForAPI(compressedMessages);
  
  // Si l'historique formaté est dans les limites, le retourner
  if (estimateTokens(formattedHistory) <= maxTokens) {
    return formattedHistory;
  }
  
  // Sinon, réduire davantage le nombre de messages
  const reducedMessages = optimizeConversationHistory(messages, 8);
  const reducedFormattedHistory = formatConversationHistoryForAPI(reducedMessages);
  
  // Si toujours trop grand, ne garder que les messages essentiels
  if (estimateTokens(reducedFormattedHistory) > maxTokens) {
    // Garder le premier message et les 3 derniers
    const minimalMessages = [
      messages[0],
      ...messages.slice(-3)
    ];
    
    return formatConversationHistoryForAPI(minimalMessages);
  }
  
  return reducedFormattedHistory;
};