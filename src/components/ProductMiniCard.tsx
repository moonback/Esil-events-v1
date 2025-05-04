import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/Product';
import { motion } from 'framer-motion';

interface ProductMiniCardProps {
  product: Product;
}

const ProductMiniCard: React.FC<ProductMiniCardProps> = ({ product }) => {
  // Déterminer l'image à afficher (utiliser l'image principale ou la première disponible)
  const imageUrl = product.images && product.images.length > 0 
    ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
      ? product.images[product.mainImageIndex] 
      : product.images[0])
    : '/images/default-product.svg';

  return (
    <motion.div 
      className="product-mini-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-violet-200 dark:border-violet-800 flex flex-col w-full max-w-[250px] my-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-32 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
        <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
          {product.priceTTC}€
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {typeof product.category === 'string' 
              ? product.category
              : Array.isArray(product.category) && product.category.length > 0 
                ? product.category[0]
                : 'Catégorie'}
          </span>
          <Link 
            to={`/produit/${product.slug || product.id}`} 
            className="text-xs font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
          >
            Voir détails →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductMiniCard;