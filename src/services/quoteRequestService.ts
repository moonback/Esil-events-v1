import { supabase } from './supabaseClient';
import { FormData } from '../components/cart/types';

export interface QuoteRequest {
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
    
    // Ajout des champs manquants
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
      
      // Envoyer un email récapitulatif automatiquement
      try {
        // Import dynamique pour éviter les dépendances circulaires
        const { sendQuoteRequestEmail, emailConfig } = await import('./emailService');
        
        // Si data est un tableau, prendre le premier élément
        const quoteRequest = Array.isArray(data) ? data[0] : data;
        
        // Vérifier si l'envoi automatique est activé
        if (emailConfig.autoSendEnabled) {
          // Utiliser l'adresse email configurée
          const recipientEmail = emailConfig.defaultRecipient;
          
          console.log(`Tentative d'envoi d'email automatique pour la demande de devis ID: ${quoteRequest.id}`);
          console.log(`Destinataire configuré: ${recipientEmail}`);
          
          // Envoyer l'email récapitulatif
          const emailResult = await sendQuoteRequestEmail(quoteRequest, recipientEmail);
          
          if (emailResult.success) {
            console.log(`Email récapitulatif envoyé avec succès à ${recipientEmail}`);
          } else {
            console.error(`Échec de l'envoi automatique d'email: ${emailResult.message}`);
            // Enregistrer l'erreur dans un journal ou une base de données si nécessaire
          }
        } else {
          console.log('Envoi automatique d\'email désactivé dans la configuration');
        }
      } catch (emailError) {
        console.error('Erreur non gérée lors de l\'envoi de l\'email récapitulatif:', emailError);
        // Journaliser plus de détails sur l'erreur
        if (emailError instanceof Error) {
          console.error('Message d\'erreur:', emailError.message);
          console.error('Stack trace:', emailError.stack);
        }
        // Ne pas bloquer le processus si l'envoi d'email échoue
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