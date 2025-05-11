import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, Check, X, ShoppingCart, Calendar, DollarSign, ArrowLeft, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { getPackageTemplateBySlug } from '../services/packageTemplateService';
import { getAllProducts } from '../services/productService';
import { getAllArtists } from '../services/artistService';
import { PackageTemplateWithItems } from '../types/PackageTemplate';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

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

type State = {
  template: PackageTemplateWithItems | null;
  customizedItems: CustomizedItem[];
  products: any[];
  artists: any[];
  loading: boolean;
  error: string | null;
  totalPrice: number;
};

type Action =
  | { type: 'SET_TEMPLATE'; payload: PackageTemplateWithItems }
  | { type: 'SET_CUSTOMIZED_ITEMS'; payload: CustomizedItem[] }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'TOGGLE_ITEM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOTAL_PRICE'; payload: number };

const initialState: State = {
  template: null,
  customizedItems: [],
  products: [],
  artists: [],
  loading: true,
  error: null,
  totalPrice: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload };
    case 'SET_CUSTOMIZED_ITEMS':
      return { ...state, customizedItems: action.payload };
    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        customizedItems: state.customizedItems.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'TOGGLE_ITEM':
      return {
        ...state,
        customizedItems: state.customizedItems.map(item =>
          item.id === action.payload
            ? { ...item, is_included: !item.is_included }
            : item
        ),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TOTAL_PRICE':
      return { ...state, totalPrice: action.payload };
    default:
      return state;
  }
}

const PackageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = useCallback(async () => {
    if (!slug) {
      navigate('/packages');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [templateData, productsData, artistsData] = await Promise.all([
        getPackageTemplateBySlug(slug),
        getAllProducts(),
        getAllArtists(),
      ]);
      
      if (!templateData) {
        dispatch({ type: 'SET_ERROR', payload: 'Package non trouvé' });
        return;
      }

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
      
      dispatch({ type: 'SET_TEMPLATE', payload: enrichedTemplate });
      
      // Initialiser les éléments personnalisés
      const initialCustomizedItems = enrichedTemplate.items.map(item => {
        const itemDetails = item.item_details;
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
          id: `${item.id}-${Date.now()}`,
          package_template_item_id: item.id,
          item_id: item.item_id,
          item_type: item.item_type,
          name: itemDetails ? itemDetails.name : `Élément #${item.item_id}`,
          quantity: item.default_quantity,
          price: itemPrice,
          discount_percentage: item.discount_percentage || 0,
          is_included: !item.is_optional
        };
      });
      
      dispatch({ type: 'SET_CUSTOMIZED_ITEMS', payload: initialCustomizedItems });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      console.error('Erreur lors du chargement du package:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement du package' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [slug, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculer le prix total à chaque changement des éléments personnalisés
  useEffect(() => {
    if (!state.template) return;
    
    let total = state.template.base_price || 0;
    
    state.customizedItems.forEach(item => {
      if (item.is_included) {
        const discountMultiplier = 1 - (item.discount_percentage / 100);
        total += item.price * item.quantity * discountMultiplier;
      }
    });
    
    dispatch({ type: 'SET_TOTAL_PRICE', payload: total });
  }, [state.template, state.customizedItems]);

  const handleQuantityChange = useCallback((id: string, newQuantity: number) => {
    const item = state.customizedItems.find(item => item.id === id);
    if (!item) return;

    const templateItem = state.template?.items.find(ti => ti.id === item.package_template_item_id);
    if (!templateItem) return;

    const minQuantity = templateItem.min_quantity || 1;
    const maxQuantity = templateItem.max_quantity || 100;

    if (newQuantity >= minQuantity && newQuantity <= maxQuantity) {
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  }, [state.customizedItems, state.template]);

  const handleToggleItem = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_ITEM', payload: id });
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!state.template) return;
    
    const customizedPackage = {
      id: `package-${state.template.id}-${Date.now()}`,
      name: `Package personnalisé: ${state.template.name}`,
      priceTTC: state.totalPrice,
      quantity: 1,
      type: 'package',
      package_template_id: state.template.id,
      customized_items: state.customizedItems.filter(item => item.is_included),
      image: state.template.image_url || '',
    };
    
    addToCart(customizedPackage);
    navigate('/cart');
  }, [state.template, state.totalPrice, state.customizedItems, addToCart, navigate]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );

  if (state.loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSkeleton />
        </div>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-4 text-red-600 dark:text-red-400">{state.error}</p>
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

  if (!state.template) {
    return null;
  }

  return (
    <Layout>
      <SEO
        title={`${state.template.name} | Personnalisation de Package | ESIL Events`}
        description={`Personnalisez le package ${state.template.name} selon vos besoins et obtenez une estimation de prix en temps réel.`}
        keywords={`personnalisation package, ${state.template.name}, événementiel, ${state.template.target_event_type || ''}`}
      />

      <div className="max-w-7xl pt-40 mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header avec navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/packages')}
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour aux packages
          </button>
        </motion.div>

        {/* En-tête du package */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="md:flex">
            {/* Image du package */}
            <div className="md:flex-shrink-0 md:w-1/3 relative group">
              {state.template.image_url ? (
                <img
                  className="h-64 w-full object-cover md:h-full transition-transform duration-500 group-hover:scale-105"
                  src={state.template.image_url}
                  alt={state.template.name}
                  loading="lazy"
                />
              ) : (
                <div className="h-64 w-full md:h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Package className="h-16 w-16 text-white opacity-75" />
                </div>
              )}
              {state.template.target_event_type && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 shadow-lg">
                    <Calendar className="-ml-0.5 mr-2 h-4 w-4" />
                    {state.template.target_event_type}
                  </span>
                </div>
              )}
            </div>

            {/* Informations du package */}
            <div className="p-8 md:w-2/3">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    {state.template.name}
                  </h1>

                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {state.template.description || 'Aucune description disponible.'}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      <DollarSign className="h-8 w-8 mr-2" />
                      {state.totalPrice.toFixed(2)} €
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="inline-flex items-center px-8 py-4 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
                    >
                      <ShoppingCart className="-ml-1 mr-2 h-5 w-5" />
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personnalisation des éléments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
              Personnalisez votre package
            </h2>

            <div className="space-y-6">
              <AnimatePresence>
                {state.customizedItems.map((item, index) => {
                  const templateItem = state.template?.items.find(ti => ti.id === item.package_template_item_id);
                  const isOptional = templateItem?.is_optional || false;
                  const isAdjustable = templateItem?.is_quantity_adjustable || false;
                  const minQuantity = templateItem?.min_quantity || 1;
                  const maxQuantity = templateItem?.max_quantity || 100;
                  
                  const discountMultiplier = 1 - (item.discount_percentage / 100);
                  const itemTotalPrice = item.price * item.quantity * discountMultiplier;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-xl p-6 transition-all duration-300 ${
                        !item.is_included ? 'bg-gray-50 dark:bg-gray-700/50 opacity-75' : 'bg-white dark:bg-gray-800 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {isOptional && (
                            <div className="pt-1">
                              <button
                                onClick={() => handleToggleItem(item.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                                  item.is_included
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {item.is_included ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                              </button>
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.item_type === 'product' ? 'Produit' : item.item_type === 'artist' ? 'Artiste' : 'Service'}
                              {item.discount_percentage > 0 && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  -{item.discount_percentage}%
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
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
                              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                            <span className="mx-4 w-8 text-center text-lg font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= maxQuantity}
                              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                          {(minQuantity > 1 || maxQuantity < 100) && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-3">
                              (Min: {minQuantity}, Max: {maxQuantity})
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Résumé et total */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Total estimé</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {state.customizedItems.filter(item => item.is_included).length} éléments inclus
                </p>
              </div>
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                {state.totalPrice.toFixed(2)} €
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                className="w-full inline-flex justify-center items-center px-8 py-4 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="-ml-1 mr-2 h-5 w-5" />
                Ajouter au panier
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PackageDetailPage;