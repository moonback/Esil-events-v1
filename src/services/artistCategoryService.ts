import { supabase } from './supabaseClient';

export interface ArtistCategory {
  id: string;
  name: string;
  created_at?: string;
}

export const getAllArtistCategories = async (): Promise<ArtistCategory[]> => {
  const { data, error } = await supabase
    .from('artist_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const getArtistCategoryById = async (id: string): Promise<ArtistCategory> => {
  const { data, error } = await supabase
    .from('artist_categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createArtistCategory = async (category: Omit<ArtistCategory, 'id' | 'created_at'>): Promise<ArtistCategory> => {
  const { data, error } = await supabase
    .from('artist_categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateArtistCategory = async (id: string, category: Partial<ArtistCategory>): Promise<ArtistCategory> => {
  const { data, error } = await supabase
    .from('artist_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteArtistCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('artist_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};