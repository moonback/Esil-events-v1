import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [prevActiveCategory, setPrevActiveCategory] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Vérifier si les données sont en cache et encore valides
        const cachedData = localStorage.getItem('megaMenuCategories');
        const cachedTimestamp = localStorage.getItem('megaMenuCategoriesTimestamp');
        const currentTime = new Date().getTime();
        
        // Utiliser le cache si disponible et moins de 10 minutes d'âge
        if (cachedData && cachedTimestamp && 
            (currentTime - parseInt(cachedTimestamp)) < 10 * 60 * 1000) {
          const parsedData = JSON.parse(cachedData);
          setCategories(parsedData);
          if (parsedData.length > 0) {
            setActiveCategory(parsedData[0].id);
          }
          setIsLoading(false);
          return;
        }
        
        // Sinon, charger depuis l'API
        const data = await getAllCategories();
        setCategories(data);
        
        // Mettre en cache les données
        localStorage.setItem('megaMenuCategories', JSON.stringify(data));
        localStorage.setItem('megaMenuCategoriesTimestamp', currentTime.toString());
        
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
  const getTotalItemsCount = useCallback(() => {
    if (categories.length === 0) return 0;
    
    return categories.reduce((acc, cat) => {
      const subCatCount = cat.subcategories?.length || 0;
      const subSubCatCount = cat.subcategories?.reduce((acc2, subCat) => 
        acc2 + (subCat.subsubcategories?.length || 0), 0) || 0;
      return acc + subCatCount + subSubCatCount;
    }, 0);
  }, [categories]);
  
  // Calculer le nombre de sous-catégories pour une catégorie spécifique
  const getCategoryItemsCount = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 0;
    
    const subCatCount = category.subcategories?.length || 0;
    const subSubCatCount = category.subcategories?.reduce((acc, subCat) => 
      acc + (subCat.subsubcategories?.length || 0), 0) || 0;
    
    return subCatCount + subSubCatCount;
  }, [categories]);

  // Trouver la catégorie active
  const getActiveCategory = useCallback(() => {
    return categories.find(cat => cat.id === activeCategory) || null;
  }, [categories, activeCategory]);
  
  // Gérer le changement de catégorie avec animation
  const handleCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === activeCategory) return;
    
    setPrevActiveCategory(activeCategory);
    setIsTransitioning(true);
    
    // Délai court pour permettre l'animation
    setTimeout(() => {
      setActiveCategory(categoryId);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Durée de l'animation
    }, 50);
  }, [activeCategory]);

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
      <div className="max-w-12xl mx-auto p-6">
        <div className="flex flex-col md:flex-row">
          {/* Colonne de gauche - Catégories principales */}
          <div className="w-full md:w-1/4 border-r border-gray-100 pr-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`
                  p-4 rounded-lg mb-2 cursor-pointer transition-all duration-300
                  ${activeCategory === category.id 
                    ? 'bg-violet-100 text-violet-800 font-medium shadow-sm scale-102' 
                    : 'hover:bg-gray-50 hover:scale-102'}
                `}
                onClick={() => handleCategoryChange(category.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{category.name}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 transition-all duration-300 hover:bg-violet-100">
                    {getCategoryItemsCount(category.id)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Colonne de droite - Sous-catégories */}
          <div className="w-full md:w-3/4 pl-0 md:pl-6 mt-4 md:mt-0 relative overflow-hidden">
            {activeCat && (
              <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
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
                              <li key={subSubCategory.id} className="transform transition-all duration-200 hover:translate-x-1">
                                <Link
                                  to={`/products/${activeCat.slug}/${subCategory.slug}/${subSubCategory.slug}`}
                                  className="text-gray-600 hover:text-violet-700 text-sm transition-colors duration-200 block flex items-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onLinkClick) onLinkClick();
                                  }}
                                >
                                  <span className="text-violet-400 mr-1">•</span> {subSubCategory.name}
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
                </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="text-sm text-gray-600">
            {categories.length > 0 
              ? `${categories.length} catégories · ${getTotalItemsCount()} produits au total`
              : 'Chargement des produits...'}
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