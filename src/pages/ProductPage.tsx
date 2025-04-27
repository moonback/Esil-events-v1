import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, FileText, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductById } from '../services/productService';
import { Product } from '../types/Product';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
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
    <div className="pt-32 pb-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb - improved styling */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-2 text-sm">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-600 hover:text-black transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link 
                    to={`/products/${product.category}`} 
                    className="ml-2 text-gray-600 hover:text-black transition-colors"
                  >
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="ml-2 text-gray-500 font-medium">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images - improved gallery */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="relative group">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.name} 
                  className="w-full h-96 object-contain rounded-lg transition-opacity duration-300"
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails - improved styling */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex overflow-x-auto py-2 space-x-3 scrollbar-hide">
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer transition-all duration-200 border-2 ${currentImageIndex === index ? 'border-violet-500' : 'border-transparent hover:border-gray-200'}`}
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

          {/* Product Info - improved layout */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-500 text-sm mb-4">Réf: {product.reference}</p>
              
              {/* Price section - improved */}
              <div className="flex items-center space-x-8 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Prix HT / jour</p>
                  <p className="text-2xl font-bold text-gray-800">{product.priceHT.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Prix TTC / jour</p>
                  <p className="text-2xl font-bold text-violet-600">{product.priceTTC.toFixed(2)} €</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Tarif affiché pour une journée. Un tarif dégressif est appliqué pour toute journée supplémentaire. 
                Ce prix ne comprend pas la livraison, l'installation et le démontage du matériel.
              </p>
            </div>
            
            {/* Quantity Selector - improved */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
              <div className="flex items-center max-w-xs">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 border border-gray-300 rounded-l hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="p-2 w-16 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-2 border border-gray-300 rounded-r hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Color Selector - improved */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm rounded-md transition-all ${selectedColor === color ? 'bg-violet-100 text-violet-700 border border-violet-300' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add to Cart Button - improved */}
            <button 
              onClick={handleAddToCart}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 mb-8 flex items-center justify-center space-x-2"
            >
              <span>Ajouter au devis</span>
              <Plus className="w-4 h-4" />
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
        
        {/* Related Products - improved */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits associés</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Related products would be rendered here */}
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-100 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
