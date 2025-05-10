import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, Edit, ArrowLeft, Tag, Calendar, DollarSign } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { NotificationContainer, useNotification } from '../../components/admin/AdminNotification';
import { getPackageTemplateById } from '../../services/packageTemplateService';
import { getAllProducts } from '../../services/productService';
import { getAllArtists } from '../../services/artistService';
import { PackageTemplateWithItems } from '../../types/PackageTemplate';

const PackageTemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [template, setTemplate] = useState<PackageTemplateWithItems | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate('/admin/package-templates');
        return;
      }

      try {
        setLoading(true);
        
        // Charger le modèle de package avec ses éléments
        const templateData = await getPackageTemplateById(id);
        
        if (!templateData) {
          setError('Modèle de package non trouvé');
          return;
        }

        // Charger les produits et artistes pour les détails des éléments
        const productsData = await getAllProducts();
        const artistsData = await getAllArtists();
        
        setProducts(productsData);
        setArtists(artistsData);
        
        // Enrichir les éléments du template avec leurs détails
        const enrichedTemplate = {
          ...templateData,
          items: templateData.items.map(item => {
            let itemDetails = null;
            
            if (item.item_type === 'product') {
              itemDetails = productsData.find(p => p.id === item.item_id);
            } else if (item.item_type === 'artist') {
              itemDetails = artistsData.find(a => a.id === item.item_id);
            }
            
            return {
              ...item,
              item_details: itemDetails
            };
          })
        };
        
        setTemplate(enrichedTemplate);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du modèle de package:', err);
        setError('Erreur lors du chargement du modèle de package');
        showNotification('Erreur lors du chargement du modèle de package', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, showNotification]);

  // Calculer le prix total estimé du package
  const calculateTotalPrice = () => {
    if (!template) return 0;
    
    let total = template.base_price || 0;
    
    template.items.forEach(item => {
      if (item.item_details) {
        // Déterminer le prix en fonction du type d'élément
        let itemPrice = 0;
        if (item.item_type === 'product' && 'priceTTC' in item.item_details) {
          itemPrice = item.item_details.priceTTC;
        } else if (item.item_type === 'artist' && 'price' in item.item_details) {
          itemPrice = item.item_details.price;
        } else if ('price' in item.item_details) {
          itemPrice = item.item_details.price;
        }
        
        const discountMultiplier = 1 - (item.discount_percentage || 0) / 100;
        total += itemPrice * item.default_quantity * discountMultiplier;
      }
    });
    
    return total;
  };

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="pt-24">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement du modèle de package...</p>
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
              onClick={() => navigate('/admin/package-templates')}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="py-8">
          {/* Header avec actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/package-templates')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  {template.name}
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${template.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                  >
                    {template.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Créé le {new Date(template.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to={`/admin/package-templates/${template.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors"
              >
                <Edit className="-ml-1 mr-2 h-5 w-5" />
                Modifier
              </Link>
            </div>
          </div>

          {/* Informations générales */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{template.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug (URL)</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{template.slug}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type d'événement</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {template.target_event_type ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Calendar className="-ml-0.5 mr-1.5 h-3 w-3" />
                          {template.target_event_type}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Non spécifié</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Prix de base</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {template.base_price ? (
                        <span className="inline-flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          {template.base_price.toFixed(2)} €
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Non spécifié</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ordre d'affichage</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{template.order_index}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Prix total estimé</dt>
                    <dd className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {calculateTotalPrice().toFixed(2)} €
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            {template.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <div className="mt-2 prose prose-sm max-w-none text-gray-900 dark:text-white">
                  {template.description}
                </div>
              </div>
            )}
            {template.image_url && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Image</h3>
                <div className="mt-2">
                  <img
                    src={template.image_url}
                    alt={template.name}
                    className="h-48 w-auto object-cover rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Éléments du package */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Éléments du package</h2>
            
            {template.items.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-md">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun élément</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Ce package ne contient aucun élément.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Élément</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Quantité</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Prix unitaire</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Remise</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                    {template.items.map((item) => {
                      const itemDetails = item.item_details;
                      const itemPrice = itemDetails ? (itemDetails.price_ttc || itemDetails.price || 0) : 0;
                      const discountMultiplier = 1 - (item.discount_percentage || 0) / 100;
                      const totalPrice = itemPrice * item.default_quantity * discountMultiplier;
                      
                      return (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            {itemDetails ? itemDetails.name : `Élément #${item.item_id}`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {item.item_type === 'product' ? 'Produit' : item.item_type === 'artist' ? 'Artiste' : 'Service'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {item.default_quantity}
                            {item.is_quantity_adjustable && (
                              <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">(Ajustable)</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {itemPrice.toFixed(2)} €
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {item.discount_percentage ? `${item.discount_percentage}%` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {totalPrice.toFixed(2)} €
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan={5} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6 text-right">
                        Total estimé:
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {calculateTotalPrice().toFixed(2)} €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PackageTemplateDetail;