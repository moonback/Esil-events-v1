import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/Product';
import { ProductPaletteItem } from './ProductPaletteItem';
import { CanvasItem } from './CanvasItem';
import { useCart } from '../../context/CartContext';
import { getAllProducts } from '../../services/productService';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 12;

export const VisualConfigurator: React.FC = () => {
  const [productsOnCanvas, setProductsOnCanvas] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productFilters, setProductFilters] = useState({
    category: '',
    searchTerm: '',
    currentPage: 1
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Récupérer toutes les catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = new Set(availableProducts.map(p => p.category));
    return Array.from(uniqueCategories).sort();
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
    setProductsOnCanvas(prev => [...prev, product]);
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
        quantity: 1
      });
    });

    navigate('/cart');
  };

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    return availableProducts.filter(product => {
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
    return productsOnCanvas.reduce((sum, product) => sum + product.priceTTC, 0);
  }, [productsOnCanvas]);

  const handleDragStart = (e: React.DragEvent, product: Product) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Créez votre Ambiance</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Palette */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Palette de Produits</h2>
          
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full px-4 py-2 border rounded-lg"
              value={productFilters.searchTerm}
              onChange={(e) => handleApplyFilters({ ...productFilters, searchTerm: e.target.value })}
            />
            
            {/* Catégories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleApplyFilters({ ...productFilters, category: '' })}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !productFilters.category 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tout
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleApplyFilters({ ...productFilters, category })}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    productFilters.category === category 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {isLoadingProducts ? (
              <div className="col-span-full text-center py-8">Chargement...</div>
            ) : paginatedProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Aucun produit trouvé
              </div>
            ) : (
              paginatedProducts.map(product => (
                <div
                  key={product.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, product)}
                  className="cursor-move"
                >
                  <ProductPaletteItem
                    product={product}
                    onSelect={handleAddProductToCanvas}
                  />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handleApplyFilters({ ...productFilters, currentPage: productFilters.currentPage - 1 })}
                disabled={productFilters.currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {productFilters.currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => handleApplyFilters({ ...productFilters, currentPage: productFilters.currentPage + 1 })}
                disabled={productFilters.currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Canvas & Summary */}
        <div className="space-y-6">
          {/* Canvas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Votre Ambiance</h2>
              <button
                onClick={handleClearCanvas}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Effacer tout
              </button>
            </div>
            
            <div 
              className={`min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-colors ${
                isDraggingOver 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {productsOnCanvas.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {isDraggingOver ? (
                    <span className="text-primary-600 font-medium">Déposez le produit ici</span>
                  ) : (
                    <span>Glissez-déposez des produits ici pour créer votre ambiance</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {productsOnCanvas.map(product => (
                    <CanvasItem
                      key={`${product.id}-${Math.random()}`}
                      product={product}
                      onRemove={handleRemoveProductFromCanvas}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
            {productsOnCanvas.length === 0 ? (
              <p className="text-gray-500">Aucun produit sélectionné</p>
            ) : (
              <>
                <ul className="space-y-2 mb-4">
                  {productsOnCanvas.map(product => (
                    <li key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="text-sm">{product.name}</span>
                      </div>
                      <span className="text-sm font-medium">{product.priceTTC}€</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-4 mt-4">
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 