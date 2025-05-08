import React, { useState } from 'react';
import { Search, AlertCircle, ExternalLink } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import KeywordRankingTool from '../../components/admin/KeywordRankingTool';
import { NotificationContainer } from '../../components/admin/AdminNotification';
import { isGoogleSearchConfigValid } from '../../config/googleSearchApi';

const KeywordRankings: React.FC = () => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const apiConfigured = isGoogleSearchConfigValid();

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="pt-24 px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Search className="w-6 h-6 mr-2 text-violet-600 dark:text-violet-400" />
            Suivi des positions SEO
          </h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Cet outil vous permet de suivre la position de votre site dans les résultats de recherche Google pour des mots-clés spécifiques.
            Entrez un mot-clé et l'URL de votre site pour vérifier son classement, puis sauvegardez les résultats pour suivre l'évolution dans le temps.
          </p>
        </div>

        {!apiConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Configuration de l'API SerpApi requise</h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                  Pour obtenir des résultats réels (et non simulés), vous devez configurer l'API SerpApi. Suivez ces étapes :
                </p>
                <ol className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 list-decimal list-inside space-y-1">
                  <li>Créez un compte sur <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-800 dark:text-yellow-300 underline inline-flex items-center">SerpApi <ExternalLink className="w-3 h-3 ml-1" /></a></li>
                  <li>Obtenez votre clé API depuis votre tableau de bord</li>
                  <li>Ajoutez la variable suivante dans votre fichier .env :
                    <pre className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs font-mono">
                      VITE_SERP_API_KEY=votre_clé_api_serpapi
                    </pre>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <KeywordRankingTool />

        {/* Conteneur de notifications */}
        {/* <NotificationContainer notification={notification} setNotification={setNotification} /> */}
      </div>
    </AdminLayout>
  );
};

export default KeywordRankings;