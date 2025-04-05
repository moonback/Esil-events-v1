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
      image_url: artist.image_url || '', // Add fallback to empty string
      description: artist.description || '' // Add fallback to empty string
    });
    setEditingArtist(artist);
    setShowForm(true);
  };

  const handleDeleteArtist = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      return;
    }

    try {
      await deleteArtist(id);
      setArtists(artists.filter(artist => artist.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de l\'artiste');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingArtist) {
        await updateArtist(editingArtist.id, formData);
        setArtists(artists.map(artist => 
          artist.id === editingArtist.id ? { ...artist, ...formData } : artist
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
      <div className="p-6 pt-24 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Artistes</h1>
          <button
            onClick={handleAddArtist}
            className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un artiste
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              // In the form section, remove the duplicate category dropdown and keep only one:
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
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
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de l'image
                </label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url || ''} // Add fallback to empty string
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                >
                  {editingArtist ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un artiste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
              </div>
            ) : filteredArtists.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
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
                      <tr key={artist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                            onClick={() => handleDeleteArtist(artist.id)}
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