import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

export interface Announcement {
  id: string;
  message: string;
  link?: string;
  active: boolean;
  start_date: string;
  end_date: string;
  background_color: string;
  text_color: string;
}

/**
 * Récupère toutes les annonces actives pour la date actuelle
 */
export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .lte('start_date', today)
      .gte('end_date', today);
    
    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getActiveAnnouncements:', error);
    return [];
  }
};

/**
 * Crée une nouvelle annonce
 */
export const createAnnouncement = async (announcement: Omit<Announcement, 'id'>): Promise<Announcement> => {
  try {
    // Vérifier que l'utilisateur est authentifié avant de créer une annonce
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Vous devez être connecté pour créer une annonce');
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Impossible de vérifier vos droits d\'administrateur');
    }
    
    if (profileData.role !== 'admin') {
      throw new Error('Vous devez avoir les droits d\'administrateur pour créer une annonce');
    }
    
    // Utiliser le service d'administration pour contourner les politiques RLS
    // Cette approche suppose que l'utilisateur a déjà été vérifié comme admin
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating announcement:', error);
      throw new Error(`Failed to create announcement: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error in createAnnouncement:', error);
    throw error;
  }
};

/**
 * Met à jour une annonce existante
 */
export const updateAnnouncement = async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .update(announcement)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating announcement:', error);
      throw new Error(`Failed to update announcement: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Announcement not found');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error in updateAnnouncement:', error);
    throw error;
  }
};

/**
 * Supprime une annonce
 */
export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting announcement:', error);
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error in deleteAnnouncement:', error);
    throw error;
  }
};

/**
 * Récupère toutes les annonces (pour l'administration)
 */
export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all announcements:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllAnnouncements:', error);
    return [];
  }
};