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
import { sendQuoteEmail } from '../services/emailService';

const CartPage: React.FC<{}> = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Gestion de la soumission du formulaire
  const handleFormSubmit = async (formData: FormData) => {
    try {
      const result = await sendQuoteEmail(formData, items);
      if (result.success) {
        // Afficher le message de succès et vider le panier
        setFormSubmitted(true);
        clearCart();
      } else {
        alert('Une erreur est survenue lors de l\'envoi du devis. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du devis:', error);
      alert('Une erreur est survenue lors de l\'envoi du devis. Veuillez réessayer.');
    }
  }

  // Afficher le message de succès si le formulaire a été soumis
  if (formSubmitted) {
    return <SuccessMessage />;
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