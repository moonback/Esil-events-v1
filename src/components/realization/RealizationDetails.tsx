import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tag, Quote, ArrowLeft, Heart, ChevronLeft, ChevronRight, Camera, Award, Clock } from 'lucide-react';
import { Realization } from '../../services/realizationService';
import { motion, AnimatePresence } from 'framer-motion';

interface RealizationDetailsProps {
  realization: Realization;
  onClose: () => void;
}

const RealizationDetails: React.FC<RealizationDetailsProps> = ({ realization, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    realization.images && realization.images.length > 0 ? realization.images[0] : null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formattedDate = realization.event_date 
    ? new Date(realization.event_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  // Animation variants pour différents éléments
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  // Fonction pour naviguer entre les images
  const navigateImages = (direction: 'next' | 'prev') => {
    if (!realization.images || realization.images.length <= 1) return;
    
    const currentIndex = realization.images.findIndex(img => img === selectedImage);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % realization.images.length;
    } else {
      newIndex = (currentIndex - 1 + realization.images.length) % realization.images.length;
    }
    
    setSelectedImage(realization.images[newIndex]);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col relative overflow-hidden"
        variants={containerVariants}
      >
        {/* Header amélioré avec dégradé et animations */}
        <motion.div 
          className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-700 z-10 px-6 py-4 flex justify-between items-center shadow-md"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            onClick={onClose}
            className="flex items-center text-white hover:text-violet-200 transition-colors font-medium group"
            aria-label="Retour"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:translate-x-[-2px] transition-transform" />
            Retour
          </motion.button>

          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                liked 
                  ? 'bg-pink-100 text-pink-600 border border-pink-200' 
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-pink-600' : ''}`} />
              <span>{liked ? 'Aimé' : 'J\'aime'}</span>
            </motion.button>
            <motion.button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2"
              aria-label="Fermer"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero section améliorée avec animation */}
          <motion.div 
            className="relative bg-gradient-to-br from-violet-100 via-white to-purple-50 pt-8 pb-10 px-8 border-b border-violet-100"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full filter blur-3xl opacity-30 -z-10 transform translate-x-1/2 -translate-y-1/2"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
            <motion.h2 
              className="text-4xl font-bold text-gray-900 mb-4 tracking-tight"
              variants={itemVariants}
            >
              {realization.title}
            </motion.h2>
            <motion.div 
              className="flex flex-wrap items-center gap-4 mb-6"
              variants={itemVariants}
            >
              {realization.category && (
                <motion.div 
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Tag className="h-4 w-4 mr-1.5 text-violet-600" />
                  <span className="inline-block px-3 py-1.5 text-sm font-medium bg-violet-100 text-violet-800 rounded-full shadow-sm border border-violet-200">
                    {realization.category}
                  </span>
                </motion.div>
              )}
              {realization.location && (
                <motion.div 
                  className="flex items-center text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full shadow-sm border border-gray-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <MapPin className="h-4 w-4 mr-1.5 text-violet-600" />
                  <span className="text-sm font-medium">{realization.location}</span>
                </motion.div>
              )}
              {formattedDate && (
                <motion.div 
                  className="flex items-center text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full shadow-sm border border-gray-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calendar className="h-4 w-4 mr-1.5 text-violet-600" />
                  <span className="text-sm font-medium">{formattedDate}</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <div className="px-8 py-8">
            {/* Galerie d'images améliorée avec contrôles et animations */}
            {realization.images && realization.images.length > 0 && (
              <motion.div 
                className="mb-12"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="mb-2 flex items-center justify-between">
                  <motion.h3 
                    className="text-lg font-semibold text-gray-800 flex items-center"
                    variants={itemVariants}
                  >
                    <Camera className="h-5 w-5 mr-2 text-violet-600" />
                    Galerie photo
                  </motion.h3>
                  <div className="text-sm text-gray-500">
                    {realization.images.length} photo{realization.images.length > 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="mb-5 relative rounded-xl overflow-hidden bg-gray-100 aspect-video group shadow-lg border border-gray-200">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImage}
                      src={selectedImage || realization.images[0]}
                      alt={`${realization.title} - Image principale`}
                      className="object-cover w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>
                  
                  {/* Overlay avec effet de dégradé */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Contrôles de navigation */}
                  {realization.images.length > 1 && (
                    <>
                      <motion.button 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => navigateImages('prev')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </motion.button>
                      <motion.button 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => navigateImages('next')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </motion.button>
                    </>
                  )}
                </div>

                {realization.images.length > 1 && (
                  <div className="flex overflow-x-auto space-x-3 pb-2 custom-scrollbar">
                    {realization.images.map((img, index) => (
                      <motion.div 
                        key={index}
                        className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === img ? 'border-violet-500 shadow-md' : 'border-transparent hover:border-violet-300'
                        }`}
                        onClick={() => setSelectedImage(img)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <img
                          src={img}
                          alt={`Vignette ${index + 1}`}
                          className="h-20 w-32 object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
                {/* Objectif avec animation et design amélioré */}
                <motion.div 
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-violet-200"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  <h3 className="text-lg font-semibold text-violet-700 uppercase tracking-wide flex items-center mb-4">
                    <span className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-lg mr-3 shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    Objectif
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">{realization.objective}</p>
                </motion.div>

                {/* Mission avec animation et design amélioré */}
                <motion.div 
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-violet-200"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  <h3 className="text-lg font-semibold text-violet-700 uppercase tracking-wide flex items-center mb-4">
                    <span className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-lg mr-3 shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    Notre mission
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">{realization.mission}</p>
                </motion.div>
              </motion.div>

              {/* Témoignage + Détails avec animations */}
              <motion.div className="space-y-6" variants={itemVariants}>
                {realization.testimonial && (
                  <motion.div 
                    className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ y: -5 }}
                    variants={itemVariants}
                  >
                    <div className="flex items-center mb-4">
                      <Quote className="h-6 w-6 text-violet-600 mr-2" />
                      <h3 className="text-lg font-semibold text-violet-700">Témoignage client</h3>
                    </div>
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-violet-300 opacity-30 transform scale-150">
                        <Quote className="h-10 w-10" />
                      </div>
                      <p className="text-gray-700 italic text-lg leading-relaxed relative z-10">« {realization.testimonial} »</p>
                    </div>
                  </motion.div>
                )}
                
                <motion.div 
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-violet-200"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  <h3 className="text-lg font-semibold mb-4 text-violet-700 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-violet-600" />
                    Détails du projet
                  </h3>
                  <ul className="space-y-4 text-gray-700 text-sm">
                    <motion.li 
                      className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-violet-200 transition-colors"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-2 rounded-lg mr-3 shadow-sm">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1">Date</span>
                        <span className="font-medium text-base">{formattedDate || 'Non spécifiée'}</span>
                      </div>
                    </motion.li>
                    <motion.li 
                      className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-violet-200 transition-colors"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-2 rounded-lg mr-3 shadow-sm">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1">Lieu</span>
                        <span className="font-medium text-base">{realization.location || 'Non spécifié'}</span>
                      </div>
                    </motion.li>
                    <motion.li 
                      className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-violet-200 transition-colors"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-2 rounded-lg mr-3 shadow-sm">
                        <Tag className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1">Catégorie</span>
                        <span className="font-medium text-base">{realization.category || 'Non spécifiée'}</span>
                      </div>
                    </motion.li>
                  </ul>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer amélioré */}
          <motion.div 
            className="sticky bottom-0 bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-4 border-t border-violet-500/20 shadow-lg"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-end">
              <motion.button
                onClick={onClose}
                className="px-6 py-3 bg-white text-violet-700 rounded-full font-semibold hover:bg-violet-50 active:scale-95 transition-all duration-300 shadow-md flex items-center"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                Fermer
                <X className="h-4 w-4 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealizationDetails;
