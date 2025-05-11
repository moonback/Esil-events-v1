import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, FileText, Plus, Minus, ShoppingCart, Star, Clock, Tag, Truck, Check, ZoomIn, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { getProductById, getSimilarProducts } from '../services/productService';
import { Product } from '../types/Product';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import SEO from '../components/SEO';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [sortMethod, setSortMethod] = useState<'relevance' | 'price' | 'newest'>('relevance');
  const [showToast, setShowToast] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const productData = await getProductById(id);
        setProduct(productData);
        
        // Vérifier et définir l'index de l'image principale
        if (productData?.images && productData.images.length > 0) {
          if (productData.mainImageIndex !== undefined && 
              productData.mainImageIndex >= 0 && 
              productData.mainImageIndex < productData.images.length) {
            setCurrentImageIndex(productData.mainImageIndex);
          } else {
            setCurrentImageIndex(0); // Utiliser la première image par défaut
          }
        }

        if (productData?.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        
        // Récupérer les produits similaires séparément pour ne pas bloquer l'affichage du produit principal
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  // Fonction pour charger les produits similaires avec différentes méthodes de tri
  const fetchSimilarProducts = async (sortByMethod: 'relevance' | 'price' | 'newest' = sortMethod) => {
    if (!product) return;
    
    setSortMethod(sortByMethod);
    setLoadingSimilar(true);
    try {
      // Utilisation des options améliorées pour les produits similaires
      const similar = await getSimilarProducts(product, 8, {
        prioritizeCategory: true,
        excludeCurrentProduct: true,
        includeAttributes: ['colors', 'technicalSpecs', 'price'],
        sortBy: sortByMethod
      });
      setSimilarProducts(similar);
      console.log(`Similar products loaded (sorted by ${sortByMethod}):`, similar.length);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Effet pour charger les produits similaires quand le produit change
  useEffect(() => {
    if (product) {
      fetchSimilarProducts();
    }
  }, [product]);

  const handlePrevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images[0] : DEFAULT_PRODUCT_IMAGE,
      quantity,
      color: selectedColor,
      priceTTC: product.priceTTC // Add the price
    });
  
    // Show toast notification
    setShowToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 shadow-md"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Produit non trouvé</h2>
        <Link to="/" className="px-6 py-3 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* SEO Component */}
      {product && (
        <SEO 
          title={product.seo_title || product.name}
          description={product.seo_description || product.description.substring(0, 160)}
          keywords={product.seo_keywords || ''}
          image={product.images && product.images.length > 0 ? product.images[currentImageIndex] : DEFAULT_PRODUCT_IMAGE}
        />
      )}
      
      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-3 text-sm bg-white px-4 py-2 rounded-lg shadow-sm">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-600 hover:text-violet-600 transition-colors duration-200 font-medium">
                  Accueil
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link 
                    to={`/products/${product.category}`} 
                    className="ml-3 text-gray-600 hover:text-violet-600 transition-colors duration-200 font-medium"
                  >
                    {typeof product.category === 'string' 
                      ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
                      : product.category[0]}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="ml-3 text-violet-600 font-medium">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="space-y-10  pt-10">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            {/* Product Images */}
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
              <div className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-xl">
                {product.images && product.images.length > 0 ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={product.images[currentImageIndex]} 
                      alt={product.name} 
                      className="w-full h-full object-contain transition-opacity duration-300 cursor-zoom-in"
                      onClick={() => setZoomOpen(true)}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => setZoomOpen(true)}
                        className="bg-violet-600/80 text-white p-3 rounded-full hover:bg-violet-700 transition-all duration-300 transform hover:scale-110"
                        aria-label="Zoomer l'image"
                      >
                        <ZoomIn className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={DEFAULT_PRODUCT_IMAGE} 
                    alt={product.name} 
                    className="w-full h-full object-contain"
                  />
                )}
                
                {product.images && product.images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 md:p-3 shadow-lg hover:bg-violet-50 transition-colors"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-violet-600" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 md:p-3 shadow-lg hover:bg-violet-50 transition-colors"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-violet-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="mt-4 md:mt-6 grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                        currentImageIndex === index 
                          ? 'ring-2 ring-violet-600 scale-105 z-10' 
                          : 'hover:ring-1 hover:ring-violet-300'
                      }`}
                      aria-label={`Voir image ${index + 1}`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 md:space-y-6 ">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <p className="mt-1 text-gray-500 flex items-center text-sm">
                  <Tag className="w-3 h-3 mr-1" />
                  <span>Réf: {product.reference}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg transition-shadow hover:shadow-md">
                  <p className="text-xs sm:text-sm text-gray-500">Prix HT / jour</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{product.priceHT.toFixed(2)} €</p>
                </div>
                <div className="bg-violet-50 p-4 md:p-6 rounded-xl shadow-lg transition-shadow hover:shadow-md">
                  <p className="text-xs sm:text-sm text-violet-600">Prix TTC / jour</p>
                  <p className="text-xl sm:text-2xl font-bold text-violet-600">{product.priceTTC.toFixed(2)} €</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {/* Quantity Selector */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-violet-600" />
                      <span>Quantité</span>
                    </label>
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <button 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="p-2 md:p-3 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <input 
                        type="number" 
                        min="1"
                        max="999" 
                        value={quantity} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1 && val <= 999) {
                            setQuantity(val);
                          }
                        }}
                        className="w-20 md:w-28 text-center border-2 border-violet-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 shadow-sm text-lg font-medium"
                        aria-label="Quantité"
                      />
                      <button 
                        onClick={() => setQuantity(prev => Math.min(999, prev + 1))}
                        className="p-2 md:p-3 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Color Selector */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3 flex items-center">
                        <Info className="w-4 h-4 mr-1" />
                        <span>Couleur</span>
                      </label>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-2 md:px-4 md:py-2 text-sm rounded-lg transition-all shadow-sm ${
                              selectedColor === color 
                                ? 'bg-violet-600 text-white shadow-md transform scale-105' 
                                : 'bg-violet-50 text-gray-700 hover:bg-violet-100 hover:shadow'
                            }`}
                            aria-label={`Sélectionner la couleur ${color}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 text-white py-3 md:py-4 px-6 rounded-xl 
                hover:from-violet-700 hover:to-violet-800 transition-all duration-300 
                flex items-center justify-center space-x-3 text-base md:text-lg font-semibold
                shadow-lg hover:shadow-xl transform hover:-translate-y-1 
                active:transform active:translate-y-0 active:shadow-md
                relative overflow-hidden group"
                aria-label="Ajouter au devis"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
                  <span>Ajouter au devis</span>
                </div>
              </button>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-violet-600" />
                  <span>Description</span>
                </h2>
                <div className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {product.description.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-3 last:mb-0">{paragraph}</p>
                    ) : null
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-violet-600" />
                  <span>Caractéristiques techniques</span>
                </h2>
                <dl className="space-y-3 md:space-y-4">
                  {Object.entries(product.technicalSpecs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0">
                      <dt className="text-gray-600 font-medium text-sm md:text-base">{key}</dt>
                      <dd className="col-span-1 sm:col-span-2 text-gray-900 text-sm md:text-base">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Documentation and Video Links */}
              {(product.technicalDocUrl || product.videoUrl) && (
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-violet-600" />
                    <span>Documentation & Présentation</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.technicalDocUrl && (
                      <a 
                        href={product.technicalDocUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 md:p-4 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 duration-300"
                      >
                        <FileText className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                        <span className="font-medium">Documentation Technique</span>
                      </a>
                    )}
                    {product.videoUrl && (
                      <a 
                        href={product.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 md:p-4 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span className="font-medium">Vidéo de Présentation</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* SEO Keywords Section - Only visible for authenticated users */}
              {user && (product.seo_keywords || product.seo_title || product.seo_description) && (
                <div className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                        <path d="M7 7h.01"/>
                      </svg>
                      <span>Informations SEO</span>
                    </h2>
                    <span className="text-xs px-2 py-1 bg-violet-100 text-violet-800 rounded-full font-medium">
                      Accès restreint
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {product.seo_title && (
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-violet-100">
                        <h3 className="text-sm font-medium text-violet-600 mb-1">Titre SEO</h3>
                        <p className="text-gray-700">{product.seo_title}</p>
                      </div>
                    )}
                    
                    {product.seo_description && (
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-violet-100">
                        <h3 className="text-sm font-medium text-violet-600 mb-1">Description SEO</h3>
                        <p className="text-gray-700">{product.seo_description}</p>
                      </div>
                    )}
                    
                    {product.seo_keywords && (
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-violet-100">
                        <h3 className="text-sm font-medium text-violet-600 mb-2">Mots-clés SEO</h3>
                        <div className="flex flex-wrap gap-2">
                          {product.seo_keywords.split(',').map((keyword, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800 hover:bg-violet-200 transition-colors duration-200 cursor-default"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-violet-700 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in-up z-50 transform hover:scale-105 transition-transform duration-300">
              <div className="bg-white/20 p-2 rounded-full">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-medium">Produit ajouté au devis avec succès !</span>
            </div>
          )}
          
          {/* Image Zoom Modal */}
          {zoomOpen && product.images && product.images.length > 0 && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 md:p-8">
              <div className="relative w-full h-full flex flex-col">
                <div className="absolute top-4 left-4 bg-white/10 text-white/80 px-3 py-1 rounded-lg text-sm">
                  <span>Mode zoom interactif</span>
                </div>
                <button 
                  onClick={() => setZoomOpen(false)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300 z-10"
                  aria-label="Fermer le zoom"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {/* Utilisation du composant ZoomableImage pour le zoom interactif */}
                <ZoomableImage 
                  src={product.images[currentImageIndex]} 
                  alt={product.name}
                  fallbackSrc={DEFAULT_PRODUCT_IMAGE}
                />
                
                {product.images.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    <button 
                      onClick={() => setCurrentImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-white/70 flex items-center px-3">
                      {currentImageIndex + 1} / {product.images.length}
                    </span>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
                
                {/* <div className="absolute bottom-4 left-4 right-4 text-center text-white/60 text-xs md:text-sm bg-black/30 p-2 rounded-lg">
                  <p>Utilisez la molette de la souris ou les boutons pour zoomer • Cliquez et déplacez pour naviguer dans l'image zoomée</p>
                </div> */}
              </div>
            </div>
          )}
          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="pt-12 pb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Star className="w-6 h-6 mr-2 text-violet-600" />
                    Produits similaires
                  </h2>
                  <p className="text-gray-600 mt-1">D'autres produits qui pourraient vous intéresser</p>
                </div>
                {similarProducts.length > 4 && (
                  <Link 
                    to={`/products/${product.category}`}
                    className="text-violet-600 hover:text-violet-800 font-medium flex items-center transition-colors hover:scale-105 transform duration-200 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-lg"
                  >
                    Voir plus <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </div>
              
              {/* Filtres pour les produits similaires */}
              <div className="mb-6 flex flex-wrap gap-2">
                <button 
                  onClick={() => fetchSimilarProducts('relevance')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${sortMethod === 'relevance' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Pertinence
                </button>
                <button 
                  onClick={() => fetchSimilarProducts('price')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${sortMethod === 'price' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Prix croissant
                </button>
                <button 
                  onClick={() => fetchSimilarProducts('newest')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${sortMethod === 'newest' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Nouveautés
                </button>
              </div>
              
              {/* Carrousel de produits similaires avec animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 transition-all duration-500">
                {similarProducts.map((similarProduct, index) => {
                  // Déterminer les points communs avec le produit principal
                  const sameCategory = similarProduct.category === product.category;
                  const sameSubCategory = similarProduct.subCategory === product.subCategory;
                  const sameSubSubCategory = similarProduct.subSubCategory === product.subSubCategory;
                  
                  // Vérifier si les produits ont des couleurs en commun
                  const commonColors = product.colors && similarProduct.colors ? 
                    product.colors.filter(color => similarProduct.colors?.includes(color)) : [];
                  
                  // Calculer la différence de prix en pourcentage
                  const priceDiff = product.priceTTC > 0 ? 
                    Math.round((similarProduct.priceTTC - product.priceTTC) / product.priceTTC * 100) : 0;
                  
                  return (
                    <Link 
                      to={`/product/${similarProduct.id}`} 
                      key={similarProduct.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full group"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                        <img 
                          src={similarProduct.mainImageIndex !== undefined && similarProduct.images?.[similarProduct.mainImageIndex] 
                            ? similarProduct.images[similarProduct.mainImageIndex] 
                            : similarProduct.images?.[0] || DEFAULT_PRODUCT_IMAGE} 
                          alt={similarProduct.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-2"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                          }}
                        />
                        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start">
                          {similarProduct.category && (
                            <span className={`text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-md feedback-message-enter ${sameCategory ? 'bg-violet-600' : 'bg-gray-600'}`}>
                              {typeof similarProduct.category === 'string' 
                                ? similarProduct.category.charAt(0).toUpperCase() + similarProduct.category.slice(1)
                                : similarProduct.category[0]}
                            </span>
                          )}
                          {!similarProduct.isAvailable && (
                            <span className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-md ml-auto feedback-message-enter">
                              Indisponible
                            </span>
                          )}
                          {similarProduct.stock > 0 && similarProduct.stock <= 5 && (
                            <span className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-md ml-auto feedback-message-enter">
                              Stock limité
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                          {similarProduct.name}
                        </h3>
                        
                        {/* Badges pour les caractéristiques communes */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {/* {sameSubCategory && (
                            <span className="bg-violet-100 text-violet-800 text-xs px-2 py-0.5 rounded-md">
                              Même sous-catégorie
                            </span>
                          )} */}
                          {commonColors.length > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-md">
                              {commonColors.length} couleur{commonColors.length > 1 ? 's' : ''} commune{commonColors.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        {similarProduct.subCategory && (
                          <div className="mt-1 mb-2 text-xs text-gray-500 flex items-center">
                            <Tag className="w-3 h-3 mr-1 text-violet-400" />
                            {typeof similarProduct.subCategory === 'string' 
                              ? similarProduct.subCategory.charAt(0).toUpperCase() + similarProduct.subCategory.slice(1)
                              : similarProduct.subCategory[0]}
                            {similarProduct.subSubCategory && ` › ${similarProduct.subSubCategory}`}
                          </div>
                        )}
                      
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500">Prix TTC / jour</p>
                            <p className="text-violet-600 font-bold text-lg">
                              {similarProduct.priceTTC.toFixed(2)} €
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            {similarProduct.stock > 0 && (
                              <span className="text-xs text-green-600 mb-1 flex items-center">
                                <Check className="w-3 h-3 mr-1" />
                                Stock: {similarProduct.stock}
                              </span>
                            )}
                            <div className="bg-violet-50 text-violet-700 p-2 rounded-full group-hover:bg-violet-100 transition-colors transform group-hover:scale-110 duration-200 shadow-sm group-hover:shadow-md">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
              
              {loadingSimilar && (
                <div className="flex justify-center mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  
};

// Composant ZoomableImage pour le zoom interactif
const ZoomableImage: React.FC<{
  src: string;
  alt: string;
  fallbackSrc: string;
}> = ({ src, alt, fallbackSrc }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(false);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Réinitialiser le zoom et la position
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Gérer le zoom avant
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 5)); // Limite max de zoom: 5x
  };
  
  // Gérer le zoom arrière
  const zoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1); // Limite min de zoom: 1x
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 }); // Réinitialiser la position si on revient au zoom initial
      }
      return newScale;
    });
  };
  
  // Gérer le début du déplacement
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  
  // Gérer le déplacement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };
  
  // Gérer la fin du déplacement
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Gérer le déplacement par toucher (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
      e.preventDefault(); // Empêcher le défilement de la page
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Gérer le zoom avec la molette de la souris
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };
  
  // Gérer les erreurs de chargement d'image
  const handleImageError = () => {
    setError(true);
  };
  
  // Ajouter/supprimer les écouteurs d'événements globaux
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);
  
  // Empêcher le défilement de la page lorsque le conteneur est survolé
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    container.addEventListener('wheel', preventScroll, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', preventScroll);
    };
  }, []);
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
      <div className="flex justify-center mb-4 space-x-3">
        <button 
          onClick={zoomOut}
          disabled={scale === 1}
          className={`bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300 ${scale === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Zoom arrière"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button 
          onClick={resetZoom}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          className={`bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300 ${scale === 1 && position.x === 0 && position.y === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Réinitialiser le zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
            <path d="M9 12h6"></path>
          </svg>
        </button>
        <button 
          onClick={zoomIn}
          disabled={scale >= 5}
          className={`bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300 ${scale >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Zoom avant"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className={`relative flex items-center justify-center overflow-hidden max-w-full max-h-[70vh] ${scale > 1 ? 'cursor-move' : 'cursor-zoom-in'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onClick={() => scale === 1 && zoomIn()}
      >
        <div 
          className="transition-transform duration-100"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
        >
          <img 
            src={error ? fallbackSrc : src} 
            alt={alt} 
            className="max-h-[70vh] max-w-full object-contain select-none"
            onError={handleImageError}
            draggable="false"
          />
        </div>
      </div>
      
      <div className="text-white/60 text-sm mt-4 text-center">
        <p className="mb-1">Zoom: {Math.round(scale * 100)}%</p>
        <p className="text-xs">
          {scale > 1 ? "Cliquez et déplacez pour naviguer dans l'image" : "Cliquez sur l'image ou utilisez les boutons pour zoomer"}
        </p>
      </div>
    </div>
  );
};

export default ProductPage;
