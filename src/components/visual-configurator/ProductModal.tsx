import React from 'react';
import { Product } from '../../types/Product';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCanvas: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCanvas }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* Modal Content */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Image Gallery */}
                      <div className="space-y-4">
                        <div className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {product.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {product.images.slice(1).map((image, index) => (
                              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                <img
                                  src={image}
                                  alt={`${product.name} - Vue ${index + 2}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                        <p className="text-3xl font-bold text-primary-600">
                          {product.priceTTC.toFixed(2)}€ TTC
                        </p>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Catégorie: {product.category}</p>
                          {product.subCategory && (
                            <p className="text-sm text-gray-500">Sous-catégorie: {product.subCategory}</p>
                          )}
                          {product.subSubCategory && (
                            <p className="text-sm text-gray-500">Sous-sous-catégorie: {product.subSubCategory}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">Description</h4>
                          <p className="text-gray-600">{product.description}</p>
                        </div>

                        {product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Spécifications techniques</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(product.technicalSpecs).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-gray-600">{key}:</span>{' '}
                                  <span className="text-gray-500">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {product.colors && product.colors.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Couleurs disponibles</h4>
                            <div className="flex flex-wrap gap-2">
                              {product.colors.map((color, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => onAddToCanvas(product)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <ShoppingCartIcon className="w-5 h-5" />
                          <span>Ajouter au devis</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 