import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../services/categoryService';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
  categories: Category[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  category, 
  subcategory, 
  subsubcategory, 
  categories 
}) => {
  const getBreadcrumb = (): BreadcrumbItem[] => {
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

  return (
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
  );
};

export default Breadcrumb;