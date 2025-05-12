import React from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Product } from '../../types/Product';

interface CanvasItemProps {
  product: Product & { quantity: number };
  onRemove: (id: string) => void;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ product, onRemove }) => {
  return (
    <div className="relative group">
      <div className="relative aspect-square rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-violet-50 to-white">
        <img
          src={product.images[product.mainImageIndex || 0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white drop-shadow-lg">
              {product.reference}
            </span>
            <button
              onClick={() => onRemove(product.id)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-full text-gray-600 shadow-sm transition-all duration-200"
              aria-label="Remove item"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {/* <span className="text-sm font-semibold text-violet-600">
              {product.priceTTC.toFixed(2)}€
            </span>
            <span className="text-xs text-gray-500">TTC</span> */}
          </div>
        </div>
        {product.technicalSpecs && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <InformationCircleIcon className="w-3 h-3" />
            <span className="line-clamp-1">
              {Object.entries(product.technicalSpecs).map(([key, value]) => `${key}: ${value}`).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 