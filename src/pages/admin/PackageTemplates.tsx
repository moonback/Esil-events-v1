import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Eye, Copy } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { NotificationContainer, useNotification } from '../../components/admin/AdminNotification';
import { getAllPackageTemplates, deletePackageTemplate } from '../../services/packageTemplateService';
import { PackageTemplate } from '../../types/PackageTemplate';
import { Link } from 'react-router-dom';

const AdminPackageTemplates: React.FC = () => {
  const [packageTemplates, setPackageTemplates] = useState<PackageTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPackageTemplates();
  }, []);

  const fetchPackageTemplates = async () => {
    try {
      setLoading(true);
      const templates = await getAllPackageTemplates();
      setPackageTemplates(templates);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des modèles de packages:', err);
      setError('Erreur lors du chargement des modèles de packages');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle de package ?')) {
      try {
        await deletePackageTemplate(id);
        showNotification('Modèle de package supprimé avec succès', 'success');
        fetchPackageTemplates(); // Rafraîchir la liste
      } catch (err) {
        console.error('Erreur lors de la suppression du modèle de package:', err);
        showNotification('Erreur lors de la suppression du modèle de package', 'error');
      }
    }
  };

  const handleToggleActive = async (template: PackageTemplate) => {
    try {
      // Cette fonction sera implémentée plus tard
      // await updatePackageTemplate(template.id, { is_active: !template.is_active });
      showNotification(
        `Modèle de package ${template.is_active ? 'désactivé' : 'activé'} avec succès`,
        'success'
      );
      fetchPackageTemplates(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour du modèle de package:', err);
      showNotification('Erreur lors de la mise à jour du modèle de package', 'error');
    }
  };

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="pt-24">
          <div className="flex items-center justify-between mb-8 px-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modèles de Packages</h1>
          </div>
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement des modèles de packages...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => fetchPackageTemplates()}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modèles de Packages</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gérez les modèles de packages pré-configurés pour vos clients
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/admin/package-templates/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Nouveau modèle
              </Link>
            </div>
          </div>

          {/* Package Templates List */}
          {packageTemplates.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Aucun modèle de package</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Commencez par créer votre premier modèle de package pré-configuré.
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/package-templates/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Créer un modèle
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {packageTemplates.map((template) => (
                  <li key={template.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {template.image_url ? (
                              <img
                                className="h-12 w-12 rounded-md object-cover"
                                src={template.image_url}
                                alt={template.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                              <span
                                className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${template.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                              >
                                {template.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {template.description || 'Aucune description'}
                            </div>
                            {template.target_event_type && (
                              <div className="mt-1">
                                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {template.target_event_type}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/package-templates/${template.id}`}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
                            title="Voir les détails"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/admin/package-templates/${template.id}/edit`}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
                            title="Modifier"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-500 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {template.base_price && (
                            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                              <span className="font-medium">Prix de base:</span>
                              <span className="ml-1">{template.base_price.toFixed(2)} €</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                          <span className="font-medium">Ordre d'affichage:</span>
                          <span className="ml-1">{template.order_index}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPackageTemplates;