import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../services/categoryService';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentCategory?: string;
  currentSubcategory?: string;
  currentSubsubcategory?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentCategory,
  currentSubcategory,
  currentSubsubcategory
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Catégories</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4">
          <div className="space-y-2">
            {categories.map(category => {
              const isActiveCategory = category.slug === currentCategory;
              return (
                <div key={category.id} className="space-y-1">
                  <Link
                    to={`/products/${category.slug}`}
                    className={`flex items-center justify-between w-full text-left text-sm px-2 py-1.5 rounded hover:bg-violet-50 transition-colors ${
                      isActiveCategory ? 'font-medium text-violet-700 bg-violet-50' : 'text-gray-600 hover:text-violet-700'
                    }`}
                  >
                    <span>{category.name}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <svg 
                        className={`w-3 h-3 transition-transform duration-200 ${isActiveCategory ? 'rotate-90 text-violet-700' : 'text-gray-400'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                  
                  {isActiveCategory && category.subcategories && category.subcategories.length > 0 && (
                    <div className="pl-3 border-l border-gray-200 ml-2 space-y-1 mt-1">
                      {category.subcategories.map(subcategory => {
                        const isActiveSubcategory = subcategory.slug === currentSubcategory;
                        return (
                          <div key={subcategory.id} className="space-y-1">
                            <Link
                              to={`/products/${category.slug}/${subcategory.slug}`}
                              className={`flex items-center justify-between w-full text-left text-sm px-2 py-1 rounded hover:bg-violet-50 transition-colors ${
                                isActiveSubcategory ? 'font-medium text-violet-700 bg-violet-50' : 'text-gray-600 hover:text-violet-700'
                              }`}
                            >
                              <span>{subcategory.name}</span>
                              {subcategory.subsubcategories && subcategory.subsubcategories.length > 0 && (
                                <svg 
                                  className={`w-3 h-3 transition-transform duration-200 ${isActiveSubcategory ? 'rotate-90 text-violet-700' : 'text-gray-400'}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </Link>
                            
                            {isActiveSubcategory && subcategory.subsubcategories && subcategory.subsubcategories.length > 0 && (
                              <div className="pl-3 border-l border-gray-200 ml-2 space-y-1 mt-1">
                                {subcategory.subsubcategories.map(subsubcategory => (
                                  <Link
                                    key={subsubcategory.id}
                                    to={`/products/${category.slug}/${subcategory.slug}/${subsubcategory.slug}`}
                                    className={`block text-sm px-2 py-1 rounded hover:bg-violet-50 transition-colors ${
                                      subsubcategory.slug === currentSubsubcategory ? 'font-medium text-violet-700 bg-violet-50' : 'text-gray-600 hover:text-violet-700'
                                    }`}
                                  >
                                    {subsubcategory.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryModal; 