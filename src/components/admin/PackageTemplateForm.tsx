import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { PackageTemplateFormData, PackageTemplateItemFormData } from '../../types/PackageTemplate';
import { createPackageTemplate, updatePackageTemplate, addPackageTemplateItem, deletePackageTemplateItem } from '../../services/packageTemplateService';
import { getAllProducts } from '../../services/productService';
import { getAllArtists } from '../../services/artistService';
import { useNotification } from './AdminNotification';
import { generateSlug } from '../../utils/slugUtils';

interface PackageTemplateFormProps {
  initialData?: PackageTemplateFormData;
  templateId?: string;
  isEditing?: boolean;
}

const PackageTemplateForm: React.FC<PackageTemplateFormProps> = ({
  initialData,
  templateId,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<PackageTemplateFormData>(initialData || {
    name: '',
    description: '',
    slug: '',
    target_event_type: '',
    base_price: undefined,
    is_active: true,
    image_url: '',
    order_index: 0,
  });
  
  const [items, setItems] = useState<PackageTemplateItemFormData[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [itemType, setItemType] = useState<'product' | 'service' | 'artist'>('product');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les produits et artistes pour les sélecteurs
        const productsData = await getAllProducts();
        setProducts(productsData);
        
        const artistsData = await getAllArtists();
        setArtists(artistsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement des données', 'error');
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Gérer les valeurs numériques
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Générer automatiquement le slug à partir du nom
    if (name === 'name' && !isEditing) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  const handleAddItem = () => {
    if (!selectedItemId) {
      showNotification('Veuillez sélectionner un élément à ajouter', 'error');
      return;
    }
    
    const newItem: PackageTemplateItemFormData = {
      package_template_id: templateId || '',
      item_id: selectedItemId,
      item_type: itemType,
      default_quantity: 1,
      is_optional: false,
      is_quantity_adjustable: true,
      min_quantity: 1,
      max_quantity: 10,
      discount_percentage: 0,
    };
    
    setItems([...items, newItem]);
    setSelectedItemId('');
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  const handleItemChange = (index: number, field: keyof PackageTemplateItemFormData, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'default_quantity' || field === 'min_quantity' || field === 'max_quantity' || field === 'discount_percentage'
        ? parseFloat(value)
        : value,
    };
    setItems(newItems);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let templateResult;
      
      if (isEditing && templateId) {
        // Mettre à jour le modèle existant
        templateResult = await updatePackageTemplate(templateId, formData);
        showNotification('Modèle de package mis à jour avec succès', 'success');
      } else {
        // Créer un nouveau modèle
        templateResult = await createPackageTemplate(formData);
        showNotification('Modèle de package créé avec succès', 'success');
      }
      
      // Ajouter les éléments au modèle
      if (templateResult) {
        const templateId = templateResult.id;
        
        // Ajouter chaque élément
        for (const item of items) {
          await addPackageTemplateItem({
            ...item,
            package_template_id: templateId,
          });
        }
      }
      
      // Rediriger vers la liste des modèles
      navigate('/admin/package-templates');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du modèle de package:', error);
      showNotification('Erreur lors de l\'enregistrement du modèle de package', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Modifier le modèle de package' : 'Nouveau modèle de package'}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {isEditing
                ? 'Modifiez les détails et les éléments du modèle de package'
                : 'Créez un nouveau modèle de package pré-configuré pour vos clients'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/package-templates')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
          >
            <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
            Retour
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations générales */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom du modèle *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug (URL) *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="target_event_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type d'événement cible
                </label>
                <div className="mt-1">
                  <select
                    id="target_event_type"
                    name="target_event_type"
                    value={formData.target_event_type || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="séminaire">Séminaire</option>
                    <option value="soirée_entreprise">Soirée d'entreprise</option>
                    <option value="mariage">Mariage</option>
                    <option value="anniversaire">Anniversaire</option>
                    <option value="conférence">Conférence</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prix de base (€)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="base_price"
                    id="base_price"
                    step="0.01"
                    min="0"
                    value={formData.base_price || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL de l'image
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="image_url"
                    id="image_url"
                    value={formData.image_url || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ordre d'affichage
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="order_index"
                    id="order_index"
                    min="0"
                    value={formData.order_index}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-black focus:ring-black dark:text-white dark:focus:ring-white border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Actif (visible pour les clients)
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Éléments du package */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Éléments du package</h2>
            
            {/* Ajouter un élément */}
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Ajouter un élément</h3>
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="item_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type d'élément
                  </label>
                  <div className="mt-1">
                    <select
                      id="item_type"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as any)}
                      className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    >
                      <option value="product">Produit</option>
                      <option value="artist">Artiste</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="item_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sélectionner un élément
                  </label>
                  <div className="mt-1">
                    <select
                      id="item_id"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    >
                      <option value="">Sélectionnez un élément</option>
                      {itemType === 'product' && products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.price_ttc}€
                        </option>
                      ))}
                      {itemType === 'artist' && artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name} - {artist.category}
                        </option>
                      ))}
                      {/* Ajouter d'autres types d'éléments au besoin */}
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
            
            {/* Liste des éléments */}
            {items.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-md">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun élément</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Commencez par ajouter des produits, services ou artistes à ce package.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Élément</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Quantité</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Optionnel</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Ajustable</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Remise (%)</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                    {items.map((item, index) => {
                      // Trouver les détails de l'élément
                      let itemDetails;
                      if (item.item_type === 'product') {
                        itemDetails = products.find(p => p.id === item.item_id);
                      } else if (item.item_type === 'artist') {
                        itemDetails = artists.find(a => a.id === item.item_id);
                      }
                      
                      return (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            {itemDetails ? itemDetails.name : `${item.item_type} #${item.item_id}`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <input
                              type="number"
                              min="1"
                              value={item.default_quantity}
                              onChange={(e) => handleItemChange(index, 'default_quantity', e.target.value)}
                              className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-20 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <input
                              type="checkbox"
                              checked={item.is_optional}
                              onChange={(e) => handleItemChange(index, 'is_optional', e.target.checked)}
                              className="h-4 w-4 text-black focus:ring-black dark:text-white dark:focus:ring-white border-gray-300 dark:border-gray-600 rounded"
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <input
                              type="checkbox"
                              checked={item.is_quantity_adjustable}
                              onChange={(e) => handleItemChange(index, 'is_quantity_adjustable', e.target.checked)}
                              className="h-4 w-4 text-black focus:ring-black dark:text-white dark:focus:ring-white border-gray-300 dark:border-gray-600 rounded"
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount_percentage || 0}
                              onChange={(e) => handleItemChange(index, 'discount_percentage', e.target.value)}
                              className="shadow-sm focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-20 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            />
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/package-templates')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="-ml-1 mr-2 h-5 w-5" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageTemplateForm;