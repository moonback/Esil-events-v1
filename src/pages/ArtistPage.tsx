import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, Mic, Radio, Theater, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllArtists, Artist } from '../services/artistService';
import { getAllArtistCategories, ArtistCategory } from '../services/artistCategoryService';
import { h1 } from 'framer-motion/client';

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 mb-16">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos artistes</h1>
          <p className="text-xl max-w-3xl mx-auto">
          Découvrez notre sélection d'artistes professionnels pour animer vos événements et créer des moments inoubliables.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="ml-2">{category}</span>
            </button>
          ))}
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredArtists.map((artist) => (
            <motion.div 
              key={artist.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <div className="relative h-64">
                <img 
                  src={artist.image_url}
                  alt={artist.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300/blue/white?text=Image+Non+Disponible';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full  text-black-600 backdrop-blur-sm">
                    {getCategoryIcon(artist.category)}
                    <span className="ml-1">{artist.category}</span>
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h2 className="text-xl font-bold text-white">{artist.name}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{artist.description}</p>
                
                <Link 
                  to={`/artist/${encodeURIComponent(artist.name)}`} 
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Voir plus <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {activeCategory === 'all' 
                ? "Aucun artiste disponible pour le moment." 
                : `Aucun artiste trouvé dans la catégorie "${activeCategory}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;