import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Tag, Eye } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { getAllPackages, deleteProduct, createProduct, updateProduct } from '../../services/productService';
import PackageForm from '../../components/PackageForm';
import AdminHeader from '../../components/admin/AdminHeader';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/images';
import { Package as PackageType } from '../../types/Package';

const AdminPackages: React.FC = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formError, setFormError] = useState<string>('');
  const [quickViewPackage, setQuickViewPackage] = useState<PackageType | null>(null);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await getAllPackages();
      setPackages(data);
    } catch (err) {
      setError('Erreur lors du chargement des packages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce package ?')) {
      return;
    }

    try {
      await deleteProduct(id);
      setPackages(packages.filter(p => p.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du package');
      console.error(err);
    }
  };

  // Filter packages by search term
  const filteredPackages = packages.filter(pkg => {
    return pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.reference.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);

  // Statistics
  const totalPackages = packages.length;
  const totalProducts = packages.reduce((sum, pkg) => sum + (pkg.items?.length || 0), 0);
  const averageDiscount = packages.length > 0 
    ? packages.reduce((sum, pkg) => sum + (pkg.discountPercentage || 0), 0) / packages.length
    : 0;

  const handleCreateSubmit = async (packageData: any) => {
    try {
      setFormError('');
      // Utiliser le service de création de produit existant car un package est un type de produit
      await createProduct(packageData);
      setShowForm(false);
      setEditingPackage(null);
      loadPackages(); // Recharger la liste des packages
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la création du package');
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (packageData: any) => {
    if (!editingPackage) return;
    
    try {
      setFormError('');
      // Utiliser le service de mise à jour de produit existant
      await updateProduct(editingPackage.id, packageData);
      setShowForm(false);
      setEditingPackage(null);
      loadPackages(); // Recharger la liste des packages
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la mise à jour du package');
      console.error(err);
    }
  };

  const PackageImage = ({ src, alt }: { src: string; alt: string }) => {
    const [imgError, setImgError] = useState(false);
    
    return (
      <div className="relative h-10 w-10">
        {!imgError ? (
          <img
            src={src || DEFAULT_PRODUCT_IMAGE}
            alt={alt}
            onError={() => setImgError(true)}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Packages</p>
                <p className="text-2xl font-semibold">{totalPackages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mr-4">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Produits inclus</p>
                <p className="text-2xl font-semibold">{totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Remise moyenne</p>
                <p className="text-2xl font-semibold">{averageDiscount.toFixed(1)}%</p>
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
          <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 ease-in-out max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingPackage ? 'Modifier le package' : 'Nouveau package'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingPackage(null);
                  setFormError('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                &times;
              </button>
            </div>
            
            {formError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {formError}
              </div>
            )}
            
            <PackageForm
              initialData={editingPackage || undefined}
              onSubmit={editingPackage ? handleUpdateSubmit : handleCreateSubmit}
              isLoading={loading}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <h2 className="text-xl font-bold text-gray-800">Packages</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingPackage(null);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouveau package
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-500">Chargement des packages...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  {searchTerm ? 'Aucun package ne correspond à votre recherche.' : 'Aucun package n\'a été créé.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Package
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Référence
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produits inclus
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remise
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix HT
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix TTC
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <PackageImage
                              src={pkg.images && pkg.images.length > 0 ? pkg.images[pkg.mainImageIndex || 0] : ''}
                              alt={pkg.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.items?.length || 0} produits
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.discountPercentage ? `${pkg.discountPercentage.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.priceHT.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.priceTTC.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setQuickViewPackage(pkg)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Aperçu rapide"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingPackage(pkg);
                                setShowForm(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Modifier"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(pkg.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredPackages.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredPackages.length}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Précédent</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Suivant</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick View Modal */}
        {quickViewPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">{quickViewPackage.name}</h3>
                <button
                  onClick={() => setQuickViewPackage(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Informations générales</h4>
                    <div className="bg-gray-50 p-4 rounded-md space-y-2">
                      <p><span className="font-medium">Référence:</span> {quickViewPackage.reference}</p>
                      <p><span className="font-medium">Prix HT:</span> {quickViewPackage.priceHT.toFixed(2)} €</p>
                      <p><span className="font-medium">Prix TTC:</span> {quickViewPackage.priceTTC.toFixed(2)} €</p>
                      <p><span className="font-medium">Remise:</span> {quickViewPackage.discountPercentage ? `${quickViewPackage.discountPercentage.toFixed(1)}%` : '-'}</p>
                      <p><span className="font-medium">Prix original HT:</span> {quickViewPackage.originalTotalPriceHT?.toFixed(2)} €</p>
                      <p><span className="font-medium">Prix original TTC:</span> {quickViewPackage.originalTotalPriceTTC?.toFixed(2)} €</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {quickViewPackage.description || <span className="text-gray-500 italic">Aucune description</span>}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Produits inclus</h4>
                  {quickViewPackage.items && quickViewPackage.items.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <ul className="space-y-2">
                        {quickViewPackage.items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.productId} x{item.quantity}</span>
                            <span className="text-sm">
                              {item.isRequired ? (
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">Obligatoire</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">Optionnel</span>
                              )}
                              {item.isCustomizable && (
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs ml-1">Personnalisable</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md text-gray-500 italic">
                      Aucun produit inclus
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Options de personnalisation</h4>
                  {quickViewPackage.options && quickViewPackage.options.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md space-y-4">
                      {quickViewPackage.options.map((option, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium">{option.name}</h5>
                            {option.isRequired ? (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">Obligatoire</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">Optionnel</span>
                            )}
                          </div>
                          {option.description && <p className="text-sm text-gray-600 mt-1">{option.description}</p>}
                          
                          <div className="mt-2">
                            <h6 className="text-xs font-medium text-gray-700 mb-1">Choix disponibles:</h6>
                            <ul className="space-y-1">
                              {option.choices.map((choice, choiceIndex) => (
                                <li key={choiceIndex} className="text-sm flex justify-between items-center">
                                  <span>{choice.name}</span>
                                  <span className={choice.priceAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {choice.priceAdjustment >= 0 ? '+' : ''}{choice.priceAdjustment.toFixed(2)} €
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md text-gray-500 italic">
                      Aucune option de personnalisation
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setQuickViewPackage(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPackages;