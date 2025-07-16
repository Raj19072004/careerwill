import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Story', href: '#about' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' }
    ],
    products: [
      { name: 'Face Wash', href: '#products' },
      { name: 'Scrubs', href: '#products' },
      { name: 'Serums', href: '#products' },
      { name: 'Moisturizers', href: '#products' }
    ],
    support: [
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQ', href: '#' },
      { name: 'Shipping', href: '#' },
      { name: 'Returns', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Disclaimer', href: '#' }
    ]
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/WhatsApp Image 2025-05-26 at 18.14.07.jpeg" 
                alt="Auresta Logo" 
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 font-inter leading-relaxed mb-6">
              Nurturing your natural beauty with 100% herbal skincare products 
              inspired by Korean beauty traditions.
            </p>
            <div className="flex items-center gap-2 text-primary-400">
              <Heart size={16} />
              <span className="text-sm font-inter">Made with love for your skin</span>
            </div>
          </motion.div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-playfair font-semibold mb-6 capitalize">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <motion.a
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-inter"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          className="border-t border-gray-800 pt-12 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-playfair font-bold mb-4">
                Stay in the Loop
              </h3>
              <p className="text-gray-300 font-inter">
                Subscribe to get updates on new products, beauty tips, and exclusive offers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
              />
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-inter font-semibold rounded-full hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail size={18} />
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="border-t border-gray-800 pt-12 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-inter">Email</p>
                <p className="text-white font-inter">hello@auresta.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage-600 rounded-full flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-inter">Phone</p>
                <p className="text-white font-inter">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cream-600 rounded-full flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-inter">Address</p>
                <p className="text-white font-inter">123 Beauty Lane, Skincare City</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 text-gray-400 font-inter">
            <Leaf size={16} />
            <span>© 2024 Auresta. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400 font-inter">
            <span>Made with natural ingredients</span>
            <span>•</span>
            <span>Chemical-free promise</span>
            <span>•</span>
            <span>Korean beauty inspired</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;