import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Product } from '../../types/Product';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/images';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddToComparison: (product: Product) => void;
  isInComparison: (productId: string) => boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onAddToComparison, isInComparison }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group relative flex flex-col"
    >
      {/* Image produit avec overlay */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <img
            src={product.images && product.images.length > 0
              ? (product.mainImageIndex !== undefined && product.images[product.mainImageIndex]
                ? product.images[product.mainImageIndex]
                : product.images[0])
              : DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Badge disponibilité */}
          {product.isAvailable !== undefined && (
            <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full shadow-sm backdrop-blur-sm ${
              product.isAvailable
                ? 'bg-green-100/90 text-green-800 border border-green-200'
                : 'bg-red-100/90 text-red-800 border border-red-200'
            }`}>
              {product.isAvailable ? 'Disponible' : 'Indisponible'}
            </span>
          )}
        </div>
      </Link>
      {/* Infos produit */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{product.reference}</p>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold text-gray-900">{product.priceHT.toFixed(2)}€</p>
              <span className="text-sm text-gray-500">€ HT</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-base font-medium text-purple-600">{Math.round(product.priceTTC)}€</p>
              <span className="text-xs text-purple-500">€ TTC</span>
            </div>
          </div>
        </div>
        <div className="mb-2 flex flex-wrap gap-1">
          <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            {product.category}
          </span>
          {product.subCategory && (
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-100">
              {product.subCategory}
            </span>
          )}
        </div>
        {/* Actions en colonne */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 mt-auto">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            Ajouter au devis
          </button>
          <button
            onClick={() => onAddToComparison(product)}
            disabled={isInComparison(product.id)}
            className={`w-full flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isInComparison(product.id)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
            }`}
          >
            <Scale className="h-4 w-4 mr-1" />
            {isInComparison(product.id) ? 'Ajouté' : 'Comparer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 