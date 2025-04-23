import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import {
  getAllArtists,
  createArtist,
  updateArtist,
  deleteArtist,
  Artist
} from '../../services/artistService';
import { getAllArtistCategories, ArtistCategory } from '../../services/artistCategoryService';

const AdminArtists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  // Initialize form state with empty strings for all fields to ensure inputs are controlled
  // Update the initial form state to use one of the default categories
  const [formData, setFormData] = useState({
    name: '',
    category: 'Chanteurs', // Default category
    image_url: '',
    description: ''
  });
  const [categories, setCategories] = useState<ArtistCategory[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [artistsData, categoriesData] = await Promise.all([
          getAllArtists(),
          getAllArtistCategories()
        ]);
        setArtists(artistsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleAddArtist = () => {
    setFormData({
      name: '',
      category: 'Chanteurs',
      image_url: '',
      description: ''
    });
    setEditingArtist(null);
    setShowForm(true);
  };

  const handleEditArtist = (artist: Artist) => {
    setFormData({
      name: artist.name,
      category: artist.category,
      image_url: artist.image_url || '',
      description: artist.description || ''
    });
    setEditingArtist(artist);
    setShowForm(true);
  };

  const handleDeleteArtist = async (name: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      return;
    }

    try {
      await deleteArtist(name);
      setArtists(artists.filter(artist => artist.name !== name));
    } catch (err) {
      setError('Erreur lors de la suppression de l\'artiste');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingArtist) {
        await updateArtist(editingArtist.name, formData);
        setArtists(artists.map(artist => 
          artist.name === editingArtist.name ? { ...artist, ...formData } : artist
        ));
      } else {
        const newArtist = await createArtist(formData);
        setArtists([...artists, newArtist]);
      }
      setShowForm(false);
      setEditingArtist(null);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de l\'artiste');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12">
        {/* Header Section - Improved responsive layout */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Artistes
          </h1>
          <button
            onClick={handleAddArtist}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un artiste
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingArtist ? 'Modifier l\'artiste' : 'Nouvel artiste'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingArtist(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields with improved styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de l'artiste
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Entrez le nom de l'artiste"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="" disabled>Sélectionnez une catégorie</option>
                    {/* Default categories */}
                    <option value="Chanteurs">Chanteurs</option>
                    <option value="Danseurs">Danseurs</option>
                    <option value="DJ">DJ</option>
                    <option value="Spectacles">Spectacles</option>
                    <option value="Animateurs">Animateurs</option>
                    
                    {/* Dynamic categories from database (excluding default ones to avoid duplicates) */}
                    {categories
                      .filter(category => !['Chanteurs', 'Danseurs', 'DJ', 'Spectacles', 'Animateurs'].includes(category.name))
                      .map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de l'image
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    type="text"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    required
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Décrivez l'artiste..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingArtist(null);
                  }}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  {editingArtist ? 'Mettre à jour' : 'Créer l\'artiste'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Search bar with improved styling */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un artiste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Responsive table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
              </div>
            ) : filteredArtists.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nom
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Image
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredArtists.map((artist) => (
                          <tr key={artist.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {artist.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {artist.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              <div className="h-10 w-10 rounded-md overflow-hidden">
                                <img 
                                  src={artist.image_url} 
                                  alt={artist.name} 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                              {artist.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditArtist(artist)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteArtist(artist.name)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucun artiste trouvé</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminArtists;