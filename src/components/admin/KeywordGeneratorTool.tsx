import React, { useState } from 'react';
import { Search, RefreshCw, Save, Copy, CheckCircle, AlertCircle, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateKeywords, GeneratedKeyword, KeywordGenerationOptions } from '../../services/keywordGenerationService';

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
  const [generatedKeywords, setGeneratedKeywords] = useState<GeneratedKeyword[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
        <Search className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400" />
        Générateur de mots-clés avec IA
      </h2>

      <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sujet ou thème
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: location de mobilier pour événements d'entreprise"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center"
          >
            {showAdvancedOptions ? 'Masquer les options avancées' : 'Afficher les options avancées'}
          </button>
        </div>

        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Public cible
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de mots-clés à générer
                  </label>
                  <input
                    type="number"
                    id="count"
                    min="5"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 20)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeMetrics}
                    onChange={(e) => setIncludeMetrics(e.target.checked)}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Inclure des métriques estimées (difficulté, volume, etc.)
                  </span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Générer des mots-clés
              </>
            )}
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-start"
          >
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md flex items-start"
          >
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </div>

      {/* Résultats des mots-clés générés */}
      {generatedKeywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
              <Info className="w-4 h-4 mr-2 text-violet-600 dark:text-violet-400" />
              {generatedKeywords.length} mots-clés générés pour "{topic}"
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mot-clé
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  {includeMetrics && (
                    <>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pertinence
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Difficulté
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Volume
                      </th>
                    </>
                  )}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {generatedKeywords.map((keyword, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {keyword.keyword}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(keyword.type)}`}>
                        {keyword.type}
                      </span>
                    </td>
                    {includeMetrics && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-violet-600 dark:bg-violet-400 h-2.5 rounded-full" 
                                style={{ width: `${(keyword.relevance / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span>{keyword.relevance}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {keyword.difficulty !== undefined && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(keyword.difficulty)}`}>
                              {keyword.difficulty}/10
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {keyword.searchVolume && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVolumeBadgeColor(keyword.searchVolume)}`}>
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
                          className="text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                          title="Copier le mot-clé"
                        >
                          {copiedKeyword === keyword.keyword ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                        {onAddToSearch && (
                          <button
                            onClick={() => handleAddToSearch(keyword.keyword)}
                            className="text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                            title="Ajouter à la recherche"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default KeywordGeneratorTool;