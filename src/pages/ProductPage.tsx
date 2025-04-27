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
    <div className="pt-32 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-8xl mx-auto">
        {/* Breadcrumb - enhanced with better spacing and styling */}
        <div className="mb-10">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
          {/* Product Images - enhanced with zoom effect and better shadows */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1">
            <div className="relative group overflow-hidden rounded-lg">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.name} 
                  className="w-full h-96 object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                  }}
                />
              ) : (
                <img 
                  src={DEFAULT_PRODUCT_IMAGE} 
                  alt={product.name} 
                  className="w-full h-96 object-contain rounded-lg"
                />
              )}
              
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6 text-violet-600" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6 text-violet-600" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails - enhanced with active state */}
            {product.images && product.images.length > 1 && (
              <div className="mt-6 flex overflow-x-auto py-2 space-x-4 scrollbar-hide">
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${currentImageIndex === index ? 'border-violet-600 scale-105' : 'border-transparent hover:border-gray-300'}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - enhanced with better visual hierarchy and animations */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1">
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
                  <div className="flex items-center mb-6">
                    <Tag className="w-4 h-4 text-violet-600 mr-2" />
                    <p className="text-gray-500 text-sm font-medium">Réf: {product.reference}</p>
                  </div>
                </div>
                <div className="flex items-center bg-violet-50 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-violet-600 mr-1" />
                  <span className="text-xs font-medium text-violet-600">Location journalière</span>
                </div>
              </div>
              
              {/* Price section - enhanced with badges and animations */}
              <div className="flex items-center space-x-10 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:bg-gray-100 transform hover:-translate-y-0.5">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Prix HT / jour</p>
                  <p className="text-2xl font-bold text-gray-800">{product.priceHT.toFixed(2)} €</p>
                </div>
                <div className="bg-violet-50 p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:bg-violet-100 transform hover:-translate-y-0.5">
                  <p className="text-xs text-violet-600 mb-1 uppercase tracking-wider">Prix TTC / jour</p>
                  <p className="text-2xl font-bold text-violet-600">{product.priceTTC.toFixed(2)} €</p>
                </div>
              </div>
              
              <div className="flex items-start bg-gray-50 p-4 rounded-lg border-l-4 border-violet-400 shadow-sm">
                <Truck className="w-5 h-5 text-violet-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tarif affiché pour une journée. Un tarif dégressif est appliqué pour toute journée supplémentaire. 
                  Ce prix ne comprend pas la livraison, l'installation et le démontage du matériel.
                </p>
              </div>
            </div>
            
            {/* Quantity Selector - enhanced with better styling */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md mr-2 text-xs uppercase tracking-wider">Étape </span>
                Sélectionnez la quantité
              </label>
              <div className="flex items-center max-w-xs border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition-all duration-300">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-3 bg-gray-50 hover:bg-violet-50 transition-colors duration-200 active:bg-violet-100"
                >
                  <Minus className="w-5 h-5 text-violet-600" />
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="p-3 w-16 text-center border-x border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                />
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-3 bg-gray-50 hover:bg-violet-50 transition-colors duration-200 active:bg-violet-100"
                >
                  <Plus className="w-5 h-5 text-violet-600" />
                </button>
              </div>
            </div>
            
            {/* Color Selector - enhanced with better styling */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md mr-2 text-xs uppercase tracking-wider">Étape </span>
                  Sélectionnez la couleur
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${selectedColor === color 
                        ? 'bg-violet-600 text-white shadow-md transform scale-105' 
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-violet-300 hover:shadow-sm'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add to Cart Button - enhanced with pulse animation and better styling */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md mr-2 text-xs uppercase tracking-wider">Étape </span>
                Ajoutez au devis
              </label>
              <button 
                onClick={handleAddToCart}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-500 to-violet-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="font-semibold relative z-10 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ajouter au devis
                </span>
              </button>
            </div>
            
            {/* Description - improved with better styling */}
            <div className="mb-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center pb-2 border-b border-gray-100">
                <Info className="w-5 h-5 mr-2 text-violet-600" />
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            
            {/* Technical Specifications - improved with better styling */}
            <div className="mb-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center pb-2 border-b border-gray-100">
                <Star className="w-5 h-5 mr-2 text-violet-600" />
                Caractéristiques techniques
              </h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(product.technicalSpecs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap bg-gray-50 border-r border-gray-200 w-1/3">{key}</td>
                        <td className="py-3 px-4 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Video - improved with better styling */}
            {product.videoUrl && (
              <div className="mb-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center pb-2 border-b border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  Présentation vidéo
                </h2>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                  <iframe 
                    src={product.videoUrl} 
                    title="Product video"
                    className="w-full h-64"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            
            {/* Technical Document - improved with better styling */}
            {product.technicalDocUrl && (
              <div className="mb-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center pb-2 border-b border-gray-100">
                  <FileText className="w-5 h-5 mr-2 text-violet-600" />
                  Documentation technique
                </h2>
                <a 
                  href={product.technicalDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-violet-50 text-violet-600 hover:text-violet-700 rounded-lg transition-all duration-300 hover:shadow-sm"
                >
                  <FileText className="mr-2 w-5 h-5" />
                  Télécharger la documentation technique (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Similar Products Section - improved with better styling */}
        <div className="mt-20">
          <div className="flex items-center mb-10">
            <div className="w-10 h-1 bg-violet-600 rounded-full mr-4"></div>
            <h2 className="text-3xl font-bold text-gray-900">Produits similaires</h2>
          </div>
          
          {loadingSimilar ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="h-56 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-5"></div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((similarProduct) => (
                <Link 
                  to={`/product/${similarProduct.id}`} 
                  key={similarProduct.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={similarProduct.images && similarProduct.images.length > 0 ? 
                        similarProduct.images[similarProduct.mainImageIndex || 0] : DEFAULT_PRODUCT_IMAGE} 
                      alt={similarProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {similarProduct.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      <span className="inline-block bg-gray-100 px-2 py-0.5 rounded-md mr-1">
                        {similarProduct.category.charAt(0).toUpperCase() + similarProduct.category.slice(1)}
                      </span>
                      <span className="inline-block bg-violet-50 px-2 py-0.5 rounded-md">
                        {similarProduct.subCategory.charAt(0).toUpperCase() + similarProduct.subCategory.slice(1)}
                      </span>
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-violet-600">
                        {similarProduct.priceTTC.toFixed(2)} € <span className="text-xs font-normal">TTC/jour</span>
                      </p>
                      <span className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded-full">Voir détails</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <p className="text-gray-500 mb-4">Aucun produit similaire trouvé</p>
              <Link to="/products" className="inline-flex items-center text-violet-600 hover:text-violet-700 transition-colors">
                <span>Découvrir tous nos produits</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
      
      
    </div>
  );
};

export default ProductPage;
