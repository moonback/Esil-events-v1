import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import { getAllProducts, getProductsByCategory, getProductsBySubCategory } from '../services/productService';
import { Category, getAllCategories } from '../services/categoryService';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';

interface Product {
  mainImageIndex?: number;
  id: string;
  name: string;
  reference: string;
  category: string;
  subCategory?: string;
  subSubCategory?: string;
  priceHT: number;
  priceTTC: number;
  images: string[];
  colors?: string[];
  isAvailable?: boolean;
}

const ProductListPage: React.FC = () => {
  const { category, subcategory, subsubcategory } = useParams<{ category: string; subcategory?: string; subsubcategory?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let productsData;
        if (category) {
          if (subcategory) {
            productsData = await getProductsBySubCategory(category, subcategory);
            // Si on a une sous-sous-catégorie, filtrer les produits qui correspondent
            if (subsubcategory && productsData.length > 0) {
              productsData = productsData.filter(product => product.subSubCategory === subsubcategory);
            }
          } else {
            productsData = await getProductsByCategory(category);
          }
        } else {
          productsData = await getAllProducts(); // Add this case to fetch all products
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

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setAvailability('all');
    setSortBy('name-asc');
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    setPriceRange(newRange);
  };

  const getCategoryTitle = () => {
    if (!category) return '';
    
    switch (category) {
      case 'mobilier':
        return 'Mobilier & Déco';
      case 'jeux':
        return 'Jeux';
      case 'signaletique':
        return 'Signalétique';
      case 'technique':
        return 'Technique';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const sortProducts = (products: Product[]) => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return sorted.sort((a, b) => a.priceHT - b.priceHT);
      case 'price-desc':
        return sorted.sort((a, b) => b.priceHT - a.priceHT);
      default:
        return sorted;
    }
  };

  const filterProducts = (products: Product[]) => {
    return products.filter(product => {
      // Vérification du prix
      const priceMatch = product.priceHT >= priceRange[0] && product.priceHT <= priceRange[1];
      
      // Vérification des couleurs - s'assurer que product.colors est un tableau
      const colorMatch = selectedColors.length === 0 || 
        (Array.isArray(product.colors) && product.colors.some(c => selectedColors.includes(c)));
      
      // Vérification des catégories
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category) ||
        (product.subCategory && selectedCategories.includes(product.subCategory));
      
      // Vérification de la disponibilité
      const availabilityMatch = 
        availability === 'all' || 
        (availability === 'available' && product.isAvailable === true) ||
        (availability === 'unavailable' && product.isAvailable === false);

      return priceMatch && colorMatch && categoryMatch && availabilityMatch;
    });
  };

  const displayedProducts = sortProducts(filterProducts(products));

return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white">
      <div className="container-custom mx-auto px-4 pt-44 pb-16">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-72 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900">Filtres</h3>
                <button 
                  onClick={resetFilters}
                  className="text-xs text-violet-600 hover:text-violet-800 hover:underline"
                >
                  Réinitialiser
                </button>
              </div>
              
              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-medium mb-4 text-gray-900">Fourchette de prix</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Min: {priceRange[0]}€</span>
                    <span>Max: {priceRange[1]}€</span>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="1000" 
                      value={priceRange[0]} 
                      onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                      className="w-full h-2 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="1000" 
                      value={priceRange[1]} 
                      onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                      className="w-full h-2 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h4 className="font-medium mb-4 text-gray-900">Couleurs</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(products.flatMap(product => product.colors || []))).map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColors(prev =>
                        prev.includes(color)
                          ? prev.filter(c => c !== color)
                          : [...prev, color]
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${
                        selectedColors.includes(color)
                          ? 'bg-violet-100 border-violet-500 text-violet-700'
                          : 'border-gray-200 hover:border-violet-300 text-gray-700 hover:bg-violet-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h4 className="font-medium mb-4 text-gray-900">Disponibilité</h4>
                <div className="space-y-3">
                  {['all', 'available', 'unavailable'].map(option => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        value={option}
                        checked={availability === option}
                        onChange={(e) => setAvailability(e.target.value as any)}
                        className="form-radio h-4 w-4 text-violet-500 border-gray-300 focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {option === 'all' && 'Tous'}
                        {option === 'available' && 'Disponibles'}
                        {option === 'unavailable' && 'Indisponibles'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Breadcrumb */}
            <nav className="mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-violet-600">Accueil</Link>
                </li>
                {category && (
                  <>
                    <span className="text-gray-400">/</span>
                    <li>
                      <Link to={`/products/${category}`} className="text-gray-600 hover:text-violet-600">
                        {getCategoryTitle()}
                      </Link>
                    </li>
                  </>
                )}
                {subcategory && (
                  <>
                    <span className="text-gray-400">/</span>
                    <li>
                      <Link to={`/products/${category}/${subcategory}`} className="text-gray-600 hover:text-violet-600">
                        {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                      </Link>
                    </li>
                  </>
                )}
                {subsubcategory && (
                  <>
                    <span className="text-gray-400">/</span>
                    <li>
                      <span className="text-gray-400">
                        {subsubcategory.charAt(0).toUpperCase() + subsubcategory.slice(1)}
                      </span>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            {/* Categories Grid */}
            {!category && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Nos catégories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      to={`/products/${cat.slug}`}
                      className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 flex flex-col items-center hover:-translate-y-1"
                    >
                      <div className="w-16 h-16 bg-violet-100 rounded-full mb-4 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                        <span className="text-xl text-violet-600">{cat.name.charAt(0)}</span>
                      </div>
                      <h3 className="text-lg font-medium text-center text-gray-900">{cat.name}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-8 text-gray-900">
              {subcategory 
                ? `${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} - ${getCategoryTitle()}`
                : getCategoryTitle()
              }
            </h1>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Filters and Sorting */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <button 
                onClick={toggleFilter}
                className="flex items-center gap-2 text-gray-700 hover:text-violet-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow border border-gray-200"
              >
                <Filter className="w-5 h-5" />
                <span>Filtres</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="w-full md:w-auto p-2 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200"
              >
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="price-asc">Prix (croissant)</option>
                <option value="price-desc">Prix (décroissant)</option>
              </select>
            </div>

            {/* Active Filters */}
            {(selectedColors.length > 0 || selectedCategories.length > 0 || availability !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000) && (
              <div className="mb-6 bg-violet-50 p-4 rounded-lg border border-violet-100">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-violet-700">Filtres actifs:</span>
                  
                  {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <span className="px-3 py-1 bg-white text-sm font-medium text-violet-700 rounded-full border border-violet-200">
                      Prix: {priceRange[0]}€ - {priceRange[1]}€
                    </span>
                  )}
                  
                  {selectedColors.map(color => (
                    <span 
                      key={color}
                      className="px-3 py-1 bg-white text-sm font-medium text-violet-700 rounded-full border border-violet-200 flex items-center"
                    >
                      {color}
                      <button 
                        onClick={() => setSelectedColors(prev => prev.filter(c => c !== color))}
                        className="ml-2 text-violet-500 hover:text-violet-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {selectedCategories.map(cat => {
                    const categoryName = categories.find(c => c.slug === cat)?.name || cat;
                    return (
                      <span 
                        key={cat}
                        className="px-3 py-1 bg-white text-sm font-medium text-violet-700 rounded-full border border-violet-200 flex items-center"
                      >
                        {categoryName}
                        <button 
                          onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                          className="ml-2 text-violet-500 hover:text-violet-700"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  
                  {availability !== 'all' && (
                    <span className="px-3 py-1 bg-white text-sm font-medium text-violet-700 rounded-full border border-violet-200">
                      {availability === 'available' ? 'Disponibles' : 'Indisponibles'}
                    </span>
                  )}
                  
                  <button 
                    onClick={resetFilters}
                    className="px-3 py-1 bg-violet-600 text-sm font-medium text-white rounded-full hover:bg-violet-700 transition-colors ml-auto"
                  >
                    Effacer tous les filtres
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    aria-busy="true"
                    aria-label="Loading product..."
                  >
                    <div className="aspect-square bg-gray-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                      <div className="flex justify-between items-end pt-2">
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-12" />
                          <div className="h-5 bg-gray-100 rounded animate-pulse w-16" />
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <Link 
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={product.images?.[product.mainImageIndex ?? 0] || DEFAULT_PRODUCT_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE }}
                        loading="lazy"
                      />
                      
                      {product.isAvailable !== undefined && (
                        <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${
                          product.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isAvailable ? 'Disponible' : 'Indisponible'}
                        </div>
                      )}
                      
                      {product.colors && product.colors.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex space-x-1">
                          {product.colors.slice(0, 3).map((color, index) => (
                            <div 
                              key={index}
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                          ))}
                          {product.colors.length > 3 && (
                            <div className="w-3 h-3 rounded-full bg-gray-200 border border-white shadow-sm flex items-center justify-center text-[8px] font-bold">
                              +
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Réf: {product.reference}</p>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Prix HT / jour</p>
                          <p className="font-bold text-lg text-violet-600">{product.priceHT.toFixed(2)}€</p>
                        </div>
                        <div className="bg-violet-100 rounded-full p-2 group-hover:bg-violet-200 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Aucun produit trouvé</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Essayez de modifier vos filtres ou revenez plus tard pour découvrir nos nouveaux produits.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/"
                    className="px-6 py-3 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors font-medium"
                  >
                    Retour à l'accueil
                  </Link>
                  <Link
                    to={`/products/${category}`}
                    className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                  >
                    Retour à la catégorie
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
