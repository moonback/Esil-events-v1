import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Eye, ArrowUpDown, Image, Calendar, Star, MapPin, Tag } from 'lucide-react';
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
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ onSubmit, onCancel, initialData, setPreviewUrls }) => {
  const [formData, setFormData] = useState<RealizationFormData>({
    title: initialData?.title || '',
    location: initialData?.location || '',
    objective: initialData?.objective || '',
    mission: initialData?.mission || '',
    images: initialData?.images || [],
    category: initialData?.category || '',
    event_Date: initialData?.event_date || '', // Using correct property name from RealizationFormData interface
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
      // Stocker les fichiers pour un téléchargement ultérieur vers Supabase Storage
      const files = Array.from(e.target.files);
      
      // Créer des URLs temporaires pour la prévisualisation
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      
      // Mettre à jour l'état des prévisualisations dans le composant parent
      setPreviewUrls(prev => [...prev, ...newImageUrls]);
      
      // Mettre à jour le formulaire avec les fichiers et les URLs de prévisualisation
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls],
        imageFiles: [...(prev.imageFiles || []), ...files]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      // Récupérer l'URL de l'image à supprimer
      const imageUrl = prev.images[index];
      
      // Si c'est une URL temporaire (blob:), la révoquer
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
        
        // Mettre à jour l'état des prévisualisations dans le composant parent
        setPreviewUrls(prevUrls => prevUrls.filter(url => url !== imageUrl));
      }
      
      // Supprimer l'image de la liste des images
      const newImages = prev.images.filter((_, i) => i !== index);
      
      // Si nous avons des fichiers d'image, supprimer également le fichier correspondant
      let newImageFiles = prev.imageFiles || [];
      if (newImageFiles.length > 0 && index < newImageFiles.length) {
        newImageFiles = newImageFiles.filter((_, i) => i !== index);
      }
      
      return {
        ...prev,
        images: newImages,
        imageFiles: newImageFiles
      };
    });
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
      // Filtrer les URLs temporaires (blob:) des images existantes
      // Seules les URLs Supabase et les URLs externes valides seront conservées
      const filteredFormData = {
        ...formData,
        images: formData.images.filter(url => !url.startsWith('blob:'))
      };
      
      onSubmit(filteredFormData);
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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  // Gérer la mise à jour d'une réalisation existante
  const handleUpdateRealization = async (formData: RealizationFormData) => {
    if (!editingRealization) return;
    
    try {
      await updateRealization(editingRealization.id, formData);
      await loadRealizations();
      setEditingRealization(null);
      setError('');
      
      // Nettoyer les URLs de prévisualisation
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    } catch (err) {
      setError(`Erreur lors de la mise à jour de la réalisation: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      console.error('Erreur de mise à jour:', err);
    }
  };

  // Gérer la suppression d'une réalisation
  const handleDeleteRealization = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réalisation?')) return;
    
    try {
      setIsLoading(true);
      await deleteRealization(id);
      loadRealizations();
      setNotification({ type: 'success', message: 'Réalisation supprimée avec succès!' });
      
      // Nettoyer les URLs de prévisualisation
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    } catch (error) {
      console.error('Erreur lors de la suppression de la réalisation:', error);
      setNotification({ type: 'error', message: 'Erreur lors de la suppression de la réalisation' });
    } finally {
      setIsLoading(false);
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

  // Calculer les statistiques
  const totalRealizations = realizations.length;
  const categoriesCount = new Set(realizations.map(r => r.category).filter(Boolean)).size;
  const upcomingEvents = realizations.filter(r => r.event_date && new Date(r.event_date) > new Date()).length;
  const locationsCount = new Set(realizations.map(r => r.location)).size;

  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
                  <Image className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Réalisations</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalRealizations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-4">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Catégories</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{categoriesCount}</p>
                </div>
              </div>
            </div>
            
            {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mr-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Événements à venir</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{upcomingEvents}</p>
                </div>
              </div>
            </div> */}
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lieux uniques</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{locationsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Formulaire d'ajout/édition */}
          {showForm && (
            <RealizationForm
              onSubmit={handleAddRealization}
              onCancel={() => setShowForm(false)}
              setPreviewUrls={setPreviewUrls}
            />
          )}

          {/* Formulaire d'édition */}
          {editingRealization && (
            <RealizationForm
              initialData={editingRealization}
              onSubmit={handleUpdateRealization}
              onCancel={() => setEditingRealization(null)}
              setPreviewUrls={setPreviewUrls}
            />
          )}

          {/* Header with search, filters and view toggle */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title="Vue en cards"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title="Vue en tableau"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une réalisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </button>

              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingRealization(null);
                }}
                className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle réalisation</span>
              </button>
            </div>
          </div>

          {/* Filtres */}
          {isFilterOpen && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}

          {/* Liste des réalisations */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement des réalisations...</p>
              </div>
            </div>
          ) : filteredRealizations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune réalisation trouvée</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
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
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    Réinitialiser la recherche
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRealizations.map((realization) => (
                <div 
                  key={realization.id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={realization.images[0] || '/images/default-product.svg'}
                      alt={realization.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {realization.category && (
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full backdrop-blur-sm">
                        {realization.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {realization.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="truncate">{realization.location}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                      {realization.objective}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleQuickView(realization)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                          title="Aperçu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditRealization(realization)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteRealization(realization.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer">
                          Titre
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Lieu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRealizations.map((realization) => (
                      <tr key={realization.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
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
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{realization.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{realization.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {realization.category ? (
                            <span className="px-2 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                              {realization.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {realization.event_date
                              ? new Date(realization.event_date).toLocaleDateString('fr-FR')
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleQuickView(realization)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Aperçu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditRealization(realization)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRealization(realization.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{quickViewRealization.title}</h2>
                    <button
                      onClick={() => setQuickViewRealization(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                            className="rounded-xl object-cover w-full h-48"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lieu</h3>
                      <p className="text-gray-700 dark:text-gray-300">{quickViewRealization.location}</p>
                    </div>
                    
                    {quickViewRealization.category && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Catégorie</h3>
                        <p className="text-gray-700 dark:text-gray-300">{quickViewRealization.category}</p>
                      </div>
                    )}
                    
                    {quickViewRealization.event_date && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Date de l'événement</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {new Date(quickViewRealization.event_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Objectif</h3>
                    <p className="text-gray-700 dark:text-gray-300">{quickViewRealization.objective}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notre mission</h3>
                    <p className="text-gray-700 dark:text-gray-300">{quickViewRealization.mission}</p>
                  </div>

                  {quickViewRealization.testimonial && (
                    <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Témoignage client</h3>
                      <p className="text-gray-700 dark:text-gray-300 italic">« {quickViewRealization.testimonial} »</p>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setQuickViewRealization(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
