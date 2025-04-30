import { supabase } from './supabaseClient';
import { FormData } from '../components/cart/types';
import { sendQuoteRequestConfirmation, sendAdminNotification } from './emailService';

export interface QuoteRequest {
  billing_postal_code: string;
  billing_city: string;
  has_elevator: any;
  elevator_dimensions: string;
  floor_number: undefined;
  pickup_time_slot: string;
  comments: any; // Renommé de additional_comments pour correspondre au schéma de la BDD
  privacy_accepted: any;
  delivery_address?: string;
  delivery_date?: string;
  pickup_date?: string;
  delivery_notes?: string;
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
  
  // Informations de facturation
  customer_type?: 'particular' | 'professional';
  billing_address?: string;
  postal_code?: string;
  city?: string;
  
  // Détails de l'événement
  event_start_time?: string;
  event_end_time?: string;
  guest_count?: number;
  event_location?: 'indoor' | 'outdoor';
  
  // Informations de livraison
  delivery_type?: 'pickup' | 'eco' | 'premium';
  delivery_time_slot?: 'before9' | '9to13' | '13to19';
  delivery_postal_code?: string;
  delivery_city?: string;
  exterior_access?: 'parking' | 'street';
  interior_access?: 'stairs' | 'flat' | 'elevator';
  elevator_width?: number | null;
  elevator_height?: number | null;
  elevator_depth?: number | null;
  
  // Informations de reprise
  pickup_return_date?: string;
  pickup_return_start_time?: string;
  pickup_return_end_time?: string;
  
  // Commentaires et conditions
  comments?: string;
  terms_accepted?: boolean;
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
    description: formData.description || `Événement ${formData.eventLocation === 'indoor' ? 'en intérieur' : 'en extérieur'} pour ${formData.guestCount} personnes.`,
    
    // Propriétés manquantes requises par l'interface QuoteRequest
    billing_postal_code: formData.postalCode,
    billing_city: formData.city,
    has_elevator: formData.interiorAccess === 'elevator',
    elevator_dimensions: formData.interiorAccess === 'elevator' ? 
      `Largeur: ${formData.elevatorWidth || 'N/A'}, Hauteur: ${formData.elevatorHeight || 'N/A'}, Profondeur: ${formData.elevatorDepth || 'N/A'}` : '',
    floor_number: undefined,
    pickup_time_slot: formData.deliveryTimeSlot || '',
    comments: formData.comments, // Utilisation de 'comments' au lieu de 'additional_comments' pour correspondre au schéma de la BDD
    privacy_accepted: formData.termsAccepted,
    
    // Informations de facturation
    customer_type: formData.customerType,
    billing_address: formData.billingAddress,
    postal_code: formData.postalCode,
    city: formData.city,
    
    // Détails de l'événement
    event_start_time: formData.eventStartTime,
    event_end_time: formData.eventEndTime,
    guest_count: formData.guestCount,
    event_location: formData.eventLocation,
    
    // Informations de livraison
    delivery_type: formData.deliveryType,
    pickup_date: formData.pickupDate,
    delivery_date: formData.deliveryDate,
    delivery_time_slot: formData.deliveryTimeSlot,
    delivery_address: formData.deliveryAddress,
    delivery_postal_code: formData.deliveryPostalCode,
    delivery_city: formData.deliveryCity,
    exterior_access: formData.exteriorAccess,
    interior_access: formData.interiorAccess,
    elevator_width: formData.elevatorWidth === '' ? null : formData.elevatorWidth,
    elevator_height: formData.elevatorHeight === '' ? null : formData.elevatorHeight,
    elevator_depth: formData.elevatorDepth === '' ? null : formData.elevatorDepth,
    
    // Informations de reprise
    pickup_return_date: formData.pickupReturnDate,
    pickup_return_start_time: formData.pickupReturnStartTime,
    pickup_return_end_time: formData.pickupReturnEndTime,
    
    // Commentaires et conditions
    comments: formData.comments,
    terms_accepted: formData.termsAccepted,
    
    // Informations sur les articles
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
      
      // Envoyer un email de confirmation au client
      if (data && data.length > 0) {
        try {
          // Envoi d'email de confirmation au client
          const confirmationResult = await sendQuoteRequestConfirmation(data[0]);
          if (!confirmationResult.success) {
            console.error('Erreur lors de l\'envoi de l\'email de confirmation:', confirmationResult.error);
          }
          
          // Envoi d'une notification à l'administrateur
          const notificationResult = await sendAdminNotification(data[0]);
          if (!notificationResult.success) {
            console.error('Erreur lors de l\'envoi de la notification admin:', notificationResult.error);
          }
        } catch (emailError) {
          console.error('Exception lors de l\'envoi des emails:', emailError);
          // Ne pas bloquer le processus si l'envoi d'email échoue
        }
      }
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

/**
 * Supprime une demande de devis par son ID
 */
export const deleteQuoteRequest = async (id: string): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from('quote_requests')
    .delete()
    .eq('id', id);

  return { data, error };
};