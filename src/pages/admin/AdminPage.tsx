import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { useAdminService, ChatbotConfig } from '../../services/adminService';

const AdminPage: React.FC = () => {
  const {
    loadConfig,
    saveConfig,
    updateSystemPrompt,
    addEventType,
    updateEventType,
    deleteEventType,
    addQuickReplies,
    resetConfig
  } = useAdminService();

  const [config, setConfig] = useState<ChatbotConfig>(loadConfig());
  const [newEventType, setNewEventType] = useState({
    id: '',
    name: '',
    description: '',
    styles: [] as string[],
    themes: [] as string[]
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    updateSystemPrompt(newPrompt);
    setConfig({ ...config, systemPrompt: newPrompt });
    showNotification('success', 'Configuration mise à jour avec succès');
  };

  const handleAddEventType = (e: React.FormEvent) => {
    e.preventDefault();
    addEventType(newEventType);
    setConfig(loadConfig());
    setNewEventType({
      id: '',
      name: '',
      description: '',
      styles: [],
      themes: []
    });
    showNotification('success', 'Type d\'événement ajouté avec succès');
  };

  const handleDeleteEventType = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'événement ?')) {
      deleteEventType(id);
      setConfig(loadConfig());
      showNotification('success', 'Type d\'événement supprimé avec succès');
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ?')) {
      resetConfig();
      setConfig(loadConfig());
      showNotification('success', 'Configuration réinitialisée avec succès');
    }
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="p-6 md:p-14">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-12 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Configuration du Chatbot
          </h1>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Paramètres généraux
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nom du chatbot
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400 min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prompt système
              </label>
              <textarea
                value={config.systemPrompt}
                onChange={handleSystemPromptChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400 min-h-[200px]"
              />
            </div>
            <button
              onClick={() => saveConfig(config)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
            >
              Sauvegarder les modifications
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Types d'événements
          </h2>
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {config.eventTypes.map((eventType) => (
                    <tr key={eventType.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {eventType.name}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {eventType.description}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <button
                          onClick={() => handleDeleteEventType(eventType.id)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddEventType} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ajouter un type d'événement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ID
                  </label>
                  <input
                    type="text"
                    value={newEventType.id}
                    onChange={(e) => setNewEventType({ ...newEventType, id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={newEventType.name}
                    onChange={(e) => setNewEventType({ ...newEventType, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEventType.description}
                  onChange={(e) => setNewEventType({ ...newEventType, description: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400 min-h-[100px]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
              >
                Ajouter
              </button>
            </form>
          </div>
        </div>

        <button
          onClick={handleResetConfig}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
        >
          Réinitialiser la configuration
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminPage; 