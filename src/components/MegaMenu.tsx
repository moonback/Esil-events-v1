import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories, type Category } from '../services/categoryService';

interface MegaMenuProps {
  onLinkClick?: () => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ onLinkClick }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
        // Définir la première catégorie comme active par défaut
        if (data.length > 0) {
          setActiveCategory(data[0].id);
        }
      } catch (err) {
        setError('Erreur lors du chargement des catégories');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Calculate total subcategories and subsubcategories with proper type checking
  const getTotalItemsCount = () => {
    if (categories.length === 0) return 0;
    
    return categories.reduce((acc, cat) => {
      const subCatCount = cat.subcategories?.length || 0;
      const subSubCatCount = cat.subcategories?.reduce((acc2, subCat) => 
        acc2 + (subCat.subsubcategories?.length || 0), 0) || 0;
      return acc + subCatCount + subSubCatCount;
    }, 0);
  };

  // Trouver la catégorie active
  const getActiveCategory = () => {
    return categories.find(cat => cat.id === activeCategory) || null;
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-xl animate-fadeIn p-6 rounded-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            <div className="w-1/4 animate-pulse">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 rounded my-2"></div>
              ))}
            </div>
            <div className="w-3/4 pl-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded w-2/3"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-xl animate-fadeIn p-6 rounded-lg">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-600 font-medium p-4 bg-red-50 rounded-lg border border-red-200">
            <span className="block mb-1 text-red-500 font-bold">Erreur</span>
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const activeCat = getActiveCategory();
  const activeSubcategories = activeCat?.subcategories || [];

  return (
    <div className="bg-white shadow-xl animate-fadeIn rounded-b-lg overflow-hidden">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row">
          {/* Colonne de gauche - Catégories principales */}
          <div className="w-full md:w-1/4 border-r border-gray-100 pr-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`
                  p-4 rounded-lg mb-2 cursor-pointer transition-all duration-200
                  ${activeCategory === category.id 
                    ? 'bg-violet-100 text-violet-800 font-medium shadow-sm' 
                    : 'hover:bg-gray-50'}
                `}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{category.name}</span>
                  
                </div>
              </div>
            ))}
          </div>

          {/* Colonne de droite - Sous-catégories */}
          <div className="w-full md:w-3/4 pl-0 md:pl-6 mt-4 md:mt-0">
            {activeCat && (
              <>
                <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-100">
                  <Link 
                    to={`/products/${activeCat.slug}`}
                    className="hover:text-violet-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onLinkClick) onLinkClick();
                    }}
                  >
                    {activeCat.name}
                  </Link>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {activeSubcategories.map((subCategory) => {
                    // Safe access to subsubcategories
                    const subsubcategories = subCategory.subsubcategories || [];
                    
                    return (
                      <div key={subCategory.id} className="mb-4">
                        <Link
                          to={`/products/${activeCat.slug}/${subCategory.slug}`}
                          className="text-violet-800 hover:text-violet-900 font-medium text-lg block mb-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onLinkClick) onLinkClick();
                          }}
                        >
                          {subCategory.name}
                        </Link>
                        
                        {subsubcategories.length > 0 && (
                          <ul className="space-y-1 pl-1">
                            {subsubcategories.map((subSubCategory) => (
                              <li key={subSubCategory.id}>
                                <Link
                                  to={`/products/${activeCat.slug}/${subCategory.slug}/${subSubCategory.slug}`}
                                  className="text-gray-600 hover:text-violet-700 text-sm transition-colors duration-200 block"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onLinkClick) onLinkClick();
                                  }}
                                >
                                  • {subSubCategory.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                {activeSubcategories.length === 0 && (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucune sous-catégorie disponible</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="text-sm text-gray-600">
            {/* {categories.length > 0 
              ? ` ${categories.length} catégories principales`
              : 'Chargement des produits...'} */}
          </p>
          
          <div className="flex space-x-4">
            {/* <Link 
              to="/products/new" 
              className="text-violet-600 font-medium hover:text-violet-800 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                if (onLinkClick) onLinkClick();
              }}
            >
              Nouveautés
            </Link>
            <Link 
              to="/products/sale" 
              className="text-red-600 font-medium hover:text-red-800 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                if (onLinkClick) onLinkClick();
              }}
            >
              Promotions
            </Link> */}
            <Link 
              to="/products" 
              className="text-black font-medium hover:text-violet-800 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                if (onLinkClick) onLinkClick();
              }}
            >
              Tous les produits →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;