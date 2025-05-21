import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Package, Tag, ShoppingCart, Layers, Eye, ArrowUpDown, Copy, BarChart, Hash, FileText, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Product } from '../../types/Product';
import { getAllProducts, deleteProduct, createProduct, updateProduct, duplicateProduct, regenerateMissingSlugs } from '../../services/productService';
import { generateProductSeo } from '../../services/productSeoService';
import ProductForm from '../../components/ProductForm';
import AdminHeader from '../../components/admin/AdminHeader';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/images';
import ProductFilterPanel from '../../components/admin/ProductFilterPanel';
import { useAdminProductFilters } from '../../hooks/useAdminProductFilters';
import { StatCard } from '../../components/StatCard';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [seoModalProduct, setSeoModalProduct] = useState<Product | null>(null);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [seoGenerationError, setSeoGenerationError] = useState<string>('');
  
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

  const handleGenerateSeo = async (product: Product) => {
    try {
      setIsGeneratingSeo(true);
      setSeoGenerationError('');

      const result = await generateProductSeo({
        name: product.name,
        reference: product.reference,
        category: product.category,
        subCategory: product.subCategory,
        subSubCategory: product.subSubCategory,
        description: product.description,
        priceHT: product.priceHT,
        colors: product.colors,
        technicalSpecs: product.technicalSpecs
      });

      if (result.error) {
        setSeoGenerationError(result.error);
        return;
      }

      if (result.seoContent && result.seoContent.seo_title && result.seoContent.seo_description && result.seoContent.seo_keywords) {
        const seoContent = result.seoContent;
        // Mettre à jour le produit avec le nouveau contenu SEO
        await updateProduct(product.id, {
          ...product,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.seo_description,
          seo_keywords: seoContent.seo_keywords
        });

        // Recharger les produits pour afficher les mises à jour
        await loadProducts();
        
        // Mettre à jour le produit dans le modal
        setSeoModalProduct(prev => prev ? {
          ...prev,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.seo_description,
          seo_keywords: seoContent.seo_keywords
        } : null);
      } else {
        setSeoGenerationError('Le contenu SEO généré est incomplet');
      }
    } catch (err: any) {
      setSeoGenerationError(err.message || 'Une erreur est survenue lors de la génération du SEO');
      console.error('Erreur lors de la génération du SEO:', err);
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="space-y-6 mt-12">
        {/* Boutons d'action et sélecteur de vue */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title="Vue en cards"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title="Vue en tableau"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={async () => {
                    try {
                      setError('');
                      const result = await regenerateMissingSlugs();
                      
                      const successMessage = document.createElement('div');
                      successMessage.className = `fixed bottom-4 right-4 ${
                        result.success 
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400'
                      } border-l-4 p-4 rounded-lg shadow-lg z-50 animate-fade-in`;
                      successMessage.innerHTML = result.message;
                      document.body.appendChild(successMessage);
                      
                      setTimeout(() => {
                        if (document.body.contains(successMessage)) {
                          document.body.removeChild(successMessage);
                        }
                      }, 3000);
                      
                      await loadProducts();
                    } catch (err: any) {
                      setError(`Erreur lors de la régénération des slugs: ${err.message || 'Erreur inconnue'}`);
                      console.error('Erreur de régénération des slugs:', err);
                    }
                  }}
                  className="group relative px-5 py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 dark:from-blue-600 dark:via-blue-700 dark:to-cyan-600 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] dark:hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center space-x-2 font-medium"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Tag className="w-4 h-4 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Régénérer les slugs</span>
                </button>
                
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="group relative px-5 py-2.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 dark:from-violet-600 dark:via-purple-600 dark:to-fuchsia-600 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] dark:hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] flex items-center justify-center space-x-2 font-medium"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Plus className="w-4 h-4 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Nouveau produit</span>
                </button>
              </div>
            </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Produits"
            value={totalProducts}
            icon={Package}
            iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
            trendValue={((totalProducts - products.filter(p => new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length) / 
              (products.filter(p => new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length || 1)) * 100}
            trendData={Array.from({ length: 10 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - (9 - i));
              return products.filter(p => new Date(p.createdAt) <= date).length;
            })}
            trendColor="bg-indigo-500"
          />

          <StatCard
            title="Mots-clés par produit"
            value={(products.reduce((acc, product) => {
              const keywords = product.seo_keywords ? product.seo_keywords.split(',').filter(k => k.trim()).length : 0;
              return acc + keywords;
            }, 0) / (products.length || 1)).toFixed(1)}
            icon={Hash}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            trendValue={((products.reduce((acc, product) => {
              const keywords = product.seo_keywords ? product.seo_keywords.split(',').filter(k => k.trim()).length : 0;
              return acc + keywords;
            }, 0) / (products.length || 1)) - 
            (products.filter(p => new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1))
              .reduce((acc, product) => {
                const keywords = product.seo_keywords ? product.seo_keywords.split(',').filter(k => k.trim()).length : 0;
                return acc + keywords;
              }, 0) / (products.filter(p => new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length || 1))) * 100}
            trendData={Array.from({ length: 10 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - (9 - i));
              const productsUntilDate = products.filter(p => new Date(p.createdAt) <= date);
              return productsUntilDate.reduce((acc, product) => {
                const keywords = product.seo_keywords ? product.seo_keywords.split(',').filter(k => k.trim()).length : 0;
                return acc + keywords;
              }, 0) / (productsUntilDate.length || 1);
            })}
            trendColor="bg-purple-500"
          />

          <StatCard
            title="Indisponibles"
            value={unavailableProducts}
            icon={ShoppingCart}
            iconBgColor="bg-red-100 dark:bg-red-900/30"
            iconColor="text-red-600 dark:text-red-400"
            trendValue={((unavailableProducts - products.filter(p => !p.isAvailable && new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length) / 
              (products.filter(p => !p.isAvailable && new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length || 1)) * 100}
            trendData={Array.from({ length: 10 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - (9 - i));
              return products.filter(p => !p.isAvailable && new Date(p.createdAt) <= date).length;
            })}
            trendColor="bg-red-500"
          />

          <StatCard
            title="Référencés sur Google"
            value={products.filter(p => p.seo_title && p.seo_description).length}
            icon={Search}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            trendValue={((products.filter(p => p.seo_title && p.seo_description).length - 
              products.filter(p => p.seo_title && p.seo_description && new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length) / 
              (products.filter(p => p.seo_title && p.seo_description && new Date(p.createdAt) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length || 1)) * 100}
            trendData={Array.from({ length: 10 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - (9 - i));
              return products.filter(p => p.seo_title && p.seo_description && new Date(p.createdAt) <= date).length;
            })}
            trendColor="bg-blue-500"
          />
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
            
            

            {/* Contenu principal avec vue conditionnelle */}
            <div className="space-y-8">
              {viewMode === 'cards' ? (
                // Vue en cards avec design amélioré
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3">
                  {currentItems.map((product) => (
                    <div 
                      key={product.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group relative"
                    >
                      {/* Image du produit avec overlay amélioré */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <>
                            <img
                              src={product.mainImageIndex !== undefined && 
                                   product.mainImageIndex >= 0 && 
                                   product.mainImageIndex < product.images.length 
                                   ? product.images[product.mainImageIndex] 
                                   : product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Badges de statut et stock améliorés */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm backdrop-blur-sm ${
                              product.isAvailable
                                ? 'bg-green-100/90 dark:bg-green-900/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                                : 'bg-red-100/90 dark:bg-red-900/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            {product.isAvailable ? 'Disponible' : 'Indisponible'}
                          </span>
                         
                        </div>

                      </div>

                      {/* Informations du produit améliorées */}
                      <div className="p-3">
                        <div className="mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {product.reference}
                          </p>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-1">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {product.priceHT.toFixed(2)}€
                                </p>
                                <span className="text-sm text-gray-500 dark:text-gray-400">€ HT</span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <p className="text-base font-medium text-purple-600 dark:text-purple-400">
                                {product.priceTTC.toFixed(2)}€
                                </p>
                                <span className="text-xs text-purple-500 dark:text-purple-400">€ TTC</span>
                              </div>
                            </div>
                            
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800">
                              {product.category}
                            </span>
                            {product.subCategory && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full border border-purple-100 dark:border-purple-800">
                                {product.subCategory}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions améliorées */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setQuickViewProduct(product)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all duration-200"
                              title="Aperçu rapide"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
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
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-200"
                              title="Dupliquer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setSeoModalProduct(product)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200"
                              title="Informations SEO"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Vue en tableau
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th 
                            className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                            className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
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
                            className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('price')}
                          >
                            <div className="flex items-center">
                              Prix
                              {sortField === 'price' && (
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                              )}
                            </div>
                          </th>
                          
                          <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentItems.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
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
                                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[40ch]">{product.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[40ch]">{product.reference}</div>
                                  {product.slug && (
                                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 truncate max-w-[40ch]">
                                      <span className="font-medium ">URL:</span> /product/{product.slug}
                                    </div>
                                  )}
                                  <div className="lg:hidden text-xs text-gray-400 mt-1">
                                    {product.category} • {product.stock} en stock
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{product.category}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{product.subCategory}</div>
                              {product.subSubCategory && (
                                <div className="text-sm text-gray-400">{product.subSubCategory}</div>
                              )}
                            </td>
                            <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{product.priceHT} €</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{product.priceTTC} € TTC</div>
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
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => setQuickViewProduct(product)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  title="Aperçu rapide"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowForm(true);
                                  }}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
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
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Dupliquer"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setSeoModalProduct(product)}
                                  className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                                  title="Informations SEO"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 0 && totalPages > 1 && (
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Affichage de <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                      </span>{' '}
                      sur <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> produits
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === pageNum
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Message aucun résultat */}
              {filteredProducts.length === 0 && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun produit ne correspond à vos critères</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Essayez de modifier vos filtres ou d'effectuer une autre recherche.</p>
                    <button 
                      onClick={resetFilters}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
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

      {/* Modal SEO */}
      {seoModalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Informations SEO</h3>
                <button 
                  onClick={() => setSeoModalProduct(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{seoModalProduct.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Réf: {seoModalProduct.reference}</p>
                </div>

                {seoGenerationError && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    {seoGenerationError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Titre SEO
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {seoModalProduct.seo_title || 'Non défini'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Méta-description
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {seoModalProduct.seo_description || 'Non définie'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mots-clés SEO
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      {seoModalProduct.seo_keywords ? (
                        <div className="flex flex-wrap gap-2">
                          {seoModalProduct.seo_keywords.split(',').map((keyword, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun mot-clé défini</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL du produit
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {seoModalProduct.slug ? `/product/${seoModalProduct.slug}` : 'URL non définie'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={() => handleGenerateSeo(seoModalProduct)}
                    disabled={isGeneratingSeo}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingSeo ? 'animate-spin' : ''}`} />
                    {isGeneratingSeo ? 'Génération en cours...' : 'Régénérer le SEO'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(seoModalProduct);
                      setShowForm(true);
                      setSeoModalProduct(null);
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier manuellement
                  </button>
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