import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle, FileText, Tag, Globe, RefreshCw, Info } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { saveSitemap, parseSitemapXml, generateProductSitemapEntries } from '../../services/sitemapService';
import '../../styles/admin-animations.css';

interface SitemapEntry {
  id: string;
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const AdminSitemap: React.FC = () => {
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [showXmlPreview, setShowXmlPreview] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  // Fréquences possibles pour le sitemap
  const changefreqOptions = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

  useEffect(() => {
    // Charger le sitemap.xml existant
    const fetchSitemap = async () => {
      try {
        setLoading(true);
        const response = await fetch('/sitemap.xml');
        const xmlText = await response.text();
        
        // Utiliser la fonction parseSitemapXml du service pour parser le XML
        const parsedEntries = parseSitemapXml(xmlText);
        
        // Ajouter les IDs aux entrées si nécessaire
        const entriesWithIds = parsedEntries.map((entry, index) => ({
          ...entry,
          id: entry.id || `entry-${index}`
        }));
        
        setEntries(entriesWithIds);
      } catch (err) {
        console.error('Erreur lors du chargement du sitemap:', err);
        setError('Impossible de charger le sitemap.xml');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSitemap();
  }, []);

  const handleAddEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: SitemapEntry = {
      id: `entry-${Date.now()}`,
      loc: 'https://esil-events.fr/',
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5'
    };
    
    setEntries([...entries, newEntry]);
    
    // Scroll to the new entry after it's added
    setTimeout(() => {
      const element = document.getElementById(`row-${newEntry.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSelectedEntry(newEntry.id);
        setTimeout(() => setSelectedEntry(null), 2000);
      }
    }, 100);
  };

  // Ajouter tous les produits au sitemap
  const handleAddProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);
      
      // Récupérer les entrées de sitemap pour les produits
      const productEntries = await generateProductSitemapEntries();
      
      // Filtrer les entrées existantes pour éviter les doublons
      const existingUrls = entries.map(entry => entry.loc);
      const newProductEntries = productEntries.filter(entry => !existingUrls.includes(entry.loc));
      
      if (newProductEntries.length === 0) {
        setSuccess('Tous les produits sont déjà présents dans le sitemap');
        setTimeout(() => setSuccess(null), 3000);
        return;
      }
      
      // Ajouter les nouvelles entrées à la liste existante
      setEntries([...entries, ...newProductEntries]);
      
      setSuccess(`${newProductEntries.length} produits ajoutés au sitemap`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout des produits au sitemap:', err);
      setError(`Impossible d'ajouter les produits au sitemap: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleEntryChange = (id: string, field: keyof SitemapEntry, value: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const generateSitemapXml = (): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    entries.forEach(entry => {
      xml += '  <url>\n';
      xml += `    <loc>${entry.loc}</loc>\n`;
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    return xml;
  };

  const handleSaveSitemap = async () => {
    try {
      const sitemapXml = generateSitemapXml();
      
      // Animation pour montrer que la sauvegarde est en cours
      const saveBtnElement = document.getElementById('save-button');
      if (saveBtnElement) {
        saveBtnElement.classList.add('animate-pulse');
      }
      
      // Utiliser le service sitemapService pour sauvegarder le sitemap
      await saveSitemap(sitemapXml);
      
      // Enlever l'animation une fois la sauvegarde terminée
      if (saveBtnElement) {
        saveBtnElement.classList.remove('animate-pulse');
      }
      
      setSuccess('Sitemap mis à jour avec succès');
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du sitemap:', err);
      setError(`Impossible de sauvegarder le sitemap.xml: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      // Effacer le message d'erreur après 3 secondes
      setTimeout(() => setError(null), 3000);
    }
  };

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="pt-24">
          <div className="flex items-center justify-between mb-8 px-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du Sitemap</h1>
          </div>
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement du sitemap...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="pt-24 px-6 max-w-12xl mx-auto">
        {/* Hero section with stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center">
                <Globe className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Sitemap</h1>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
                Gérez le plan du site qui aide les moteurs de recherche à indexer votre contenu et améliore votre référencement.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 min-w-[140px]">
                <p className="text-sm text-gray-500 dark:text-gray-400">URLs totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{entries.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 min-w-[140px]">
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Les modifications ne seront appliquées qu'après avoir cliqué sur "Enregistrer".</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddEntry}
              className="flex items-center px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100 border border-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:border-gray-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une URL
            </button>
            <button
              onClick={handleAddProducts}
              disabled={loadingProducts}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 dark:border-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProducts ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-700 dark:border-indigo-300 mr-2"></div>
                  Chargement...
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4 mr-2" />
                  Ajouter les produits
                </>
              )}
            </button>
            <button
              onClick={() => setShowXmlPreview(!showXmlPreview)}
              className="flex items-center px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100 border border-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:border-gray-600 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              {showXmlPreview ? "Masquer l'aperçu XML" : "Afficher l'aperçu XML"}
            </button>
            <button
              id="save-button"
              onClick={handleSaveSitemap}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 md:space-x-3 font-medium"
              >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </button>
          </div>
        </div>

        {/* Messages d'erreur ou de succès */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start animate-fade-in">
            <div className="p-1 bg-green-100 rounded-full mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Tableau des entrées du sitemap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL (loc)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dernière modification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fréquence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priorité</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>Aucune entrée dans le sitemap</p>
                      <button
                        onClick={handleAddEntry}
                        className="mt-2 inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter une URL
                      </button>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr 
                      key={entry.id} 
                      id={`row-${entry.id}`}
                      className={`hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${selectedEntry === entry.id ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={entry.loc}
                          onChange={(e) => handleEntryChange(entry.id, 'loc', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="https://example.com/page"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={entry.lastmod}
                          onChange={(e) => handleEntryChange(entry.id, 'lastmod', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={entry.changefreq}
                          onChange={(e) => handleEntryChange(entry.id, 'changefreq', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          {changefreqOptions.map(option => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={entry.priority}
                            onChange={(e) => handleEntryChange(entry.id, 'priority', e.target.value)}
                            className="w-full mr-2"
                          />
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={entry.priority}
                            onChange={(e) => handleEntryChange(entry.id, 'priority', e.target.value)}
                            className="w-16 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                          title="Supprimer cette entrée"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination (statique pour l'instant) */}
          {entries.length > 10 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Affichage de <span className="font-medium">{entries.length}</span> entrées
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-gray-300 disabled:opacity-50">
                  Précédent
                </button>
                <button className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-gray-300 disabled:opacity-50">
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Aperçu du XML généré */}
        {showXmlPreview && (
          <div className="mt-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Aperçu du XML</h2>
              <div className="flex items-center space-x-2">
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 flex items-center"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSitemapXml());
                    setSuccess('XML copié dans le presse-papier');
                    setTimeout(() => setSuccess(null), 3000);
                  }}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier
                </button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg overflow-auto max-h-96 shadow-inner">
              <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">{generateSitemapXml()}</pre>
            </div>
          </div>
        )}
        
        {/* Bottom help section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-500" />
            Conseils pour optimiser votre sitemap
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <span>Attribuez une <strong>priorité plus élevée</strong> aux pages importantes de votre site.</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <span>La fréquence de changement indique aux moteurs de recherche à quelle fréquence une page est susceptible d'être modifiée.</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <span>Assurez-vous que les URL sont complètes et incluent le protocole (https://).</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <span>Mettez à jour régulièrement la date de dernière modification pour les pages qui évoluent.</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSitemap;