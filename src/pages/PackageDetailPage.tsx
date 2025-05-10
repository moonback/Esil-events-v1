import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, Check, X, ShoppingCart, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { getPackageTemplateBySlug } from '../services/packageTemplateService';
import { getAllProducts } from '../services/productService';
import { getAllArtists } from '../services/artistService';
import { PackageTemplateWithItems } from '../types/PackageTemplate';
import { useCart } from '../context/CartContext';

interface CustomizedItem {
  id: string;
  package_template_item_id: string;
  item_id: string;
  item_type: string;
  name: string;
  quantity: number;
  price: number;
  discount_percentage: number;
  is_included: boolean;
}

const PackageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [template, setTemplate] = useState<PackageTemplateWithItems | null>(null);
  const [customizedItems, setCustomizedItems] = useState<CustomizedItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        navigate('/packages');
        return;
      }

      try {
        setLoading(true);
        
        // Charger le modèle de package avec ses éléments
        const templateData = await getPackageTemplateBySlug(slug);
        
        if (!templateData) {
          setError('Package non trouvé');
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
        
        // Initialiser les éléments personnalisés
        const initialCustomizedItems = enrichedTemplate.items.map(item => {
          const itemDetails = item.item_details;
          // Déterminer le prix en fonction du type d'élément
          let itemPrice = 0;
          if (itemDetails) {
            if (item.item_type === 'product' && 'priceTTC' in itemDetails) {
              itemPrice = itemDetails.priceTTC;
            } else if (item.item_type === 'artist' && 'price' in itemDetails) {
              itemPrice = Number(itemDetails.price) || 0;
            } else if ('price' in itemDetails) {
              itemPrice = Number(itemDetails.price) || 0;
            }
          }
          
          return {
            id: `${item.id}-${Date.now()}`, // ID unique pour cet élément personnalisé
            package_template_item_id: item.id,
            item_id: item.item_id,
            item_type: item.item_type,
            name: itemDetails ? itemDetails.name : `Élément #${item.item_id}`,
            quantity: item.default_quantity,
            price: itemPrice,
            discount_percentage: item.discount_percentage || 0,
            is_included: !item.is_optional // Par défaut, inclure les éléments non optionnels
          };
        });
        
        setCustomizedItems(initialCustomizedItems);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du package:', err);
        setError('Erreur lors du chargement du package');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate]);

  // Calculer le prix total à chaque changement des éléments personnalisés
  useEffect(() => {
    if (!template) return;
    
    let total = template.base_price || 0;
    
    customizedItems.forEach(item => {
      if (item.is_included) {
        const discountMultiplier = 1 - (item.discount_percentage / 100);
        total += item.price * item.quantity * discountMultiplier;
      }
    });
    
    setTotalPrice(total);
  }, [template, customizedItems]);

  // Gérer le changement de quantité d'un élément
  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCustomizedItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  // Gérer l'inclusion/exclusion d'un élément optionnel
  const handleToggleItem = (id: string) => {
    setCustomizedItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, is_included: !item.is_included }
          : item
      )
    );
  };

  // Ajouter le package personnalisé au panier
  const handleAddToCart = () => {
    if (!template) return;
    
    // Créer un objet représentant le package personnalisé
    const customizedPackage = {
      id: `package-${template.id}-${Date.now()}`,
      name: `Package personnalisé: ${template.name}`,
      priceTTC: totalPrice, // Utiliser priceTTC au lieu de price pour correspondre à l'interface CartItem
      quantity: 1,
      type: 'package',
      package_template_id: template.id,
      customized_items: customizedItems.filter(item => item.is_included),
      image: template.image_url || '',
    };
    
    // Ajouter au panier
    addToCart(customizedPackage);
    
    // Rediriger vers le panier
    navigate('/cart');
  };

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement du package...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => navigate('/packages')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Retour aux packages
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <Layout>
      <SEO
        title={`${template.name} | Personnalisation de Package | ESIL Events`}
        description={`Personnalisez le package ${template.name} selon vos besoins et obtenez une estimation de prix en temps réel.`}
        keywords={`personnalisation package, ${template.name}, événementiel, ${template.target_event_type || ''}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header avec navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/packages')}
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour aux packages
          </button>
        </div>

        {/* En-tête du package */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* Image du package */}
            <div className="md:flex-shrink-0 md:w-1/3">
              {template.image_url ? (
                <img
                  className="h-64 w-full object-cover md:h-full"
                  src={template.image_url}
                  alt={template.name}
                />
              ) : (
                <div className="h-64 w-full md:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Informations du package */}
            <div className="p-8 md:w-2/3">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{template.name}</h1>
                    {template.target_event_type && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Calendar className="-ml-0.5 mr-2 h-4 w-4" />
                        {template.target_event_type}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {template.description || 'Aucune description disponible.'}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      <DollarSign className="h-6 w-6 mr-1" />
                      {totalPrice.toFixed(2)} €
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <ShoppingCart className="-ml-1 mr-2 h-5 w-5" />
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personnalisation des éléments */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personnalisez votre package</h2>

            <div className="space-y-6">
              {customizedItems.map((item, index) => {
                // Trouver l'élément du template correspondant
                const templateItem = template.items.find(ti => ti.id === item.package_template_item_id);
                const isOptional = templateItem?.is_optional || false;
                const isAdjustable = templateItem?.is_quantity_adjustable || false;
                const minQuantity = templateItem?.min_quantity || 1;
                const maxQuantity = templateItem?.max_quantity || 100;
                
                // Calculer le prix avec remise
                const discountMultiplier = 1 - (item.discount_percentage / 100);
                const itemTotalPrice = item.price * item.quantity * discountMultiplier;
                
                return (
                  <div 
                    key={item.id}
                    className={`border rounded-lg p-4 ${!item.is_included ? 'bg-gray-50 dark:bg-gray-700/50 opacity-75' : 'bg-white dark:bg-gray-800'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {isOptional && (
                          <div className="pt-1">
                            <button
                              onClick={() => handleToggleItem(item.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${item.is_included ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}
                            >
                              {item.is_included ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </button>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.item_type === 'product' ? 'Produit' : item.item_type === 'artist' ? 'Artiste' : 'Service'}
                            {item.discount_percentage > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                -{item.discount_percentage}%
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {itemTotalPrice.toFixed(2)} €
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.price.toFixed(2)} € {item.quantity > 1 && `x ${item.quantity}`}
                        </div>
                      </div>
                    </div>

                    {/* Contrôles de quantité */}
                    {item.is_included && isAdjustable && (
                      <div className="mt-4 flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">Quantité:</span>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= minQuantity}
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-3 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxQuantity}
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        {(minQuantity > 1 || maxQuantity < 100) && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-3">
                            (Min: {minQuantity}, Max: {maxQuantity})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Résumé et total */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total estimé</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {customizedItems.filter(item => item.is_included).length} éléments inclus
                </p>
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {totalPrice.toFixed(2)} €
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleAddToCart}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ShoppingCart className="-ml-1 mr-2 h-5 w-5" />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PackageDetailPage;