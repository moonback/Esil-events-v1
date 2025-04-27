import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, FileText, Plus, Minus } from 'lucide-react';
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
      <div className="min-h-screen  flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb - enhanced with better spacing */}
        <div className="mb-10">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-3 text-sm">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-600 hover:text-black transition-colors duration-200">
                  Accueil
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link 
                    to={`/products/${product.category}`} 
                    className="ml-3 text-gray-600 hover:text-black transition-colors duration-200"
                  >
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="ml-3 text-gray-500 font-medium">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Images - enhanced with zoom effect */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
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

          {/* Product Info - enhanced with better visual hierarchy */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-500 text-sm font-medium mb-6">Réf: {product.reference}</p>
              
              {/* Price section - enhanced with badges */}
              <div className="flex items-center space-x-10 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Prix HT / jour</p>
                  <p className="text-2xl font-bold text-gray-800">{product.priceHT.toFixed(2)} €</p>
                </div>
                <div className="bg-violet-50 p-3 rounded-lg">
                  <p className="text-xs text-violet-600 mb-1">Prix TTC / jour</p>
                  <p className="text-2xl font-bold text-violet-600">{product.priceTTC.toFixed(2)} €</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Tarif affiché pour une journée. Un tarif dégressif est appliqué pour toute journée supplémentaire. 
                Ce prix ne comprend pas la livraison, l'installation et le démontage du matériel.
              </p>
            </div>
            
            {/* Quantity Selector - enhanced */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantité</label>
              <div className="flex items-center max-w-xs border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="p-3 w-16 text-center border-x border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Color Selector - enhanced */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Couleur</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${selectedColor === color ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add to Cart Button - enhanced with pulse animation */}
            <button 
              onClick={handleAddToCart}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 mb-10 flex items-center justify-center space-x-3 hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="font-semibold">Ajouter au devis</span>
              <Plus className="w-5 h-5" />
            </button>
            
            {/* Description - improved */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-violet-600" />
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            
            {/* Technical Specifications - improved */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Caractéristiques techniques</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(product.technicalSpecs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">{key}</td>
                        <td className="py-3 px-4 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Video - improved */}
            {product.videoUrl && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Présentation</h2>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <iframe 
                    src={product.videoUrl} 
                    title="Product video"
                    className="w-full h-64"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            
            {/* Technical Document - improved */}
            {product.technicalDocUrl && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Documentation technique</h2>
                <a 
                  href={product.technicalDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-violet-600 hover:text-violet-700 hover:underline transition-colors"
                >
                  <FileText className="mr-2" />
                  Télécharger la documentation technique (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Similar Products Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Produits similaires</h2>
          
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
                  <div className="h-56 overflow-hidden">
                    <img 
                      src={similarProduct.images && similarProduct.images.length > 0 ? 
                        similarProduct.images[similarProduct.mainImageIndex || 0] : DEFAULT_PRODUCT_IMAGE} 
                      alt={similarProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {similarProduct.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {similarProduct.category.charAt(0).toUpperCase() + similarProduct.category.slice(1)} - 
                      {similarProduct.subCategory.charAt(0).toUpperCase() + similarProduct.subCategory.slice(1)}
                    </p>
                    <p className="font-bold text-violet-600">
                      {similarProduct.priceTTC.toFixed(2)} € <span className="text-xs font-normal">TTC/jour</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Aucun produit similaire trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
