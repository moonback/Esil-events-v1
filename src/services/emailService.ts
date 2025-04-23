import { FormData } from '../components/cart/types';
import { CartItem } from '../context/CartContext';

// Fonction pour envoyer le devis par email via l'API Express
export const sendQuoteEmail = async (formData: FormData, items: CartItem[]) => {
  try {
    const response = await fetch('http://localhost:3001/api/send-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData, items })
    });
    console.log('Statut de la réponse:', response.status);
    let data;
    try {
      data = await response.json();
      console.log('Réponse JSON du serveur:', data);
    } catch (e) {
      console.error('Erreur lors du parsing JSON:', e);
      data = { success: false, error: "Réponse du serveur invalide" };
    }
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du devis:', error);
    return { success: false, error: 'Erreur lors de l\'envoi du devis' };
  }
};