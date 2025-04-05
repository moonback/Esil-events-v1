import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Music, Mic, Radio, Theater, Users } from 'lucide-react';
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
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/artists" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux artistes
        </Link>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-full"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="relative h-72 md:h-96 lg:h-[500px]">
            <img 
              src={artist.image_url} 
              alt={artist.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400/blue/white?text=Image+Non+Disponible';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white">{artist.name}</h1>
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100/80 text-blue-600 backdrop-blur-sm">
                {getCategoryIcon(artist.category)}
                <span className="ml-1">{artist.category}</span>
              </span>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="prose prose-blue max-w-none dark:prose-invert mb-8">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{artist.description}</p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Réserver cet artiste
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtistDetailPage;