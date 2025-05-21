import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, ArrowRight, CircleDot, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter } from '../services/newsletterService';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // État pour le formulaire de newsletter
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const services = [
    "Location de matériel événementiel",
    "Solutions techniques clé en main",
    "Livraison & installation premium",
    "Gestion complète d'événements",
    "Conseil et accompagnement"
  ];
  
  const navLinks = [
    { to: "/", text: "Accueil" },
    { to: "/products/mobilier", text: "Mobilier & Décoration" },
    { to: "/products/jeux", text: "Espaces jeux & animations" },
    { to: "/products/technique", text: "Solutions techniques" },
    { to: "/products/realizations", text: "Nos réalisations" },
    { to: "/contact", text: "Contact & Devis" }
  ];
  
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, label: "Facebook", href: "https://facebook.com/esilevents" },
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", href: "https://instagram.com/esil_events" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", href: "https://linkedin.com/company/esil-events" }
  ];
  
  // Fonction pour gérer la soumission du formulaire de newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base de l'email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Veuillez entrer une adresse email valide');
      setSubscriptionStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubscriptionStatus('idle');
    setErrorMessage('');
    
    try {
      // Appel au service d'inscription à la newsletter
      const result = await subscribeToNewsletter(email);
      
      if (result.success) {
        // Réinitialiser le formulaire et afficher un message de succès
        setEmail('');
        setSubscriptionStatus('success');
      } else {
        // Afficher un message d'erreur
        // Convertir l'objet d'erreur en chaîne de caractères si nécessaire
        const errorMsg = typeof result.error === 'object' && result.error !== null
          ? (result.error.message || JSON.stringify(result.error))
          : (result.error || 'Une erreur est survenue. Veuillez réessayer.');
        setErrorMessage(errorMsg);
        setSubscriptionStatus('error');
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription à la newsletter:', err);
      setErrorMessage('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
      setSubscriptionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 pt-20 pb-12">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="lg:pr-4">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                ESIL Events
              </span>
            </h3>
            <p className="mb-4 text-gray-400 leading-relaxed">
              Expert en organisation d'événements d'entreprise et location de matériel premium pour des expériences mémorables.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Nous concevons des solutions sur mesure pour vos séminaires, soirées et lancements produits.
            </p>
            
            <div className="mt-8">
              <Link 
                to="/about" 
                className="inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors"
              >
                Découvrir notre histoire
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">Nos services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="flex items-start">
                  <CircleDot className="w-4 h-4 text-violet-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">Navigation</h4>
            <ul className="space-y-3">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-violet-400 transition-colors flex items-start group"
                  >
                    <ArrowRight className="w-4 h-4 text-violet-500 mr-2 mt-1 transform group-hover:translate-x-1 transition-transform" />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-700">Nous contacter</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-violet-500 mr-3 mt-0.5 flex-shrink-0" />
                <a 
                  href="https://maps.google.com/?q=7+Rue+de+la+Cellophane+78711+Mantes-la-Ville" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-violet-400 transition-colors"
                >
                  7 Rue de la Cellophane<br />
                  78711 Mantes-la-Ville<br />
                  Île-de-France
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-violet-500 mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  <a 
                    href="tel:+33620461385" 
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    06 20 46 13 85
                  </a>
                  <a 
                    href="tel:0785959723" 
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    07.85.95.97.23

                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-violet-500 mr-3 flex-shrink-0" />
                <a 
                  href="mailto:contact@esil-events.fr" 
                  className="text-gray-400 hover:text-violet-400 transition-colors"
                >
                  contact@esil-events.fr
                </a>
              </li>
            </ul>
            
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Suivez-nous</h5>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    className="bg-gray-800 hover:bg-violet-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 mt-16 pt-12 mb-12">
          <div className="max-w-xl mx-auto">
            <h4 className="text-lg font-semibold text-white mb-4 text-center">Restez informé</h4>
            <p className="text-gray-400 mb-6 text-center">
              Inscrivez-vous à notre newsletter pour recevoir nos actualités et offres exclusives
            </p>
            
            {subscriptionStatus === 'success' ? (
              <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <p className="text-green-300">Merci pour votre inscription ! Vous recevrez bientôt nos actualités.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email" 
                    className={`w-full px-4 py-3 rounded-lg bg-gray-800 border ${subscriptionStatus === 'error' ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-violet-500'} text-white focus:outline-none focus:ring-2`}
                    required
                    disabled={isSubmitting}
                  />
                  {subscriptionStatus === 'error' && (
                    <div className="mt-2 flex items-center text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
            © {currentYear} ESIL Events - Tous droits réservés
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/conditions-generales-d-utilisation" className="text-gray-500 hover:text-violet-400 text-sm transition-colors">
              Mentions légales
            </Link>
            <Link to="/politique-de-confidentialite" className="text-gray-500 hover:text-violet-400 text-sm transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/cgu" className="text-gray-500 hover:text-violet-400 text-sm transition-colors">
              CGU
            </Link>
            <Link to="/livraison" className="text-gray-500 hover:text-violet-400 text-sm transition-colors">
              Livraison
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;