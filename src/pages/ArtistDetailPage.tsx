import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Music, Mic, Radio, Theater, Users, 
  Calendar, MapPin, Star, Heart, Share2, Globe, 
  Clock, DollarSign, Award, Instagram, Facebook, Twitter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Artist, getArtistByName } from '../services/artistService';

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const artistName = id ? decodeURIComponent(id) : '';
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistName) return;
      
      try {
        setLoading(true);
        const data = await getArtistByName(artistName);
        setArtist(data);
        // Check if artist is in favorites (from localStorage)
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(artistName));
      } catch (err) {
        console.error('Error fetching artist:', err);
        setError('Impossible de charger les détails de l\'artiste. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [artistName]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter((name: string) => name !== artistName);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      favorites.push(artistName);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions);
  };

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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
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
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-violet-600"></div>
          <p className="mt-4 text-violet-600 dark:text-violet-400 font-medium">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center w-full">
        <motion.div 
          className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 text-red-500 dark:text-red-400">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oups ! Une erreur est survenue</h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error || "Artiste non trouvé"}</p>
          <Link 
            to="/artists" 
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all inline-flex items-center shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux artistes
          </Link>
        </motion.div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <motion.div 
            key="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="prose prose-violet max-w-none dark:prose-invert"
          >
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl shadow-inner mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">À propos de l'artiste</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{artist.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                  <Calendar className="w-5 h-5 mr-2 text-violet-600" /> Disponibilité
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Disponible pour vos événements toute l'année sur réservation.</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                    <div 
                      key={day} 
                      className={`text-center py-2 rounded ${index > 4 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                  <MapPin className="w-5 h-5 mr-2 text-violet-600" /> Zone d'intervention
                </h3>
                <p className="text-gray-600 dark:text-gray-400">France entière et pays limitrophes.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'].map((city) => (
                    <span key={city} className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-400 rounded-full text-sm">
                      {city}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-400 rounded-full text-sm">
                    +5 autres
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                  <Clock className="w-5 h-5 mr-2 text-violet-600" /> Durée de prestation
                </h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-violet-600 h-2.5 rounded-full w-3/4"></div>
                  </div>
                  <span className="ml-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">3-4h</span>
                </div>
                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">Peut être prolongée sur demande</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                  <DollarSign className="w-5 h-5 mr-2 text-violet-600" /> Tarification
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">À partir de</span>
                  <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">800 €</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Tarif variable selon la prestation et la durée</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 md:col-span-2">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                  <Star className="w-5 h-5 mr-2 text-violet-600" /> Expérience
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Plus de 10 ans d'expérience dans l'animation d'événements professionnels et particuliers.</p>
                
                <div className="mt-4 flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">4.0/5 (126 avis)</span>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 italic text-sm">"Une prestation exceptionnelle qui a conquis tous nos invités. Professionnel et talentueux."</p>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">Marie D. - Mariage, Juin 2023</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      case 'portfolio':
        return (
          <motion.div 
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Portfolio de l'artiste</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={item} 
                  className="relative group overflow-hidden rounded-xl shadow-md border border-gray-100 dark:border-gray-700 aspect-square"
                >
                  <img 
                    src={`https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Performance+${item}`} 
                    alt={`Performance ${item}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4">
                      <h3 className="text-white font-bold">Performance #{item}</h3>
                      <p className="text-gray-200 text-sm">Événement à Paris</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-xl shadow-md border border-violet-100 dark:border-violet-800/30">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                <Award className="w-5 h-5 mr-2 text-violet-600" /> Distinctions
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                  <div className="w-3 h-3 bg-violet-600 rounded-full mr-3"></div>
                  Lauréat du festival "Nouveaux Talents" 2022
                </li>
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                  <div className="w-3 h-3 bg-violet-600 rounded-full mr-3"></div>
                  Prix du public au concours national d'artistes 2021
                </li>
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                  <div className="w-3 h-3 bg-violet-600 rounded-full mr-3"></div>
                  Top 5 des artistes les plus demandés en 2023
                </li>
              </ul>
            </div>
          </motion.div>
        );
        
      case 'contact':
        return (
          <motion.div 
            key="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Contactez l'artiste</h2>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
              <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="mb-6 md:mb-0 md:w-1/2">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Informations de contact</h3>
                  
                  <ul className="space-y-4">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Globe className="w-5 h-5 mr-3 text-violet-600" />
                      <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">www.artistesite.com</a>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Instagram className="w-5 h-5 mr-3 text-violet-600" />
                      <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">@artisteofficial</a>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Facebook className="w-5 h-5 mr-3 text-violet-600" />
                      <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">ArtistePage</a>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Twitter className="w-5 h-5 mr-3 text-violet-600" />
                      <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">@artiste</a>
                    </li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Pour une réponse plus rapide, précisez le type d'événement et la date souhaitée.</p>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Demande de réservation</h3>
                  
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de l'événement</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                      <textarea 
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <button 
                      type="button"
                      className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Envoyer la demande
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="pt-20 pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-20 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md py-3 px-4 rounded-lg shadow-md mb-6 flex justify-between items-center"
        >
          <Link 
            to="/artists" 
            className="inline-flex items-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" /> 
            Retour aux artistes
          </Link>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={pulseAnimation}
              onClick={toggleFavorite}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Ajouter aux favoris"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
            </motion.button>
            
            <div className="relative">
              <motion.button
                whileTap={pulseAnimation}
                onClick={toggleShareOptions}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Partager"
              >
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <AnimatePresence>
                {showShareOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20"
                  >
                    <div className="px-4 py-2 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
                      Partager via
                    </div>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                      Facebook
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                      Twitter
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Instagram className="w-4 h-4 mr-3 text-pink-600" />
                      Instagram
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden w-full border border-gray-100 dark:border-gray-700"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="relative h-72 md:h-80 lg:h-96 overflow-hidden">
            <motion.img 
              src={artist.image_url} 
              alt={artist.name} 
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=Image+Non+Disponible';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8 z-10 w-full">
              <motion.span 
                className="inline-flex items-center px-3 py-1 mb-4 text-sm font-medium rounded-full bg-white/90 text-violet-800 shadow-sm backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {getCategoryIcon(artist.category)}
                <span className="ml-1">{artist.category}</span>
              </motion.span>
              
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {artist.name}
              </motion.h1>
              
              <motion.div 
                className="w-16 h-1 bg-violet-500 rounded-full mb-4"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-white text-sm font-medium">4.8/5</span>
                </div>
                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                <span className="text-white/90 text-sm">+120 spectacles</span>
                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                <span className="text-white/90 text-sm">Depuis 2015</span>
              </motion.div>
            </div>
          </div>
          
         {/* Tabs Navigation */}
         <div className="border-b border-gray-200 dark:border-gray-700 px-6 md:px-8 pt-4">
            <nav className="flex space-x-6 overflow-x-auto scrollbar-hide -mb-px">
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'about'
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                À propos
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'portfolio'
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'contact'
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Contact & Réservation
              </button>
            </nav>
          </div>
          
          <motion.div 
            className="p-6 md:p-8 lg:p-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
            
            <motion.div 
              className="mt-10"
              variants={slideUp}
            >
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Artistes similaires</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((index) => (
                  <Link 
                    key={index}
                    to={`/artists/artiste-${index}`}
                    className="group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={`https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Artiste+${index}`}
                        alt={`Artiste ${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Artiste {index}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{artist.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4"
              variants={slideUp}
            >
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Réserver cet artiste
              </Link>
              
              <Link 
                to="/artists" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-lg font-medium"
              >
                Voir d'autres artistes
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Sticky booking button for mobile */}
        <motion.div 
          className="fixed bottom-0 left-0 right-0 sm:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 p-4 z-10"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Link 
            to="/contact" 
            className="block w-full py-3 bg-violet-600 text-white rounded-lg text-center font-medium"
          >
            Réserver maintenant
          </Link>
        </motion.div>
        
        {/* Quick social sharing fab button */}
        <motion.div
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
        >
          <button 
            onClick={toggleFavorite}
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${
              isFavorite ? 'bg-red-500' : 'bg-white dark:bg-gray-800'
            } mb-4`}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'text-white fill-white' : 'text-gray-700 dark:text-gray-300'}`} />
          </button>
          
          <button 
            onClick={toggleShareOptions}
            className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-violet-600 text-white"
            aria-label="Partager"
          >
            <Share2 className="w-6 h-6" />
          </button>
          
          <AnimatePresence>
            {showShareOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-16 right-0 mb-4 shadow-lg rounded-lg overflow-hidden"
              >
                <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <button className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Facebook className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-800 dark:text-gray-200">Facebook</span>
                  </button>
                  <button className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Twitter className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-gray-800 dark:text-gray-200">Twitter</span>
                  </button>
                  <button className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                    <span className="text-gray-800 dark:text-gray-200">Instagram</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Floating CTA - Appears when scrolled */}
      <motion.div
        className="hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl px-1 py-1 flex items-center border border-gray-200 dark:border-gray-700">
          <img 
            src={artist.image_url || "https://via.placeholder.com/50/8B5CF6/FFFFFF"}
            alt={artist.name}
            className="w-10 h-10 rounded-full object-cover mr-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50/8B5CF6/FFFFFF';
            }}
          />
          <span className="text-gray-800 dark:text-gray-200 font-medium mr-4">{artist.name}</span>
          <Link
            to="/contact"
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full transition-colors text-sm font-medium"
          >
            Réserver
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ArtistDetailPage;
