import React, { useState, useEffect } from 'react';
import { Search, Save, Trash2, RefreshCw, ArrowUp, ArrowDown, Minus, AlertCircle, Info, RotateCw, List, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getKeywordPosition, saveKeywordRanking, getAllKeywordRankings, deleteKeywordRanking, KeywordRanking, SearchResult } from '../../services/keywordRankingService';
import { isGoogleSearchConfigValid } from '../../config/googleSearchApi';

const KeywordRankingTool: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [multipleKeywords, setMultipleKeywords] = useState('');
  const [siteUrl, setSiteUrl] = useState('https://esil-events.fr/');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [batchResults, setBatchResults] = useState<{keyword: string, result: SearchResult}[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [rankings, setRankings] = useState<KeywordRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [scrollToForm, setScrollToForm] = useState(false);

  // Charger les classements existants au chargement du composant
  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setIsLoading(true);
      const data = await getAllKeywordRankings();
      setRankings(data);
    } catch (err) {
      setError('Erreur lors du chargement des classements');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('Veuillez saisir un mot-clé');
      return;
    }

    if (!siteUrl.trim()) {
      setError('Veuillez saisir l\'URL de votre site');
      return;
    }
    
    // Réinitialiser le flag de défilement
    setScrollToForm(false);
    setBatchResults([]);
    setIsBatchMode(false);

    try {
      setError(null);
      setIsSearching(true);
      setSearchResult(null);

      // Rechercher la position du mot-clé avec les détails
      const result = await getKeywordPosition(keyword, siteUrl);
      setSearchResult(result);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction pour traiter plusieurs mots-clés
  const handleBatchSearch = async () => {
    if (!multipleKeywords.trim()) {
      setError('Veuillez saisir au moins un mot-clé');
      return;
    }

    if (!siteUrl.trim()) {
      setError('Veuillez saisir l\'URL de votre site');
      return;
    }

    // Réinitialiser les états
    setScrollToForm(false);
    setSearchResult(null);
    setBatchResults([]);
    setIsBatchMode(true);
    setError(null);

    try {
      setIsSearching(true);
      
      // Diviser les mots-clés (par virgule ou saut de ligne)
      const keywords = multipleKeywords
        .split(/[,\n]/) // Diviser par virgule ou saut de ligne
        .map(k => k.trim()) // Supprimer les espaces
        .filter(k => k.length > 0); // Supprimer les entrées vides
      
      const results = [];
      setBatchProgress(0);
      
      // Traiter chaque mot-clé séquentiellement
      for (let i = 0; i < keywords.length; i++) {
        const currentKeyword = keywords[i];
        try {
          const result = await getKeywordPosition(currentKeyword, siteUrl);
          results.push({ keyword: currentKeyword, result });
        } catch (err) {
          console.error(`Erreur pour le mot-clé "${currentKeyword}":`, err);
          results.push({ 
            keyword: currentKeyword, 
            result: { 
              position: -1, 
              isRealResult: false, 
              errorMessage: 'Erreur lors de la recherche' 
            } 
          });
        }
        
        // Mettre à jour la progression
        setBatchProgress(Math.round(((i + 1) / keywords.length) * 100));
      }
      
      setBatchResults(results);
    } catch (err) {
      setError('Erreur lors du traitement des mots-clés');
      console.error(err);
    } finally {
      setIsSearching(false);
      setBatchProgress(100);
    }
  };

  const handleSave = async () => {
    if (searchResult === null) {
      setError('Veuillez d\'abord effectuer une recherche');
      return;
    }

    try {
      setError(null);
      await saveKeywordRanking({
        keyword,
        position: searchResult.position,
        lastChecked: new Date().toISOString(),
        url: siteUrl,
        notes: notes
      });

      // Réinitialiser les champs
      setKeyword('');
      setSiteUrl('');
      setNotes('');
      setSearchResult(null);

      // Afficher un message de succès
      setSuccessMessage('Position sauvegardée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Recharger les classements
      await loadRankings();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  // Fonction pour sauvegarder tous les résultats du lot
  const handleSaveBatch = async () => {
    if (batchResults.length === 0) {
      setError('Aucun résultat à sauvegarder');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      let savedCount = 0;
      
      // Sauvegarder chaque résultat
      for (const item of batchResults) {
        if (item.result.position > 0) { // Ne sauvegarder que les résultats valides
          await saveKeywordRanking({
            keyword: item.keyword,
            position: item.result.position,
            lastChecked: new Date().toISOString(),
            url: siteUrl,
            notes: notes
          });
          savedCount++;
        }
      }

      // Réinitialiser les champs
      setMultipleKeywords('');
      setSiteUrl('');
      setNotes('');
      setBatchResults([]);
      setIsBatchMode(false);

      // Afficher un message de succès
      setSuccessMessage(`${savedCount} position(s) sauvegardée(s) avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Recharger les classements
      await loadRankings();
    } catch (err) {
      setError('Erreur lors de la sauvegarde des positions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce classement ?')) {
      return;
    }

    try {
      setError(null);
      await deleteKeywordRanking(id);
      await loadRankings();
      setSuccessMessage('Classement supprimé avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };
  
  // Fonction pour relancer une recherche à partir d'un classement existant
  const handleRelaunchSearch = (ranking: KeywordRanking) => {
    setKeyword(ranking.keyword);
    setSiteUrl(ranking.url);
    setNotes(ranking.notes || '');
    setSearchResult(null);
    setError(null);
    setScrollToForm(true);
    
    // Faire défiler jusqu'au formulaire de recherche
    setTimeout(() => {
      const formElement = document.getElementById('search-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const getPositionChange = (current: number, previous: number | null | undefined) => {
    if (previous === null || previous === undefined) return null;
    return current - previous;
  };

  const renderPositionChange = (change: number | null) => {
    if (change === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change < 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (change > 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
        <Search className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400" />
        Outil de suivi des positions SEO
      </h2>

      {/* Formulaire de recherche */}
      <div id="search-form" className={`mb-8 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg ${scrollToForm ? 'ring-2 ring-violet-500 dark:ring-violet-400' : ''}`}>
        {/* Onglets pour choisir entre recherche simple et multiple */}
        <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsBatchMode(false)}
            className={`py-2 px-4 font-medium text-sm ${!isBatchMode ? 'text-violet-600 border-b-2 border-violet-600 dark:text-violet-400 dark:border-violet-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Search className="w-4 h-4 inline-block mr-1" />
            Recherche simple
          </button>
          <button
            onClick={() => setIsBatchMode(true)}
            className={`py-2 px-4 font-medium text-sm ${isBatchMode ? 'text-violet-600 border-b-2 border-violet-600 dark:text-violet-400 dark:border-violet-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <List className="w-4 h-4 inline-block mr-1" />
            Recherche multiple
          </button>
        </div>

        {/* URL du site (commun aux deux modes) */}
        <div className="mb-4">
          <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL du site
          </label>
          <input
            type="text"
            id="siteUrl"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://votre-site.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Champ de recherche simple ou multiple selon le mode */}
        {!isBatchMode ? (
          <div className="mb-4">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot-clé
            </label>
            <input
              type="text"
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Entrez un mot-clé à rechercher"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="multipleKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mots-clés (un par ligne ou séparés par des virgules)
            </label>
            <textarea
              id="multipleKeywords"
              value={multipleKeywords}
              onChange={(e) => setMultipleKeywords(e.target.value)}
              placeholder="Entrez vos mots-clés ici\nExemple: location jeux, animation entreprise, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
              rows={4}
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des notes sur ce mot-clé"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
            rows={2}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isBatchMode ? (
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher la position
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleBatchSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Recherche en cours... {batchProgress}%
                </>
              ) : (
                <>
                  <List className="w-4 h-4 mr-2" />
                  Rechercher les positions
                </>
              )}
            </button>
          )}

          {searchResult !== null && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder la position
            </button>
          )}

          {batchResults.length > 0 && (
            <button
              onClick={handleSaveBatch}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder toutes les positions
            </button>
          )}
        </div>

        {/* Affichage du résultat de recherche (mode simple) */}
        {!isBatchMode && searchResult !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 ${searchResult.isRealResult ? 'bg-gray-100 dark:bg-gray-700' : 'bg-red-50 dark:bg-red-900/30'} rounded-md`}
          >
            <div className="flex items-start">
              {!searchResult.isRealResult && (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-1" />
              )}
              <div>
                {searchResult.position > 0 && searchResult.position <= 100 ? (
                  <div className="flex items-center mb-1">
                    <p className="text-gray-800 dark:text-gray-200">
                      Position pour <span className="font-semibold">"{keyword}"</span> : 
                      <span className="font-bold text-lg ml-2">{searchResult.position}</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center mb-1">
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">"{keyword}"</span> : 
                      <span className="font-bold text-lg ml-2 text-red-600 dark:text-red-400">{searchResult.position > 100 ? "Mot clé non trouvé" : "Non trouvé"}</span>
                    </p>
                  </div>
                )}
                
                {searchResult.isRealResult && searchResult.totalResults !== undefined && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Info className="w-4 h-4 inline-block mr-1" />
                    Environ {parseInt(searchResult.totalResults).toLocaleString()} résultats trouvés
                    {searchResult.searchTime && ` en ${searchResult.searchTime.toFixed(2)} secondes`}
                  </p>
                )}
                
                {searchResult.errorMessage && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {searchResult.errorMessage}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Affichage des résultats en lot (mode multiple) */}
        {isBatchMode && batchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden"
          >
            <div className="p-3 bg-gray-200 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-500">
              <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                <List className="w-4 h-4 mr-2" />
                Résultats pour {batchResults.length} mot(s)-clé(s)
              </h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mot-clé</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {batchResults.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.keyword}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {item.result.position > 0 && item.result.position <= 100 ? (
                          <span className="font-semibold">{item.result.position}</span>
                        ) : (
                          <span className="text-red-500 dark:text-red-400">Non trouvé</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {item.result.isRealResult ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Résultat réel
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Simulation
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md"
          >
            {error}
          </motion.div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md"
          >
            {successMessage}
          </motion.div>
        )}
      </div>

      {/* Tableau des classements */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Historique des positions</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-violet-600 dark:text-violet-400" />
          </div>
        ) : rankings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-4 text-center">Aucun classement enregistré</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mot-clé</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Évolution</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dernière vérification</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {rankings.map((ranking) => {
                  const positionChange = getPositionChange(ranking.position, ranking.previousPosition);
                  return (
                    <tr key={ranking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{ranking.keyword}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <a href={ranking.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">
                          {ranking.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ranking.position > 100 ? '0' : ranking.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          {renderPositionChange(positionChange)}
                          {positionChange !== null && (
                            <span className={`ml-1 ${positionChange < 0 ? 'text-green-500' : positionChange > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                              {positionChange < 0 ? Math.abs(positionChange) : positionChange > 0 ? `+${positionChange}` : '0'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(ranking.lastChecked).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {ranking.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleRelaunchSearch(ranking)}
                            title="Relancer cette recherche"
                            className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ranking.id!)}
                            title="Supprimer ce classement"
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordRankingTool;