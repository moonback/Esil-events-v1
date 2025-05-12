import React from 'react';
import { Product } from '../../types/Product';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CanvasItemProps {
  product: Product;
  onRemove: (productId: string) => void;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ product, onRemove }) => {
  return (
    <div className="relative group">
      <div className="relative aspect-square  rounded-lg overflow-hidden shadow-md">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {/* <button
          onClick={() => onRemove(product.id)}
          className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Remove item"
        >
          <XMarkIcon className="w-4 h-4 text-gray-600" />
        </button> */}
      </div>
      <div className="mt-1 text-center">
        <p className="text-xs text-gray-600 truncate">{product.name}</p>
      </div>
    </div>
  );
}; 