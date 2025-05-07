import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, MapPin, Tag, Quote, ArrowLeft, Heart, ChevronLeft, ChevronRight, Camera, Award, Clock, Share2, Download, Zap, Star, FileSpreadsheet, User } from 'lucide-react';
import { Realization } from '../../services/realizationService';
import { motion, AnimatePresence } from 'framer-motion';

// CSS pour les motifs décoratifs
const decorativeStyles = `
  .bg-grid-pattern {
    background-image: radial-gradient(circle, #7c3aed 1px, transparent 1px);
    background-size: 30px 30px;
  }
  
  .bg-grid-pattern-small {
    background-image: radial-gradient(circle, #7c3aed 0.5px, transparent 0.5px);
    background-size: 20px 20px;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c4b5fd;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #7c3aed;
  }
`;

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
  const [activeTab, setActiveTab] = useState<'details' | 'gallery'>('details');

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

  // Animation variants
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

  // Image navigation function
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

  // Métriques du projet (données fictives pour la démo)
  const projectMetrics = useMemo(() => ({
    satisfaction: 98,
    duration: '3 mois',
    completion: '100%',
    rating: 4.9
  }), []);
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Injection des styles CSS pour les motifs décoratifs */}
      <style>{decorativeStyles}</style>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col relative overflow-hidden"
        variants={containerVariants}
      >
        {/* Enhanced header with glass effect */}
        <motion.div 
          className="sticky top-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 z-10 px-6 py-4 flex justify-between items-center shadow-lg backdrop-blur-md border-b border-white/20"
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
          
          <div className="hidden md:block">
            <motion.div 
              className="flex bg-white/10 backdrop-blur-md rounded-full border border-white/20 overflow-hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-5 py-2 text-sm font-medium transition-all flex items-center ${
                  activeTab === 'details' 
                    ? 'bg-white text-violet-700'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Award className="h-4 w-4 mr-2" />
                Détails
              </button>
              <button 
                onClick={() => setActiveTab('gallery')}
                className={`px-5 py-2 text-sm font-medium transition-all flex items-center ${
                  activeTab === 'gallery' 
                    ? 'bg-white text-violet-700'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Camera className="h-4 w-4 mr-2" />
                Galerie
              </button>
            </motion.div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                liked 
                  ? 'bg-pink-100 text-pink-600 border border-pink-200' 
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-pink-600' : ''}`} />
              <span>{liked ? 'Aimé' : 'J\'aime'}</span>
            </motion.button>
            
            <motion.button
              className="hidden md:flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>Partager</span>
            </motion.button>
            
            <motion.button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/20"
              aria-label="Fermer"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Enhanced hero section with 3D effect */}
          <motion.div 
            className="relative bg-gradient-to-br from-violet-100 via-white to-purple-50 pt-10 pb-12 px-8 border-b border-violet-100"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Decorative elements */}
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-300 to-purple-300 rounded-full filter blur-3xl opacity-30 -z-10 transform translate-x-1/2 -translate-y-1/2"
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
            <motion.div
              className="absolute bottom-0 left-1/4 w-40 h-40 bg-gradient-to-tr from-blue-300 to-cyan-300 rounded-full filter blur-3xl opacity-20 -z-10"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2
              }}
            />
            
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-5 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern transform rotate-3"></div>
            </div>
            
            {/* Title with 3D effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <h2 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-800 to-purple-600 mb-2">
                {realization.title}
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mb-6"></div>
            </motion.div>
            
            {/* Tags and metadata with improved styling */}
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
              
              {/* Status badge */}
              <motion.div 
                className="flex items-center ml-auto"
                whileHover={{ scale: 1.05 }}
              >
                <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-green-100 text-green-800 border border-green-200 rounded-full shadow-sm">
                  <Zap className="h-4 w-4 mr-1.5 text-green-600" />
                  Projet terminé
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="px-8 py-8">
            {/* Métriques du projet */}
            <motion.div 
              className="mb-10 bg-white p-6 rounded-xl border border-gray-200 shadow-lg"
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                <span className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-2 rounded-lg mr-3 shadow-md">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>
                Statistiques du projet
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="text-xs font-medium uppercase text-gray-500 mb-1">Satisfaction</div>
                  <div className="text-2xl font-bold text-gray-900">{projectMetrics.satisfaction}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${projectMetrics.satisfaction}%` }}></div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="text-xs font-medium uppercase text-gray-500 mb-1">Durée</div>
                  <div className="text-2xl font-bold text-gray-900">{projectMetrics.duration}</div>
                  <div className="text-xs text-gray-500 mt-2">Livraison à temps</div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="text-xs font-medium uppercase text-gray-500 mb-1">Achèvement</div>
                  <div className="text-2xl font-bold text-gray-900">{projectMetrics.completion}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="text-xs font-medium uppercase text-gray-500 mb-1">Évaluation</div>
                  <div className="text-2xl font-bold text-gray-900">{projectMetrics.rating}/5</div>
                  <div className="flex text-amber-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(projectMetrics.rating) ? 'fill-amber-500' : ''}`} />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Enhanced gallery with improved cards */}
            {realization.images && realization.images.length > 0 && (
              <motion.div 
                className="mb-12"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="mb-4 flex items-center justify-between">
                  <motion.h3 
                    className="text-xl font-semibold text-gray-800 flex items-center"
                    variants={itemVariants}
                  >
                    <span className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-2 rounded-lg mr-3 shadow-md">
                      <Camera className="h-5 w-5" />
                    </span>
                    Galerie photo
                  </motion.h3>
                  <div className="text-sm font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {realization.images.length} photo{realization.images.length > 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Main image with enhanced glass effect */}
                <div className="mb-5 relative rounded-xl overflow-hidden bg-gray-100 aspect-video group shadow-xl border border-gray-200">
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
                  
                  {/* Enhanced overlay with more info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white text-xl font-bold mb-2 drop-shadow-md">{realization.title}</h4>
                      <p className="text-white/80 text-sm drop-shadow-md">{realization.location || 'Localisation non spécifiée'}</p>
                    </div>
                  </div>
                  
                  {/* Download button */}
                  <button 
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/30"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  
                  {/* Navigation controls */}
                  {realization.images.length > 1 && (
                    <>
                      <motion.button 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={() => navigateImages('prev')}
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </motion.button>
                      <motion.button 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={() => navigateImages('next')}
                        whileHover={{ scale: 1.1, x: 2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Enhanced thumbnails */}
                {realization.images.length > 1 && (
                  <div className="flex overflow-x-auto space-x-3 pb-2 custom-scrollbar">
                    {realization.images.map((img, index) => (
                      <motion.div 
                        key={index}
                        className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all ${
                          selectedImage === img 
                            ? 'ring-4 ring-violet-500 shadow-lg scale-105 z-10' 
                            : 'border-2 border-transparent hover:border-violet-300 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedImage(img)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="relative h-20 w-32 group">
                          <img
                            src={img}
                            alt={`Vignette ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {selectedImage === img && (
                            <div className="absolute inset-0 bg-violet-500/20 backdrop-blur-sm flex items-center justify-center">
                              <span className="bg-white text-violet-800 text-xs font-bold px-2 py-1 rounded-full">
                                Actif
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Enhanced content grid with better cards */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
                {/* Enhanced objective card */}
                <motion.div 
                  className="bg-white p-7 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-violet-200 relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  {/* Decorative element */}
                  <div className="absolute -top-12 -right-12 h-24 w-24 bg-gradient-to-br from-violet-100 to-purple-200 rounded-full opacity-50"></div>
                  <div className="absolute -bottom-16 -left-16 h-32 w-32 bg-gradient-to-tr from-violet-100 to-blue-100 rounded-full opacity-30"></div>
                  
                  <h3 className="text-lg font-semibold text-violet-800 uppercase tracking-wide flex items-center mb-5 relative z-10">
                    <span className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-2 rounded-lg mr-3 shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    Objectif
                  </h3>
                  <div className="relative z-10">
                    <p className="text-gray-700 leading-relaxed text-base">{realization.objective}</p>
                  </div>
                </motion.div>

                {/* Enhanced mission card */}
                <motion.div 
                  className="bg-white p-7 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-violet-200 relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-grid-pattern-small"></div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-violet-800 uppercase tracking-wide flex items-center mb-5 relative z-10">
                    <span className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-2 rounded-lg mr-3 shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    Notre mission
                  </h3>
                  <div className="relative z-10">
                    <p className="text-gray-700 leading-relaxed text-base">{realization.mission}</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Sidebar content with enhanced styling */}
              <motion.div className="space-y-6" variants={itemVariants}>
                {/* Enhanced testimonial card */}
                {realization.testimonial && (
                  <motion.div 
                    className="bg-gradient-to-br from-violet-50 to-purple-100 p-7 rounded-xl border border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    whileHover={{ y: -5 }}
                    variants={itemVariants}
                  >
                    {/* Decorative quotes */}
                    <div className="absolute -top-10 -left-10 text-violet-200 opacity-30 transform scale-150">
                      <Quote className="h-24 w-24" />
                    </div>
                    <div className="absolute -bottom-10 -right-10 text-violet-200 opacity-20 transform scale-150 rotate-180">
                      <Quote className="h-16 w-16" />
                    </div>
                    
                    <div className="flex items-center mb-4 relative z-10">
                      <Quote className="h-6 w-6 text-violet-700 mr-2" />
                      <h3 className="text-lg font-semibold text-violet-800">Témoignage client</h3>
                    </div>
                    <div className="relative z-10">
                      <p className="text-gray-700 italic text-lg leading-relaxed">« {realization.testimonial} »</p>
                      <div className="mt-4 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {(realization.title[0] || "C").toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-violet-800">Client</p>
                          <p className="text-sm text-gray-500">{realization.location || "Projet"}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Enhanced project details card */}
                <motion.div 
                  className="bg-white p-7 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-violet-200"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  <h3 className="text-lg font-semibold mb-5 text-violet-800 flex items-center">
                    <span className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-2 rounded-lg mr-3 shadow-lg">
                      <Award className="h-5 w-5" />
                    </span>
                    Détails du projet
                  </h3>
                  <ul className="space-y-4 text-gray-700">
                    <motion.li 
                      className="flex items-start bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-violet-200 transition-colors shadow-sm hover:shadow-md"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-3 rounded-xl mr-4 shadow-md">
                        <Calendar className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1 text-sm">Date</span>
                        <span className="font-medium text-base text-gray-800">{formattedDate || 'Non spécifiée'}</span>
                      </div>
                    </motion.li>
                    <motion.li 
                      className="flex items-start bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-violet-200 transition-colors shadow-sm hover:shadow-md"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-3 rounded-xl mr-4 shadow-md">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1 text-sm">Lieu</span>
                        <span className="font-medium text-base text-gray-800">{realization.location || 'Non spécifié'}</span>
                      </div>
                    </motion.li>
                    <motion.li 
                      className="flex items-start bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-violet-200 transition-colors shadow-sm hover:shadow-md"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-3 rounded-xl mr-4 shadow-md">
                        <Tag className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1 text-sm">Catégorie</span>
                        <span className="font-medium text-base text-gray-800">{realization.category || 'Non spécifiée'}</span>
                      </div>
                    </motion.li>
                    
                    {/* Additional info */}
                    <motion.li 
                      className="flex items-start bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-violet-200 transition-colors shadow-sm hover:shadow-md"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-3 rounded-xl mr-4 shadow-md">
                        <Clock className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1 text-sm">État</span>
                        <span className="inline-flex items-center font-medium text-base text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                          Terminé
                        </span>
                      </div>
                    </motion.li>
                    
                    {/* Ajout d'une note d'évaluation */}
                    <motion.li 
                      className="flex items-start bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:border-violet-200 transition-colors shadow-sm hover:shadow-md"
                      whileHover={{ x: 3 }}
                    >
                      <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-xl mr-4 shadow-md">
                        <Star className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-gray-500 block mb-1 text-sm">Évaluation</span>
                        <div className="flex items-center">
                          <div className="text-amber-500 flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.floor(projectMetrics.rating) ? 'fill-amber-500' : ''}`} />
                            ))}
                          </div>
                          <span className="ml-2 font-medium text-base text-gray-800">{projectMetrics.rating}/5</span>
                        </div>
                      </div>
                    </motion.li>
                  </ul>
                </motion.div>
                
                {/* Contact card with team info */}
                <motion.div 
                  className="bg-gradient-to-br from-violet-600 to-purple-700 p-7 rounded-xl shadow-lg text-white relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
                  
                  <h3 className="text-lg font-semibold mb-4 relative z-10">Intéressé par ce projet?</h3>
                  <p className="text-white/80 mb-6 relative z-10">Contactez-nous pour discuter de votre projet ou pour en savoir plus sur cette réalisation.</p>
                  
                  {/* Team avatars */}
                  <div className="mb-6 relative z-10">
                    <p className="text-sm text-white/70 mb-3">Notre équipe sur ce projet:</p>
                    <div className="flex -space-x-2">
                      <div className="h-10 w-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+2</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    className="w-full py-3 bg-white text-violet-700 rounded-lg font-semibold hover:bg-violet-50 active:scale-95 transition-all duration-300 shadow-lg relative z-10 flex items-center justify-center"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Nous contacter
                  </motion.button>
                </motion.div>
                
                {/* New related projects card */}
                <motion.div 
                  className="bg-white p-7 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-violet-200 mt-6"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  <h3 className="text-lg font-semibold mb-5 text-violet-800 flex items-center">
                    <span className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-2 rounded-lg mr-3 shadow-lg">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </span>
                    Projets similaires
                  </h3>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <motion.div 
                        key={item}
                        className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-14 w-14 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-violet-100 to-gray-200"></div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Projet {item}</h4>
                          <p className="text-sm text-gray-500">Catégorie similaire</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced footer with CTAs */}
          <motion.div 
            className="sticky bottom-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-8 py-4 border-t border-violet-500/20 shadow-xl backdrop-blur-md"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                    liked 
                      ? 'bg-pink-100 text-pink-600 border border-pink-200' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Heart className={`h-5 w-5 ${liked ? 'fill-pink-600' : ''}`} />
                  <span>{liked ? 'Vous aimez ce projet' : 'Aimer ce projet'}</span>
                </motion.button>
                
                <motion.button
                  className="hidden md:flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Share2 className="h-5 w-5 mr-1" />
                  <span>Partager</span>
                </motion.button>
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.button
                  className="px-5 py-2.5 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all md:block hidden"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Voir plus de projets
                </motion.button>
                
                <motion.button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white text-violet-700 rounded-lg font-semibold hover:bg-violet-50 transition-all duration-300 shadow-md flex items-center"
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Fermer
                  <X className="h-4 w-4 ml-2" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealizationDetails;