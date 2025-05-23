import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Navigation, Facebook, Instagram, Linkedin } from 'lucide-react';
import { sendContactFormEmail } from '../services/contactService';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import L from 'leaflet';
import SEO from '../components/SEO';

// Composant pour ajouter des fonctionnalités supplémentaires à la carte
const MapFeatures: React.FC = () => {
  const map = useMap();
  
  // Ajout d'un gestionnaire d'événements pour le double-clic
  useEffect(() => {
    map.on('dblclick', () => {
      map.zoomIn();
    });
    
    return () => {
      map.off('dblclick');
    };
  }, [map]);
  
  return null;
};

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  eventDate: string;
  eventDuration: string;
  description: string;
}

const ContactPage: React.FC = () => {
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
  
  // Configuration personnalisée de l'icône de marqueur Leaflet
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);
  
  useEffect(() => {
    // Correction pour les icônes Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    // Création d'une icône personnalisée
    const icon = new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    setCustomIcon(icon);
  }, []);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    email: '',
    eventDate: '',
    eventDuration: '',
    description: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Envoyer les données du formulaire via le service d'email
      const result = await sendContactFormEmail(formData);
      
      if (result.success) {
        // Afficher le message de succès
        setFormSubmitted(true);
      } else {
        // Afficher l'erreur
        setError(result.error || 'Une erreur est survenue lors de l\'envoi du message.');
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi du formulaire:', err);
      setError('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 overflow-hidden">
      
<SEO 
  title="Contactez ESIL Events - Demande de devis et informations"
  description="Contactez ESIL Events pour organiser votre événement ou louer du matériel événementiel. Notre équipe est à votre écoute pour répondre à toutes vos questions."
  keywords="contact ESIL Events, devis événement, location matériel événementiel, organisation événement, agence événementielle contact"
/>
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
            Contactez-<span className="text-violet-300">nous</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Nous sommes à votre écoute pour répondre à toutes vos questions et vous accompagner dans la réalisation de vos événements.
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="container mx-auto px-6">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Contact Form */}
          <motion.div 
            className="relative"
            variants={fadeInUp}
          >
            {/* Forme décorative */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-100 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-100 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"></div>
            
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
              {formSubmitted ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                    <svg
                      className="h-10 w-10 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">Message envoyé avec succès !</h2>
                  <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">
                    Merci de nous avoir contacté. Notre équipe vous répondra dans les plus brefs délais.
                  </p>
                  <motion.button 
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        firstName: '',
                        lastName: '',
                        company: '',
                        phone: '',
                        email: '',
                        eventDate: '',
                        eventDuration: '',
                        description: '',
                      });
                    }}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Envoyer un nouveau message
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <motion.h2 
                    className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent"
                    variants={fadeInUp}
                  >
                    Parlons de votre projet
                  </motion.h2>
                  
                  {error && (
                    <motion.div 
                      className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p>{error}</p>
                    </motion.div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Raison sociale *
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date de l'événement *
                        </label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="eventDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Durée de l'événement *
                        </label>
                        <input
                          type="text"
                          id="eventDuration"
                          name="eventDuration"
                          value={formData.eventDuration}
                          onChange={handleInputChange}
                          required
                          placeholder="Ex: 1 jour, 2 jours, etc."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description de votre projet (1000 caractères max) *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        maxLength={1000}
                        rows={5}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      ></textarea>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {formData.description.length}/1000 caractères
                      </p>
                    </div>
                    
                    <motion.button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer votre message'}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-gradient-to-br from-black to-gray-900 text-white p-8 rounded-3xl shadow-2xl mb-8 transform transition-all duration-300 hover:shadow-violet-200/10"
              variants={scaleIn}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-bold mb-8 border-b border-gray-700 pb-4">Nos coordonnées</h2>
              
              <ul className="space-y-8">
                <motion.li 
                  className="flex items-start group"
                  variants={fadeInUp}
                >
                  <div className="bg-gradient-to-br from-violet-500 to-violet-700 p-3 rounded-2xl text-white shadow-lg mr-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-violet-300">Adresse</h3>
                    <p className="text-gray-300">ESIL Events</p>
                    <p className="text-gray-300">7 rue de la cellophane</p>
                    <p className="text-gray-300">78711 Mantes-la-Ville</p>
                  </div>
                </motion.li>
                <motion.li 
                  className="flex items-start group"
                  variants={fadeInUp}
                >
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-2xl text-white shadow-lg mr-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-violet-300">Téléphone</h3>
                    <div className="space-y-2">
                      <a href="tel:+33785959723" className="block text-gray-300 hover:text-violet-300 transition-colors">
                        Service commercial : 07 85 95 97 23 (lundi au vendredi de 9h-17h)
                      </a>
                      <a href="tel:+33620461385" className="block text-gray-300 hover:text-violet-300 transition-colors">
                        Service technique : 06 20 46 13 85
                      </a>
                    </div>
                  </div>
                </motion.li>
                <motion.li 
                  className="flex items-start group"
                  variants={fadeInUp}
                >
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-2xl text-white shadow-lg mr-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-violet-300">Email</h3>
                    <a href="mailto:contact@esil-events.fr" className="text-gray-300 hover:text-violet-300 transition-colors">contact@esil-events.fr</a>
                  </div>
                </motion.li>
              </ul>

              <motion.div 
                className="mt-10 pt-8 border-t border-gray-700"
                variants={fadeInUp}
              >
                <h3 className="font-bold mb-6 text-violet-300">Suivez-nous</h3>
                <div className="flex space-x-6">
                  <motion.a
                    href="https://www.facebook.com/profile.php?id=61574583021091"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-violet-600 text-white p-3 rounded-full transition-all duration-300"
                    aria-label="Suivez-nous sur Facebook"
                    whileHover={{ y: -5, backgroundColor: "#8B5CF6" }}
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="https://www.instagram.com/esilevents/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-violet-600 text-white p-3 rounded-full transition-all duration-300"
                    aria-label="Suivez-nous sur Instagram"
                    whileHover={{ y: -5, backgroundColor: "#8B5CF6" }}
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="https://linkedin.com/company/esil-events"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-violet-600 text-white p-3 rounded-full transition-all duration-300"
                    aria-label="Suivez-nous sur LinkedIn"
                    whileHover={{ y: -5, backgroundColor: "#8B5CF6" }}
                  >
                    <Linkedin className="w-5 h-5" />
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>

            {/* Carte */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl mb-8"
              variants={scaleIn}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Notre localisation</h2>
              <div className="h-[350px] w-full rounded-xl overflow-hidden shadow-lg">
                {customIcon && (
                  <MapContainer 
                    center={[48.98064744242492, 1.7254724964374457]}
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    scrollWheelZoom={true}
                    className="map-container"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="bottomright" />
                    <MapFeatures />
                    <Marker position={[48.98064744242492, 1.7254724964374457]} icon={customIcon}>
                      <Popup className="custom-popup" minWidth={220} maxWidth={300}>
                        <div className="font-medium">
                          <div className="flex items-center mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="font-bold">ESIL Events</span>
                          </div>
                          <p>7 rue de la cellophane<br />78711 Mantes-la-Ville</p>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center mb-1">
                              <Phone className="w-4 h-4 mr-1" />
                              <span>06 20 46 13 85</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Lun-Ven: 9h-18h</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                )}
              </div>
              <div className="mt-6 flex flex-col items-center">
                {/* Remove this empty div */}
                {/* <div className="flex justify-center space-x-4"></div> */}
                <motion.a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${48.98064744242492},${1.7254724964374457}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 mb-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Obtenir l'itinéraire
                </motion.a>
                <div className="flex justify-center space-x-4">
                  <motion.a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${48.98064744242492},${1.7254724964374457}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-violet-100 dark:hover:bg-violet-900 p-3 rounded-full transition-colors duration-300"
                    title="En voiture"
                    aria-label="Obtenir l'itinéraire en voiture"
                    whileHover={{ scale: 1.1, backgroundColor: "#EDE9FE" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
                      <circle cx="7" cy="17" r="2"/>
                      <path d="M9 17h6"/>
                      <circle cx="17" cy="17" r="2"/>
                    </svg>
                  </motion.a>
                  <motion.a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${48.98064744242492},${1.7254724964374457}&travelmode=transit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-violet-100 dark:hover:bg-violet-900 p-3 rounded-full transition-colors duration-300"
                    title="En transports en commun"
                    aria-label="Obtenir l'itinéraire en transports en commun"
                    whileHover={{ scale: 1.1, backgroundColor: "#EDE9FE" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="3" width="16" height="16" rx="2"/>
                      <path d="M4 11h16"/>
                      <path d="M12 3v16"/>
                      <path d="M8 15h0"/>
                      <path d="M16 15h0"/>
                      <path d="M8 19l-2 3"/>
                      <path d="M18 22l-2-3"/>
                    </svg>
                  </motion.a>
                  {/* Change this from <a> to <motion.a> to match the other links */}
                  <motion.a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${48.98064744242492},${1.7254724964374457}&travelmode=walking`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-violet-100 dark:hover:bg-violet-900 p-3 rounded-full transition-colors duration-300"
                    title="À pied"
                    aria-label="Obtenir l'itinéraire à pied"
                    whileHover={{ scale: 1.1, backgroundColor: "#EDE9FE" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 4v16"/>
                      <path d="M17 4v16"/>
                      <path d="M21 4v16"/>
                      <path d="M8 6l3-3 3 3"/>
                      <path d="M17 18l-3 3-3-3"/>
                    </svg>
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Horaires d'ouverture */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl"
              variants={scaleIn}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Horaires d'ouverture du dépôt</h2>
              
              <ul className="space-y-4">
                <li className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors duration-300">
                  <span className="font-medium">Lundi - Vendredi</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">9h15 - 12h00 et 14h15 - 16h30</span>
                </li>
                <li className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors duration-300">
                  <span className="font-medium">Samedi - Dimanche</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">Fermé</span>
                </li>
              </ul>
              
              
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;

