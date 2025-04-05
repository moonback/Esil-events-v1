import { supabase } from './supabaseClient';

export interface Artist {
  id: string;
  name: string;
  category: string;
  image_url: string; // Using snake_case to match database column
  description: string;
  created_at?: string;
}

export const getAllArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const getArtistById = async (id: string): Promise<Artist> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createArtist = async (artist: Omit<Artist, 'id' | 'created_at'>): Promise<Artist> => {
  const { data, error } = await supabase
    .from('artists')
    .insert([artist])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateArtist = async (id: string, artist: Partial<Artist>): Promise<Artist> => {
  const { data, error } = await supabase
    .from('artists')
    .update(artist)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteArtist = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('artists')
    .delete()
    .eq('id', id);

  if (error) throw error;
};