import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyCartProps } from './types';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowRight, Package, Home } from 'lucide-react';

const EmptyCart: React.FC<EmptyCartProps> = ({ 
  message = "Vous n'avez pas encore ajouté de produits à votre devis.",
  title = "Votre panier est vide",
  buttonText = "Découvrir nos produits",
  buttonLink = "/products",
  showDecorations = true,
  icon = 'cart'
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    },
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 }
    }
  };

  const decorationVariants = {
    animate: (i: number) => ({
      y: [0, i % 2 === 0 ? -15 : 15, 0],
      x: [0, i % 3 === 0 ? 10 : -10, 0],
      rotate: [0, i % 2 === 0 ? 5 : -5, 0],
      transition: {
        duration: 5 + i,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  // Render the appropriate icon based on the icon prop
  const renderIcon = () => {
    switch(icon) {
      case 'package':
        return <Package size={40} className="text-violet-500 dark:text-violet-400" />;
      case 'home':
        return <Home size={40} className="text-violet-500 dark:text-violet-400" />;
      case 'cart':
      default:
        return <ShoppingCart size={40} className="text-violet-500 dark:text-violet-400" />;
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-10 rounded-3xl shadow-xl text-center max-w-2xl mx-auto overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative">
        {/* Decorative elements */}
        {showDecorations && (
          <>
            <motion.div 
              className="absolute -top-10 -right-10 w-32 h-32 bg-violet-100 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"
              variants={decorationVariants}
              animate="animate"
              custom={1}
            />
            <motion.div 
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"
              variants={decorationVariants}
              animate="animate"
              custom={2}
            />
            <motion.div 
              className="absolute top-20 left-10 w-24 h-24 bg-purple-100 rounded-full opacity-40 dark:opacity-10 blur-3xl z-0"
              variants={decorationVariants}
              animate="animate"
              custom={3}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-20 h-20 bg-pink-100 rounded-full opacity-30 dark:opacity-10 blur-3xl z-0"
              variants={decorationVariants}
              animate="animate"
              custom={4}
            />
            
            {/* Geometric shapes */}
            <motion.div 
              className="absolute top-1/4 right-1/4 w-16 h-16 bg-indigo-100 rounded-lg rotate-45 opacity-40 dark:opacity-10 blur-xl z-0"
              variants={decorationVariants}
              animate="animate"
              custom={5}
            />
            <motion.div 
              className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-violet-100 rounded-lg rotate-12 opacity-40 dark:opacity-10 blur-xl z-0"
              variants={decorationVariants}
              animate="animate"
              custom={6}
            />
          </>
        )}
        
        <div className="relative z-10">
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="mb-8 flex justify-center"
          >
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-full shadow-md border border-violet-100/30 dark:border-violet-500/10">
              {renderIcon()}
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          
          <motion.p 
            className="mb-8 text-gray-600 dark:text-gray-300 max-w-md mx-auto"
            variants={itemVariants}
          >
            {message}
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to={buttonLink} 
              className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="w-5 h-5" />
              </span>
              {buttonText}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyCart;
