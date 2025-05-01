import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Music, Mic, Radio, Theater, Users, Calendar, Star, MapPin, Award, Clock, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';
import { Artist, getArtistByName } from '../services/artistService';

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const artistName = id ? decodeURIComponent(id) : '';
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistName) return;
      
      try {
        setLoading(true);
        const data = await getArtistByName(artistName);
        setArtist(data);
      } catch (err) {
        console.error('Error fetching artist:', err);
        setError('Impossible de charger les détails de l\'artiste. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [artistName]);

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

  if (error || !artist) {
    return (
      <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center w-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Artiste non trouvé"}</p>
          <Link 
            to="/artists" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux artistes
          </Link>
        </div>
      </div>
    );
  }

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
            <span className="text-violet-300">{artist.name}</span>
          </motion.h1>
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <span className="inline-flex items-center px-4 py-2 text-base font-medium rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg">
              {getCategoryIcon(artist.category)}
              <span className="ml-2">{artist.category}</span>
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Formes décoratives */}
        <div className="relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-100 rounded-full opacity-50 dark:opacity-10 blur-3xl z-0"></div>
          <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-indigo-100 rounded-full opacity-60 dark:opacity-10 blur-3xl z-0"></div>
        </div>

        <div className="relative z-10 mb-8">
          <Link 
            to="/artists" 
            className="inline-flex items-center px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux artistes
          </Link>
        </div>
        
        <motion.div 
          className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="relative h-72 md:h-96 lg:h-[500px] overflow-hidden">
            <img 
              src={artist.image_url} 
              alt={artist.name} 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400/blue/white?text=Image+Non+Disponible';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
          
          <div className="p-8 md:p-10">
            {/* Section À propos */}
            <motion.div 
              className="prose prose-lg max-w-none dark:prose-invert mb-12"
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">À propos de {artist.name}</span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{artist.description}</p>
            </motion.div>
            
            {/* Section Informations */}
            {/* <motion.div
              className="mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Informations</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl flex items-start">
                  <Award className="w-6 h-6 text-violet-600 dark:text-violet-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Spécialité</h3>
                    <p className="text-gray-600 dark:text-gray-300">{artist.category}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl flex items-start">
                  <Clock className="w-6 h-6 text-violet-600 dark:text-violet-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Expérience</h3>
                    <p className="text-gray-600 dark:text-gray-300">Plus de 5 ans</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl flex items-start">
                  <MapPin className="w-6 h-6 text-violet-600 dark:text-violet-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Disponibilité</h3>
                    <p className="text-gray-600 dark:text-gray-300">France entière</p>
                  </div>
                </div>
              </div>
            </motion.div> */}
            
            {/* Section Performances passées */}
            {/* <motion.div
              className="mb-12"
              variants={staggerContainer}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Performances passées</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Festival de Musique de Paris",
                    date: "Juin 2023",
                    description: "Performance principale sur la scène centrale"
                  },
                  {
                    title: "Gala d'entreprise Microsoft",
                    date: "Décembre 2022",
                    description: "Animation de la soirée annuelle"
                  },
                  {
                    title: "Mariage VIP à Cannes",
                    date: "Juillet 2022",
                    description: "Performance exclusive pour 200 invités"
                  },
                  {
                    title: "Tournée nationale",
                    date: "2021-2022",
                    description: "15 dates dans les principales villes françaises"
                  }
                ].map((performance, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    variants={fadeInUp}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{performance.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {performance.date}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{performance.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div> */}
            
            {/* Section Témoignages */}
            {/* <motion.div
              className="mb-12"
              variants={staggerContainer}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Ce qu'en disent nos clients</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    quote: "Une prestation exceptionnelle qui a transformé notre événement en un moment magique. Professionnalisme et talent au rendez-vous !",
                    author: "Marie L., Responsable événementiel",
                    rating: 5
                  },
                  {
                    quote: "Nous avons été impressionnés par la qualité de la performance et la capacité à captiver notre audience. À recommander sans hésitation !",
                    author: "Thomas D., Directeur marketing",
                    rating: 5
                  }
                ].map((testimonial, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    variants={fadeInUp}
                  >
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="italic mb-6 text-gray-700 dark:text-gray-300">"{testimonial.quote}"</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{testimonial.author}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div> */}
            
            {/* Section Contact et Réservation */}
            <motion.div
              className="mb-8"
              variants={fadeIn}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Contact et Réservation</span>
              </h2>
              
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-violet-100 dark:border-violet-800/30 mb-8">
                <p className="text-gray-700 dark:text-gray-300 mb-6">Pour réserver {artist.name} pour votre prochain événement ou pour toute demande d'information, n'hésitez pas à nous contacter directement.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-3" />
                      <span className="text-gray-800 dark:text-gray-200">06.20.46.13.85 (Eric)</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-3" />
                      <span className="text-gray-800 dark:text-gray-200">07.85.95.97.23 (Amelie)</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-3" />
                    <span className="text-gray-800 dark:text-gray-200">contact@esil-events.fr</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/esilevents" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="https://www.instagram.com/esilevents" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors">
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
              </div>
              
              {/* <motion.div 
                className="flex flex-col sm:flex-row sm:items-center gap-4"
                variants={scaleIn}
              >
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl text-lg font-medium"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Réserver cet artiste
                </Link>
              </motion.div> */}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtistDetailPage;