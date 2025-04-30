import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle, FileText } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { saveSitemap, parseSitemapXml } from '../../services/sitemapService';

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
      id: `entry-${entries.length}`,
      loc: 'https://esil-events.com/',
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5'
    };
    
    setEntries([...entries, newEntry]);
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
      
      // Utiliser le service sitemapService pour sauvegarder le sitemap
      // Cette fonction gère à la fois la sauvegarde dans Supabase et l'appel à l'API
      await saveSitemap(sitemapXml);
      
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
      <div className="pt-24 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du Sitemap</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleAddEntry}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une URL
            </button>
            <button
              onClick={handleSaveSitemap}
              className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </button>
          </div>
        </div>

        {/* Messages d'erreur ou de succès */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Tableau des entrées du sitemap */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={entry.loc}
                        onChange={(e) => handleEntryChange(entry.id, 'loc', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        value={entry.lastmod}
                        onChange={(e) => handleEntryChange(entry.id, 'lastmod', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={entry.changefreq}
                        onChange={(e) => handleEntryChange(entry.id, 'changefreq', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
                      >
                        {changefreqOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={entry.priority}
                        onChange={(e) => handleEntryChange(entry.id, 'priority', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveEntry(entry.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aperçu du XML généré */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Aperçu du XML</h2>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-auto max-h-96">
            <pre className="text-sm text-gray-800 dark:text-gray-200">{generateSitemapXml()}</pre>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSitemap;