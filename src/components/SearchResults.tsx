import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types/Product';
import { searchProducts } from '../services/productService';

interface SearchResultsProps {
  query: string;
  onSelect: (product: Product) => void;
  onClose: () => void;
  results: Product[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelect }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<Product[]>([]);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        searchProducts(query)
          .then(setResults)
          .catch(console.error)
          .finally(() => setIsLoading(false));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);
  return (
    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
      {results.map((product) => (
        <div 
          key={product.id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            onSelect(product);
            navigate(`/product/${product.id}`);
          }}
        >
          {product.name}
        </div>
      ))}
    </div>
  );
};

export default SearchResults;