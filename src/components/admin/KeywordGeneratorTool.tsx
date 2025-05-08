import React, { useState } from 'react';
import { Search, RefreshCw, Save, Copy, CheckCircle, AlertCircle, Info, Plus, Lightbulb, ChevronDown, ChevronUp, Filter, ArrowRight, Database, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateKeywords, GeneratedKeyword, KeywordGenerationOptions } from '../../services/keywordGenerationService';
import { saveKeyword } from '../../services/savedKeywordsService';

interface KeywordGeneratorToolProps {
  onAddToSearch?: (keyword: string) => void;
}

const KeywordGeneratorTool: React.FC<KeywordGeneratorToolProps> = ({ onAddToSearch }) => {
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('événementiel');
  const [targetAudience, setTargetAudience] = useState('organisateurs d\'événements');
  const [location, setLocation] = useState('France');
  const [count, setCount] = useState(20);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState<GeneratedKeyword[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Veuillez saisir un sujet pour générer des mots-clés');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      setGeneratedKeywords([]);

      const options: KeywordGenerationOptions = {
        topic,
        industry,
        targetAudience,
        location,
        count,
        includeMetrics
      };

      const result = await generateKeywords(options);

      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedKeywords(result.keywords);
        if (result.keywords.length === 0) {
          setError('Aucun mot-clé n\'a été généré. Veuillez essayer avec un sujet différent.');
        }
      }
    } catch (err) {
      setError('Erreur lors de la génération des mots-clés');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setSuccessMessage(`Mot-clé "${keyword}" copié dans le presse-papier`);
    
    setTimeout(() => {
      setCopiedKeyword(null);
      setSuccessMessage(null);
    }, 2000);
  };

  const handleAddToSearch = (keyword: string) => {
    if (onAddToSearch) {
      onAddToSearch(keyword);
      setSuccessMessage(`Mot-clé "${keyword}" ajouté à la recherche`);
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const toggleKeywordSelection = (index: number) => {
    const newSelectedKeywords = new Set(selectedKeywords);
    if (newSelectedKeywords.has(index)) {
      newSelectedKeywords.delete(index);
    } else {
      newSelectedKeywords.add(index);
    }
    setSelectedKeywords(newSelectedKeywords);
  };

  const handleSaveSelectedKeywords = async () => {
    if (selectedKeywords.size === 0) {
      setError('Veuillez sélectionner au moins un mot-clé à sauvegarder');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const selectedKeywordsArray = Array.from(selectedKeywords);
      const savedCount = await Promise.all(
        selectedKeywordsArray.map(index => saveKeyword(generatedKeywords[index], topic))
      ).then(results => results.filter(id => id !== null).length);

      if (savedCount > 0) {
        setSuccessMessage(`${savedCount} mot${savedCount > 1 ? 's' : ''}-clé${savedCount > 1 ? 's' : ''} sauvegardé${savedCount > 1 ? 's' : ''} avec succès`);
        setSelectedKeywords(new Set());
      } else {
        setError('Erreur lors de la sauvegarde des mots-clés');
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde des mots-clés');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour déterminer la couleur de badge en fonction de la difficulté
  const getDifficultyBadgeColor = (difficulty: number | undefined) => {
    if (difficulty === undefined) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (difficulty <= 3) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (difficulty <= 6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  // Fonction pour déterminer la couleur de badge en fonction du volume de recherche
  const getVolumeBadgeColor = (volume: string | undefined) => {
    if (!volume) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (volume.toLowerCase().includes('faible')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (volume.toLowerCase().includes('moyen')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    if (volume.toLowerCase().includes('élevé')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Fonction pour déterminer la couleur de badge en fonction du type de mot-clé
  const getTypeBadgeColor = (type: string) => {
    if (type.toLowerCase().includes('principal')) return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300';
    if (type.toLowerCase().includes('longue')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
    if (type.toLowerCase().includes('question')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
    if (type.toLowerCase().includes('local')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    if (type.toLowerCase().includes('tendance')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div>
      {/* Header and main input card */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border border-violet-100 dark:border-violet-800/30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-violet-600 dark:bg-violet-500 p-2 rounded-lg shadow-md mr-4">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Générateur de mots-clés IA</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Boostez votre SEO avec des mots-clés optimisés pour votre activité
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
              <Sparkles className="w-3 h-3 mr-1" />
              Propulsé par IA
            </span>
          </div>
        </div>

        <div className="relative">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sujet ou thème principal
          </label>
          <div className="relative">
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: location de mobilier pour événements d'entreprise"
              className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white text-base"
            />
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center font-medium transition-colors"
            >
              {showAdvancedOptions ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Masquer les options avancées
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Afficher les options avancées
                </>
              )}
            </button>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer des mots-clés
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-5 overflow-hidden bg-white dark:bg-gray-800/70 p-5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center mb-3">
                <Filter className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Paramètres avancés</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Public cible
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Localisation
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre de mots-clés à générer
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="count"
                      min="5"
                      max="50"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 20)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none text-sm text-gray-500 dark:text-gray-400">
                      mots-clés
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-md">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeMetrics}
                      onChange={(e) => setIncludeMetrics(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${includeMetrics ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${includeMetrics ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Inclure des métriques estimées (difficulté, volume, pertinence)
                  </span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800/50 flex items-start shadow-sm"
            >
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-500 dark:text-red-400" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message de succès */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-800/50 flex items-start shadow-sm"
            >
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 text-green-500 dark:text-green-400" />
              <span className="text-sm">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Résultats des mots-clés générés */}
      {generatedKeywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md"
        >
          <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <h3 className="font-medium text-lg text-gray-900 dark:text-white flex items-center">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded-md mr-3">
                <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span>
                <span className="font-bold text-violet-700 dark:text-violet-400">{generatedKeywords.length}</span> mots-clés générés pour "<span className="italic">{topic}</span>"
              </span>
            </h3>
            
            <div className="flex space-x-2">
              <button 
                onClick={handleSaveSelectedKeywords}
                disabled={selectedKeywords.size === 0 || isSaving}
                className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-1.5" />
                    Sauvegarder ({selectedKeywords.size})
                  </>
                )}
              </button>
              <button className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center">
                <Save className="w-4 h-4 mr-1.5" />
                Exporter CSV
              </button>
              <button className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/30 text-violet-700 dark:text-violet-400 rounded-md text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-800/30 transition-colors flex items-center">
                <Filter className="w-4 h-4 mr-1.5" />
                Filtrer
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-10">
                    <span className="sr-only">Sélectionner</span>
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mot-clé
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Type
                  </th>
                  {includeMetrics && (
                    <>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Pertinence
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Difficulté
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Volume
                      </th>
                    </>
                  )}
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {generatedKeywords.map((keyword, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} ${selectedKeywords.has(index) ? 'bg-violet-50 dark:bg-violet-900/20' : ''} hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors`}>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <div 
                        onClick={() => toggleKeywordSelection(index)}
                        className={`w-5 h-5 rounded border cursor-pointer mx-auto flex items-center justify-center ${selectedKeywords.has(index) ? 'bg-violet-600 border-violet-600 dark:bg-violet-500 dark:border-violet-500' : 'border-gray-300 dark:border-gray-600'}`}
                      >
                        {selectedKeywords.has(index) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {keyword.keyword}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(keyword.type)}`}>
                        {keyword.type}
                      </span>
                    </td>
                    {includeMetrics && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  keyword.relevance >= 8 ? 'bg-green-500 dark:bg-green-400' : 
                                  keyword.relevance >= 5 ? 'bg-violet-500 dark:bg-violet-400' : 
                                  'bg-amber-500 dark:bg-amber-400'
                                }`}
                                style={{ width: `${(keyword.relevance / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{keyword.relevance}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {keyword.difficulty !== undefined && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(keyword.difficulty)}`}>
                              {keyword.difficulty}/10
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {keyword.searchVolume && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getVolumeBadgeColor(keyword.searchVolume)}`}>
                              {keyword.searchVolume}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleCopyKeyword(keyword.keyword)}
                          className="text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors bg-gray-100 dark:bg-gray-700 p-1.5 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30"
                          title="Copier le mot-clé"
                        >
                          {copiedKeyword === keyword.keyword ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {onAddToSearch && (
                          <button
                            onClick={() => handleAddToSearch(keyword.keyword)}
                            className="text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors bg-gray-100 dark:bg-gray-700 p-1.5 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30"
                            title="Ajouter à la recherche"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Sélectionnez les mots-clés que vous souhaitez sauvegarder en base de données</p>
            <p className="mt-1">Vous pouvez aussi copier un mot-clé ou l'ajouter directement à l'outil de suivi des positions</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Il faut ajouter ce composant pour que l'icône Sparkles soit disponible
const Sparkles = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
};

export default KeywordGeneratorTool;