import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Eye, ArrowUpDown, Image } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { NotificationContainer } from '../../components/admin/AdminNotification';

// Import du service de réalisations
import { Realization, RealizationFormData, getAllRealizations, createRealization, updateRealization, deleteRealization } from '../../services/realizationService';

// Composant pour le formulaire de réalisation
const RealizationForm: React.FC<{
  onSubmit: (data: RealizationFormData) => void;
  onCancel: () => void;
  initialData?: Realization;
}> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<RealizationFormData>({
    title: initialData?.title || '',
    location: initialData?.location || '',
    objective: initialData?.objective || '',
    mission: initialData?.mission || '',
    images: initialData?.images || [],
    category: initialData?.category || '',
    event_Date: initialData?.event_date || '', // Fixed property name to match RealizationFormData
    testimonial: initialData?.testimonial || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Simuler l'upload d'images (à remplacer par une vraie implémentation)
      const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.location.trim()) newErrors.location = 'Le lieu est requis';
    if (!formData.objective.trim()) newErrors.objective = "L'objectif est requis";
    if (!formData.mission.trim()) newErrors.mission = 'La mission est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Modifier la réalisation' : 'Ajouter une nouvelle réalisation'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la réalisation *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ex: Lancement Produit XYZ Tech"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ex: Palais des Congrès, Paris"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objectif *</label>
          <textarea
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            rows={3}
            className={`w-full p-2 border rounded-md ${errors.objective ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Description de ce que le client voulait accomplir"
          />
          {errors.objective && <p className="text-red-500 text-xs mt-1">{errors.objective}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notre mission *</label>
          <textarea
            name="mission"
            value={formData.mission}
            onChange={handleChange}
            rows={4}
            className={`w-full p-2 border rounded-md ${errors.mission ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Description de ce qu'ESIL Events a fait"
          />
          {errors.mission && <p className="text-red-500 text-xs mt-1">{errors.mission}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="w-full p-2 border border-gray-300 rounded-md"
            accept="image/*"
          />
          {formData.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  <img src={img} alt={`Image ${index + 1}`} className="h-20 w-full object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie (optionnel)</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Lancement de produit">Lancement de produit</option>
            <option value="Séminaire d'entreprise">Séminaire d'entreprise</option>
            <option value="Mariage">Mariage</option>
            <option value="Festival">Festival</option>
            <option value="Conférence">Conférence</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de l'événement (optionnel)</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Témoignage client (optionnel)</label>
          <textarea
            name="testimonial"
            value={formData.testimonial}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Témoignage du client sur l'événement"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            {initialData ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const AdminRealizations: React.FC = () => {
  const [realizations, setRealizations] = useState<Realization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingRealization, setEditingRealization] = useState<Realization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickViewRealization, setQuickViewRealization] = useState<Realization | null>(null);

  // Fonction pour charger les réalisations depuis le service
  const loadRealizations = async () => {
    try {
      setLoading(true);
      const data = await getAllRealizations();
      setRealizations(data);
    } catch (err) {
      setError('Erreur lors du chargement des réalisations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealizations();
  }, []);

  // Filtrer les réalisations en fonction de la recherche et de la catégorie
  const filteredRealizations = realizations.filter(realization => {
    const matchesSearch = realization.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          realization.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          realization.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          realization.mission.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? realization.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Gérer l'ajout d'une nouvelle réalisation
  const handleAddRealization = async (data: RealizationFormData) => {
    try {
      await createRealization(data);
      await loadRealizations(); // Recharger la liste après l'ajout
      setShowForm(false);
      // Afficher un message de succès
      setError('');
    } catch (err: any) {
      setError(`Erreur lors de l'ajout de la réalisation: ${err.message || 'Erreur inconnue'}`);
      console.error('Erreur d\'ajout:', err);
    }
  };

  // Gérer la mise à jour d'une réalisation
  const handleUpdateRealization = async (data: RealizationFormData) => {
    if (!editingRealization) return;
    
    try {
      await updateRealization(editingRealization.id, data);
      await loadRealizations(); // Recharger la liste après la mise à jour
      setEditingRealization(null);
      // Afficher un message de succès
      setError('');
    } catch (err: any) {
      setError(`Erreur lors de la mise à jour de la réalisation: ${err.message || 'Erreur inconnue'}`);
      console.error('Erreur de mise à jour:', err);
    }
  };

  // Gérer la suppression d'une réalisation
  const handleDeleteRealization = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réalisation ?')) {
      return;
    }

    try {
      await deleteRealization(id);
      await loadRealizations(); // Recharger la liste après la suppression
      // Afficher un message de succès
      setError('');
    } catch (err: any) {
      setError(`Erreur lors de la suppression de la réalisation: ${err.message || 'Erreur inconnue'}`);
      console.error('Erreur de suppression:', err);
    }
  };

  // Gérer l'édition d'une réalisation
  const handleEditRealization = (realization: Realization) => {
    setEditingRealization(realization);
    setShowForm(false); // Fermer le formulaire d'ajout s'il est ouvert
  };

  // Gérer l'aperçu rapide d'une réalisation
  const handleQuickView = (realization: Realization) => {
    setQuickViewRealization(realization);
  };

  // Obtenir les catégories uniques pour le filtre
  const uniqueCategories = Array.from(new Set(realizations.map(r => r.category).filter(Boolean))) as string[];

  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Gestion des Réalisations
          </h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingRealization(null);
              }}
              className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une réalisation
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 animate-fade-in">
            {error}
          </div>
        )}

        {/* Formulaire d'ajout/édition */}
        {showForm && (
          <RealizationForm
            onSubmit={handleAddRealization}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Formulaire d'édition */}
        {editingRealization && (
          <RealizationForm
            initialData={editingRealization}
            onSubmit={handleUpdateRealization}
            onCancel={() => setEditingRealization(null)}
          />
        )}

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une réalisation..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2 text-gray-500" />
                Filtres
              </button>
            </div>
          </div>

          {/* Panneau de filtres */}
          {isFilterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Toutes les catégories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des réalisations */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement des réalisations...</p>
            </div>
          </div>
        ) : filteredRealizations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune réalisation trouvée</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? "Aucune réalisation ne correspond à vos critères de recherche."
                : "Vous n'avez pas encore ajouté de réalisations."}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer">
                        Titre
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRealizations.map((realization) => (
                    <tr key={realization.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={realization.images[0] || '/images/default-product.svg'}
                              alt={realization.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{realization.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{realization.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {realization.category ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {realization.category}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {realization.event_date
                            ? new Date(realization.event_date).toLocaleDateString('fr-FR')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleQuickView(realization)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Aperçu"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditRealization(realization)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRealization(realization.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal d'aperçu rapide */}
        {quickViewRealization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{quickViewRealization.title}</h2>
                  <button
                    onClick={() => setQuickViewRealization(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {quickViewRealization.images.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quickViewRealization.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Image ${index + 1}`}
                          className="rounded-lg object-cover w-full h-48"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Lieu</h3>
                    <p className="text-gray-700">{quickViewRealization.location}</p>
                  </div>
                  
                  {quickViewRealization.category && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Catégorie</h3>
                      <p className="text-gray-700">{quickViewRealization.category}</p>
                    </div>
                  )}
                  
                  {quickViewRealization.event_date && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Date de l'événement</h3>
                      <p className="text-gray-700">{new Date(quickViewRealization.event_date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Objectif</h3>
                  <p className="text-gray-700">{quickViewRealization.objective}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Notre mission</h3>
                  <p className="text-gray-700">{quickViewRealization.mission}</p>
                </div>

                {quickViewRealization.testimonial && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <h3 className="text-lg font-semibold mb-2">Témoignage client</h3>
                    <p className="text-gray-700 italic">« {quickViewRealization.testimonial} »</p>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setQuickViewRealization(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
