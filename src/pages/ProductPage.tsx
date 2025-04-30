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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Breadcrumb */}
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

        <div className="space-y-12">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[currentImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-contain"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6 text-violet-600" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6 text-violet-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="mt-6 grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden ${
                        currentImageIndex === index ? 'ring-2 ring-violet-600' : ''
                      }`}
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
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
                <p className="mt-2 text-gray-500">Réf: {product.reference}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <p className="text-sm text-gray-500">Prix HT / jour</p>
                  <p className="text-2xl font-bold text-gray-900">{product.priceHT.toFixed(2)} €</p>
                </div>
                <div className="bg-violet-50 p-4 rounded-xl shadow-lg">
                  <p className="text-sm text-violet-600">Prix TTC / jour</p>
                  <p className="text-2xl font-bold text-violet-600">{product.priceTTC.toFixed(2)} €</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  />
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          selectedColor === color 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-white text-gray-700 hover:bg-violet-50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                className="w-full bg-violet-600 text-white py-3 px-6 rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Ajouter au devis</span>
              </button>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Caractéristiques techniques</h2>
                <dl className="space-y-4">
                  {Object.entries(product.technicalSpecs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <dt className="text-gray-600">{key}</dt>
                      <dd className="col-span-2 text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => (
                  <Link 
                    to={`/product/${similarProduct.id}`} 
                    key={similarProduct.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="aspect-square">
                      <img 
                        src={similarProduct.images?.[0] || DEFAULT_PRODUCT_IMAGE} 
                        alt={similarProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{similarProduct.name}</h3>
                      <p className="text-violet-600 font-bold mt-2">
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
