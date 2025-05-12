import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/Product';
import { ProductPaletteItem } from './ProductPaletteItem';
import { CanvasItem } from './CanvasItem';
import { useCart } from '../../context/CartContext';
import { getAllProducts } from '../../services/productService';
import { getProductSuggestions } from '../../services/geminiService';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowPathIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { addToCart } = useCart();
  const navigate = useNavigate();

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

    try {
      const { suggestions, explanation } = await getProductSuggestions(aiQuery, availableProducts);
      setAiSuggestions(suggestions);
      setAiExplanation(explanation);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setAiExplanation('Désolé, une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Créez votre Devis rapide</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleClearCanvas}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            <span>Effacer tout</span>
          </button>
          <button
            onClick={handleFinalizeSelection}
            disabled={productsOnCanvas.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span>Finaliser le devis</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Palette */}
        <div className="space-y-6">
          {/* AI Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Décrivez votre événement ou vos besoins..."
                className="w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiSearch()}
              />
              <SparklesIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
              <button
                onClick={handleAiSearch}
                disabled={isAiSearching || !aiQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAiSearching ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  'Rechercher'
                )}
              </button>
            </div>
            
            <AnimatePresence>
              {aiExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-4 bg-primary-50 rounded-lg"
                >
                  <h3 className="text-sm font-semibold text-primary-800 mb-2">Suggestions IA :</h3>
                  <div className="text-sm text-primary-700 whitespace-pre-line">
                    {aiExplanation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Suggestions Grid */}
            <AnimatePresence>
              {aiSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits suggérés</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {aiSuggestions.map(product => (
                      <motion.div
                        key={product.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="cursor-move"
                        draggable
                        onDragStart={(e) => {
                          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
                          handleDragStart(dragEvent, product);
                        }}
                      >
                        <ProductPaletteItem
                          product={product}
                          onSelect={handleAddProductToCanvas}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                        ? 'bg-primary-600 text-white shadow-md' 
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
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
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => handleApplyFilters({ ...productFilters, currentPage: productFilters.currentPage - 1 })}
                  disabled={productFilters.currentPage === 1}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {productFilters.currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => handleApplyFilters({ ...productFilters, currentPage: productFilters.currentPage + 1 })}
                  disabled={productFilters.currentPage === totalPages}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Canvas & Summary */}
        <div className="space-y-6">
          {/* Canvas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Votre Devis</h2>
              <div className="text-sm text-gray-500">
                {productsOnCanvas.length} produit{productsOnCanvas.length !== 1 ? 's' : ''} sélectionné{productsOnCanvas.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div 
              className={`min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-all ${
                isDraggingOver 
                  ? 'border-primary-500 bg-primary-50 scale-105' 
                  : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <AnimatePresence>
                {productsOnCanvas.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center text-gray-500"
                  >
                    {isDraggingOver ? (
                      <span className="text-primary-600 font-medium">Déposez le produit ici</span>
                    ) : (
                      <span>Glissez-déposez des produits ici pour créer votre devis</span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex flex-wrap gap-4"
                    layout
                  >
                    {productsOnCanvas.map(product => (
                      <motion.div
                        key={`${product.id}-${Math.random()}`}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative"
                      >
                        <CanvasItem
                          product={product}
                          onRemove={handleRemoveProductFromCanvas}
                        />
                        <div className="absolute bottom-2 right-2 bg-white rounded-lg shadow-md p-1 flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            disabled={product.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4 text-gray-600" />
                          </button>
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
                      className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Ajouter la sélection au devis
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}; 