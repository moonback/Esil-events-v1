import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Package, Tag, ShoppingCart, Layers, Eye, ArrowUpDown, Copy } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Product } from '../../types/Product';
import { getAllProducts, deleteProduct, createProduct, updateProduct, duplicateProduct } from '../../services/productService';
import ProductForm from '../../components/ProductForm';
import AdminHeader from '../../components/admin/AdminHeader';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/images';
import ProductFilterPanel from '../../components/admin/ProductFilterPanel';
import { useAdminProductFilters } from '../../hooks/useAdminProductFilters';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Utiliser notre hook personnalisé pour les filtres
  const {
    priceRange,
    setPriceRange,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedColors,
    setSelectedColors,
    availabilityFilter,
    setAvailabilityFilter,
    stockFilter,
    setStockFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    resetFilters,
    filteredProducts,
    isFilterOpen,
    toggleFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    currentItems
  } = useAdminProductFilters(products);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await deleteProduct(id);
      // Mettre à jour la liste des produits en retirant le produit supprimé
      setProducts(products.filter(p => p.id !== id));
      // Afficher un message de succès temporaire
      setError(''); // Effacer les erreurs précédentes
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in';
      successMessage.innerHTML = 'Produit supprimé avec succès de la base de données';
      document.body.appendChild(successMessage);
      
      // Supprimer le message après 3 secondes
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
      // Recharger la liste des produits pour s'assurer que tout est à jour
      await loadProducts();
    } catch (err: any) {
      setError(`Erreur lors de la suppression du produit: ${err.message || 'Erreur inconnue'}`);
      console.error('Erreur de suppression:', err);
    }
  };

  // Statistiques calculées à partir des produits filtrés

  // Statistics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockProducts = products.filter(p => p.stock < 5).length;
  const unavailableProducts = products.filter(p => !p.isAvailable).length;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Réinitialiser la pagination lors du changement de tri
  };

  const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
    const [error, setError] = useState(false);
    
    return (
      <div className="relative h-10 w-10">
        {!error ? (
          <img
            src={src || DEFAULT_PRODUCT_IMAGE}
            alt={alt}
            onError={() => setError(true)}
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <img
            src={DEFAULT_PRODUCT_IMAGE}
            alt={alt}
            className="h-10 w-10 rounded-md object-cover"
          />
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Produits</p>
                <p className="text-2xl font-semibold">{totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mr-4">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock Total</p>
                <p className="text-2xl font-semibold">{totalStock}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock Faible</p>
                <p className="text-2xl font-semibold">{lowStockProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Indisponibles</p>
                <p className="text-2xl font-semibold">{unavailableProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md animate-fade-in">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 ease-in-out max-w-8xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setFormError('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">Fermer</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            {formError && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md animate-fade-in border border-red-200">
                {formError}
              </div>
            )}
            <div className="px-2">
              <ProductForm
                initialData={editingProduct || undefined}
                onSubmit={async (data) => {
                  try {
                    setFormError('');
                    if (editingProduct) {
                      await updateProduct(editingProduct.id, data);
                    } else {
                      await createProduct(data);
                    }
                    await loadProducts();
                    setShowForm(false);
                    setEditingProduct(null);
                  } catch (err: any) {
                    setFormError(err.message || 'Une erreur est survenue lors de l\'enregistrement du produit');
                    console.error(err);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Panneau de filtres avancés */}
            <ProductFilterPanel
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              availabilityFilter={availabilityFilter}
              setAvailabilityFilter={setAvailabilityFilter}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              products={products}
              onReset={resetFilters}
              isFilterOpen={isFilterOpen}
              toggleFilter={toggleFilter}
            />
            
            {/* Bouton Nouveau produit */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 md:space-x-3 font-medium"
                >
                <Plus className="w-4 h-4 mr-2" />
                <span>Nouveau produit</span>
              </button>
            </div>

            {/* Products Table - Made responsive */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Produit
                            {sortField === 'name' && (
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('category')}
                        >
                          <div className="flex items-center">
                            Catégorie
                            {sortField === 'category' && (
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            )}
                          </div>
                        </th>
                        
                        <th 
                          className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('price')}
                        >
                          <div className="flex items-center">
                            Prix
                            {sortField === 'price' && (
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('stock')}
                        >
                          <div className="flex items-center">
                            Stock
                            {sortField === 'stock' && (
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="hidden lg:block">
                                {product.images && product.images.length > 0 ? (
                                  <ProductImage
                                    src={product.mainImageIndex !== undefined && product.mainImageIndex >= 0 && product.mainImageIndex < product.images.length ? product.images[product.mainImageIndex] : product.images[0]}
                                    alt={product.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-0 lg:ml-3">
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.reference}</div>
                                {product.slug && (
                                  <div className="text-xs text-blue-500 mt-0.5">
                                    <span className="font-medium">URL:</span> /product/{product.slug}
                                  </div>
                                )}
                                <div className="lg:hidden text-xs text-gray-400 mt-1">
                                  {product.category} • {product.stock} en stock
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.category}</div>
                            <div className="text-sm text-gray-500">{product.subCategory}</div>
                            {product.subSubCategory && (
                              <div className="text-sm text-gray-400">{product.subSubCategory}</div>
                            )}
                          </td>
                          
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.priceHT} €</div>
                            <div className="text-xs text-gray-500">{product.priceTTC} € TTC</div>
                          </td>
                          <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm ${product.stock < 5 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                                {product.stock}
                              </span>
                              {product.stock < 5 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">
                                  Faible
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                product.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.isAvailable ? 'Disponible' : 'Indisponible'}
                            </span>
                          </td>
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setQuickViewProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              title="Aperçu rapide"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                              className="text-gray-600 hover:text-gray-900 mr-3"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  setError('');
                                  const newProductId = await duplicateProduct(product.id);
                                  await loadProducts();
                                } catch (err: any) {
                                  setError(err.message || 'Erreur lors de la duplication du produit');
                                  console.error(err);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                              title="Dupliquer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination - Made responsive */}
              {filteredProducts.length > 0 && totalPages > 1 && (
                <div className="bg-white px-3 lg:px-6 py-3 border-t border-gray-200">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="w-full lg:w-auto">
                      <p className="text-sm text-gray-700 text-center lg:text-left">
                        <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                        {' - '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                        </span>
                        {' sur '}
                        <span className="font-medium">{filteredProducts.length}</span>
                        {' produits'}
                      </p>
                    </div>
                    <div className="flex justify-center w-full lg:w-auto">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {/* Bouton Précédent */}
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Précédent</span>
                          &larr;
                        </button>
                        
                        {/* Pages */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Logique pour afficher les pages autour de la page courante
                          let pageNum;
                          if (totalPages <= 5) {
                            // Moins de 5 pages, on les affiche toutes
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            // Près du début
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // Près de la fin
                            pageNum = totalPages - 4 + i;
                          } else {
                            // Au milieu
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${currentPage === pageNum
                                ? 'z-10 bg-black border-black text-white'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {/* Bouton Suivant */}
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Suivant</span>
                            &rarr;
                          </button>
                        </nav>
                      </div>
                    </div>
                </div>
              )}
              
              {/* Aucun résultat */}
              {filteredProducts.length === 0 && (
                <div className="bg-white p-8 text-center rounded-lg shadow-sm">
                  <div className="text-gray-500 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium">Aucun produit ne correspond à vos critères</h3>
                    <p className="mt-1">Essayez de modifier vos filtres ou d'effectuer une autre recherche.</p>
                    <button 
                      onClick={resetFilters}
                      className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
           
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Détails du produit</h3>
                <button 
                  onClick={() => setQuickViewProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {quickViewProduct.images && quickViewProduct.images.length > 0 ? (
                    <img 
                      src={quickViewProduct.mainImageIndex !== undefined && 
                           quickViewProduct.mainImageIndex >= 0 && 
                           quickViewProduct.mainImageIndex < quickViewProduct.images.length 
                           ? quickViewProduct.images[quickViewProduct.mainImageIndex] 
                           : quickViewProduct.images[0]} 
                      alt={quickViewProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                    <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
                      {quickViewProduct.images.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`${quickViewProduct.name} - ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded border-2 border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{quickViewProduct.name}</h4>
                    <p className="text-sm text-gray-500">Réf: {quickViewProduct.reference}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Prix HT</p>
                      <p className="text-lg font-medium">{quickViewProduct.priceHT} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prix TTC</p>
                      <p className="text-lg font-medium">{quickViewProduct.priceTTC} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className={`text-lg font-medium ${quickViewProduct.stock < 5 ? 'text-amber-600' : ''}`}>
                        {quickViewProduct.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          quickViewProduct.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {quickViewProduct.isAvailable ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {quickViewProduct.category}
                      </span>
                      {quickViewProduct.subCategory && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {quickViewProduct.subCategory}
                        </span>
                      )}
                      {quickViewProduct.subSubCategory && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {quickViewProduct.subSubCategory}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {quickViewProduct.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm text-gray-700 mt-1">{quickViewProduct.description}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 flex space-x-3">
                    <button
                      onClick={() => {
                        setEditingProduct(quickViewProduct);
                        setShowForm(true);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;