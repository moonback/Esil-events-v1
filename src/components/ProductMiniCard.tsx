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
      className="product-mini-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-violet-300 dark:border-violet-700 flex flex-col w-full max-w-[280px] my-3 transform hover:scale-102 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
        />
        <div className="absolute top-3 right-3 bg-violet-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
          {product.priceTTC}€
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {typeof product.category === 'string' 
              ? product.category
              : Array.isArray(product.category) && product.category.length > 0 
                ? product.category[0]
                : 'Catégorie'}
          </span>
          <Link 
            to={`/product/${product.slug || product.id}`} 
            className="text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            Voir détails
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductMiniCard;