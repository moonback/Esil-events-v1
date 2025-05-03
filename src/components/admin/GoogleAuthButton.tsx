import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { isGoogleAuthenticated, getGoogleAuthUrl, disconnectFromGoogle, getVerifiedSites } from '../../services/googleSearchConsoleService';

interface GoogleAuthButtonProps {
  onAuthStatusChange?: (isAuthenticated: boolean) => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onAuthStatusChange }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [verifiedSites, setVerifiedSites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSites, setShowSites] = useState<boolean>(false);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = isGoogleAuthenticated();
      setAuthenticated(isAuth);
      
      if (onAuthStatusChange) {
        onAuthStatusChange(isAuth);
      }
      
      if (isAuth) {
        loadVerifiedSites();
      }
    };
    
    checkAuth();
  }, [onAuthStatusChange]);

  // Charger les sites vérifiés
  const loadVerifiedSites = async () => {
    setLoading(true);
    try {
      const sites = await getVerifiedSites();
      setVerifiedSites(sites);
    } catch (error) {
      console.error('Erreur lors du chargement des sites vérifiés:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la connexion à Google
  const handleConnect = () => {
    const authUrl = getGoogleAuthUrl();
    window.location.href = authUrl;
  };

  // Gérer la déconnexion de Google
  const handleDisconnect = () => {
    disconnectFromGoogle();
    setAuthenticated(false);
    setVerifiedSites([]);
    
    if (onAuthStatusChange) {
      onAuthStatusChange(false);
    }
  };

  // Afficher/masquer la liste des sites vérifiés
  const toggleSitesList = () => {
    setShowSites(!showSites);
  };

  return (
    <div className="flex flex-col space-y-3">
      {authenticated ? (
        <>
          <div className="flex items-center">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnecter Google Search Console
            </button>
            
            <button
              onClick={toggleSitesList}
              className="ml-3 px-3 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300"
            >
              {showSites ? 'Masquer les sites' : 'Afficher les sites vérifiés'}
            </button>
          </div>
          
          {showSites && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium mb-2">Sites vérifiés dans Search Console :</h3>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                  <span className="text-sm">Chargement des sites...</span>
                </div>
              ) : verifiedSites.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {verifiedSites.map((site, index) => (
                    <li key={index} className="text-blue-600 hover:underline">
                      <a href={site} target="_blank" rel="noopener noreferrer">{site}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucun site vérifié trouvé. Veuillez vérifier votre site dans <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Search Console</a>.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center">
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Connecter Google Search Console
          </button>
          <div className="ml-3 text-sm text-gray-500">
            Connectez-vous pour obtenir des données réelles de positionnement
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;