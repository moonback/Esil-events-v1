import { supabase } from './supabaseClient';
import { FormData } from '../components/cart/types';

export interface QuoteRequest {
  id?: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  event_date: string;
  event_duration: string;
  description: string;
  items: any[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Convertit les données du formulaire au format attendu par la table quote_requests
 */
const mapFormDataToQuoteRequest = (formData: FormData, cartItems: any[]): QuoteRequest => {
  return {
    first_name: formData.firstName,
    last_name: formData.lastName,
    company: formData.customerType === 'professional' ? formData.company : 'Particulier',
    email: formData.email,
    phone: formData.phone,
    event_date: formData.eventDate,
    event_duration: formData.eventDuration,
    description: formData.description || `Événement ${formData.eventLocation === 'indoor' ? 'en intérieur' : 'en extérieur'} pour ${formData.guestCount} personnes. ${formData.comments || ''}`,
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.priceTTC,
      color: item.color
    }))
  };
};

/**
 * Crée une nouvelle demande de devis dans Supabase
 */
export const createQuoteRequest = async (formData: FormData, cartItems: any[]): Promise<{ data: any; error: any }> => {
  const quoteRequestData = mapFormDataToQuoteRequest(formData, cartItems);

  try {
    // Directly insert the quote request without checking for a session or signing in anonymously
    const { data, error } = await supabase
      .from('quote_requests')
      .insert([quoteRequestData])
      .select();

    if (error) {
      console.error('Erreur lors de l\'insertion de la demande de devis:', error);
    } else {
      console.log('Demande de devis insérée avec succès');
    }

    return { data, error };
  } catch (err) {
    console.error('Exception non gérée lors de la création de la demande de devis:', err);
    return { data: null, error: err };
  }
};

/**
 * Récupère toutes les demandes de devis (pour l'administration)
 */
export const getQuoteRequests = async (): Promise<{ data: QuoteRequest[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Récupère une demande de devis par son ID
 */
export const getQuoteRequestById = async (id: string): Promise<{ data: QuoteRequest | null; error: any }> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

/**
 * Met à jour le statut d'une demande de devis
 */
export const updateQuoteRequestStatus = async (id: string, status: string): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  return { data, error };
};