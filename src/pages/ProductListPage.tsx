import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import { getAllProducts, getProductsByCategory, getProductsBySubCategory } from '../services/productService';
import { Category, getAllCategories } from '../services/categoryService';

interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  subCategory?: string;
  priceHT: number;
  priceTTC: number;
  images: string[];
  colors?: string[];
  isAvailable?: boolean;
}

const ProductListPage: React.FC = () => {
  const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();
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
  }, [category, subcategory]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
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
      const priceMatch = product.priceHT >= priceRange[0] && product.priceHT <= priceRange[1];
      const colorMatch = selectedColors.length === 0 || 
        (product.colors && product.colors.some(c => selectedColors.includes(c)));
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category) ||
        selectedCategories.includes(product.subCategory || '');
      const availabilityMatch = availability === 'all' || 
        (product.isAvailable === (availability === 'available'));

      return priceMatch && colorMatch && categoryMatch && availabilityMatch;
    });
  };

  const displayedProducts = sortProducts(filterProducts(products));

  return (
    <div className="pt-44 pb-16 px-4 bg-gray-50">
      <div className="container-custom mx-auto flex gap-8">
        {/* Sidebar Filters */}
        <div className={`w-72 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Filtres</h3>
            
            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Fourchette de prix</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Min: {priceRange[0]}€</span>
                  <span>Max: {priceRange[1]}€</span>
                </div>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    value={priceRange[0]} 
                    onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    value={priceRange[1]} 
                    onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Couleurs</h4>
              <div className="flex flex-wrap gap-2">
                {['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColors(prev =>
                      prev.includes(color)
                        ? prev.filter(c => c !== color)
                        : [...prev, color]
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      selectedColors.includes(color)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Catégories</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={(e) => setSelectedCategories(prev =>
                        e.target.checked
                          ? [...prev, cat.slug]
                          : prev.filter(c => c !== cat.slug)
                      )}
                      className="form-checkbox h-4 w-4 text-blue-500"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Disponibilité</h4>
              <div className="space-y-2">
                {['all', 'available', 'unavailable'].map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={option}
                      checked={availability === option}
                      onChange={(e) => setAvailability(e.target.value as any)}
                      className="form-radio h-4 w-4 text-blue-500"
                    />
                    <span className="text-sm">
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
          <div className="mb-8">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link to="/" className="text-gray-700 hover:text-black">Accueil</Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link to={`/products/${category}`} className="text-gray-700 hover:text-black">
                      {getCategoryTitle()}
                    </Link>
                  </div>
                </li>
                {subcategory && (
                  <li aria-current="page">
                    <div className="flex items-center">
                      <span className="mx-2 text-gray-400">/</span>
                      <span className="text-gray-500">
                        {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>
          </div>
          {/* Categories Section */}
          {!category && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Nos catégories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/products/${cat.slug}`}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col items-center hover:-translate-y-1"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                      {/* Placeholder for category icon */}
                      <span className="text-xl">{cat.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-lg font-medium text-center">{cat.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
          

          <h1 className="text-3xl font-bold mb-8">
            {subcategory 
              ? `${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} - ${getCategoryTitle()}`
              : getCategoryTitle()
            }
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Filters and Sorting */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <button 
                onClick={toggleFilter}
                className="flex items-center text-black hover:text-gray-700 transition-colors duration-200 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
              >
                <Filter className="mr-2 w-5 h-5" />
                Filtres
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="w-full md:w-auto">
                <select 
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full md:w-auto p-2 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="name-asc">Nom (A-Z)</option>
                  <option value="name-desc">Nom (Z-A)</option>
                  <option value="price-asc">Prix (croissant)</option>
                  <option value="price-desc">Prix (décroissant)</option>
                </select>
              </div>
            </div>
            
            {/* Filter Panel */}
            {isFilterOpen && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-4 transition-all duration-300 ease-in-out">
                <h3 className="font-semibold text-lg mb-4">Fourchette de prix</h3>
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        value={priceRange[0]} 
                        onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        value={priceRange[1]} 
                        onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Min: {priceRange[0]}€</span>
                      <span>Max: {priceRange[1]}€</span>
                    </div>
                    <div className="relative h-1 bg-gray-200 rounded-full">
                      <div 
                        className="absolute h-1 bg-blue-500 rounded-full"
                        style={{
                          left: `${(priceRange[0] / 1000) * 100}%`,
                          right: `${100 - (priceRange[1] / 1000) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <div 
                  key={index} 
                  className="product-card group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                  aria-busy="true"
                  aria-label="Loading product..."
                >
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              role="list"
              aria-label="Products grid"
            >
              {displayedProducts.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="product-card group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  role="listitem"
                >
                  <div className="aspect-square relative">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-500">Réf: {product.reference}</p>
                    <p className="font-bold text-lg text-blue-600">{product.priceHT.toFixed(2)}€ HT / jour</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Aucun produit trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos filtres ou revenez plus tard.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Rafraîchir la page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
