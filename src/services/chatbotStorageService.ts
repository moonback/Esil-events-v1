import { supabase } from './supabaseClient';
import { ChatMessage } from './chatbotService';

/**
 * Service pour gérer le stockage des conversations et messages du chatbot dans Supabase
 */

// Interface pour les conversations du chatbot dans Supabase
export interface ChatbotConversation {
  id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface pour les messages du chatbot dans Supabase
export interface ChatbotMessageDB {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  created_at?: string;
}

/**
 * Crée une nouvelle conversation dans Supabase
 * @param userId ID de l'utilisateur (optionnel)
 * @returns L'ID de la conversation créée
 */
export const createConversation = async (userId?: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert([
        { user_id: userId || null }
      ])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error: any) {
    console.error('Erreur lors de la création de la conversation:', error.message);
    throw error;
  }
};

/**
 * Sauvegarde un message dans Supabase
 * @param message Le message à sauvegarder
 * @returns Le message sauvegardé
 */
export const saveMessage = async (message: ChatMessage): Promise<ChatbotMessageDB> => {
  try {
    if (!message.conversationId) {
      throw new Error('ID de conversation manquant');
    }

    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert([
        {
          conversation_id: message.conversationId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp.toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du message:', error.message);
    throw error;
  }
};

/**
 * Récupère tous les messages d'une conversation
 * @param conversationId ID de la conversation
 * @returns Liste des messages de la conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Convertir les données de la base en objets ChatMessage
    return data.map((msg: ChatbotMessageDB) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp || msg.created_at || ''),
      conversationId: msg.conversation_id
    }));
  } catch (error: any) {
    console.error('Erreur lors de la récupération des messages:', error.message);
    return [];
  }
};

/**
 * Récupère toutes les conversations d'un utilisateur
 * @param userId ID de l'utilisateur (optionnel pour les conversations anonymes)
 * @returns Liste des conversations
 */
export const getUserConversations = async (userId?: string): Promise<ChatbotConversation[]> => {
  try {
    let query = supabase
      .from('chatbot_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    // Si un userId est fourni, filtrer par cet utilisateur ou les conversations anonymes
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des conversations:', error.message);
    return [];
  }
};

/**
 * Met à jour la date de dernière modification d'une conversation
 * @param conversationId ID de la conversation
 */
export const updateConversationTimestamp = async (conversationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la conversation:', error.message);
  }
};

/**
 * Supprime une conversation et tous ses messages
 * @param conversationId ID de la conversation à supprimer
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // Grâce à ON DELETE CASCADE, la suppression de la conversation supprimera aussi tous les messages
    const { error } = await supabase
      .from('chatbot_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la conversation:', error.message);
    throw error;
  }
};