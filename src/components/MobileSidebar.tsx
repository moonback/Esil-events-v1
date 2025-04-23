import React from 'react';
import { Link } from 'react-router-dom';
import { X, Settings, Home, ShoppingBag, Info, Phone, Truck, User, Heart, Package, LogOut } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  isAdminUser: boolean;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  isAdminUser 
}) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90] md:hidden"
        onClick={onClose}
      />
      {/* Sidebar - From top */}
      <div 
        className={`fixed top-0 left-0 right-0 w-full h-auto max-h-[105vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-[100] md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        } shadow-xl rounded-b-xl`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <div className="flex items-center">
            {/* <img 
              src="/images/logo.png" 
              alt="ESIL Events Logo" 
              className="h-8 w-8 mr-3"
            /> */}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ESIL Events</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* User info section if logged in */}
        {user && (
          <div className="px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border-b border-gray-200/80 dark:border-gray-700/80">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-violet-200 dark:bg-violet-700 flex items-center justify-center">
                <User className="w-5 h-5 text-violet-700 dark:text-violet-200" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.user_metadata?.first_name || 'Bienvenue'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-2 py-3 space-y-1 overflow-y-auto">
          {/* Main navigation */}
          <div className="mb-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Navigation
            </h3>
            <Link 
              to="/" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <Home className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Accueil
            </Link>
            <Link 
              to="/products" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <ShoppingBag className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Nos produits
            </Link>
            <Link 
              to="/agence-evenementielle" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <Heart className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Agence événementielle
            </Link>
            <Link 
              to="/artists" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Artistes
            </Link>
          </div>

          {/* Information section */}
          <div className="mb-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Informations
            </h3>
            <Link 
              to="/about" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <Info className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              À propos
            </Link>
            <Link 
              to="/contact" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <Phone className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Contact
            </Link>
            <Link 
              to="/delivery" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <Truck className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Livraison
            </Link>
          </div>

          {/* User account section
          {user && (
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Mon compte
              </h3>
              <Link 
                to="/profile" 
                className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                onClick={onClose}
              >
                <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                Mon profil
              </Link>
              <Link 
                to="/orders" 
                className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                onClick={onClose}
              >
                <Package className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                Mes commandes
              </Link>
              {isAdminUser && (
                <Link 
                  to="/admin" 
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  onClick={onClose}
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Administration
                </Link>
              )}
              <button 
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                onClick={() => {
                  onClose();
                  // You'll need to add a signOut prop or handle this differently
                }}
              >
                <LogOut className="w-4 h-4 mr-3 text-red-500" />
                Déconnexion
              </button>
            </div>
          )} */}

          {/* Contact info */}
          <div className="px-3 py-4 mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Contactez-nous
            </h3>
            <div className="space-y-2">
              <a 
                href="tel:0620461385" 
                className="flex items-center text-sm text-gray-700 dark:text-gray-200"
              >
                <Phone className="w-4 h-4 mr-2 text-violet-500" />
                06 20 46 13 85
              </a>
              <a 
                href="tel:0785959723" 
                className="flex items-center text-sm text-gray-700 dark:text-gray-200"
              >
                <Phone className="w-4 h-4 mr-2 text-violet-500" />
                07 85 95 97 23
              </a>
            </div>
            <div className="flex space-x-3 mt-3">
              <a href="https://www.facebook.com/profile.php?id=61574583021091" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.instagram.com/esilevents" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;