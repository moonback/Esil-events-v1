import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  CartItemList,
  CartSummary,
  EmptyCart,
  CheckoutForm,
  SuccessMessage,
  FormData
} from '../components/cart';
import { createQuoteRequest } from '../services/quoteRequestService';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Gestion de la soumission du formulaire
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Envoyer les données à Supabase
      const { data, error } = await createQuoteRequest(formData, items);
      
      if (error) {
        console.error('Erreur lors de la création de la demande de devis:', error);
        alert('Une erreur est survenue lors de l\'envoi de votre demande de devis. Veuillez réessayer.');
        return;
      }
      
      console.log('Demande de devis créée avec succès:', data);
      
      // Afficher le message de succès et vider le panier
      setFormSubmitted(true);
      clearCart();
    } catch (error) {
      console.error('Erreur lors de la création de la demande de devis:', error);
      alert('Une erreur est survenue lors de l\'envoi de votre demande de devis. Veuillez réessayer.');
    }
  };

  // Afficher le message de succès si le formulaire a été soumis
  if (formSubmitted) {
    return <SuccessMessage 
      title="Demande de devis envoyée !"
      message="Nous avons bien reçu votre demande de devis. Notre équipe va l'étudier et vous contactera dans les plus brefs délais."
      buttonText="Retour à l'accueil"
      buttonLink="/"
    />;
  }

  return (
    <div className="min-h-screen pt-44 pb-16 px-4">
      <div className="container-custom mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Votre devis ({items.reduce((total, item) => total + item.quantity, 0)} articles)
        </h1>
        
        {items.length === 0 ? (
          <EmptyCart />
        ) : !showForm ? (
          <>
            <CartItemList 
              items={items} 
              removeFromCart={removeFromCart} 
              updateQuantity={updateQuantity} 
            />
            <CartSummary 
              items={items} 
              onCheckoutClick={() => setShowForm(true)} 
            />
          </>
        ) : (
          <CheckoutForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => setShowForm(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;