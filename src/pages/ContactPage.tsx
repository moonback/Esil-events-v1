import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Navigation } from 'lucide-react';
import { sendContactFormEmail } from '../services/contactService';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import L from 'leaflet';

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
    <div className="min-h-screen pt-48 pb-16 px-4">
      <div className="container-custom mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Nous contacter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            {formSubmitted ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Message envoyé avec succès !</h2>
                <p className="mb-6">
                  Merci de nous avoir contacté. Notre équipe vous répondra dans les plus brefs délais.
                </p>
                <button 
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
                  className="btn-primary"
                >
                  Envoyer un nouveau message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Parlons de votre projet</h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Raison sociale *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de l'événement *
                      </label>
                      <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="eventDuration" className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full p-3 border border-gray-300 rounded-md"
                    ></textarea>
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.description.length}/1000 caractères
                    </p>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <div className="bg-black text-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-6">Nos coordonnées</h2>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <MapPin className="w-6 h-6 mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">Adresse</h3>
                    <p>ESIL Events</p>
                     <p>7 rue de la cellophane</p>
                    <p>78711 Mantes-la-Ville</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Phone className="w-6 h-6 mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">Téléphone</h3>
                    <p>06 20 46 13 85</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Mail className="w-6 h-6 mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p>contact@esil-events.fr</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Carte */}
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-6">Notre localisation</h2>
              <div className="h-[350px] w-full rounded-lg overflow-hidden shadow-lg">
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
              <div className="mt-4">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${48.98064744242492},${1.7254724964374457}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center map-directions-link"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Obtenir l'itinéraire
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Horaires d'ouverture</h2>
              
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="font-medium">9h00 - 18h00</span>
                </li>
                <li className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium">10h00 - 16h00</span>
                </li>
                <li className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-medium">Fermé</span>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Notre équipe est disponible 24h/24 et 7j/7 pour les interventions techniques sur les événements en cours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
