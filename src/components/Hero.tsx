import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, Heart } from 'lucide-react';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-100 via-cream-50 to-primary-50">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg')] bg-cover bg-center opacity-10"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 text-sage-300"
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf size={40} />
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-primary-300"
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles size={32} />
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-20 text-cream-400"
        animate={{ y: [-15, 15, -15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart size={36} />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <img 
            src="/WhatsApp Image 2025-05-26 at 18.14.07.jpeg" 
            alt="Auresta Logo" 
            className="h-24 w-auto mx-auto mb-6"
          />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-playfair font-bold text-gray-800 mb-6"
        >
          Nurture Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-sage-600">
            Natural Beauty
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto font-inter leading-relaxed"
        >
          Experience the power of 100% herbal skincare inspired by Korean beauty traditions. 
          Chemical-free formulations that reveal your skin's natural radiance.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-inter font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Products
          </motion.button>
          <motion.button
            className="px-8 py-4 border-2 border-sage-600 text-sage-700 font-inter font-semibold rounded-full hover:bg-sage-600 hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { icon: Leaf, title: "100% Herbal", desc: "Pure natural ingredients" },
            { icon: Sparkles, title: "Korean Beauty", desc: "Trending K-beauty secrets" },
            { icon: Heart, title: "Chemical-Free", desc: "Gentle on your skin" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <feature.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-inter">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;