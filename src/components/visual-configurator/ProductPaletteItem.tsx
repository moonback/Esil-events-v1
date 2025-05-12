import React from 'react';
import { Product } from '../../types/Product';

interface ProductPaletteItemProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductPaletteItem: React.FC<ProductPaletteItemProps> = ({ product, onSelect }) => {
  return (
    <div 
      className="cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden bg-white"
      onClick={() => onSelect(product)}
    >
      <div className="relative aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.priceTTC}€</p>
      </div>
    </div>
  );
}; 