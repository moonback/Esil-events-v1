import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Product } from '../../types/Product';
import { getAllProducts, deleteProduct, seedDatabase, createProduct, updateProduct } from '../../services/productService';
import ProductForm from '../../components/ProductForm';
import AdminHeader from '../../components/admin/AdminHeader';
const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formError, setFormError] = useState<string>('');

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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
    const [error, setError] = useState(false);
    
    return (
      <div className="relative h-10 w-10">
        {!error ? (
          <img
            src={src}
            alt={alt}
            onError={() => setError(true)}
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12">
        

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
                {/* <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                  <Filter className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Filtres</span>
                </button> */}
              </div>
            </div>

            {/* Products Table - Made responsive */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Catégorie
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
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
                                    src={product.images[0]}
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
                            <div className="text-sm text-gray-400">{product.subSubCategory}</div>
                          </td>
                          <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.priceHT} €</div>
                            <div className="text-xs text-gray-500">{product.priceTTC} € TTC</div>
                          </td>
                          <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stock}
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
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                              className="text-gray-600 hover:text-gray-900 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
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
                          {Math.min(indexOfLastItem, filteredProducts.length)}
                        </span>
                        {' sur '}
                        <span className="font-medium">{filteredProducts.length}</span>
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
    </AdminLayout>
  );
};

export default AdminProducts;
