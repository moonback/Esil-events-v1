import { supabase } from './supabaseClient';

// Interface pour les réalisations
export interface Realization {
  id: string;
  title: string;
  location: string;
  objective: string;
  mission: string;
  images: string[];
  category?: string;
  event_date?: string;
  testimonial?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RealizationFormData extends Omit<Realization, 'id' | 'created_at' | 'updated_at'> {
    event_Date: string | number | readonly string[] | undefined;
}

// Récupérer toutes les réalisations
export const getAllRealizations = async (): Promise<Realization[]> => {
  try {
    const { data, error } = await supabase
      .from('realizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des réalisations:', error);
      throw error;
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      location: item.location,
      objective: item.objective,
      mission: item.mission,
      images: item.images || [],
      category: item.category,
      event_date: item.event_date,
      testimonial: item.testimonial,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at)
    }));
  } catch (error) {
    console.error('Erreur dans getAllRealizations:', error);
    throw error;
  }
};

// Récupérer une réalisation par son ID
export const getRealizationById = async (id: string): Promise<Realization> => {
  try {
    const { data, error } = await supabase
      .from('realizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération de la réalisation ${id}:`, error);
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      location: data.location,
      objective: data.objective,
      mission: data.mission,
      images: data.images || [],
      category: data.category,
      event_date: data.event_date,
      testimonial: data.testimonial,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erreur dans getRealizationById:', error);
    throw error;
  }
};

// Créer une nouvelle réalisation
export const createRealization = async (realizationData: RealizationFormData): Promise<string> => {
  try {
    // Récupérer la session utilisateur actuelle
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Vous devez être connecté pour créer une réalisation');
    }
    
    const userId = session.user.id;
    
    const { data, error } = await supabase
      .from('realizations')
      .insert([
        {
          title: realizationData.title,
          location: realizationData.location,
          objective: realizationData.objective,
          mission: realizationData.mission,
          images: realizationData.images || [],
          category: realizationData.category || null,
          event_date: realizationData.event_date || null,
          testimonial: realizationData.testimonial || null,
          created_by: userId,
          updated_by: userId
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la réalisation:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Erreur dans createRealization:', error);
    throw error;
  }
};

// Mettre à jour une réalisation existante
export const updateRealization = async (id: string, realizationData: RealizationFormData): Promise<void> => {
  try {
    // Récupérer la session utilisateur actuelle
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Vous devez être connecté pour mettre à jour une réalisation');
    }
    
    const userId = session.user.id;
    
    const { error } = await supabase
      .from('realizations')
      .update({
        title: realizationData.title,
        location: realizationData.location,
        objective: realizationData.objective,
        mission: realizationData.mission,
        images: realizationData.images || [],
        category: realizationData.category || null,
        event_date: realizationData.event_date || null,
        testimonial: realizationData.testimonial || null,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la mise à jour de la réalisation ${id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur dans updateRealization:', error);
    throw error;
  }
};

// Supprimer une réalisation
export const deleteRealization = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('realizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de la réalisation ${id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur dans deleteRealization:', error);
    throw error;
  }
};