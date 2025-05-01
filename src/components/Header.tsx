import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Settings, Mail, Phone, Sun, Moon, ChevronDown, Package, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/authService';
import MegaMenu from './MegaMenu';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import TopBar from './TopBar';
import MobileSidebar from './MobileSidebar';
import '../styles/header-animations.css';
// import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { items } = useCart();
  const { user, isAdminUser } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  



  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuRef.current && !userMenuRef.current.contains(target) && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      
      if (showMegaMenu && megaMenuButtonRef.current && !megaMenuButtonRef.current.contains(target) && 
          !target.closest('.mega-menu-container')) {
        setShowMegaMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMegaMenu]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const [showTopBar, setShowTopBar] = useState(true);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {showTopBar && <TopBar onClose={() => setShowTopBar(false)} />}
      
      <div 
        className={`transition-all duration-300 relative ${
          isScrolled 
            ? 'glassmorphism shadow-lg border-b border-gray-200/20 dark:border-gray-700/20' 
            : 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm'
        }`} 
        style={{ '--header-height': 'calc(2.5rem + 44px)' } as React.CSSProperties}
      >
        <div className="w-full mx-auto">
          <div className="flex flex-col relative">
            {/* Logo Section - Absolute positioned to overlap */}
            <div className="absolute left-4 top-5 z-10">
              <Link to="/" className="flex items-center group">
                {/* Desktop version */}
                <img 
                  src="images/logo.png" 
                  alt="ESIL Events Logo" 
                  className="hidden md:block h-20 w-20 transition-all duration-300 transform group-hover:scale-105 hover:rotate-3 filter drop-shadow-lg"
                />
                {/* Mobile version */}
                <img 
                  src="images/logo.png" 
                  alt="ESIL Events Logo" 
                  className="md:hidden h-12 w-12 mt-[35px] transition-all duration-300 transform group-hover:scale-105 hover:rotate-3 filter drop-shadow-lg"
                />
              </Link>
            </div>

            {/* Search Bar Section */}
            <div className="w-full py-3 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="px-4 flex items-center justify-center">
                <div className="flex-1 max-w-3xl relative">
                  <SearchBar 
                    onSearch={handleSearch} 
                    onChange={(query) => setSearchQuery(query)}
                    value={searchQuery}
                  />
                  {searchQuery.trim().length > 0 && (
                    <SearchResults 
                      query={searchQuery} 
                      onClose={() => setSearchQuery('')} 
                      results={[]} 
                      onSelect={(product) => {
                        setSearchQuery('');
                        navigate(`/product/${product.id}`);
                      }} 
                    />
                  )}
                </div>
                <div className="hidden md:flex space-x-2 ml-4">
                  <a 
                    href="tel:0620461385" 
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-50/80 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-primary-500/30"
                  >
                    <Phone className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium tracking-wide">06.20.46.13.85</span>
                  </a>
                  <a 
                    href="tel:07.85.95.97.23" 
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-50/80 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-primary-500/30"
                  >
                    <Phone className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium tracking-wide">07.85.95.97.23</span>
                  </a>
                  <Link
                    to="/contact"
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-50/80 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-primary-500/30"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium tracking-wide">Contact</span>
                  </Link>
                </div>
                
                <div className="hidden md:flex space-x-3 ml-3">
                  <a href="https://www.facebook.com/profile.php?id=61574583021091" target="_blank" rel="noopener noreferrer" 
                    className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 transform hover:scale-110 hover:shadow-md group"
                    aria-label="Facebook">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" 
                      fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/esilevents" target="_blank" rel="noopener noreferrer" 
                    className="p-2 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-all duration-300 transform hover:scale-110 hover:shadow-md group"
                    aria-label="Instagram">
                    <svg className="w-5 h-5 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors duration-300" 
                      fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  
                  
                </div>
              </div>
              
            </div>

            {/* Main Navigation */}
            <div className="flex items-center h-14 px-4">
              {/* Spacer for logo */}
              <div className="w-24"></div>

              <div className="flex-1 flex justify-center">
                <nav className="hidden md:flex items-center space-x-8">
                  <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 py-1 border-b-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
                    Accueil
                  </Link>
                  <div className="relative group mega-menu-container">
                    <button
                      ref={megaMenuButtonRef}
                      onClick={() => setShowMegaMenu(!showMegaMenu)}
                      onMouseEnter={() => setShowMegaMenu(true)}
                      onMouseLeave={() => setShowMegaMenu(false)}
                      className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center space-x-1 py-1 nav-link-border"
                    >
                      <span>Location matériel</span>
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 ${showMegaMenu ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    {showMegaMenu && (
                      <div
                        className="fixed left-0 right-0 w-full bg-white/0 dark:bg-gray-900/95 backdrop-blur-md shadow-lg z-50 border-t border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 animate-fadeIn"
                        style={{ top: 'calc(var(--header-height) - 1px + 20px)' }}
                        onMouseEnter={() => setShowMegaMenu(true)}
                        onMouseLeave={() => setShowMegaMenu(false)}
                      >
                        <div className="max-w-7xl mx-auto px-4 py-6">
                          <MegaMenu onLinkClick={() => setShowMegaMenu(false)} />
                        </div>
                      </div>
                    )}
                  </div>
                  <Link to="/artists" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 py-1 nav-link-border">
                    Artistes
                  </Link>
                  <Link to="/about" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 py-1 nav-link-border">
                    À propos
                  </Link>
                  <Link to="/delivery" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 py-1 nav-link-border">
                    Livraison
                  </Link>
                  <Link to="/contact" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 py-1 nav-link-border">
                    Contact
                  </Link>
                  <Link to="/agence-evenementielle" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 py-1 nav-link-border">
                    <i>Agence événementielle</i>
                  </Link>
                </nav>
              </div>

              <div className="flex items-center space-x-3">
                {/* Cart Button with Animation */}
                <Link 
                  to="/cart" 
                  className="relative group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:shadow-md hover:ring-2 hover:ring-primary-500/30"
                  aria-label="Panier"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300 transform group-hover:rotate-12" />
                  {items.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md animate-pulse-slow">
                      {items.length}
                    </span>
                  )}
                </Link>

                

                {/* User Menu */}
                {user ? (
                  <div className="relative user-menu-container" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:shadow-md hover:ring-2 hover:ring-primary-500/30 flex items-center space-x-1"
                      aria-label="Menu utilisateur"
                      aria-expanded={showUserMenu}
                    >
                      <User className="w-5 h-5 text-gray-700 dark:text-gray-200 transition-all duration-300 transform group-hover:rotate-12" />
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl py-2 z-50 border border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 animate-fadeIn">
                        <div className="px-4 py-3 border-b border-gray-200/60 dark:border-gray-700/60">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.user_metadata.first_name || 'Mon compte'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1">
                          
                          {isAdminUser && (
                            <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                              <Settings className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                              Administration
                            </Link>
                          )}
                        </div>
                        {/* <div className="py-1 border-t border-gray-200/60 dark:border-gray-700/60">
                          <button 
                            onClick={handleSignOut} 
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Déconnexion
                          </button>
                        </div> */}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:shadow-md hover:ring-2 hover:ring-primary-500/30 flex items-center space-x-1"
                  >
                    <User className="w-5 h-5 text-gray-700 dark:text-gray-200 transition-all duration-300 transform hover:rotate-12" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Connexion</span>
                  </Link>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Menu mobile"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-200 transition-all duration-300 transform hover:rotate-90" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200 transition-all duration-300 transform hover:rotate-12" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu - Replaced with MobileSidebar component */}
          {isMobileMenuOpen && (
            <MobileSidebar 
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              user={user}
              isAdminUser={isAdminUser}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
