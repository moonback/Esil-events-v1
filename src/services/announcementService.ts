import announcementsData from '../data/announcements.json';
import { supabase } from './supabaseClient';

export interface Announcement {
  id: number;
  message: string;
  link?: string;
  active: boolean;
  background_color?: string;
  text_color?: string;
}

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  try {
    return announcementsData.announcements.filter(announcement => announcement.active);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement | null> => {
  const { data, error } = await supabase
    .from('announcements')
    .insert([announcement])
    .select()
    .single();

  if (error) {
    console.error('Error creating announcement:', error);
    return null;
  }

  return data;
};

export const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<Announcement | null> => {
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating announcement:', error);
    return null;
  }

  return data;
};

export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }

  return true;
};