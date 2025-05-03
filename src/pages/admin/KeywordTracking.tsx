import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, ArrowUp, ArrowDown, Minus, Search, Filter, Download } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import GoogleAuthButton from '../../components/admin/GoogleAuthButton';
import { 
  KeywordRanking, 
  getKeywords, 
  addKeyword, 
  deleteKeyword, 
  updateKeywordPosition, 
  updateAllKeywordPositions 
} from '../../services/keywordTrackingService';

const AdminKeywordTracking: React.FC = () => {
  const [keywords, setKeywords] = useState<KeywordRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshingKeyword, setRefreshingKeyword] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newUrl, setNewUrl] = useState('https://esil-events.fr');
  const [newNotes, setNewNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  // Charger les mots-clés depuis l'API
  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const { data, error } = await getKeywords();
      if (error) throw error;
      if (data) setKeywords(data);
    } catch (error) {
      console.error('Erreur lors du chargement des mots-clés:', error);
      setNotification({ type: 'error', message: 'Erreur lors du chargement des mots-clés' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les mots-clés en fonction du terme de recherche
  const filteredKeywords = keywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keyword.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      setNotification({ type: 'error', message: 'Veuillez entrer un mot-clé' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await addKeyword({
        keyword: newKeyword,
        position: 0, // Position inconnue jusqu'à vérification
        previousPosition: null,
        lastChecked: new Date().toISOString().split('T')[0],
        url: newUrl,
        notes: newNotes
      });

      if (error) throw error;
      if (data) {
        setKeywords([data, ...keywords]);
        setNewKeyword('');
        setNewUrl('https://esil-events.com');
        setNewNotes('');
        setShowAddModal(false);
        setNotification({ type: 'success', message: 'Mot-clé ajouté avec succès' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du mot-clé:', error);
      setNotification({ type: 'error', message: 'Erreur lors de l\'ajout du mot-clé' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mot-clé ?')) {
      setLoading(true);
      try {
        const { success, error } = await deleteKeyword(id);
        if (error) throw error;
        if (success) {
          setKeywords(keywords.filter(keyword => keyword.id !== id));
          setNotification({ type: 'success', message: 'Mot-clé supprimé avec succès' });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du mot-clé:', error);
        setNotification({ type: 'error', message: 'Erreur lors de la suppression du mot-clé' });
      } finally {
        setLoading(false);
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleRefreshKeyword = async (id: string) => {
    setRefreshingKeyword(id);
    try {
      const { data, error } = await updateKeywordPosition(id);
      if (error) throw error;
      if (data) {
        setKeywords(keywords.map(keyword => keyword.id === id ? data : keyword));
        setNotification({ type: 'success', message: 'Position mise à jour avec succès' });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
      setNotification({ type: 'error', message: 'Erreur lors de la mise à jour de la position' });
    } finally {
      setRefreshingKeyword(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRefreshAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await updateAllKeywordPositions();
      if (error) throw error;
      if (data) {
        setKeywords(data);
        setNotification({ type: 'success', message: 'Toutes les positions ont été mises à jour' });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de toutes les positions:', error);
      setNotification({ type: 'error', message: 'Erreur lors de la mise à jour de toutes les positions' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportCSV = () => {
    // Créer le contenu CSV
    const headers = ['Mot-clé', 'Position', 'Position précédente', 'Dernière vérification', 'URL', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...keywords.map(k => 
        [
          `"${k.keyword}"`, 
          k.position, 
          k.previousPosition || 'N/A', 
          k.lastChecked, 
          `"${k.url}"`, 
          `"${k.notes}"`
        ].join(',')
      )
    ].join('\n');

    // Créer le lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `keyword-positions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPositionChangeElement = (current: number, previous: number | null) => {
    if (previous === null) return <Minus className="w-4 h-4 text-gray-500" />;
    
    if (current < previous) {
      const diff = previous - current;
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="w-4 h-4 mr-1" />
          <span>{diff}</span>
        </div>
      );
    } else if (current > previous) {
      const diff = current - previous;
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="w-4 h-4 mr-1" />
          <span>{diff}</span>
        </div>
      );
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Non vérifié') return dateString;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suivi des Mots-clés SEO
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un mot-clé
            </button>
            <button
              onClick={handleRefreshAll}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser tout
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </button>
          </div>
        </div>

        {notification && (
          <div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {notification.message}
          </div>
        )}
        
        {/* Google Auth Button */}
        <div className="mb-6">
          <GoogleAuthButton onAuthStatusChange={setIsGoogleAuth} />
          {isGoogleAuth && (
            <div className="mt-2 p-2 bg-green-50 text-green-800 border border-green-200 rounded-md">
              <p className="text-sm">✓ Connecté à Google Search Console - Les données de positionnement seront réelles</p>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher un mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </button>
        </div>

        {/* Keywords table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mot-clé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Évolution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dernière vérification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black dark:border-white"></div>
                        <span>Chargement des données...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Aucun mot-clé trouvé
                    </td>
                  </tr>
                ) : (
                  filteredKeywords.map((keyword) => (
                    <tr key={keyword.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{keyword.keyword}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 dark:text-white">{keyword.position || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPositionChangeElement(keyword.position, keyword.previousPosition)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(keyword.lastChecked)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                        <a href={keyword.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {keyword.url.replace('https://', '')}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {keyword.notes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRefreshKeyword(keyword.id)}
                          disabled={refreshingKeyword === keyword.id}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-3 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshingKeyword === keyword.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteKeyword(keyword.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ajouter un nouveau mot-clé</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot-clé
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Ex: location matériel événementiel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  id="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://esil-events.fr"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes ou commentaires sur ce mot-clé"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminKeywordTracking;