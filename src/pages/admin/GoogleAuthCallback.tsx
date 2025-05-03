import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForTokens } from '../../services/googleSearchConsoleService';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';

const GoogleAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extraire le code d'autorisation de l'URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (!code) {
          setStatus('error');
          setMessage('Aucun code d\'autorisation trouvé dans l\'URL.');
          return;
        }

        // Échanger le code contre des tokens
        const success = await exchangeCodeForTokens(code);

        if (success) {
          setStatus('success');
          setMessage('Authentification réussie! Redirection...');
          // Rediriger vers la page de suivi des mots-clés après 2 secondes
          setTimeout(() => {
            navigate('/admin/keyword-tracking');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Échec de l\'authentification. Veuillez réessayer.');
        }
      } catch (error) {
        console.error('Erreur lors du traitement du callback:', error);
        setStatus('error');
        setMessage(`Erreur: ${error instanceof Error ? error.message : 'Une erreur inconnue est survenue'}`);
      }
    };

    handleCallback();
  }, [location.search, navigate]);

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Authentification en cours...</h2>
              <p className="text-gray-600 dark:text-gray-300">Veuillez patienter pendant que nous traitons votre authentification Google.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="font-medium">Authentification réussie!</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">Vous allez être redirigé vers la page de suivi des mots-clés...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
                <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span className="font-medium">Erreur d'authentification</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
              <button 
                onClick={() => navigate('/admin/keyword-tracking')} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour au suivi des mots-clés
              </button>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GoogleAuthCallback;