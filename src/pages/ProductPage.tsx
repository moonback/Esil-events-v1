import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, FileText, Plus, Minus, ShoppingCart, Star, Clock, Tag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductById, getSimilarProducts } from '../services/productService';
import { Product } from '../types/Product';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const { addToCart } = useCart();

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
        
        // Récupérer les produits similaires
        if (productData) {
          setLoadingSimilar(true);
          try {
            const similar = await getSimilarProducts(productData);
            setSimilarProducts(similar);
          } catch (error) {
            console.error('Error fetching similar products:', error);
          } finally {
            setLoadingSimilar(false);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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
  
    // Show confirmation message
    alert('Produit ajouté au devis !');
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
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
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
                  <img 
                    src={product.images[currentImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-contain transition-opacity duration-300"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Quantité</span>
                    </label>
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <button 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="p-2 md:p-3 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors shadow-sm hover:shadow"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 md:w-24 text-center border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 shadow-sm"
                        aria-label="Quantité"
                      />
                      <button 
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="p-2 md:p-3 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors shadow-sm hover:shadow"
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
                className="w-full bg-violet-600 text-white py-3 md:py-4 px-6 rounded-xl hover:bg-violet-700 transition-all duration-300 flex items-center justify-center space-x-3 text-base md:text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                aria-label="Ajouter au devis"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                <span>Ajouter au devis</span>
              </button>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-violet-600" />
                  <span>Description</span>
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{product.description}</p>
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
                        className="flex items-center justify-center p-3 md:p-4 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors shadow-sm hover:shadow-md"
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
                        className="flex items-center justify-center p-3 md:p-4 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors shadow-sm hover:shadow-md"
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
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {similarProducts.map((similarProduct) => (
                  <Link 
                    to={`/product/${similarProduct.id}`} 
                    key={similarProduct.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3]">
                      <img 
                        src={similarProduct.images?.[0] || DEFAULT_PRODUCT_IMAGE} 
                        alt={similarProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">{similarProduct.name}</h3>
                      <p className="text-violet-600 font-bold">
                        {similarProduct.priceTTC.toFixed(2)} € TTC/jour
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
