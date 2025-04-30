import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import { getAllProducts, getProductsByCategory, getProductsBySubCategory, getProductsBySubSubCategory } from '../services/productService';
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
  const [categoryInfo, setCategoryInfo] = useState<{name: string, description?: string, seo_title?: string}>({name: ''});

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
        
        // Find current category/subcategory/subsubcategory info for display
        if (category) {
          const currentCategory = categoriesData.find(cat => cat.slug === category);
          if (currentCategory) {
            if (!subcategory) {
              setCategoryInfo({
                name: currentCategory.name,
                description: currentCategory.description,
                seo_title: currentCategory.seo_title
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
                    seo_title: currentSubcategory.seo_title
                  });
                } else {
                  const currentSubSubcategory = currentSubcategory.subsubcategories?.find(
                    subsubcat => subsubcat.slug === subsubcategory
                  );
                  if (currentSubSubcategory) {
                    setCategoryInfo({
                      name: currentSubSubcategory.name,
                      description: currentSubSubcategory.description,
                      seo_title: currentSubSubcategory.seo_title
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

  // Apply filters and sorting to products
  const filteredProducts = products
    .filter(product => {
      // Filter by price
      if (product.priceTTC < priceRange[0] || product.priceTTC > priceRange[1]) {
        return false;
      }
      
      // Filter by availability
      if (availability === 'available' && !product.isAvailable) {
        return false;
      }
      if (availability === 'unavailable' && product.isAvailable) {
        return false;
      }
      
      // Filter by colors
      if (selectedColors.length > 0 && (!product.colors || !product.colors.some(color => selectedColors.includes(color)))) {
        return false;
      }
      
      // Filter by selected categories (if on main page)
      if (!category && selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort products
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.priceTTC - b.priceTTC;
        case 'price-desc':
          return b.priceTTC - a.priceTTC;
        default:
          return 0;
      }
    });

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 mt-5 pt-20">
        <ol className="flex flex-wrap text-sm">
          {getBreadcrumb().map((item, index, array) => (
            <li key={item.path} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              {index === array.length - 1 ? (
                <span className="font-medium text-gray-800">{item.name}</span>
              ) : (
                <Link to={item.path} className="text-blue-600 hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {categoryInfo.name || 'Tous nos produits'}
        </h1>
        {categoryInfo.description && (
          <p className="text-gray-600">{categoryInfo.description}</p>
        )}
      </div>

      {/* Filter Button (Mobile) */}
      <div className="lg:hidden mb-4">
        <button
          onClick={toggleFilter}
          className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filtres
          <ChevronDown className={`h-5 w-5 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters (Sidebar) */}
        <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Réinitialiser
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Prix</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {priceRange[0]}€</span>
                  </div>
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Max: {priceRange[1]}€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Trier par</h3>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="price-asc">Prix (croissant)</option>
                <option value="price-desc">Prix (décroissant)</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Disponibilité</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={availability === 'all'}
                    onChange={() => setAvailability('all')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tous</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={availability === 'available'}
                    onChange={() => setAvailability('available')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Disponible</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={availability === 'unavailable'}
                    onChange={() => setAvailability('unavailable')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Non disponible</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:w-3/4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos filtres ou revenez plus tard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <img
                      src={product.images && product.images.length > 0 
                        ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
                          ? product.images[product.mainImageIndex] 
                          : product.images[0])
                        : DEFAULT_PRODUCT_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-center object-cover group-hover:opacity-75"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.reference}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-900">{product.priceTTC.toFixed(2)}€</p>
                      {product.isAvailable !== undefined && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isAvailable ? 'Disponible' : 'Indisponible'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
