import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/Product';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/images';

interface ProductGridProps {
  products: Product[];
  error: string | null;
}

const ProductGrid: React.FC<ProductGridProps> = memo(({ products, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-lg text-center border border-gray-100">
        <div className="mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 21a9 9 0 110-18 9 9 0 010 18z" 
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun produit trouvé</h3>
        <p className="text-gray-600 text-base max-w-md mx-auto">
          Nous n'avons trouvé aucun produit correspondant à vos critères. Essayez d'ajuster vos filtres ou revenez plus tard.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  const getProductImage = useCallback(() => {
    if (product.images && product.images.length > 0) {
      return product.mainImageIndex !== undefined && product.images[product.mainImageIndex] 
        ? product.images[product.mainImageIndex] 
        : product.images[0];
    }
    return DEFAULT_PRODUCT_IMAGE;
  }, [product.images, product.mainImageIndex]);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-w-1 aspect-h-1 w-full h-48 overflow-hidden bg-white flex items-center justify-center">
        <img
          src={getProductImage()}
          alt={product.name}
          className="max-w-full max-h-full object-contain group-hover:opacity-75"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.reference}</p>
        <div className="mt-2 flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-900">{Math.round(product.priceTTC)}€</p>
          {product.isAvailable !== undefined && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              product.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.isAvailable ? 'Disponible' : 'Indisponible'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

ProductGrid.displayName = 'ProductGrid';
ProductCard.displayName = 'ProductCard';

export default ProductGrid;