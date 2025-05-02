import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Settings, Home, ShoppingBag, Info, Phone, Truck, User, Heart, Package, LogOut, ShoppingCart } from 'lucide-react';
import { signOut } from '../services/authService';
import '../styles/header-animations.css';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  isAdminUser: boolean;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  isAdminUser 
}) => {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const slideIn = {
    hidden: { y: "-100%", opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: {
      y: "-100%",
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with improved animation */}
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[90] md:hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
            onClick={onClose}
          />
          
          {/* Sidebar - From top with improved glassmorphism and animations */}
          <motion.div 
            className="fixed top-0 left-0 right-0 w-full h-auto max-h-[90vh] overflow-y-auto glassmorphism dark:bg-gray-900/90 z-[100] md:hidden rounded-b-2xl shadow-2xl border-b border-gray-200/20 dark:border-gray-700/20"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideIn}
          >
            {/* Header with gradient background */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 dark:from-violet-900/30 dark:to-indigo-900/30">
              <div className="flex items-center space-x-3">
                <motion.img 
                  src="/images/logo.png" 
                  alt="ESIL Events Logo" 
                  className="h-10 w-10 rounded-lg shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">Menu</h2>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md"
                aria-label="Fermer le menu"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </motion.button>
            </div>

            {/* User info section if logged in - with improved styling */}
            {user && (
              <div className="px-4 py-3 bg-gradient-to-r from-violet-50/90 to-purple-50/90 dark:from-violet-900/30 dark:to-purple-900/30 border-b border-gray-200/30 dark:border-gray-700/30">
                <div className="flex items-center">
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg flex items-center justify-center"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {user.user_metadata?.first_name || 'Bienvenue'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                      {user.email}
                    </p>
                    <div className="mt-1 flex space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                        Client
                      </span>
                      {isAdminUser && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <motion.div 
              className="px-2 py-3 space-y-3 overflow-y-auto"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              {/* Main navigation - with improved styling and animations */}
              <motion.div 
                className="mb-5 bg-white/50 dark:bg-gray-800/30 rounded-xl p-3 shadow-sm"
                variants={itemVariant}
              >
                <h3 className="px-3 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center">
                  <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
                  Navigation
                  <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
                </h3>
                <div className="space-y-1">
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <Home className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Accueil</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/products" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <ShoppingBag className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Nos produits</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/cart" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <ShoppingCart className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Panier</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/agence-evenementielle" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <Heart className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Agence événementielle</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/artists" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <User className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Artistes</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Information section - with improved styling and animations */}
              <motion.div 
                className="mb-5 bg-white/50 dark:bg-gray-800/30 rounded-xl p-3 shadow-sm"
                variants={itemVariant}
              >
                <h3 className="px-3 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center">
                  <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
                  Informations
                  <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
                </h3>
                <div className="space-y-1">
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/about" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <Info className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">À propos</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/contact" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <Phone className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Contact</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariant}>
                    <Link 
                      to="/delivery" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                      onClick={onClose}
                    >
                      <Truck className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Livraison</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Contact info - with improved styling and animations */}
              <motion.div 
                className="mb-2 bg-gradient-to-r from-violet-50/80 to-indigo-50/80 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl p-4 shadow-sm"
                variants={itemVariant}
              >
                <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center">
                  <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-2"></span>
                  Contactez-nous
                  <span className="w-5 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-2"></span>
                </h3>
                <div className="space-y-2">
                  <motion.a 
                    href="tel:0620461385" 
                    className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 group"
                    whileHover={{ x: 5 }}
                    variants={itemVariant}
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-800/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">06 20 46 13 85</span>
                  </motion.a>
                  <motion.a 
                    href="tel:0785959723" 
                    className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 group"
                    whileHover={{ x: 5 }}
                    variants={itemVariant}
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-800/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">07 85 95 97 23</span>
                  </motion.a>
                </div>
                
                {/* Social Media Links */}
                <motion.div 
                  className="flex space-x-3 mt-4"
                  variants={itemVariant}
                >
                  <motion.a 
                    href="https://www.facebook.com/profile.php?id=61574583021091" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all duration-300 shadow-sm"
                    aria-label="Facebook"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="https://www.instagram.com/esilevents" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-800/30 transition-all duration-300 shadow-sm"
                    aria-label="Instagram"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                </motion.div>
              </motion.div>

              {/* User actions section */}
              {user && (
                <motion.div 
                  className="mt-6 px-3"
                  variants={itemVariant}
                >
                  <motion.button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-5 h-5 mr-3 text-white group-hover:scale-110 transition-transform duration-300" />
                    <span>Se déconnecter</span>
                  </motion.button>
                </motion.div>
              )}

              {/* {!user && (
                <motion.div 
                  className="mt-6 px-3 flex flex-col space-y-3"
                  variants={itemVariant}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to="/login"
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={onClose}
                    >
                      <span>Se connecter</span>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to="/register"
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-800/30 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-violet-200 dark:border-violet-800/30"
                      onClick={onClose}
                    >
                      <span>Créer un compte</span>
                    </Link>
                  </motion.div>
                </motion.div>
              )} */}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
