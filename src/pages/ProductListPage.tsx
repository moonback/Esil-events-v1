import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ChevronDown, Scale } from 'lucide-react';
import { getAllProducts, getProductsByCategory, getProductsBySubCategory, getProductsBySubSubCategory } from '../services/productService';
import { Category, getAllCategories } from '../services/categoryService';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import ProductFilters from '../components/product-list/ProductFilters';
import { useProductFilters } from '../hooks/useProductFilters';
import { Product } from '../types/Product';
import SEO from '../components/SEO';
import ComparisonBar from '../components/product-list/ComparisonBar';
import { useComparison } from '../context/ComparisonContext';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/cart/types';
import Notification from '../components/common/Notification';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ProductListPage: React.FC = () => {
  const { category, subcategory, subsubcategory } = useParams<{ category: string; subcategory?: string; subsubcategory?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // isFilterOpen is now managed by useProductFilters
  const [error, setError] = useState<string | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<{name: string, description?: string, seo_title?: string, seo_description?: string, seo_keywords?: string}>({name: ''});
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });

  // Use the product filters hook with pagination (12 products per page)
  const {
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    selectedColors,
    setSelectedColors,
    selectedCategories,
    setSelectedCategories,
    availability,
    setAvailability,
    resetFilters,
    filteredProducts,
    isFilterOpen,
    toggleFilter,
    // Display mode properties
    displayMode,
    toggleDisplayMode,
    // Pagination properties
    currentItems,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage
  } = useProductFilters(products, category, 12);

  const { addToComparison, isInComparison, comparisonProducts } = useComparison();
  const { addToCart } = useCart();

  // Ajouter l'effet pour le défilement vers le haut
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentPage]); // Se déclenche à chaque changement de page

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        // Find current category/subcategory/subsubcategory info for display
        if (category) {
          const currentCategory = categoriesData.find(cat => cat.slug === category);
          if (currentCategory) {
            if (!subcategory) {
              setCategoryInfo({
                name: currentCategory.name,
                description: currentCategory.description,
                seo_title: currentCategory.seo_title,
                seo_description: currentCategory.seo_description,
                seo_keywords: currentCategory.seo_keywords
              });
            } else {
              const currentSubcategory = currentCategory.subcategories?.find(
                subcat => subcat.slug === subcategory
              );
              if (currentSubcategory) {
                if (!subsubcategory) {
                  setCategoryInfo({
                    name: currentSubcategory.name,
                    description: currentSubcategory.description,
                    seo_title: currentSubcategory.seo_title,
                    seo_description: currentSubcategory.seo_description,
                    seo_keywords: currentSubcategory.seo_keywords
                  });
                } else {
                  const currentSubSubcategory = currentSubcategory.subsubcategories?.find(
                    subsubcat => subsubcat.slug === subsubcategory
                  );
                  if (currentSubSubcategory) {
                    setCategoryInfo({
                      name: currentSubSubcategory.name,
                      description: currentSubSubcategory.description,
                      seo_title: currentSubSubcategory.seo_title,
                      seo_description: currentSubSubcategory.seo_description,
                      seo_keywords: currentSubSubcategory.seo_keywords
                    });
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [category, subcategory, subsubcategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let productsData;
        if (category) {
          if (subcategory && subsubcategory) {
            // Get products by subsubcategory
            productsData = await getProductsBySubSubCategory(category, subcategory, subsubcategory);
          } else if (subcategory) {
            // Get products by subcategory
            productsData = await getProductsBySubCategory(category, subcategory);
          } else {
            // Get products by main category
            productsData = await getProductsByCategory(category);
          }
        } else {
          // Get all products
          productsData = await getAllProducts();
        }
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Une erreur est survenue lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory, subsubcategory]);

  // Filtering and sorting logic is now handled by useProductFilters

  // Get breadcrumb navigation
  const getBreadcrumb = () => {
    const breadcrumb = [
      { name: 'Accueil', path: '/' },
    ];
    
    if (category) {
      const categoryObj = categories.find(cat => cat.slug === category);
      if (categoryObj) {
        breadcrumb.push({ name: categoryObj.name, path: `/products/${category}` });
        
        if (subcategory) {
          const subcategoryObj = categoryObj.subcategories?.find(subcat => subcat.slug === subcategory);
          if (subcategoryObj) {
            breadcrumb.push({ name: subcategoryObj.name, path: `/products/${category}/${subcategory}` });
            
            if (subsubcategory) {
              const subsubcategoryObj = subcategoryObj.subsubcategories?.find(
                subsubcat => subsubcat.slug === subsubcategory
              );
              if (subsubcategoryObj) {
                breadcrumb.push({
                  name: subsubcategoryObj.name,
                  path: `/products/${category}/${subcategory}/${subsubcategory}`
                });
              }
            }
          }
        }
      }
    } else {
      breadcrumb.push({ name: 'Tous les produits', path: '/products' });
    }
    
    return breadcrumb;
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      priceTTC: product.priceTTC,
      image: product.images && product.images.length > 0 
        ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
          ? product.images[product.mainImageIndex] 
          : product.images[0])
        : DEFAULT_PRODUCT_IMAGE,
      quantity: 1
    };
    addToCart(cartItem);
    showNotification(`${product.name} a été ajouté au panier`);
  };

  const handleAddToComparison = (product: Product) => {
    if (comparisonProducts.length >= 3) {
      showNotification('Vous ne pouvez comparer que 3 produits maximum', 'error');
      return;
    }
    if (isInComparison(product.id)) {
      showNotification(`${product.name} est déjà dans la comparaison`, 'info');
      return;
    }
    addToComparison(product);
    showNotification(`${product.name} a été ajouté à la comparaison`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Component */}
      <SEO 
        title={categoryInfo.seo_title || categoryInfo.name || 'Produits'}
        description={categoryInfo.seo_description || categoryInfo.description || 'Découvrez notre sélection de produits de qualité pour vos événements.'}
        keywords={categoryInfo.seo_keywords || ''}
      />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-12xl">
        {/* Breadcrumb */}
        <nav className="mb-8 mt-5 pt-20" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center text-sm">
            {getBreadcrumb().map((item, index, array) => (
              <li key={item.path} className="flex items-center">
                {index > 0 && (
                  <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {index === array.length - 1 ? (
                  <span className="font-semibold text-gray-900" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link 
                    to={item.path} 
                    className="text-violet-600 hover:text-violet-800 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-10 bg-gradient-to-r from-violet-50 to-white p-8 rounded-2xl shadow-sm border border-violet-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryInfo.name || 'Tous nos produits'}
          </h1>
          {categoryInfo.description && (
            <p className="text-gray-600 text-lg leading-relaxed max-w-8xl">{categoryInfo.description}</p>
          )}
        </div>

        {/* Filter Button (Mobile) */}
        <div className="lg:hidden mb-6">
          <button
            onClick={toggleFilter}
            className="flex items-center justify-center w-full py-3 px-6 border border-violet-200 rounded-xl shadow-sm bg-white text-sm font-medium text-violet-700 hover:bg-violet-50 transition-all duration-200"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtres
            <ChevronDown className={`h-5 w-5 ml-2 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters (Sidebar) */}
          <ProductFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            availability={availability}
            setAvailability={setAvailability}
            resetFilters={resetFilters}
            products={products}
            isFilterOpen={isFilterOpen}
            categories={categories}
            currentCategory={category}
            currentSubcategory={subcategory}
            currentSubsubcategory={subsubcategory}
          />

          {/* Product Grid */}
          <div className="lg:w-3/4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8 rounded-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            {/* Display Mode Toggle */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm text-gray-600">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <div className="inline-flex rounded-xl shadow-sm overflow-hidden" role="group">
                <button
                  type="button"
                  onClick={toggleDisplayMode}
                  className={`px-4 py-2.5 text-sm font-medium border ${displayMode === 'grid' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  aria-label="Affichage en grille"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={toggleDisplayMode}
                  className={`px-4 py-2.5 text-sm font-medium border ${displayMode === 'list' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  aria-label="Affichage en liste"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl shadow-lg text-center border border-gray-100">
                <div className="mb-8">
                  <svg 
                    className="mx-auto h-20 w-20 text-violet-200"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 21a9 9 0 110-18 9 9 0 010 18z" 
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun produit trouvé</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                  Nous n'avons trouvé aucun produit correspondant à vos critères. Essayez d'ajuster vos filtres ou revenez plus tard.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              displayMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                  {currentItems.map((product) => (
                    <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
                      <Link
                        to={`/product/${product.slug}`}
                        className="flex-grow"
                      >
                        <div className="relative">
                          {/* Badge for availability status */}
                          {product.isAvailable !== undefined && (
                            <span className={`absolute top-3 right-3 z-10 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                              product.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isAvailable ? 'Disponible' : 'Indisponible'}
                            </span>
                          )}
                          {/* Badge Nouveau */}
                          {product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime() < 15 * 24 * 60 * 60 * 1000) && (
                            <span className="absolute top-3 left-3 z-10 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm bg-yellow-100 text-yellow-800 animate-pulse">
                              Nouveau à la location
                            </span>
                          )}
                          
                          {/* Product image with hover effect */}
                          <div className="aspect-w-1 aspect-h-1 w-full h-64 overflow-hidden bg-gray-50 flex items-center justify-center p-6">
                            <img
                              src={product.images && product.images.length > 0 
                                ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
                                  ? product.images[product.mainImageIndex] 
                                  : product.images[0])
                                : DEFAULT_PRODUCT_IMAGE}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col bg-white rounded-b-2xl">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-700 transition-colors line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 font-medium">
                            Réf: {product.reference}
                          </p> 
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold text-violet-600">
                                  {product.priceTTC.toFixed(2)}€
                                </p>
                                <span className="text-sm text-gray-500 font-medium">
                                  TTC / jour
                                </span>
                                <span className="text-xs text-gray-400 block mt-1">
                                  HT : {(product.priceTTC / 1.2).toFixed(2)}€
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-violet-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Voir
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="p-4 border-t border-gray-100 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Ajouter au panier
                        </button>
                        <button
                          onClick={() => handleAddToComparison(product)}
                          disabled={isInComparison(product.id)}
                          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isInComparison(product.id)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                          }`}
                        >
                          <Scale className="h-4 w-4 mr-2" />
                          {isInComparison(product.id) ? 'Ajouté à la comparaison' : 'Comparer'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col space-y-6">
                  {currentItems.map((product) => (
                    <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-row transform hover:-translate-y-1">
                      <Link
                        to={`/product/${product.slug}`}
                        className="flex-grow"
                      >
                        <div className="relative w-1/4 min-w-[200px]">
                          {/* Badge for availability status */}
                          {product.isAvailable !== undefined && (
                            <span className={`absolute top-3 right-3 z-10 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                              product.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isAvailable ? 'Disponible' : 'Indisponible'}
                            </span>
                          )}
                          {/* Badge Nouveau */}
                          {product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000) && (
                            <span className="absolute top-3 left-3 z-10 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm bg-yellow-100 text-yellow-800 animate-pulse">
                              Nouveau
                            </span>
                          )}
                          
                          {/* Product image */}
                          <div className="h-full overflow-hidden bg-gray-50 flex items-center justify-center p-6">
                            <img
                              src={product.images && product.images.length > 0 
                                ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
                                  ? product.images[product.mainImageIndex] 
                                  : product.images[0])
                                : DEFAULT_PRODUCT_IMAGE}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        
                        <div className="p-8 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-violet-700 transition-colors mb-3">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3 font-medium">
                              Réf: {product.reference}
                            </p>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {product.description || 'Aucune description disponible'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <p className="text-2xl font-bold text-violet-600">
                                {product.priceTTC.toFixed(2)}€
                              </p>
                              <span className="text-sm text-gray-500 font-medium">
                                TTC / jour
                              </span>
                              <span className="text-xs text-gray-400 block mt-1">
                                HT : {(product.priceTTC / 1.2).toFixed(2)}€
                              </span>
                            </div>
                            
                            <span className="text-sm font-semibold text-violet-600 flex items-center px-4 py-2 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors duration-200">
                              Voir le produit
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="p-4 border-l border-gray-100 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Ajouter au panier
                        </button>
                        <button
                          onClick={() => handleAddToComparison(product)}
                          disabled={isInComparison(product.id)}
                          className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isInComparison(product.id)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                          }`}
                        >
                          <Scale className="h-4 w-4 mr-2" />
                          {isInComparison(product.id) ? 'Ajouté à la comparaison' : 'Comparer'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            
            {/* Pagination Controls */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                  {/* Previous Page Button */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2.5 rounded-xl ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors duration-200'}`}
                    aria-label="Page précédente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          currentPage === pageNum 
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' 
                            : 'text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                        }`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {/* Next Page Button */}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2.5 rounded-xl ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors duration-200'}`}
                    aria-label="Page suivante"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Bar */}
      <ComparisonBar />

      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default ProductListPage;
