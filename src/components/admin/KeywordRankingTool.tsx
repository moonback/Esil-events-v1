import React, { useState, useEffect, RefObject } from 'react';
import { Search, Save, Trash2, RefreshCw, ArrowUp, ArrowDown, Minus, AlertCircle, Info, RotateCw, List, X, Database, Tag, Plus, ChevronDown, BarChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getKeywordPosition, saveKeywordRanking, getAllKeywordRankings, deleteKeywordRanking, KeywordRanking, SearchResult, getKeywordPositionHistory } from '../../services/keywordRankingService';
import { getSavedKeywords, SavedKeyword, deleteSavedKeyword } from '../../services/savedKeywordsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KeywordRankingToolProps {
  initialKeyword?: string;
  keywordInputRef?: RefObject<HTMLInputElement>;
}

const KeywordRankingTool: React.FC<KeywordRankingToolProps> = ({ initialKeyword = '', keywordInputRef }) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [multipleKeywords, setMultipleKeywords] = useState('');
  const [savedKeywords, setSavedKeywords] = useState<SavedKeyword[]>([]);
  const [filteredKeywords, setFilteredKeywords] = useState<SavedKeyword[]>([]);
  const [isLoadingSavedKeywords, setIsLoadingSavedKeywords] = useState(false);
  const [showSavedKeywords, setShowSavedKeywords] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [keywordsPerPage] = useState(12);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  
  // États pour le graphique d'historique des positions
  const [showPositionHistory, setShowPositionHistory] = useState(false);
  const [selectedKeywordHistory, setSelectedKeywordHistory] = useState<KeywordRanking[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Ajouter les nouveaux états pour les filtres
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [positionFilter, setPositionFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [trendFilter, setTrendFilter] = useState<'up' | 'down' | 'stable' | 'all'>('all');
  
  // Mettre à jour le mot-clé lorsque initialKeyword change
  useEffect(() => {
    if (initialKeyword) {
      // Si le mot-clé contient des virgules ou des sauts de ligne, on active le mode batch
      if (initialKeyword.includes(',') || initialKeyword.includes('\n')) {
        setIsBatchMode(true);
        setMultipleKeywords(initialKeyword);
      } else {
        setKeyword(initialKeyword);
        // Si un mot-clé initial est fourni, déclencher automatiquement la recherche
        if (initialKeyword.trim() && siteUrl.trim()) {
          handleSearch();
        }
      }
    }
  }, [initialKeyword]);
  
  // Charger les mots-clés sauvegardés avec filtrage et pagination
  const loadSavedKeywords = async () => {
    try {
      setIsLoadingSavedKeywords(true);
      const filterOptions = {
        search: keywordSearch,
        type: selectedType,
        topic: selectedTopic
      };
      const keywords = await getSavedKeywords(filterOptions);
      setSavedKeywords(keywords);
      
      // Extraire les types et sujets uniques pour les filtres
      const types = Array.from(new Set(keywords.map(k => k.type).filter(Boolean)));
      const topics = Array.from(new Set(keywords.map(k => k.topic).filter(Boolean)));
      
      setAvailableTypes(types);
      setAvailableTopics(topics);
      
      // Appliquer la pagination
      applyFiltersAndPagination(keywords);
    } catch (err) {
      console.error('Erreur lors du chargement des mots-clés sauvegardés:', err);
    } finally {
      setIsLoadingSavedKeywords(false);
    }
  };
  
  // Fonction pour appliquer les filtres et la pagination
  const applyFiltersAndPagination = (keywords: SavedKeyword[]) => {
    let filtered = [...keywords];
    
    // Appliquer les filtres
    if (keywordSearch) {
      filtered = filtered.filter(k => 
        k.keyword.toLowerCase().includes(keywordSearch.toLowerCase())
      );
    }
    
    if (selectedType) {
      filtered = filtered.filter(k => k.type === selectedType);
    }
    
    if (selectedTopic) {
      filtered = filtered.filter(k => k.topic === selectedTopic);
    }
    
    // Mettre à jour les mots-clés filtrés
    setFilteredKeywords(filtered);
    
    // Réinitialiser la page si nécessaire
    if (filtered.length > 0 && Math.ceil(filtered.length / keywordsPerPage) < currentPage) {
      setCurrentPage(1);
    }
  };
  
  // Charger les mots-clés sauvegardés au chargement du composant
  useEffect(() => {
    loadSavedKeywords();
  }, []);
  
  // Appliquer les filtres et la pagination lorsque les critères changent
  useEffect(() => {
    if (savedKeywords.length > 0) {
      applyFiltersAndPagination(savedKeywords);
    }
  }, [keywordSearch, selectedType, selectedTopic, currentPage, keywordsPerPage]);
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
  
  // Fonction pour charger l'historique des positions d'un mot-clé
  const loadKeywordHistory = async (keyword: string, url: string) => {
    try {
      setIsLoadingHistory(true);
      setError(null);
      setShowPositionHistory(true);
      
      const history = await getKeywordPositionHistory(keyword, url, 30);
      setSelectedKeywordHistory(history);
      
      if (history.length === 0) {
        setError(`Aucun historique trouvé pour le mot-clé "${keyword}".`);
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique des positions');
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
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
  
  // Fonction pour utiliser un mot-clé sauvegardé
  const handleUseSavedKeyword = (savedKeyword: SavedKeyword) => {
    setKeyword(savedKeyword.keyword);
    setNotes(savedKeyword.topic || '');
    setSearchResult(null);
    setError(null);
    setScrollToForm(true);
    setShowSavedKeywords(false);
    
    // Faire défiler jusqu'au formulaire de recherche
    setTimeout(() => {
      const formElement = document.getElementById('search-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Fonction pour ajouter un mot-clé sauvegardé à la liste des mots-clés multiples
  const handleAddToMultipleKeywords = (savedKeyword: SavedKeyword) => {
    const newKeyword = savedKeyword.keyword;
    const currentKeywords = multipleKeywords.trim();
    
    if (currentKeywords) {
      // Ajouter le mot-clé avec une virgule si la liste n'est pas vide
      setMultipleKeywords(`${currentKeywords},\n${newKeyword}`);
    } else {
      // Sinon, juste ajouter le mot-clé
      setMultipleKeywords(newKeyword);
    }
    
    setSuccessMessage(`Mot-clé "${newKeyword}" ajouté à la liste`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };
  
  // Fonction pour supprimer un mot-clé sauvegardé
  const handleDeleteSavedKeyword = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce mot-clé ?')) {
      return;
    }

    try {
      setError(null);
      const success = await deleteSavedKeyword(id);
      
      if (success) {
        // Recharger la liste des mots-clés sauvegardés
        await loadSavedKeywords();
        setSuccessMessage('Mot-clé supprimé avec succès');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Erreur lors de la suppression du mot-clé');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du mot-clé');
      console.error(err);
    }
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
          {/* <button
            onClick={() => setIsBatchMode(false)}
            className={`py-2 px-4 font-medium text-sm ${!isBatchMode ? 'text-violet-600 border-b-2 border-violet-600 dark:text-violet-400 dark:border-violet-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Search className="w-4 h-4 inline-block mr-1" />
            Recherche simple
          </button> */}
          <button
            onClick={() => setIsBatchMode(true)}
            className={`py-2 px-4 font-medium text-sm ${isBatchMode ? 'text-violet-600 border-b-2 border-violet-600 dark:text-violet-400 dark:border-violet-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <List className="w-4 h-4 inline-block mr-1" />
            Recherche multiple
          </button>
          <button
            onClick={() => {
              setShowSavedKeywords(!showSavedKeywords);
              if (!showSavedKeywords) {
                loadSavedKeywords();
              }
            }}
            className="ml-auto py-2 px-4 font-medium text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center"
          >
            <Database className="w-4 h-4 mr-1" />
            Mots-clés sauvegardés
            {savedKeywords.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-violet-600 dark:bg-violet-500 rounded-full">
                {savedKeywords.length > 99 ? '99+' : savedKeywords.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Panneau des mots-clés sauvegardés */}
        <AnimatePresence>
          {showSavedKeywords && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-violet-600 dark:text-violet-400" />
                      Mots-clés sauvegardés
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {filteredKeywords.length} sur {savedKeywords.length} mots-clés affichés
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => loadSavedKeywords()}
                      className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                      title="Rafraîchir les mots-clés"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowSavedKeywords(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {isLoadingSavedKeywords ? (
                  <div className="p-6 flex justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-violet-600 dark:text-violet-400" />
                  </div>
                ) : (
                  <div className="p-4">
                    {/* Statistiques des mots-clés */}
                    {savedKeywords.length > 0 && (
                      <div className="mb-4 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center">
                            <Database className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-2" />
                            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                              {savedKeywords.length} mot{savedKeywords.length > 1 ? 's' : ''}-clé{savedKeywords.length > 1 ? 's' : ''} au total
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {availableTypes.slice(0, 3).map(type => (
                              <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                                {type}: {savedKeywords.filter(k => k.type === type).length}
                              </span>
                            ))}
                            {availableTypes.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                +{availableTypes.length - 3} types
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Barre de recherche et filtres */}
                    <div className="mb-4 space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher un mot-clé..."
                          value={keywordSearch}
                          onChange={(e) => setKeywordSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-white"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {/* Filtre par type */}
                        <div className="relative inline-block">
                          <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Tous les types</option>
                            {availableTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                        
                        {/* Filtre par sujet */}
                        <div className="relative inline-block">
                          <select
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Tous les sujets</option>
                            {availableTopics.map((topic) => (
                              <option key={topic} value={topic}>{topic}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                        
                        {/* Bouton de réinitialisation des filtres */}
                        {(keywordSearch || selectedType || selectedTopic) && (
                          <button
                            onClick={() => {
                              setKeywordSearch('');
                              setSelectedType('');
                              setSelectedTopic('');
                              setCurrentPage(1);
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Réinitialiser
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Affichage des mots-clés avec pagination */}
                    {filteredKeywords.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Aucun mot-clé sauvegardé trouvé
                      </div>
                    ) : (
                      /* Message d'information si beaucoup de mots-clés */
                      savedKeywords.length > 30 && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex">
                            <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" />
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              <p className="font-medium">Grand nombre de mots-clés détecté</p>
                              <p className="mt-1">Utilisez les filtres ci-dessus pour affiner votre recherche et trouver plus facilement les mots-clés qui vous intéressent.</p>
                            </div>
                          </div>
                        </div>
                      ),
                      <>
                        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="p-2 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredKeywords
                              .slice((currentPage - 1) * keywordsPerPage, currentPage * keywordsPerPage)
                              .map((savedKeyword) => (
                                <div 
                                  key={savedKeyword.id} 
                                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-gray-900 dark:text-white truncate">
                                      {savedKeyword.keyword}
                                    </span>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => handleUseSavedKeyword(savedKeyword)}
                                        className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                                        title="Utiliser ce mot-clé"
                                      >
                                        <Search className="w-4 h-4" />
                                      </button>
                                      {isBatchMode && (
                                        <button
                                          onClick={() => handleAddToMultipleKeywords(savedKeyword)}
                                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                          title="Ajouter à la liste de mots-clés"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => savedKeyword.id ? handleDeleteSavedKeyword(savedKeyword.id) : null}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        title="Supprimer ce mot-clé"
                                        disabled={!savedKeyword.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {savedKeyword.type && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                                        {savedKeyword.type}
                                      </span>
                                    )}
                                    {savedKeyword.topic && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-full">
                                        {savedKeyword.topic}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        {/* Pagination */}
                        {filteredKeywords.length > keywordsPerPage && (
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Affichage de {Math.min(filteredKeywords.length, (currentPage - 1) * keywordsPerPage + 1)} à {Math.min(filteredKeywords.length, currentPage * keywordsPerPage)} sur {filteredKeywords.length} mots-clés
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                              >
                                Précédent
                              </button>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredKeywords.length / keywordsPerPage)))}
                                disabled={currentPage >= Math.ceil(filteredKeywords.length / keywordsPerPage)}
                                className={`px-3 py-1 rounded-md text-sm ${currentPage >= Math.ceil(filteredKeywords.length / keywordsPerPage) ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                              >
                                Suivant
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              ref={keywordInputRef}
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
      {/* Graphique d'historique des positions */}
      <AnimatePresence>
        {showPositionHistory && selectedKeywordHistory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-violet-600 dark:text-violet-400" />
                    Historique des positions: <span className="ml-1 font-bold text-violet-700 dark:text-violet-400">{selectedKeywordHistory[0]?.keyword}</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedKeywordHistory.length} enregistrements trouvés
                  </p>
                </div>
                <button 
                  onClick={() => setShowPositionHistory(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filtres avancés */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Filtre par date */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-violet-600" />
                    Période
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <input
                      type="date"
                      value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Filtre par position */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-violet-600" />
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={positionFilter.min || ''}
                      onChange={(e) => setPositionFilter(prev => ({ ...prev, min: e.target.value ? parseInt(e.target.value) : null }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
                      min="1"
                      max="100"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={positionFilter.max || ''}
                      onChange={(e) => setPositionFilter(prev => ({ ...prev, max: e.target.value ? parseInt(e.target.value) : null }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                {/* Filtre par tendance */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-violet-600" />
                    Tendance
                  </label>
                  <select
                    value={trendFilter}
                    onChange={(e) => setTrendFilter(e.target.value as 'up' | 'down' | 'stable' | 'all')}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="all">Toutes les tendances</option>
                    <option value="up" className="flex items-center">
                      <ArrowUp className="w-4 h-4 mr-2 text-green-500" /> En progression
                    </option>
                    <option value="down" className="flex items-center">
                      <ArrowDown className="w-4 h-4 mr-2 text-red-500" /> En baisse
                    </option>
                    <option value="stable" className="flex items-center">
                      <Minus className="w-4 h-4 mr-2 text-gray-500" /> Stable
                    </option>
                  </select>
                </div>
              </div>

              {/* Bouton de réinitialisation des filtres */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setDateRange({ start: null, end: null });
                    setPositionFilter({ min: null, max: null });
                    setTrendFilter('all');
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  <X className="w-4 h-4 mr-1" />
                  Réinitialiser les filtres
                </button>
              </div>

              {/* Tableau des résultats filtrés */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tendance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedKeywordHistory
                      .filter(record => {
                        // Filtre par date
                        if (dateRange.start && new Date(record.lastChecked) < dateRange.start) return false;
                        if (dateRange.end && new Date(record.lastChecked) > dateRange.end) return false;
                        
                        // Filtre par position
                        if (positionFilter.min && record.position > positionFilter.min) return false;
                        if (positionFilter.max && record.position < positionFilter.max) return false;
                        
                        // Filtre par tendance
                        if (trendFilter !== 'all') {
                          const variation = record.previousPosition ? record.previousPosition - record.position : 0;
                          if (trendFilter === 'up' && variation <= 0) return false;
                          if (trendFilter === 'down' && variation >= 0) return false;
                          if (trendFilter === 'stable' && variation !== 0) return false;
                        }
                        
                        return true;
                      })
                      .map((record, index) => {
                        const variation = record.previousPosition ? record.previousPosition - record.position : 0;
                        const trendIcon = variation > 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-500" />
                        ) : variation < 0 ? (
                          <ArrowDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-500" />
                        );
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {new Date(record.lastChecked).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {record.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                {trendIcon}
                                <span className={`ml-2 ${
                                  variation > 0 ? 'text-green-600 dark:text-green-400' :
                                  variation < 0 ? 'text-red-600 dark:text-red-400' :
                                  'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {variation > 0 ? 'En progression' :
                                   variation < 0 ? 'En baisse' :
                                   'Stable'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`${
                                variation > 0 ? 'text-green-600 dark:text-green-400' :
                                variation < 0 ? 'text-red-600 dark:text-red-400' :
                                'text-gray-600 dark:text-gray-400'
                              }`}>
                                {variation > 0 ? `+${variation}` :
                                 variation < 0 ? variation :
                                 '0'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                            onClick={() => loadKeywordHistory(ranking.keyword, ranking.url)}
                            className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                            title="Voir l'historique des positions"
                          >
                            <BarChart className="w-4 h-4" />
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