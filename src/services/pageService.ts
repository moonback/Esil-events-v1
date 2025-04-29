import { supabase } from './supabaseClient';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'auto_draft';
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
  updated_at?: string;
  author_id?: string;
  last_edited?: string;
}

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'auto_draft';
  meta_description?: string;
  meta_keywords?: string;
  author_id?: string;
  custom_prompt?: string;
}

// Fetch all pages
export const getAllPages = async (): Promise<Page[]> => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des pages:', error);
      throw new Error(`Échec de la récupération des pages: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pages:', error);
    throw error;
  }
};

// Fetch a single page by ID
export const getPageById = async (id: string): Promise<Page | null> => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération de la page ${id}:`, error);
      throw new Error(`Échec de la récupération de la page: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page ${id}:`, error);
    throw error;
  }
};

// Fetch a single page by slug
export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Erreur lors de la récupération de la page avec slug ${slug}:`, error);
      throw new Error(`Échec de la récupération de la page: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page avec slug ${slug}:`, error);
    throw error;
  }
};

// Create a new page
export const createPage = async (pageData: PageFormData): Promise<Page> => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .insert([{
        ...pageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la page:', error);
      throw new Error(`Échec de la création de la page: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la page:', error);
    throw error;
  }
};

// Update an existing page
export const updatePage = async (id: string, pageData: Partial<PageFormData>): Promise<Page> => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .update({
        ...pageData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour de la page ${id}:`, error);
      throw new Error(`Échec de la mise à jour de la page: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la page ${id}:`, error);
    throw error;
  }
};

// Delete a page
export const deletePage = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de la page ${id}:`, error);
      throw new Error(`Échec de la suppression de la page: ${error.message}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la page ${id}:`, error);
    throw error;
  }
};