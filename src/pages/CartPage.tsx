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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
          <SuccessMessage 
            title="Demande de devis envoyée !"
            message="Nous avons bien reçu votre demande de devis. Notre équipe va l'étudier et vous contactera dans les plus brefs délais."
            buttonText="Retour à l'accueil"
            buttonLink="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-16 px-4 bg-gray-50">
      <div className="container-custom mx-auto max-w-7xl">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b pb-4">
            Votre devis <span className="text-primary-600">({items.reduce((total, item) => total + item.quantity, 0)} articles)</span>
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
              <hr className="my-6 border-gray-200" />
              <CartSummary 
                items={items} 
                onCheckoutClick={() => setShowForm(true)} 
              />
            </>
          ) : (
            <div className="mt-6">
              <CheckoutForm 
                onSubmit={handleFormSubmit} 
                onCancel={() => setShowForm(false)} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
