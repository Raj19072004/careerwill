import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Award, Users, Globe, Sparkles, Star, Shield, Droplets } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Leaf,
      title: "100% Natural",
      description: "We believe in the power of nature. Every ingredient is carefully sourced from organic farms and sustainable suppliers.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Chemical-Free",
      description: "No harsh chemicals, parabens, or sulfates. Our formulations are gentle yet effective for all skin types.",
      color: "from-pink-400 to-rose-500"
    },
    {
      icon: Award,
      title: "Korean Beauty",
      description: "Inspired by centuries-old Korean beauty traditions combined with modern skincare science.",
      color: "from-purple-400 to-indigo-500"
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Inclusive skincare that celebrates all skin types, tones, and ages. Beauty has no boundaries.",
      color: "from-blue-400 to-cyan-500"
    }
  ];

  const stats = [
    { number: "100%", label: "Natural Ingredients", icon: Leaf },
    { number: "0", label: "Harmful Chemicals", icon: Shield },
    { number: "10+", label: "Herbal Extracts", icon: Droplets },
    { number: "∞", label: "Love & Care", icon: Heart }
  ];

  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Founded with a vision to bring Korean beauty secrets to the world through natural ingredients."
    },
    {
      year: "2021",
      title: "Research & Development",
      description: "Extensive research into traditional Korean herbal remedies and modern skincare science."
    },
    {
      year: "2022",
      title: "First Formulations",
      description: "Created our signature herbal blends with 100% natural ingredients."
    },
    {
      year: "2023",
      title: "Global Vision",
      description: "Expanding our mission to nurture natural beauty worldwide."
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-sage-50 via-cream-50 to-primary-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-200 rounded-full opacity-30"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
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
              About
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-sage-600">
                Auresta
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-600 mb-8 max-w-4xl mx-auto font-inter leading-relaxed">
              Nurturing your skin's natural radiance through the ancient wisdom of Korean beauty
            </p>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 text-sage-300"
          animate={{ 
            y: [-20, 20, -20],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={60} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-primary-300"
          animate={{ 
            y: [20, -20, 20],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <Globe size={50} />
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-playfair font-bold text-gray-800 mb-8">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-600 font-inter leading-relaxed">
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
                className="absolute -top-6 -right-6 bg-white rounded-full p-6 shadow-xl"
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-10 h-10 text-primary-500" />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -left-6 bg-sage-100 rounded-full p-6 shadow-xl"
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Globe className="w-10 h-10 text-sage-600" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-playfair font-bold text-gray-800 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-inter">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                whileHover={{ y: -10, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl mb-6 shadow-lg`}>
                    <value.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 font-inter leading-relaxed text-lg">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-sage-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-playfair font-bold text-gray-800 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-inter">
              From vision to reality - the story of Auresta
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-400 to-sage-400"></div>

            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className={`relative flex items-center mb-16 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="text-3xl font-playfair font-bold text-primary-600 mb-2">
                      {item.year}
                    </div>
                    <h3 className="text-xl font-playfair font-semibold text-gray-800 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 font-inter">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-primary-500 to-sage-500 rounded-full border-4 border-white shadow-lg"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-sage-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-playfair font-bold mb-6">
              Why Choose Auresta?
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto font-inter">
              Numbers that speak to our commitment
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 group-hover:bg-white/30 transition-colors duration-300">
                  <stat.icon className="w-10 h-10" />
                </div>
                <div className="text-5xl sm:text-6xl font-playfair font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-inter opacity-90">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;