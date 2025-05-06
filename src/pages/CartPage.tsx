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
import { ShoppingCart, CreditCard, ArrowLeft, Check } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Float animation for decorative elements
  const floatAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Gestion de la soumission du formulaire
  const handleFormSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      // Envoyer les données à Supabase
      const { data, error } = await createQuoteRequest(formData, items);
      
      if (error) {
        console.error('Erreur lors de la création de la demande de devis:', error);
        alert('Une erreur est survenue lors de l\'envoi de votre demande de devis. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }
      
      console.log('Demande de devis créée avec succès:', data);
      
      // Afficher le message de succès et vider le panier
      setFormSubmitted(true);
      clearCart();
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la création de la demande de devis:', error);
      alert('Une erreur est survenue lors de l\'envoi de votre demande de devis. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // Afficher le message de succès si le formulaire a été soumis
  if (formSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-20">
        <motion.div 
          className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-12 max-w-lg w-full border border-indigo-100 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <motion.div 
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            >
              <Check size={40} className="text-white" />
            </motion.div>
          </div>
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
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden">
      {/* Hero Section avec background amélioré */}
      <motion.div 
        className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white py-16 mb-16 relative overflow-hidden rounded-b-3xl shadow-xl"
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
          
          {/* Ajout de formes géométriques supplémentaires */}
          <motion.div 
            className="absolute top-10 right-10 w-24 h-24 rotate-45 bg-indigo-300 opacity-10"
            animate={{ 
              rotate: [45, 90, 45],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 15,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-40 left-1/4 w-32 h-32 rounded-lg bg-violet-500 opacity-10"
            animate={{ 
              rotate: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 12,
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
            className="mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
          >
            {showForm ? (
              <CreditCard size={32} className="text-white" />
            ) : (
              <ShoppingCart size={32} className="text-white" />
            )}
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {showForm ? (
              <>Finaliser <span className="text-violet-300">votre devis</span></>
            ) : (
              <>Votre <span className="text-violet-300">Devis</span></>
            )}
          </motion.h1>
          <motion.div 
            className="h-1 w-24 bg-gradient-to-r from-violet-300 to-indigo-300 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ delay: 0.7, duration: 0.8 }}
          />
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {showForm ? (
              "Complétez les informations ci-dessous pour recevoir votre devis personnalisé"
            ) : items.length > 0 ? (
              <>
                Vous avez <span className="font-medium text-violet-300">{items.reduce((total, item) => total + item.quantity, 0)} articles</span> dans votre panier 
                pour <span className="font-medium text-violet-300">{items?.reduce((total, item) => total + (item.priceTTC * item.quantity), 0).toFixed(2) || '0.00'} €</span>
              </>
            ) : (
              "Votre panier est actuellement vide"
            )}
          </motion.p>
          
          {/* Indicateur d'étape */}
          {items.length > 0 && (
            <motion.div 
              className="flex justify-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!showForm ? 'bg-violet-400 text-white' : 'bg-white text-violet-900'} shadow-md`}>
                  1
                </div>
                <div className={`w-16 h-1 ${showForm ? 'bg-violet-400' : 'bg-white bg-opacity-30'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showForm ? 'bg-violet-400 text-white' : 'bg-white text-violet-900'} shadow-md`}>
                  2
                </div>
              </div>
            </motion.div>
          )}
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
          <motion.div 
            className="absolute -top-10 -right-10 w-64 h-64 bg-violet-200 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"
            variants={floatAnimation}
            animate="animate"
          ></motion.div>
          <motion.div 
            className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-200 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"
            variants={floatAnimation}
            animate="animate"
            custom={1}
          ></motion.div>
          <motion.div 
            className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-200 rounded-full opacity-40 dark:opacity-10 blur-3xl z-0"
            variants={floatAnimation}
            animate="animate"
            custom={2}
          ></motion.div>
          
          <motion.div 
            className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-indigo-50 dark:border-gray-700"
            variants={scaleIn}
          >
            {/* Bouton retour */}
            {showForm && (
              <motion.button
                className="flex items-center text-violet-700 dark:text-violet-300 mb-6 hover:text-violet-900 dark:hover:text-violet-200 transition-colors"
                onClick={() => setShowForm(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowLeft size={16} className="mr-2" />
                Retour au panier
              </motion.button>
            )}
            
            {items.length === 0 ? (
              <motion.div variants={fadeInUp} className="py-12">
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
                  // isLoading={isLoading}
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