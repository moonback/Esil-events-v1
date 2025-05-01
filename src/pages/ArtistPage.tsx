import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, Mic, Radio, Theater, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllArtists, Artist } from '../services/artistService';
import { getAllArtistCategories, ArtistCategory } from '../services/artistCategoryService';

const ArtistPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<ArtistCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [artistsData, categoriesData] = await Promise.all([
          getAllArtists(),
          getAllArtistCategories()
        ]);
        setArtists(artistsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArtists = activeCategory === 'all' 
    ? artists 
    : artists.filter(artist => artist.category === activeCategory);

  // Update the getCategoryIcon function to handle all categories
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Chanteurs': return <Mic className="w-5 h-5" />;
      case 'Danseurs': return <Users className="w-5 h-5" />;
      case 'DJ': return <Radio className="w-5 h-5" />;
      case 'Spectacles': return <Theater className="w-5 h-5" />;
      case 'Animateurs': return <Music className="w-5 h-5" />;
      default: return <Music className="w-5 h-5" />;
    }
  };

  // Animations améliorées pour correspondre au style de AboutPage
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.8,
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

  if (loading) {
    return (
      <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center w-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Default categories
  const defaultCategories = ['Chanteurs', 'Danseurs', 'DJ', 'Spectacles', 'Animateurs'];
  
  // Get all unique categories from artists and categories table
  const allCategories = [...new Set([
    ...defaultCategories,
    ...categories.map(cat => cat.name)
  ])];

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen overflow-hidden">
      {/* Hero Section avec background animé */}
      <motion.div 
        className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white py-20 mb-16 relative overflow-hidden"
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
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Nos <span className="text-violet-300">Artistes</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Découvrez notre sélection d'artistes professionnels pour animer vos événements et créer des moments inoubliables.
          </motion.p>
        </motion.div>
      </motion.div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Formes décoratives */}
        <div className="relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-100 rounded-full opacity-50 dark:opacity-10 blur-3xl z-0"></div>
          <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-indigo-100 rounded-full opacity-60 dark:opacity-10 blur-3xl z-0"></div>
        </div>
        
        {/* Category Filter - Design amélioré */}
        <motion.div 
          className="relative z-10 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Filtrer par catégorie</span>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Trouvez l'<span className="text-violet-700 dark:text-violet-400">artiste parfait</span> pour votre événement
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-4xl mx-auto">
            <motion.button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.5)' }}
              whileTap={{ y: 0 }}
            >
              Tous
            </motion.button>
            {allCategories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.5)' }}
                whileTap={{ y: 0 }}
              >
                {getCategoryIcon(category)}
                <span className="ml-2">{category}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {filteredArtists.map((artist) => (
            <motion.div 
              key={artist.id} 
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 group"
              variants={fadeInUp}
              whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={artist.image_url}
                  alt={artist.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300/blue/white?text=Image+Non+Disponible';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    {getCategoryIcon(artist.category)}
                    <span className="ml-1">{artist.category}</span>
                  </span>
                </div>
                <motion.div 
                  className="absolute bottom-0 left-0 p-5 w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold text-white group-hover:text-violet-200 transition-colors duration-300">{artist.name}</h2>
                </motion.div>
              </div>
              <div className="p-8">
                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">{artist.description}</p>
                
                <Link 
                  to={`/artist/${encodeURIComponent(artist.name)}`} 
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  Voir plus <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredArtists.length === 0 && (
          <motion.div 
            className="text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-3xl shadow-inner backdrop-blur-sm max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8">
              <svg className="w-16 h-16 mx-auto mb-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                {activeCategory === 'all' 
                  ? "Aucun artiste disponible pour le moment." 
                  : `Aucun artiste trouvé dans la catégorie "${activeCategory}".`}
              </p>
              <button 
                onClick={() => setActiveCategory('all')} 
                className="mt-6 px-5 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors font-medium"
              >
                Voir tous les artistes
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;