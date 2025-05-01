import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { Announcement, getActiveAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../services/localStorageAnnouncementService';

const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const initialFormState = {
    message: '',
    link: '',
    active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    background_color: '#8854d0',
    text_color: '#ffffff'
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActiveAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Impossible de charger les annonces. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.message.trim()) {
      errors.message = "Le message est requis";
    }
    
    if (!formData.start_date) {
      errors.start_date = "La date de début est requise";
    }
    
    if (!formData.end_date) {
      errors.end_date = "La date de fin est requise";
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      errors.end_date = "La date de fin doit être après la date de début";
    }
    
    if (formData.link && !isValidUrl(formData.link)) {
      errors.link = "L'URL n'est pas valide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, formData);
        showNotification('success', "L'annonce a été mise à jour avec succès");
      } else {
        await createAnnouncement(formData);
        showNotification('success', "L'annonce a été créée avec succès");
      }
      
      await fetchAnnouncements();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving announcement:', error);
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      message: announcement.message,
      link: announcement.link || '',
      active: announcement.active,
      start_date: announcement.start_date,
      end_date: announcement.end_date,
      background_color: announcement.background_color || '#8854d0',
      text_color: announcement.text_color || '#ffffff'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await deleteAnnouncement(id);
        await fetchAnnouncements();
        showNotification('success', "L'annonce a été supprimée avec succès");
      } catch (error) {
        console.error('Error deleting announcement:', error);
        showNotification('error', 'Une erreur est survenue lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
    setFormData(initialFormState);
    setFormErrors({});
  };
  
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear validation error when field is updated
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };
  
  const AnnouncementPreview = () => (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aperçu</h3>
      <div 
        style={{ 
          backgroundColor: formData.background_color, 
          color: formData.text_color 
        }}
        className="p-3 rounded-lg flex items-center justify-between"
      >
        <span>{formData.message}</span>
        {formData.link && (
          <button className="underline text-sm">En savoir plus</button>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="p-6 md:p-14">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-12 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Gestion des annonces</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 md:space-x-3 font-medium"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Nouvelle annonce</span>
          </button>
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

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 px-4 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                Aucune annonce trouvée
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-800/30 transition-colors"
              >
                Créer votre première annonce
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Message</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Période</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {announcements.map((announcement) => (
                    <tr key={announcement.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="flex flex-col">
                          <div className="max-w-md text-sm font-medium text-gray-900 dark:text-white truncate">{announcement.message}</div>
                          {announcement.link && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">{announcement.link}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="text-xs md:text-sm text-gray-900 dark:text-white space-y-1">
                          <div>Du {new Date(announcement.start_date).toLocaleDateString()}</div>
                          <div>Au {new Date(announcement.end_date).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            announcement.active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {announcement.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors duration-200"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 w-full max-w-lg shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {editingAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.message 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    maxLength={200}
                  />
                  {formErrors.message && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.message.length}/200 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Lien (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => handleFieldChange('link', e.target.value)}
                    placeholder="https://..."
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.link 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.link && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.link}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleFieldChange('start_date', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.start_date 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.start_date && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Date de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleFieldChange('end_date', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.end_date 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.end_date && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.end_date}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Couleur de fond
                    </label>
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => handleFieldChange('background_color', e.target.value)}
                      className="w-full h-12 p-1 rounded-xl cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Couleur du texte
                    </label>
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => handleFieldChange('text_color', e.target.value)}
                      className="w-full h-12 p-1 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
                
                <AnnouncementPreview />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => handleFieldChange('active', e.target.checked)}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Activer l'annonce
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 sm:mt-0 px-4 md:px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {editingAnnouncement ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;