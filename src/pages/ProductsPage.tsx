import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Leaf, Star, ArrowRight, Sparkles, Droplets, Filter, Grid, List, ShoppingCart, Eye } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import ProductDetail from '../components/ProductDetail';

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const { addItem, isInCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fallback products if none exist in database
  const fallbackProducts = [
    {
      id: 'fallback-1',
      name: "Herbal Face Wash",
      description: "Gentle cleansing with natural herbs and botanical extracts for a refreshing start to your skincare routine",
      image_url: "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg",
      benefits: ["Deep Cleansing", "Pore Minimizing", "pH Balanced", "Gentle Formula"],
      price: 24.99,
      is_available: true,
      category: "face-wash",
      ingredients: "Green Tea Extract, Chamomile, Aloe Vera"
    },
    {
      id: 'fallback-2',
      name: "Exfoliating Scrub",
      description: "Natural exfoliation with organic ingredients for smooth, radiant skin that glows from within",
      image_url: "https://images.pexels.com/photos/6621374/pexels-photo-6621374.jpeg",
      benefits: ["Dead Skin Removal", "Skin Brightening", "Natural Glow", "Smooth Texture"],
      price: 29.99,
      is_available: true,
      category: "scrub",
      ingredients: "Walnut Shell Powder, Honey, Oatmeal"
    },
    {
      id: 'fallback-3',
      name: "Vitamin C Serum",
      description: "Brightening serum with natural vitamin C and antioxidants for youthful, luminous skin",
      image_url: "https://images.pexels.com/photos/7755508/pexels-photo-7755508.jpeg",
      benefits: ["Anti-Aging", "Brightening", "Antioxidant Rich", "Collagen Boost"],
      price: 39.99,
      is_available: true,
      category: "serum",
      ingredients: "Kakadu Plum, Rose Hip Oil, Hyaluronic Acid"
    },
    {
      id: 'fallback-4',
      name: "Hydrating Moisturizer",
      description: "Deep hydration with herbal extracts and natural oils for all-day comfort and protection",
      image_url: "https://images.pexels.com/photos/7755516/pexels-photo-7755516.jpeg",
      benefits: ["24h Hydration", "Skin Barrier", "Non-Greasy", "Long-lasting"],
      price: 34.99,
      is_available: true,
      category: "moisturizer",
      ingredients: "Shea Butter, Ceramides, Squalane"
    },
    {
      id: 'fallback-5',
      name: "Eye Cream",
      description: "Gentle care for delicate eye area with natural peptides and botanical extracts",
      image_url: "https://images.pexels.com/photos/6621371/pexels-photo-6621371.jpeg",
      benefits: ["Dark Circle Reduction", "Anti-Puffiness", "Fine Line Care", "Firming"],
      price: 44.99,
      is_available: false,
      category: "eye-cream",
      ingredients: "Caffeine, Peptides, Cucumber Extract"
    },
    {
      id: 'fallback-6',
      name: "Night Repair Mask",
      description: "Overnight treatment with powerful herbal actives for intensive skin renewal",
      image_url: "https://images.pexels.com/photos/7755509/pexels-photo-7755509.jpeg",
      benefits: ["Overnight Repair", "Deep Nourishment", "Skin Renewal", "Intensive Care"],
      price: 49.99,
      is_available: false,
      category: "mask",
      ingredients: "Ginseng, Snail Mucin, Niacinamide"
    }
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  const categories = [
    { id: 'all', name: 'All Products', count: displayProducts.length },
    { id: 'face-wash', name: 'Face Wash', count: displayProducts.filter(p => p.category === 'face-wash').length },
    { id: 'scrub', name: 'Scrubs', count: displayProducts.filter(p => p.category === 'scrub').length },
    { id: 'serum', name: 'Serums', count: displayProducts.filter(p => p.category === 'serum').length },
    { id: 'moisturizer', name: 'Moisturizers', count: displayProducts.filter(p => p.category === 'moisturizer').length },
    { id: 'eye-cream', name: 'Eye Care', count: displayProducts.filter(p => p.category === 'eye-cream').length },
    { id: 'mask', name: 'Masks', count: displayProducts.filter(p => p.category === 'mask').length },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? displayProducts 
    : displayProducts.filter(product => product.category === selectedCategory);

  const handleAddToCart = (product: any) => {
    console.log('Adding product to cart:', product);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg",
      category: product.category
    });
    console.log('Cart state after adding:', state);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  // Flowing animation for serum-like effect
  const FlowingSerum = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-20 bg-gradient-to-b from-transparent via-primary-300/30 to-transparent"
          animate={{
            y: [-100, window.innerHeight + 100],
            x: [0, Math.sin(i) * 50],
          }}
          transition={{
            duration: Math.random() * 8 + 12,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section with Flowing Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-sage-50 to-cream-50">
        <FlowingSerum />
        
        {/* Floating Rice Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-3 bg-cream-300 rounded-full opacity-40"
              animate={{
                y: [0, -20, 0],
                x: [0, Math.sin(i) * 10, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 6 + 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-playfair font-bold text-gray-800 mb-6">
              Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-sage-600">
                Products
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto font-inter leading-relaxed">
              Discover our carefully crafted collection of herbal skincare products
            </p>

            {/* Special Offer Banner */}
            <motion.div
              className="inline-block bg-gradient-to-r from-primary-600 to-sage-600 text-white px-8 py-4 rounded-full shadow-2xl mb-8"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 10px 30px rgba(236, 72, 153, 0.3)",
                  "0 20px 40px rgba(236, 72, 153, 0.4)",
                  "0 10px 30px rgba(236, 72, 153, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <span className="text-xl font-playfair font-bold">
                  Buy Any 3 Products for ₹999
                </span>
                <Sparkles className="w-6 h-6" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 text-primary-300"
          animate={{ 
            y: [-20, 20, -20],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Droplets size={60} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-sage-300"
          animate={{ 
            y: [20, -20, 20],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf size={50} />
        </motion.div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-inter font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary-600 to-sage-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name} ({category.count})
                </motion.button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Grid size={20} className={viewMode === 'grid' ? 'text-primary-600' : 'text-gray-500'} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <List size={20} className={viewMode === 'list' ? 'text-primary-600' : 'text-gray-500'} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                className={`grid gap-8 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer ${
                      viewMode === 'list' ? 'flex items-center' : ''
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Coming Soon Badge */}
                    {!product.is_available && (
                      <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-inter font-medium flex items-center gap-2 shadow-lg">
                        <Clock size={16} />
                        Coming Soon
                      </div>
                    )}

                    {/* Product Image */}
                    <div className={`relative overflow-hidden ${
                      viewMode === 'list' ? 'w-64 h-64 flex-shrink-0' : 'h-80'
                    }`}>
                      <img
                        src={product.image_url || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* View Details Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.div
                          className="bg-white rounded-full p-3 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-6 h-6 text-primary-600" />
                        </motion.div>
                      </div>
                      
                      {/* Floating Serum Effect on Hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-0.5 h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                            animate={{
                              y: [-50, 350],
                              x: [0, Math.sin(i) * 20],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                              delay: i * 0.2,
                            }}
                            style={{
                              left: `${20 + i * 10}%`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className={`p-8 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-playfair font-bold text-gray-800 group-hover:text-primary-600 transition-colors duration-300">
                          {product.name}
                        </h3>
                        <span className="text-3xl font-playfair font-bold text-primary-600">
                          ₹{product.price}
                        </span>
                      </div>

                      <p className="text-gray-600 font-inter mb-6 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Benefits */}
                      <div className="space-y-3 mb-6">
                        <h4 className="text-sm font-inter font-semibold text-gray-800 uppercase tracking-wide">
                          Key Benefits
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {product.benefits?.slice(0, 4).map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Leaf className="w-4 h-4 text-sage-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600 font-inter">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ingredients */}
                      {product.ingredients && (
                        <div className="mb-6">
                          <h4 className="text-sm font-inter font-semibold text-gray-800 uppercase tracking-wide mb-2">
                            Key Ingredients
                          </h4>
                          <p className="text-sm text-gray-600 font-inter">
                            {product.ingredients}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.is_available) {
                            handleAddToCart(product);
                          }
                        }}
                        className={`w-full py-4 rounded-2xl font-inter font-semibold flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-lg ${
                          product.is_available
                            ? isInCart(product.id)
                              ? 'bg-green-500 text-white'
                              : 'bg-gradient-to-r from-sage-500 to-sage-600 text-white hover:from-sage-600 hover:to-sage-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        whileHover={{ scale: product.is_available ? 1.02 : 1 }}
                        whileTap={{ scale: product.is_available ? 0.98 : 1 }}
                        disabled={!product.is_available}
                      >
                        {!product.is_available ? (
                          <>
                            <Star size={20} />
                            Notify Me When Available
                          </>
                        ) : isInCart(product.id) ? (
                          <>
                            <ShoppingCart size={20} />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={20} />
                            Add to Cart
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Special Offer Section */}
          <motion.div
            className="mt-20 text-center bg-gradient-to-r from-primary-600 to-sage-600 rounded-3xl p-12 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Background Animation */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.sin(i) * 20, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: Math.random() * 4 + 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-16 h-16 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-4xl font-playfair font-bold mb-4">
                Special Launch Offer
              </h3>
              <p className="text-2xl mb-8 font-inter">
                Buy Any 3 Products for Just ₹999
              </p>
              <p className="text-lg mb-8 font-inter opacity-90">
                Get notified when our products launch and receive exclusive early-bird offers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white/50 font-inter text-gray-800"
                />
                <motion.button
                  className="px-8 py-4 bg-white text-primary-600 font-inter font-semibold rounded-full hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Notify Me
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsPage;