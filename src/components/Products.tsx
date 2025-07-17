import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Leaf, Star, ArrowRight } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

const Products = () => {
  const { products, loading } = useProducts();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Fallback products if none exist in database
  const fallbackProducts = [
    {
      id: 'fallback-1',
      name: "Herbal Face Wash",
      description: "Gentle cleansing with natural herbs and botanical extracts",
      image_url: "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg",
      benefits: ["Deep Cleansing", "Pore Minimizing", "pH Balanced"],
      price: 24.99,
      is_available: false,
      category: "face-wash"
    },
    {
      id: 'fallback-2',
      name: "Exfoliating Scrub",
      description: "Natural exfoliation with organic ingredients for smooth skin",
      image_url: "https://images.pexels.com/photos/6621374/pexels-photo-6621374.jpeg",
      benefits: ["Dead Skin Removal", "Skin Brightening", "Natural Glow"],
      price: 29.99,
      is_available: false,
      category: "scrub"
    },
    {
      id: 'fallback-3',
      name: "Vitamin C Serum",
      description: "Brightening serum with natural vitamin C and antioxidants",
      image_url: "https://images.pexels.com/photos/7755508/pexels-photo-7755508.jpeg",
      benefits: ["Anti-Aging", "Brightening", "Antioxidant Rich"],
      price: 39.99,
      is_available: false,
      category: "serum"
    },
    {
      id: 'fallback-4',
      name: "Hydrating Moisturizer",
      description: "Deep hydration with herbal extracts and natural oils",
      image_url: "https://images.pexels.com/photos/7755516/pexels-photo-7755516.jpeg",
      benefits: ["24h Hydration", "Skin Barrier", "Non-Greasy"],
      price: 34.99,
      is_available: false,
      category: "moisturizer"
    },
    {
      id: 'fallback-5',
      name: "Eye Cream",
      description: "Gentle care for delicate eye area with natural peptides",
      image_url: "https://images.pexels.com/photos/6621371/pexels-photo-6621371.jpeg",
      benefits: ["Dark Circle Reduction", "Anti-Puffiness", "Fine Line Care"],
      price: 44.99,
      is_available: false,
      category: "eye-cream"
    },
    {
      id: 'fallback-6',
      name: "Night Repair Mask",
      description: "Overnight treatment with powerful herbal actives",
      image_url: "https://images.pexels.com/photos/7755509/pexels-photo-7755509.jpeg",
      benefits: ["Overnight Repair", "Deep Nourishment", "Skin Renewal"],
      price: 49.99,
      is_available: false,
      category: "mask"
    }
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-white to-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-gray-800 mb-6">
            Our Product Range
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-inter leading-relaxed">
            Discover our carefully crafted collection of herbal skincare products, 
            each formulated with the finest natural ingredients and Korean beauty wisdom.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                whileHover={{ y: -10 }}
              >
                {/* Coming Soon Badge */}
                {!product.is_available && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-sm font-inter font-medium flex items-center gap-1">
                    <Clock size={14} />
                    Coming Soon
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={product.image_url || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-playfair font-semibold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 font-inter mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-playfair font-bold text-primary-600">
                      ₹{product.price}
                    </span>
                    <span className="text-sm text-gray-500 font-inter capitalize">
                      {product.category?.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6">
                    {product.benefits?.slice(0, 3).map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-sage-500" />
                        <span className="text-sm text-gray-600 font-inter">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    className="w-full bg-gradient-to-r from-sage-500 to-sage-600 text-white py-3 rounded-2xl font-inter font-medium flex items-center justify-center gap-2 hover:from-sage-600 hover:to-sage-700 transition-all duration-300 group-hover:shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!product.is_available}
                  >
                    {!product.is_available ? (
                      <>
                        <Star size={18} />
                        Notify Me
                      </>
                    ) : (
                      <>
                        Learn More
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          className="mt-20 text-center bg-gradient-to-r from-primary-50 to-sage-50 rounded-3xl p-8 sm:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-playfair font-bold text-gray-800 mb-4">
            Be the First to Know
          </h3>
          <p className="text-lg text-gray-600 mb-8 font-inter">
            Get notified when our products launch and receive exclusive early-bird offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
            />
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-inter font-semibold rounded-full hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Notify Me
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Products;