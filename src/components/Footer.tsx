import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-300 pt-20 pb-12">
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
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-800">Nos services</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">•</span>
                <span className="text-gray-400">Location de matériel événementiel</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">•</span>
                <span className="text-gray-400">Solutions techniques clé en main</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">•</span>
                <span className="text-gray-400">Livraison & installation premium</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">•</span>
                <span className="text-gray-400">Gestion complète d'événements</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">•</span>
                <span className="text-gray-400">Conseil et accompagnement</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-800">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-violet-500 transition-colors flex items-start"
                >
                  <span className="text-violet-500 mr-2">→</span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/products/mobilier" 
                  className="text-gray-400 hover:text-violet-500 transition-colors flex items-start"
                >
                  <span className="text-violet-500 mr-2">→</span>
                  Mobilier & Décoration
                </Link>
              </li>
              <li>
                <Link 
                  to="/products/jeux" 
                  className="text-gray-400 hover:text-violet-500 transition-colors flex items-start"
                >
                  <span className="text-violet-500 mr-2">→</span>
                  Espaces jeux & animations
                </Link>
              </li>
              <li>
                <Link 
                  to="/products/technique" 
                  className="text-gray-400 hover:text-violet-500 transition-colors flex items-start"
                >
                  <span className="text-violet-500 mr-2">→</span>
                  Solutions techniques
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-violet-500 transition-colors flex items-start"
                >
                  <span className="text-violet-500 mr-2">→</span>
                  Contact & Devis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-gray-800">Nous contacter</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-violet-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  7 Rue de la Cellophane<br />
                  78711 Mantes-la-Ville<br />
                  Île-de-France
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-violet-500 mr-3 flex-shrink-0" />
                <a href="tel:+33620461385" className="text-gray-400 hover:text-violet-500 transition-colors">
                  06 20 46 13 85
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-violet-500 mr-3 flex-shrink-0" />
                <a href="mailto:contact@esil-events.fr" className="text-gray-400 hover:text-violet-500 transition-colors">
                  contact@esil-events.fr
                </a>
              </li>
            </ul>
            
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-400 mb-3">Suivez-nous</h5>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
            © 2025 ESIL Events - Tous droits réservés
          </p>
          <div className="flex space-x-6">
            <Link to="/legal" className="text-gray-500 hover:text-violet-500 text-sm transition-colors">
              Mentions légales
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-violet-500 text-sm transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/cgu" className="text-gray-500 hover:text-violet-500 text-sm transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
