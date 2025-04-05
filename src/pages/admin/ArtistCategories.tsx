import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import {
  getAllArtistCategories,
  createArtistCategory,
  updateArtistCategory,
  deleteArtistCategory,
  ArtistCategory
} from '../../services/artistCategoryService';

const AdminArtistCategories: React.FC = () => {
  const [categories, setCategories] = useState<ArtistCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArtistCategory | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllArtistCategories();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = () => {
    setFormData({
      name: ''
    });
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: ArtistCategory) => {
    setFormData({
      name: category.name
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await deleteArtistCategory(id);
      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de la catégorie');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateArtistCategory(editingCategory.id, formData);
        setCategories(categories.map(category => 
          category.id === editingCategory.id ? { ...category, ...formData } : category
        ));
      } else {
        const newCategory = await createArtistCategory(formData);
        setCategories([...categories, newCategory]);
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la catégorie');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="p-6 pt-24 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Catégories d'Artistes</h1>
          <button
            onClick={handleAddCategory}
            className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une catégorie
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
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                >
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
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
                  placeholder="Rechercher une catégorie..."
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
            ) : filteredCategories.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
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
                <p className="text-gray-500 dark:text-gray-400">Aucune catégorie trouvée</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminArtistCategories;