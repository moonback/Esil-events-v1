import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllProducts, getProductsByCategory, getProductsBySubCategory, getProductsBySubSubCategory } from '../services/productService';
import { Category, getAllCategories } from '../services/categoryService';
import ProductFilters from '../components/product-list/ProductFilters';
import { useProductFilters } from '../hooks/useProductFilters';
import { Product } from '../types/Product';
import Breadcrumb from '../components/product-list/Breadcrumb';
import CategoryHeader from '../components/product-list/CategoryHeader';
import FilterButton from '../components/product-list/FilterButton';
import ProductGrid from '../components/product-list/ProductGrid';

// Using Product type from types/Product.ts

const ProductListPage: React.FC = () => {
  const { category, subcategory, subsubcategory } = useParams<{ category: string; subcategory?: string; subsubcategory?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // isFilterOpen is now managed by useProductFilters
  const [error, setError] = useState<string | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<{name: string, description?: string, seo_title?: string}>({name: ''});

  // Use the product filters hook
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
    toggleFilter
  } = useProductFilters(products, category);

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

  // Filtering and sorting logic is now handled by useProductFilters

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      {/* Breadcrumb component */}
      <Breadcrumb 
        category={category} 
        subcategory={subcategory} 
        subsubcategory={subsubcategory} 
        categories={categories} 
      />

      {/* Category Header component */}
      <CategoryHeader 
        name={categoryInfo.name} 
        description={categoryInfo.description} 
      />

      {/* Filter Button component (Mobile) */}
      <FilterButton 
        isFilterOpen={isFilterOpen} 
        toggleFilter={toggleFilter} 
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters (Sidebar) - Using ProductFilters component */}
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
        />

        {/* Product Grid component */}
        <div className="lg:w-3/4">
          <ProductGrid 
            products={filteredProducts} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
