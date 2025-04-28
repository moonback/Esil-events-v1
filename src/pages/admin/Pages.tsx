import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import PageForm from '../../components/admin/PageForm';
import { Page, PageFormData, getAllPages, createPage, updatePage, deletePage, getPageById } from '../../services/pageService';

const AdminPages: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  // Load pages from API
  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPages();
      setPages(data);
    } catch (err) {
      setError('Erreur lors du chargement des pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Filter pages based on search term
  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteClick = (id: string) => {
    setPageToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    
    try {
      setError(null);
      await deletePage(pageToDelete);
      setPages(pages.filter(p => p.id !== pageToDelete));
      setShowDeleteModal(false);
      setPageToDelete(null);
    } catch (err) {
      setError('Erreur lors de la suppression de la page');
      console.error(err);
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      setError(null);
      const page = await getPageById(id);
      if (page) {
        setEditingPage(page);
        setShowForm(true);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des détails de la page');
      console.error(err);
    }
  };

  const handleFormSubmit = async (formData: PageFormData) => {
    try {
      setError(null);
      if (editingPage) {
        // Update existing page
        const updatedPage = await updatePage(editingPage.id, formData);
        setPages(pages.map(p => p.id === editingPage.id ? updatedPage : p));
      } else {
        // Create new page
        const newPage = await createPage(formData);
        setPages([newPage, ...pages]);
      }
      setShowForm(false);
      setEditingPage(null);
    } catch (err) {
      setError(`Erreur lors de ${editingPage ? 'la mise à jour' : 'la création'} de la page`);
      console.error(err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPage(null);
  };

  const formatDate = (dateString: string) => {
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
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showForm ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                {editingPage ? 'Modifier la page' : 'Créer une nouvelle page'}
              </h1>
              <button
                onClick={handleCancelForm}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Retour
              </button>
            </div>
            <PageForm
              initialData={editingPage ? {
                title: editingPage.title,
                slug: editingPage.slug,
                content: editingPage.content,
                status: editingPage.status,
                meta_description: editingPage.meta_description,
                meta_keywords: editingPage.meta_keywords
              } : undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Gestion des pages</h1>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle page
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher une page..."
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

            {/* Pages Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">Chargement...</div>
              ) : pages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucune page trouvée. Créez votre première page en cliquant sur "Nouvelle page".
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière mise à jour</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((page) => (
                        <tr key={page.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{page.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.slug}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {page.updated_at ? formatDate(page.updated_at) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              page.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {page.status === 'published' ? 'Publié' : 'Brouillon'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-gray-600 hover:text-gray-900 mr-3">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditClick(page.id)}
                              className="text-gray-600 hover:text-gray-900 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(page.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de{' '}
                        <span className="font-medium">{indexOfFirstItem + 1}</span>
                        {' à '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredPages.length)}
                        </span>
                        {' sur '}
                        <span className="font-medium">{filteredPages.length}</span>
                        {' pages'}
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-black border-black text-white'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPages;
