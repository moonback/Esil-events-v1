import { supabase } from './supabaseClient';
import { FormData } from '../components/cart/types';
import { sendQuoteRequestConfirmation, sendAdminNotification } from './emailService';

export interface QuoteRequest {
  id?: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  event_date: Date;
  event_duration: string;
  description: string;
  items: any[];
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // Billing information
  customer_type: 'particular' | 'professional';
  billing_address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  
  // Event details
  event_start_time?: string | null;
  event_end_time?: string | null;
  guest_count?: number | null;
  event_location?: string | null;
  
  // Delivery information
  delivery_type?: string | null;
  pickup_date?: string | null;
  delivery_date?: string | null;
  delivery_time_slot?: string | null;
  delivery_address?: string | null;
  delivery_postal_code?: string | null;
  delivery_city?: string | null;
  exterior_access?: string | null;
  interior_access?: string | null;
  elevator_width?: number | null;
  elevator_height?: number | null;
  elevator_depth?: number | null;
  
  // Pickup information
  pickup_return_date?: string | null;
  pickup_return_start_time?: string | null;
  pickup_return_end_time?: string | null;
  
  // Comments and terms
  comments?: string | null;
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
    event_date: new Date(formData.eventDate),
    event_duration: formData.eventDuration,
    description: formData.description || `Événement ${formData.eventLocation === 'Intérieur' ? 'en intérieur' : 'en extérieur'} pour ${formData.guestCount} personnes.`,
    status: 'pending', // Default status as per DB schema
    
    // Billing information
    customer_type: formData.customerType || 'particular', // Default value as per DB schema
    billing_address: formData.billingAddress,
    postal_code: formData.postalCode,
    city: formData.city,
    
    // Event details
    event_start_time: formData.eventStartTime,
    event_end_time: formData.eventEndTime,
    guest_count: formData.guestCount,
    event_location: formData.eventLocation,
    
    // Delivery information
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
    
    // Pickup information
    pickup_return_date: formData.pickupReturnDate,
    pickup_return_start_time: formData.pickupReturnStartTime,
    pickup_return_end_time: formData.pickupReturnEndTime,
    
    // Comments and terms
    comments: formData.comments,
    terms_accepted: formData.termsAccepted ?? true, // Default value as per DB schema
    
    // Items information
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