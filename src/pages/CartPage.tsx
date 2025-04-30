import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { ShoppingCart } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-20">
        <motion.div 
          className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-12 max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SuccessMessage 
            title="Demande de devis envoyée !"
            message="Nous avons bien reçu votre demande de devis. Notre équipe va l'étudier et vous contactera dans les plus brefs délais."
            buttonText="Retour à l'accueil"
            buttonLink="/"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section avec background animé */}
      <motion.div 
        className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white py-16 mb-16 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Cercles décoratifs animés */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div 
            className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500 opacity-10"
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 10,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-indigo-500 opacity-10"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, 20, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 12,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 right-1/4 w-40 h-40 rounded-full bg-violet-400 opacity-10"
            animate={{ 
              x: [0, 40, 0], 
              y: [0, 30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <motion.div 
          className="container mx-auto px-6 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            className="mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
          >
            <ShoppingCart size={32} />
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Votre <span className="text-violet-300">Devis</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {items.length > 0 
              ? `Vous avez ${items.reduce((total, item) => total + item.quantity, 0)} articles dans votre panier`
              : "Votre panier est actuellement vide"}
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="container mx-auto px-6">
        <motion.div 
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Formes décoratives */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-100 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-100 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"></div>
          
          <motion.div 
            className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12"
            variants={scaleIn}
          >
            {items.length === 0 ? (
              <motion.div variants={fadeInUp}>
                <EmptyCart />
              </motion.div>
            ) : !showForm ? (
              <>
                <motion.div variants={fadeInUp}>
                  <CartItemList 
                    items={items} 
                    removeFromCart={removeFromCart} 
                    updateQuantity={updateQuantity} 
                  />
                </motion.div>
                <motion.hr 
                  className="my-8 border-gray-200 dark:border-gray-700" 
                  variants={fadeInUp}
                />
                <motion.div variants={fadeInUp}>
                  <CartSummary 
                    items={items} 
                    onCheckoutClick={() => setShowForm(true)} 
                  />
                </motion.div>
              </>
            ) : (
              <motion.div 
                className="mt-6"
                variants={fadeInUp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CheckoutForm 
                  onSubmit={handleFormSubmit} 
                  onCancel={() => setShowForm(false)} 
                />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;
