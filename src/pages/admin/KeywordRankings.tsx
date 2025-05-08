import React, { useState, useRef, useEffect } from 'react';
import { Search, AlertCircle, ExternalLink, Sparkles, BarChart, Settings, Monitor } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import KeywordRankingTool from '../../components/admin/KeywordRankingTool';
import KeywordGeneratorTool from '../../components/admin/KeywordGeneratorTool';
import { NotificationContainer } from '../../components/admin/AdminNotification';
import { isGoogleSearchConfigValid } from '../../config/googleSearchApi';
import { useLocation } from 'react-router-dom';

const KeywordRankings: React.FC = () => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'ranking' | 'generator'>('ranking');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const apiConfigured = isGoogleSearchConfigValid();
  const location = useLocation();

  // Récupérer les mots-clés et le nom du produit depuis l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const keywordsParam = searchParams.get('keywords');
    const productName = searchParams.get('productName');
    
    if (keywordsParam) {
      setSearchKeyword(keywordsParam);
      // Afficher une notification pour indiquer que les mots-clés ont été chargés
      if (productName) {
        setNotification({
          type: 'success',
          message: `Mots-clés chargés pour le produit: ${productName}`
        });
        
        // Effacer la notification après 5 secondes
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    }
  }, [location]);

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="pt-20 px-4 md:px-8 lg:px-12 max-w-10xl mx-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                <Search className="w-6 h-6 mr-2" />
                Outils SEO Professionnels
              </h1>
              <p className="text-violet-100 mt-2 max-w-2xl">
                Optimisez votre visibilité en ligne avec nos outils de surveillance de classement et de génération de mots-clés.
              </p>
            </div>
            {/* <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg py-1 px-1 inline-flex">
                <button 
                  onClick={() => {}}
                  className="text-white text-sm font-medium px-3 py-1.5 rounded-md flex items-center hover:bg-white/10"
                >
                  <BarChart className="w-4 h-4 mr-1.5" />
                  Tableau de bord
                </button>
                <button 
                  onClick={() => {}}
                  className="text-white text-sm font-medium px-3 py-1.5 rounded-md flex items-center hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-1.5" />
                  Configuration
                </button>
              </div>
            </div> */}
          </div>
        </div>
        
        {/* Navigation tabs with improved design */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab('ranking')}
            className={`py-3 px-6 font-medium text-sm flex items-center ${
              activeTab === 'ranking' 
                ? 'text-violet-700 border-b-2 border-violet-700 dark:text-violet-400 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-t-lg' 
                : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 dark:hover:text-violet-300'
            }`}
          >
            <Search className="w-4 h-4 mr-2" />
            Suivi des positions
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`py-3 px-6 font-medium text-sm flex items-center ${
              activeTab === 'generator' 
                ? 'text-violet-700 border-b-2 border-violet-700 dark:text-violet-400 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-t-lg' 
                : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 dark:hover:text-violet-300'
            }`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Générateur de mots-clés
          </button>
        </div>

        {/* Tool description cards */}
        <div className="mb-8">
          {activeTab === 'ranking' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start">
                <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-lg mr-4">
                  <Monitor className="w-5 h-5 text-violet-700 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Suivi des positions</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Cet outil vous permet de suivre la position de votre site dans les résultats de recherche Google pour des mots-clés spécifiques.
                    Entrez un mot-clé et l'URL de votre site pour vérifier son classement, puis sauvegardez les résultats pour suivre l'évolution dans le temps.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'generator' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start">
                <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-lg mr-4">
                  <Sparkles className="w-5 h-5 text-violet-700 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Générateur de mots-clés</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Utilisez l'intelligence artificielle pour générer des suggestions de mots-clés pertinents pour votre activité.
                    Entrez un sujet ou une description, et l'outil vous proposera des mots-clés optimisés pour le référencement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API Configuration Alert with improved design */}
        {!apiConfigured && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm">
            <div className="p-5">
              <div className="flex items-start">
                <div className="bg-yellow-100 dark:bg-yellow-800/50 p-2 rounded-full mr-4 flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 text-lg">Configuration de l'API SerpApi requise</h3>
                  <p className="mt-2 text-yellow-700 dark:text-yellow-400">
                    Pour obtenir des résultats réels (et non simulés), vous devez configurer l'API SerpApi. Suivez ces étapes :
                  </p>
                  <ol className="mt-3 text-yellow-700 dark:text-yellow-400 list-decimal list-inside space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Créez un compte sur <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-800 dark:text-yellow-300 font-medium underline inline-flex items-center">SerpApi <ExternalLink className="w-3 h-3 ml-1" /></a></span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>Obtenez votre clé API depuis votre tableau de bord</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Ajoutez la variable suivante dans votre fichier .env :</span>
                    </li>
                  </ol>
                  <div className="mt-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-md p-3 border border-yellow-200 dark:border-yellow-800/50">
                    <pre className="text-xs font-mono text-yellow-800 dark:text-yellow-300">
                      VITE_SERP_API_KEY=votre_clé_api_serpapi
                    </pre>
                  </div>
                  <div className="mt-4">
                    <button className="inline-flex items-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800/40 dark:hover:bg-yellow-800/60 text-yellow-800 dark:text-yellow-300 rounded-md text-sm font-medium transition-colors">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Accéder à SerpApi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {notification.message}
          </div>
        )}

        {/* Tool Components with consistent styling */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6">
          {activeTab === 'ranking' && (
            <KeywordRankingTool 
              initialKeyword={searchKeyword}
              keywordInputRef={keywordInputRef}
            />
          )}
          
          {activeTab === 'generator' && (
            <KeywordGeneratorTool 
              onAddToSearch={(keyword) => {
                setSearchKeyword(keyword);
                setActiveTab('ranking');
                setTimeout(() => {
                  if (keywordInputRef.current) {
                    keywordInputRef.current.focus();
                  }
                }, 100);
              }}
            />
          )}
        </div>

        {/* Notification container */}
        {/* <NotificationContainer notification={notification} setNotification={setNotification} /> */}
      </div>
    </AdminLayout>
  );
};

export default KeywordRankings;