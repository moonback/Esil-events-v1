import React, { useState, useEffect } from 'react';
import { Package, PackageFormData } from '../types/Package';
import { Product } from '../types/Product';
import { getAllProducts, calculatePackageTotalPrice } from '../services/productService';
import { getAllCategories, Category } from '../services/categoryService';
import { X, Plus, Trash2, Info } from 'lucide-react';

interface PackageFormProps {
  initialData?: Package;
  onSubmit: (data: PackageFormData) => void;
  isLoading: boolean;
}

const PackageForm: React.FC<PackageFormProps> = ({ initialData, onSubmit, isLoading }) => {
  // État principal du formulaire
  const [formData, setFormData] = useState<PackageFormData>(() => {
    // Initialiser avec les données initiales ou des valeurs par défaut
    const defaults: PackageFormData = {
      name: '',
      reference: '',
      category: 'packages', // Catégorie spécifique pour les packages
      subCategory: '',
      subSubCategory: '',
      description: '',
      priceHT: 0,
      priceTTC: 0,
      stock: 0,
      images: [],
      mainImageIndex: undefined,
      colors: [],
      technicalSpecs: {},
      technicalDocUrl: null,
      videoUrl: null,
      isAvailable: true,
      type: 'package',
      items: [],
      options: [],
      discountPercentage: 0,
      originalTotalPriceHT: 0,
      originalTotalPriceTTC: 0
    };

    if (initialData) {
      return {
        ...defaults,
        ...initialData,
      };
    }
    return defaults;
  });

  // États pour la gestion des produits et catégories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour l'ajout d'éléments au package
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [isRequired, setIsRequired] = useState<boolean>(true);
  const [isCustomizable, setIsCustomizable] = useState<boolean>(false);
  const [minQuantity, setMinQuantity] = useState<number | undefined>(undefined);
  const [maxQuantity, setMaxQuantity] = useState<number | undefined>(undefined);

  // États pour l'ajout d'options
  const [newOptionName, setNewOptionName] = useState<string>('');
  const [newOptionDescription, setNewOptionDescription] = useState<string>('');
  const [newOptionRequired, setNewOptionRequired] = useState<boolean>(false);
  const [newOptionChoices, setNewOptionChoices] = useState<Array<{
    name: string;
    description: string;
    priceAdjustment: number;
    productIds: string[];
  }>>([]);

  // État pour le suivi de la longueur de la description
  const [descriptionLength, setDescriptionLength] = useState<number>(0);

  // Chargement des produits et catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);

        setProducts(productsData.filter(p => p.type !== 'package')); // Exclure les packages existants
        setCategories(categoriesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données nécessaires');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcul des prix totaux et application de la remise
  useEffect(() => {
    const calculatePrices = async () => {
      if (formData.items.length === 0) {
        setFormData(prev => ({
          ...prev,
          originalTotalPriceHT: 0,
          originalTotalPriceTTC: 0,
          priceHT: 0,
          priceTTC: 0
        }));
        return;
      }

      try {
        const { totalHT, totalTTC } = await calculatePackageTotalPrice(formData.items);
        
        // Appliquer la remise si elle existe
        const discountMultiplier = 1 - (formData.discountPercentage || 0) / 100;
        const discountedPriceHT = totalHT * discountMultiplier;
        const discountedPriceTTC = totalTTC * discountMultiplier;
        
        setFormData(prev => ({
          ...prev,
          originalTotalPriceHT: totalHT,
          originalTotalPriceTTC: totalTTC,
          priceHT: discountedPriceHT,
          priceTTC: discountedPriceTTC
        }));
      } catch (err) {
        console.error('Erreur lors du calcul des prix:', err);
      }
    };

    calculatePrices();
  }, [formData.items, formData.discountPercentage]);

  // Gestion des changements de champs de base
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'discountPercentage') {
      // Assurer que la remise est entre 0 et 100
      const discount = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
      setFormData(prev => ({ ...prev, [name]: discount }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (name === 'description') {
      setDescriptionLength(value.length);
    }
  };

  // Ajout d'un produit au package
  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    // Vérifier si le produit est déjà dans le package
    const existingItemIndex = formData.items.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité si le produit existe déjà
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += selectedQuantity;
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      // Ajouter un nouveau produit
      const newItem = {
        productId: selectedProductId,
        quantity: selectedQuantity,
        isRequired,
        isCustomizable,
        minQuantity: isCustomizable ? minQuantity : undefined,
        maxQuantity: isCustomizable ? maxQuantity : undefined
      };
      
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
    
    // Réinitialiser les champs
    setSelectedProductId('');
    setSelectedQuantity(1);
    setIsRequired(true);
    setIsCustomizable(false);
    setMinQuantity(undefined);
    setMaxQuantity(undefined);
  };

  // Suppression d'un produit du package
  const handleRemoveItem = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }));
  };

  // Ajout d'une option au package
  const handleAddOption = () => {
    if (!newOptionName.trim() || newOptionChoices.length === 0) return;
    
    const newOption = {
      id: `option-${Date.now()}`,
      name: newOptionName.trim(),
      description: newOptionDescription.trim(),
      choices: newOptionChoices.map((choice, index) => ({
        id: `choice-${Date.now()}-${index}`,
        name: choice.name,
        description: choice.description,
        priceAdjustment: choice.priceAdjustment,
        productIds: choice.productIds
      })),
      isRequired: newOptionRequired
    };
    
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
    
    // Réinitialiser les champs
    setNewOptionName('');
    setNewOptionDescription('');
    setNewOptionRequired(false);
    setNewOptionChoices([]);
  };

  // Suppression d'une option
  const handleRemoveOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).filter(option => option.id !== optionId)
    }));
  };

  // Ajout d'un choix à une option en cours de création
  const handleAddChoice = () => {
    setNewOptionChoices(prev => [
      ...prev,
      {
        name: '',
        description: '',
        priceAdjustment: 0,
        productIds: []
      }
    ]);
  };

  // Mise à jour d'un choix
  const handleUpdateChoice = (index: number, field: string, value: any) => {
    const updatedChoices = [...newOptionChoices];
    updatedChoices[index] = { ...updatedChoices[index], [field]: value };
    setNewOptionChoices(updatedChoices);
  };

  // Suppression d'un choix
  const handleRemoveChoice = (index: number) => {
    setNewOptionChoices(prev => prev.filter((_, i) => i !== index));
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Rendu du formulaire
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de base */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations de base</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du package *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Référence */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700">Référence *</label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
              <span className="text-xs text-gray-500 ml-2">({descriptionLength}/2000)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Remise */}
          <div>
            <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">
              Pourcentage de remise (%)
            </label>
            <input
              type="number"
              id="discountPercentage"
              name="discountPercentage"
              min="0"
              max="100"
              step="0.1"
              value={formData.discountPercentage || 0}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Prix calculés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md">
            <div>
              <p className="text-sm font-medium text-gray-700">Prix total HT (sans remise)</p>
              <p className="text-lg font-semibold">{formData.originalTotalPriceHT?.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Prix total TTC (sans remise)</p>
              <p className="text-lg font-semibold">{formData.originalTotalPriceTTC?.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Prix final HT (avec remise)</p>
              <p className="text-lg font-semibold text-green-600">{formData.priceHT?.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Prix final TTC (avec remise)</p>
              <p className="text-lg font-semibold text-green-600">{formData.priceTTC?.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Produits du package */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Produits inclus dans le package</h3>
          
          {/* Liste des produits inclus */}
          <div className="space-y-4">
            {formData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obligatoire</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personnalisable</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix total</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <tr key={`${item.productId}-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product ? product.name : 'Produit inconnu'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.isRequired ? 'Oui' : 'Non'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.isCustomizable ? (
                              <span>
                                Oui ({item.minQuantity || 0} - {item.maxQuantity || 'max'})
                              </span>
                            ) : 'Non'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product ? `${product.priceHT.toFixed(2)} € HT` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product ? `${(product.priceHT * item.quantity).toFixed(2)} € HT` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-red-600 hover:text-red-900"
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
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-md">
                <p className="text-gray-500">Aucun produit ajouté au package</p>
              </div>
            )}
          </div>

          {/* Formulaire d'ajout de produit */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h4 className="font-medium text-gray-700">Ajouter un produit</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélection du produit */}
              <div>
                <label htmlFor="selectedProductId" className="block text-sm font-medium text-gray-700">Produit</label>
                <select
                  id="selectedProductId"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.reference} ({product.priceHT.toFixed(2)} € HT)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantité */}
              <div>
                <label htmlFor="selectedQuantity" className="block text-sm font-medium text-gray-700">Quantité</label>
                <input
                  type="number"
                  id="selectedQuantity"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Options */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700">Obligatoire</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCustomizable"
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isCustomizable" className="ml-2 block text-sm text-gray-700">Personnalisable</label>
                </div>
              </div>

              {/* Limites de quantité si personnalisable */}
              {isCustomizable && (
                <div className="flex space-x-4">
                  <div>
                    <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">Quantité min</label>
                    <input
                      type="number"
                      id="minQuantity"
                      min="0"
                      value={minQuantity || 0}
                      onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Option obligatoire */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="newOptionRequired"
                  checked={newOptionRequired}
                  onChange={(e) => setNewOptionRequired(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="newOptionRequired" className="ml-2 block text-sm text-gray-700">Option obligatoire</label>
              </div>

              {/* Choix disponibles */}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-medium text-gray-700">Choix disponibles:</h5>
                  <button
                    type="button"
                    onClick={handleAddChoice}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter un choix
                  </button>
                </div>

                {newOptionChoices.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {newOptionChoices.map((choice, index) => (
                      <div key={index} className="bg-white p-3 rounded-md border border-gray-200 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Nom du choix</label>
                            <input
                              type="text"
                              value={choice.name}
                              onChange={(e) => handleUpdateChoice(index, 'name', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Ajustement de prix (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={choice.priceAdjustment}
                              onChange={(e) => handleUpdateChoice(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                            />
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-700">Description (facultative)</label>
                          <input
                            type="text"
                            value={choice.description}
                            onChange={(e) => handleUpdateChoice(index, 'description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-md mt-2">
                    <p className="text-xs text-gray-500">Aucun choix ajouté</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!newOptionName.trim() || newOptionChoices.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter l'option
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || formData.items.length === 0}
          className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </>
          ) : initialData ? 'Mettre à jour le package' : 'Créer le package'}
        </button>
      </div>
    </form>
  );
};

export default PackageForm;-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700">Quantité max</label>
                    <input
                      type="number"
                      id="maxQuantity"
                      min="0"
                      value={maxQuantity || 0}
                      onChange={(e) => setMaxQuantity(parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Option obligatoire */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="newOptionRequired"
                  checked={newOptionRequired}
                  onChange={(e) => setNewOptionRequired(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="newOptionRequired" className="ml-2 block text-sm text-gray-700">Option obligatoire</label>
              </div>

              {/* Choix disponibles */}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-medium text-gray-700">Choix disponibles:</h5>
                  <button
                    type="button"
                    onClick={handleAddChoice}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter un choix
                  </button>
                </div>

                {newOptionChoices.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {newOptionChoices.map((choice, index) => (
                      <div key={index} className="bg-white p-3 rounded-md border border-gray-200 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Nom du choix</label>
                            <input
                              type="text"
                              value={choice.name}
                              onChange={(e) => handleUpdateChoice(index, 'name', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Ajustement de prix (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={choice.priceAdjustment}
                              onChange={(e) => handleUpdateChoice(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                            />
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-700">Description (facultative)</label>
                          <input
                            type="text"
                            value={choice.description}
                            onChange={(e) => handleUpdateChoice(index, 'description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-md mt-2">
                    <p className="text-xs text-gray-500">Aucun choix ajouté</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!newOptionName.trim() || newOptionChoices.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter l'option
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || formData.items.length === 0}
          className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </>
          ) : initialData ? 'Mettre à jour le package' : 'Créer le package'}
        </button>
      </div>
    </form>
  );
};

export default PackageForm;-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter au package
              </button>
            </div>
          </div>
        </div>

        {/* Options de personnalisation */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Options de personnalisation</h3>
          
          {/* Liste des options existantes */}
          {formData.options && formData.options.length > 0 ? (
            <div className="space-y-4">
              {formData.options.map((option, index) => (
                <div key={option.id} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.name}</h4>
                      {option.description && <p className="text-sm text-gray-500">{option.description}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {option.isRequired ? 'Option obligatoire' : 'Option facultative'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Choix disponibles */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Choix disponibles:</h5>
                    <ul className="space-y-2">
                      {option.choices.map((choice, choiceIndex) => (
                        <li key={choice.id} className="text-sm bg-gray-50 p-2 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{choice.name}</span>
                            <span className={`${choice.priceAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {choice.priceAdjustment >= 0 ? '+' : ''}{choice.priceAdjustment.toFixed(2)} €
                            </span>
                          </div>
                          {choice.description && <p className="text-gray-500">{choice.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">Aucune option de personnalisation ajoutée</p>
            </div>
          )}

          {/* Formulaire d'ajout d'option */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h4 className="font-medium text-gray-700">Ajouter une option de personnalisation</h4>
            
            <div className="space-y-4">
              {/* Nom et description de l'option */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newOptionName" className="block text-sm font-medium text-gray-700">Nom de l'option</label>
                  <input
                    type="text"
                    id="newOptionName"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Option obligatoire */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="newOptionRequired"
                  checked={newOptionRequired}
                  onChange={(e) => setNewOptionRequired(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="newOptionRequired" className="ml-2 block text-sm text-gray-700">Option obligatoire</label>
              </div>

              {/* Choix disponibles */}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-medium text-gray-700">Choix disponibles:</h5>
                  <button
                    type="button"
                    onClick={handleAddChoice}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter un choix
                  </button>
                </div>

                {newOptionChoices.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {newOptionChoices.map((choice, index) => (
                      <div key={index} className="bg-white p-3 rounded-md border border-gray-200 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Nom du choix</label>
                            <input
                              type="text"
                              value={choice.name}
                              onChange={(e) => handleUpdateChoice(index, 'name', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Ajustement de prix (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={choice.priceAdjustment}
                              onChange={(e) => handleUpdateChoice(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                            />
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-700">Description (facultative)</label>
                          <input
                            type="text"
                            value={choice.description}
                            onChange={(e) => handleUpdateChoice(index, 'description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-md mt-2">
                    <p className="text-xs text-gray-500">Aucun choix ajouté</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!newOptionName.trim() || newOptionChoices.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter l'option
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || formData.items.length === 0}
          className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </>
          ) : initialData ? 'Mettre à jour le package' : 'Créer le package'}
        </button>
      </div>
    </form>
  );
};

export default PackageForm;-sm"
                  />
                </div>
                <div>
                  <label htmlFor="newOptionDescription" className="block text-sm font-medium text-gray-700">Description (facultative)</label>
                  <input
                    type="text"
                    id="newOptionDescription"
                    value={newOptionDescription}
                    onChange={(e) => setNewOptionDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow