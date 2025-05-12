import React, { useState } from 'react';
import { Product } from '../../types/Product';
import { PlusIcon, ShoppingCartIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ProductPaletteItemProps {
  product: Product;
  onSelect: (product: Product) => void;
  onShowDetails: (product: Product) => void;
}

export const ProductPaletteItem: React.FC<ProductPaletteItemProps> = ({ product, onSelect, onShowDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative cursor-pointer rounded-2xl border border-gray-200 overflow-hidden 
        transition-all duration-300 ease-in-out transform hover:-translate-y-2 
        hover:shadow-2xl hover:border-primary-200 bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 
            group-hover:scale-110 brightness-90 group-hover:brightness-100"
        />
        
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 
            transition-all duration-300 flex items-center justify-center`}
        >
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                bg-white/80 p-3 rounded-full shadow-lg hover:bg-white`}
            >
              <PlusIcon className="w-6 h-6 text-primary-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(product);
              }}
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                bg-white/80 p-3 rounded-full shadow-lg hover:bg-white`}
            >
              <InformationCircleIcon className="w-6 h-6 text-primary-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div className="flex flex-col space-y-1">
          <h3 className="text-base font-semibold text-gray-900 truncate">{product.name}</h3>
          <span className="text-sm font-bold text-primary-600">
            {product.priceTTC.toFixed(2)}€ TTC
          </span>
        </div>
        
        {/* Additional Product Details */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">{product.category}</span>
          <div 
            className={`flex items-center space-x-1 text-gray-600 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          >
            <ShoppingCartIcon className="w-4 h-4" />
            <span className="text-xs">Ajouter</span>
          </div>
        </div>
      </div>

      {/* Subtle Border Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 
        origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300">
      </div>
    </div>
  );
};