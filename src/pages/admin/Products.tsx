import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Package, Tag, ShoppingCart, Layers, Eye, ArrowUpDown } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Product } from '../../types/Product';
import { getAllProducts, deleteProduct, createProduct, updateProduct } from '../../services/productService';
import ProductForm from '../../components/ProductForm';
import AdminHeader from '../../components/admin/AdminHeader';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/images';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formError, setFormError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du produit');
      console.error(err);
    }
  };

  // Get unique categories
  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products by search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'Tous' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'price') {
      comparison = a.priceHT - b.priceHT;
    } else if (sortField === 'stock') {
      comparison = a.stock - b.stock;
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

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
          <div className="bg-white p-6 rounded-lg shadow-sm transform transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setFormError('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
            {formError && (
              <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md animate-fade-in">
                {formError}
              </div>
            )}
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
        ) : (
          <>
            {/* Filters and Search - Made responsive */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
              
              {/* Category Filter */}
              <div className="lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category === 'Tous' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Nouveau produit</span>
                </button>
              </div>
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
              {totalPages > 1 && (
                <div className="bg-white px-3 lg:px-6 py-3 border-t border-gray-200">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="w-full lg:w-auto">
                      <p className="text-sm text-gray-700 text-center lg:text-left">
                        <span className="font-medium">{indexOfFirstItem + 1}</span>
                        {' - '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, sortedProducts.length)}
                        </span>
                        {' sur '}
                        <span className="font-medium">{sortedProducts.length}</span>
                      </p>
                    </div>
                    <div className="flex justify-center w-full lg:w-auto">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Précédent</span>
                          &larr;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            const distance = Math.abs(page - currentPage);
                            return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                          })
                          .map((page, index, array) => {
                            if (index > 0 && array[index - 1] !== page - 1) {
                              return [
                                <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>,
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${currentPage === page
                                    ? 'z-10 bg-black border-black text-white'
                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              ];
                            }
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${currentPage === page
                                  ? 'z-10 bg-black border-black text-white'
                                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Suivant</span>
                            &rarr;
                          </button>
                        </nav>
                      </div>
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