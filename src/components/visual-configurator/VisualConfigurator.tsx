import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/Product';
import { ProductPaletteItem } from './ProductPaletteItem';
import { CanvasItem } from './CanvasItem';
import { useCart } from '../../context/CartContext';
import { getAllProducts } from '../../services/productService';
import { getProductSuggestions, performResearch, performReasoning } from '../../services/geminiService';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
  PlayIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductModal } from './ProductModal';

const ITEMS_PER_PAGE = 12;

interface CanvasProduct extends Product {
  quantity: number;
}

export const VisualConfigurator: React.FC = () => {
  const [productsOnCanvas, setProductsOnCanvas] = useState<CanvasProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productFilters, setProductFilters] = useState({
    category: '',
    searchTerm: '',
    currentPage: 1
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Product[]>([]);
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const { addToCart, items: cartItems } = useCart();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [researchMode, setResearchMode] = useState<'suggestions' | 'research' | 'reasoning'>('suggestions');
  const [researchResults, setResearchResults] = useState<{
    findings?: Product[];
    recommendations?: Product[];
    explanation: string;
  }>({ explanation: '' });
  const [maxSuggestions, setMaxSuggestions] = useState<number>(6);

  // Récupérer toutes les catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = new Set(availableProducts.map(p => p.category));
    return Array.from(uniqueCategories).filter((cat): cat is string => typeof cat === 'string').sort();
  }, [availableProducts]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getAllProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddProductToCanvas = (product: Product) => {
    setProductsOnCanvas(prev => {
      const existingProduct = prev.find(p => p.id === product.id);
      if (existingProduct) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setProductsOnCanvas(prev => 
      prev.map(p => p.id === productId ? { ...p, quantity: newQuantity } : p)
    );
  };

  const handleRemoveProductFromCanvas = (productId: string) => {
    setProductsOnCanvas(prev => prev.filter(p => p.id !== productId));
  };

  const handleApplyFilters = (filters: { category: string; searchTerm: string; currentPage?: number }) => {
    setProductFilters(prev => ({
      ...prev,
      ...filters,
      currentPage: filters.currentPage || 1
    }));
  };

  const handleClearCanvas = () => {
    setProductsOnCanvas([]);
  };

  const handleFinalizeSelection = () => {
    productsOnCanvas.forEach(product => {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.images[0],
        priceTTC: product.priceTTC,
        quantity: product.quantity
      });
    });

    navigate('/cart');
  };

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    return availableProducts.filter(product => {
      // Si nous avons des suggestions IA (recherche par IDs)
      if (productFilters.searchTerm.includes('|')) {
        const suggestedIds = productFilters.searchTerm.split('|');
        return suggestedIds.includes(product.id);
      }
      
      // Sinon, utiliser les filtres normaux
      const matchesCategory = !productFilters.category || product.category === productFilters.category;
      const matchesSearch = !productFilters.searchTerm || 
        product.name.toLowerCase().includes(productFilters.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [availableProducts, productFilters.category, productFilters.searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (productFilters.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, productFilters.currentPage]);

  // Fonction pour gérer le changement de page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleApplyFilters({ ...productFilters, currentPage: newPage });
    }
  };

  // Calculer le total des produits sur le canvas
  const totalCanvasPrice = useMemo(() => {
    return productsOnCanvas.reduce((sum, product) => sum + (product.priceTTC * product.quantity), 0);
  }, [productsOnCanvas]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, product: Product) => {
    e.dataTransfer.setData('product', JSON.stringify(product));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    try {
      const productData = e.dataTransfer.getData('product');
      if (productData) {
        const product = JSON.parse(productData) as Product;
        handleAddProductToCanvas(product);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;

    setIsAiSearching(true);
    setAiExplanation('');
    setAiSuggestions([]);
    setResearchResults({ explanation: '' });

    try {
      let result;
      switch (researchMode) {
        case 'research':
          result = await performResearch(aiQuery, availableProducts, maxSuggestions);
          setResearchResults({
            findings: result.findings,
            explanation: result.explanation
          });
          break;
        case 'reasoning':
          result = await performReasoning(aiQuery, availableProducts, cartItems, maxSuggestions);
          setResearchResults({
            recommendations: result.recommendations,
            explanation: result.explanation
          });
          break;
        default:
          const { suggestions, explanation } = await getProductSuggestions(aiQuery, availableProducts, maxSuggestions);
          setAiSuggestions(suggestions);
          setAiExplanation(explanation);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setAiExplanation('Désolé, une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleShowProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const demoExamples = [
    {
      title: "Équipement Son & Lumière",
      description: "Je recherche du matériel de sonorisation et d'éclairage pour une soirée événementielle. J'ai besoin d'un système de son complet avec microphones, enceintes et table de mixage, ainsi que des projecteurs et effets lumineux pour créer une ambiance dynamique.",
      query: "Je recherche du matériel de sonorisation et d'éclairage pour une soirée événementielle. J'ai besoin d'un système de son complet avec microphones, enceintes et table de mixage, ainsi que des projecteurs et effets lumineux pour créer une ambiance dynamique."
    },
    {
      title: "Jeux & Animation",
      description: "J'organise une animation pour un événement et je cherche des jeux et équipements d'animation. Je recherche des jeux gonflables, des structures de jeux, et du matériel d'animation pour divertir les participants de tous âges.",
      query: "J'organise une animation pour un événement et je cherche des jeux et équipements d'animation. Je recherche des jeux gonflables, des structures de jeux, et du matériel d'animation pour divertir les participants de tous âges."
    }
  ];

  const handleDemoClick = (example: typeof demoExamples[0]) => {
    setAiQuery(example.query);
    setShowDemoOptions(false);
    // Déclencher la recherche après un court délai pour montrer l'animation
    setTimeout(() => {
      handleAiSearch();
    }, 500);
  };

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Créez votre Devis rapide</h1>
          <p className="text-gray-600">Sélectionnez vos produits et créez votre devis personnalisé en quelques clics</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleClearCanvas}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            <TrashIcon className="w-5 h-5" />
            <span>Effacer tout</span>
          </button>
          <button
            onClick={handleFinalizeSelection}
            disabled={productsOnCanvas.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-violet-500 rounded-lg hover:bg-violet-50 rounded-lg transition-colors border border-violet-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span>Finaliser le devis</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Palette */}
        <div className="space-y-6">
          {/* AI Assistant Toggle Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors border border-violet-200"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>{showAiAssistant ? 'Masquer l\'Assistant IA' : 'Afficher l\'Assistant IA'}</span>
            </button>
          </div>

          {/* AI Search Bar */}
          <AnimatePresence>
            {showAiAssistant && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-violet-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-violet-100 rounded-full opacity-30 z-0"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-violet-100 rounded-full opacity-30 z-0"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <SparklesIcon className="w-6 h-6 text-violet-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Assistant IA - Configurateur Intelligent</h3>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-2 py-1 bg-violet-100 text-violet-800 text-xs font-medium rounded-full animate-pulse">Recommandé</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <label htmlFor="researchMode" className="text-sm text-gray-600">Mode:</label>
                            <select
                              id="researchMode"
                              value={researchMode}
                              onChange={(e) => setResearchMode(e.target.value as 'suggestions' | 'research' | 'reasoning')}
                              className="px-3 py-1.5 bg-white border border-violet-200 rounded-md text-sm text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                              <option value="suggestions">Suggestions rapides</option>
                              <option value="research">Recherche approfondie</option>
                              <option value="reasoning">Analyse raisonnée</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label htmlFor="maxSuggestions" className="text-sm text-gray-600">Nombre de suggestions:</label>
                            <select
                              id="maxSuggestions"
                              value={maxSuggestions}
                              onChange={(e) => setMaxSuggestions(Number(e.target.value))}
                              className="px-3 py-1.5 bg-white border border-violet-200 rounded-md text-sm text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                              <option value="3">3</option>
                              <option value="6">6</option>
                              <option value="9">9</option>
                              <option value="12">12</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Décrivez votre événement en détail (type, nombre de personnes, ambiance souhaitée, etc.) pour obtenir des suggestions personnalisées.</p>
                    <textarea
                      placeholder="Ex: Je prépare une soirée d'entreprise pour 50 personnes avec une ambiance lounge et j'ai besoin d'un système de son, d'éclairage et de mobilier adapté..."
                      className="w-full px-4 py-3 pl-12 pr-32 border-2 border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none min-h-[100px] max-h-[150px] bg-white shadow-inner"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!isAiSearching) {
                            handleAiSearch();
                          }
                        }
                      }}
                      rows={4}
                    />
                    <SparklesIcon className="absolute left-4 top-[132px] w-5 h-5 text-violet-500" />
                    <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowDemoOptions(!showDemoOptions)}
                          className="px-3 py-1.5 bg-violet-100 text-violet-600 rounded-md hover:bg-violet-200 transition-all flex items-center space-x-1"
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span className="text-sm">Exemples</span>
                        </button>

                        {/* Demo Options Dropdown */}
                        <AnimatePresence>
                          {showDemoOptions && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                            >
                              <motion.div 
                                className="w-96 bg-white rounded-lg shadow-xl border border-violet-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-5">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                      <SparklesIcon className="w-5 h-5 text-violet-500" />
                                      <h3 className="font-semibold text-gray-900">Exemples de recherche IA</h3>
                                    </div>
                                    <button 
                                      onClick={() => setShowDemoOptions(false)}
                                      className="text-gray-400 hover:text-gray-500"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-4">Cliquez sur un exemple pour voir comment l'IA peut vous aider à trouver les produits adaptés à votre événement.</p>
                                  <div className="space-y-3">
                                    {demoExamples.map((example, index) => (
                                      <button
                                        key={index}
                                        onClick={() => handleDemoClick(example)}
                                        className="w-full text-left p-4 rounded-lg hover:bg-violet-50 transition-colors border border-violet-100 hover:border-violet-300 hover:shadow-md"
                                      >
                                        <h4 className="font-medium text-violet-700 mb-2">{example.title}</h4>
                                        <p className="text-sm text-gray-600">{example.description}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        onClick={handleAiSearch}
                        disabled={isAiSearching || !aiQuery.trim()}
                        className="px-4 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                      >
                        {isAiSearching ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Obtenir des suggestions</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {researchResults.explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-primary-800">
                            {researchMode === 'research' ? 'Résultats de la recherche' :
                             researchMode === 'reasoning' ? 'Analyse et recommandations' :
                             'Suggestions personnalisées'}
                          </h3>
                          <button
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                          >
                            <span>{showSuggestions ? 'Masquer' : 'Afficher'}</span>
                            <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        <AnimatePresence>
                          {showSuggestions && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 bg-violet-50 rounded-lg border border-violet-100 shadow-inner">
                                <div className="text-sm text-violet-700 whitespace-pre-line space-y-2">
                                  {researchResults.explanation}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Suggestions Grid */}
                  <AnimatePresence>
                    {(aiSuggestions.length > 0 || researchResults.findings?.length || researchResults.recommendations?.length) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {researchMode === 'research' ? 'Produits trouvés' :
                           researchMode === 'reasoning' ? 'Produits recommandés' :
                           'Produits suggérés'}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {(researchMode === 'suggestions' ? aiSuggestions :
                            researchMode === 'research' ? researchResults.findings :
                            researchResults.recommendations)?.map(product => (
                            <motion.div
                              key={product.id}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ scale: 1.05 }}
                              className="cursor-move relative"
                              draggable
                              onDragStart={(e) => {
                                const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
                                handleDragStart(dragEvent, product);
                              }}
                            >
                              <div className="absolute -top-2 -right-2 z-10">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 border border-violet-200 shadow-sm">
                                  <SparklesIcon className="w-3 h-3 mr-1" />
                                  {researchMode === 'research' ? 'Trouvé' :
                                   researchMode === 'reasoning' ? 'Recommandé' :
                                   'Suggéré'}
                                </span>
                              </div>
                              <ProductPaletteItem
                                product={product}
                                onSelect={handleAddProductToCanvas}
                                onShowDetails={handleShowProductDetails}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Regular Search & Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  value={productFilters.searchTerm}
                  onChange={(e) => handleApplyFilters({ ...productFilters, searchTerm: e.target.value })}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {/* Catégories */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleApplyFilters({ ...productFilters, category: '' })}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    !productFilters.category 
                      ? 'bg-primary-600 text-violet-500 shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 '
                  }`}
                >
                  Tout
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleApplyFilters({ ...productFilters, category })}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      productFilters.category === category 
                        ? 'bg-primary-600 text-violet-500 shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="mt-6">
              {isLoadingProducts ? (
                <div className="flex justify-center items-center py-8">
                  <ArrowPathIcon className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun produit trouvé
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {paginatedProducts.map(product => (
                      <motion.div
                        key={product.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div
                          className="cursor-move"
                          draggable
                          onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, product)}
                        >
                          <ProductPaletteItem
                            product={product}
                            onSelect={handleAddProductToCanvas}
                            onShowDetails={handleShowProductDetails}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-600">
                        Affichage de <span className="font-semibold text-gray-900">{(productFilters.currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à{' '}
                        <span className="font-semibold text-gray-900">
                          {Math.min(productFilters.currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                        </span>{' '}
                        sur <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produits
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        

                        {/* Bouton Page Précédente */}
                        <button
                          onClick={() => handlePageChange(productFilters.currentPage - 1)}
                          disabled={productFilters.currentPage === 1}
                          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          aria-label="Page précédente"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        {/* Numéros de Page */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (productFilters.currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (productFilters.currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = productFilters.currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  productFilters.currentPage === pageNum
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        {/* Bouton Page Suivante */}
                        <button
                          onClick={() => handlePageChange(productFilters.currentPage + 1)}
                          disabled={productFilters.currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          aria-label="Page suivante"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>

                        
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Canvas & Summary */}
        <div className="space-y-6">
          {/* Canvas */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                  Votre Devis
                </h2>
                <div className="px-3 py-1 bg-violet-100 rounded-full">
                  <span className="text-sm font-medium text-violet-700">
                    {productsOnCanvas.length} produit{productsOnCanvas.length !== 1 ? 's' : ''} sélectionné{productsOnCanvas.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div 
              className={`min-h-[400px] border-3 border-dashed rounded-xl p-6 transition-all duration-300 ${
                isDraggingOver 
                  ? 'border-violet-400 bg-violet-50 scale-102 shadow-lg' 
                  : 'border-gray-200 hover:border-violet-200'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <AnimatePresence>
                {productsOnCanvas.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4"
                  >
                    {isDraggingOver ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                          <PlusIcon className="w-8 h-8 text-violet-500" />
                        </div>
                        <span className="text-lg font-medium text-violet-600">Déposez le produit ici</span>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <ArrowPathIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="text-lg">Glissez-déposez des produits ici pour créer votre devis</span>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    layout
                  >
                    {productsOnCanvas.map(product => (
                      <motion.div
                        key={`${product.id}-${Math.random()}`}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative group"
                      >
                        <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRemoveProductFromCanvas(product.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full text-red-600 shadow-sm transition-all duration-200"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group-hover:shadow-md transition-all duration-200">
                          <CanvasItem
                            product={product}
                            onRemove={handleRemoveProductFromCanvas}
                          />
                          <div className="p-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                                  disabled={product.quantity <= 1}
                                >
                                  <MinusIcon className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="text-lg font-medium w-8 text-center">
                                  {product.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                  <PlusIcon className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <span className="text-sm font-medium text-violet-600">
                                {(product.priceTTC * product.quantity).toFixed(2)}€ TTC
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
            <AnimatePresence>
              {productsOnCanvas.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-500"
                >
                  Aucun produit sélectionné
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ul className="space-y-2 mb-4">
                    {productsOnCanvas.map((product, index) => (
                      <motion.li
                        key={`${product.id}-${index}`}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-2">
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <span className="text-sm">{product.name}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <button
                                onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                disabled={product.quantity <= 1}
                              >
                                <MinusIcon className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="text-xs text-gray-600">x{product.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                              >
                                <PlusIcon className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{(product.priceTTC * product.quantity).toFixed(2)}€</span>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.div
                    layout
                    className="border-t pt-4 mt-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Total</span>
                      <span className="text-lg font-bold">{totalCanvasPrice.toFixed(2)}€</span>
                    </div>
                    <button
                      onClick={handleFinalizeSelection}
                      className="w-full bg-violet-500 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      <span>Ajouter la sélection au devis</span>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCanvas={handleAddProductToCanvas}
      />
    </div>
  );
};