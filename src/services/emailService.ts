import { FormData } from '../components/cart/types';
import { CartItem } from '../context/CartContext';

// Fonction pour envoyer le devis par email via l'API
export const sendQuoteEmail = async (formData: FormData, items: CartItem[]) => {
  try {
    const response = await fetch('/api/send-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData, items })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du devis:', error);
    return { success: false, error: 'Erreur lors de l\'envoi du devis' };
  }
};