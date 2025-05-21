import { useState } from "react";
import { ShoppingBag, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.07
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Extracted shared styles to improve maintainability
const baseCategoryStyles = "flex items-center justify-between w-full text-left px-4 py-3 rounded-xl transition-all duration-300";
const activeCategoryStyles = "bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 font-medium shadow-sm";
const inactiveCategoryStyles = "text-gray-600 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-indigo-50/50 hover:text-violet-700";

const baseSubcategoryStyles = "flex items-center justify-between w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300";
const activeSubcategoryStyles = "bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 font-medium";
const inactiveSubcategoryStyles = "text-gray-600 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-indigo-50/50 hover:text-violet-700";

// Arrow icon component for better reusability
const ChevronIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`transition-transform duration-200 ${isActive ? 'rotate-90 text-violet-700' : 'text-gray-400'}`}
    style={{ width: isActive ? '1.25rem' : '1rem', height: isActive ? '1.25rem' : '1rem' }}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

interface Category {
  id: string;
  slug: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  slug: string;
  name: string;
  subsubcategories?: Subsubcategory[];
}

interface Subsubcategory {
  id: string;
  slug: string;
  name: string;
}

// Component for subcategories to reduce nesting and improve readability
const Subcategory = ({ 
  category, 
  subcategory, 
  currentSubcategory, 
  currentSubsubcategory, 
  setIsFilterOpen,
  Link
}: {
  category: Category;
  subcategory: Subcategory;
  currentSubcategory?: string;
  currentSubsubcategory?: string;
  setIsFilterOpen: (isOpen: boolean) => void;
  Link: any;
}) => {
  const isActiveSubcategory = subcategory.slug === currentSubcategory;
  const subsubcategories = subcategory.subsubcategories || [];
  const hasSubsubcategories = subsubcategories.length > 0;
  
  return (
    <div 
      key={subcategory.id} 
      className="space-y-2"
    >
      <Link
        to={`/products/${category.slug}/${subcategory.slug}`}
        onClick={() => {
          if (window.innerWidth < 1024) {
            setIsFilterOpen(false);
          }
        }}
        className={`${baseSubcategoryStyles} ${isActiveSubcategory ? activeSubcategoryStyles : inactiveSubcategoryStyles}`}
      >
        <span className="text-sm">{subcategory.name}</span>
        {hasSubsubcategories && (
          <ChevronIcon isActive={isActiveSubcategory} />
        )}
      </Link>
      
      {isActiveSubcategory && hasSubsubcategories && (
        <div 
          className="pl-6 border-l-2 border-violet-200 ml-3 space-y-1 mt-1"
        >
          {subsubcategories.map(subsubcategory => (
            <div
              key={subsubcategory.id}
              className="transition-all duration-200 hover:translate-x-1"
            >
              <Link
                to={`/products/${category.slug}/${subcategory.slug}/${subsubcategory.slug}`}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsFilterOpen(false);
                  }
                }}
                className={`block text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                  subsubcategory.slug === currentSubsubcategory 
                    ? 'bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 font-medium' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-indigo-50/50 hover:text-violet-700'
                }`}
              >
                {subsubcategory.name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface CategoriesSidebarProps {
  categories?: Category[];
  currentCategory?: string;
  currentSubcategory?: string;
  currentSubsubcategory?: string;
  setIsFilterOpen: (isOpen: boolean) => void;
  Link: any;
}

export default function CategoriesSidebar({ 
  categories = [], 
  currentCategory,
  currentSubcategory,
  currentSubsubcategory,
  setIsFilterOpen,
  Link
}: CategoriesSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  return (
    <div className="mb-6">
      <h4 className="font-medium mb-3 text-gray-900 flex items-center text-lg">
        <span className="w-8 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full mr-3"></span>
        Catégories
        <span className="w-8 h-0.5 bg-violet-300 dark:bg-violet-700 rounded-full ml-3"></span>
      </h4>
      <motion.div 
        className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar bg-white/50 dark:bg-gray-800/30 rounded-xl p-3 shadow-sm"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {categories.map(category => {
          const isActiveCategory = category.slug === currentCategory;
          const subcategories = category.subcategories || [];
          const hasSubcategories = subcategories.length > 0;
          
          return (
            <motion.div 
              key={category.id} 
              className="space-y-2"
              variants={itemVariant}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group w-full"
                >
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-3 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{category.name}</span>
                  </div>
                  {hasSubcategories && (
                    expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )
                  )}
                </button>
                
                {/* Subcategories */}
                {expandedCategories.has(category.id) && hasSubcategories && (
                  <div className="ml-8 mt-1 space-y-1">
                    {subcategories.map((subcategory) => (
                      <motion.div key={subcategory.id} variants={itemVariant}>
                        <div className="flex flex-col">
                          <button
                            onClick={() => toggleSubcategory(subcategory.id)}
                            className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group w-full"
                          >
                            <div className="flex items-center">
                              <Package className="w-4 h-4 mr-3 text-violet-400 dark:text-violet-500 group-hover:scale-110 transition-transform duration-300" />
                              <span className="group-hover:translate-x-1 transition-transform duration-300">{subcategory.name}</span>
                            </div>
                            {subcategory.subsubcategories && subcategory.subsubcategories.length > 0 && (
                              expandedSubcategories.has(subcategory.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )
                            )}
                          </button>

                          {/* SubSubcategories */}
                          {expandedSubcategories.has(subcategory.id) && subcategory.subsubcategories && (
                            <div className="ml-8 mt-1 space-y-1">
                              {subcategory.subsubcategories.map((subsubcategory) => (
                                <motion.div key={subsubcategory.id} variants={itemVariant}>
                                  <Link
                                    to={`/products/${category.slug}/${subcategory.slug}/${subsubcategory.slug}`}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 dark:hover:from-violet-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-300 hover:shadow-sm group"
                                    onClick={() => {
                                      if (window.innerWidth < 1024) {
                                        setIsFilterOpen(false);
                                      }
                                    }}
                                  >
                                    <span className="w-1.5 h-1.5 bg-violet-300 dark:bg-violet-600 rounded-full mr-3"></span>
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">{subsubcategory.name}</span>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
} 