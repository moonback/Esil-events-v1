import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { Search, Bell, Settings, User, LogOut, Menu, X, Home, ChevronDown, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/authService';

interface AdminHeaderProps {
  title?: string;
  icon?: ReactNode;
  onToggleSidebar?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, icon, onToggleSidebar }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New user registration', time: '2 min ago', read: false },
    { id: 2, text: 'Server update completed', time: '1 hour ago', read: false },
    { id: 3, text: 'Weekly report available', time: 'Yesterday', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };



  return (
    <div className="mb-6">
      {/* Page Title Bar - visible below header */}
      {(title || icon) && (
        <div className="flex items-center pt-20 pb-4 px-4 md:px-6">
          {icon && <span className="text-primary-600 mr-3 flex-shrink-0">{icon}</span>}
          {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>}
        </div>
      )}
      
      <header className="fixed top-0 right-0 md:left-64 left-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm transition-all duration-300">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={onToggleSidebar}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb - Hidden on mobile */}
            <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 ml-2">
              <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-md">
                <Home className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="mx-2">/</span>
              <span className="font-medium text-gray-900 dark:text-white">{title || 'Dashboard'}</span>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile unless search is open */}
          {/* <div className={`${isSearchOpen ? 'flex absolute top-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 h-16 z-40' : 'hidden md:flex'} flex-1 max-w-xl mx-auto`}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              {isSearchOpen && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div> */}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 md:space-x-3">
            {/* Mobile Search Toggle */}
            {/* <button
              className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button> */}

            {/* Dark Mode Toggle */}
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button> */}

            {/* Notifications */}
            {/* <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                      Marquer tout comme lu
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div>
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{notification.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Aucune notification
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-center">
                    <button className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div> */}

            {/* Settings */}
            <button 
              onClick={() => window.location.href = '/'}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Voir le site</span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    {user?.email?.split('@')[0] || 'User'}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Administrateur
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                  <div className="md:hidden px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Administrateur
                    </p>
                  </div>
                  <div className="py-1">
                    {/* <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                      Mon profil
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                      Paramètres
                    </button> */}
                  </div>
                  <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-white dark:bg-gray-800 md:hidden z-20">
            <div className="p-4 space-y-4">
              <nav className="space-y-1">
                <button className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Home className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Tableau de bord
                </button>
                {/* Add more menu items here */}
              </nav>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {/* <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                  {darkMode ? 'Mode clair' : 'Mode sombre'}
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Paramètres
                </button> */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default AdminHeader;