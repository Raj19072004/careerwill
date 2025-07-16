import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Award, Users, Globe, Sparkles } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Leaf,
      title: "100% Natural",
      description: "We believe in the power of nature. Every ingredient is carefully sourced from organic farms and sustainable suppliers."
    },
    {
      icon: Heart,
      title: "Chemical-Free",
      description: "No harsh chemicals, parabens, or sulfates. Our formulations are gentle yet effective for all skin types."
    },
    {
      icon: Award,
      title: "Korean Beauty",
      description: "Inspired by centuries-old Korean beauty traditions combined with modern skincare science."
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Inclusive skincare that celebrates all skin types, tones, and ages. Beauty has no boundaries."
    }
  ];

  const stats = [
    { number: "100%", label: "Natural Ingredients" },
    { number: "0", label: "Harmful Chemicals" },
    { number: "10+", label: "Herbal Extracts" },
    { number: "∞", label: "Love & Care" }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-cream-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-gray-800 mb-6">
            About Auresta
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-inter leading-relaxed">
            Born from a passion for natural beauty and inspired by Korean skincare wisdom, 
            Auresta is dedicated to nurturing your skin with the purest herbal ingredients.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-playfair font-bold text-gray-800 mb-6">
              Our Story
            </h3>
            <div className="space-y-4 text-gray-600 font-inter leading-relaxed">
              <p>
                Auresta was born from a simple belief: that nature holds the key to radiant, 
                healthy skin. Our founders, inspired by their travels through Korea and 
                fascination with traditional herbal remedies, set out to create a skincare 
                line that honors both ancient wisdom and modern needs.
              </p>
              <p>
                Every product in our collection is a testament to our commitment to purity. 
                We work directly with organic farmers and herbalists to source the finest 
                ingredients, ensuring that what touches your skin is nothing but the best 
                that nature has to offer.
              </p>
              <p>
                Our mission is simple: to help you discover your skin's natural radiance 
                through the gentle power of herbs, free from harsh chemicals and full of love.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/6621374/pexels-photo-6621374.jpeg"
                alt="Natural skincare ingredients"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent"></div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-primary-500" />
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-4 bg-sage-100 rounded-full p-4 shadow-lg"
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Globe className="w-8 h-8 text-sage-600" />
            </motion.div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-playfair font-bold text-gray-800 text-center mb-12">
            Our Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-sage-100 rounded-full mb-4">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-xl font-playfair font-semibold text-gray-800 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 font-inter leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="bg-gradient-to-r from-primary-600 to-sage-600 rounded-3xl p-8 sm:p-12 text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-playfair font-bold text-center mb-12">
            Why Choose Auresta?
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl sm:text-5xl font-playfair font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-inter opacity-90">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;