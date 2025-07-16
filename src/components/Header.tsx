import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Cart from './Cart';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { state } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHomePage
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link to="/">
                <img 
                  src="/WhatsApp Image 2025-05-26 at 18.14.07.jpeg" 
                  alt="Auresta Logo" 
                  className="h-12 w-auto"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.div key={item.name}>
                  <Link
                    to={item.href}
                    className={`font-inter font-medium transition-colors duration-200 relative ${
                      (isScrolled || !isHomePage) ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-cream-200'
                    } ${location.pathname === item.href ? 'text-primary-600' : ''}`}
                  >
                    {item.name}
                    {location.pathname === item.href && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600"
                        layoutId="activeTab"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`px-4 py-2 rounded-full font-inter font-medium transition-colors duration-200 ${
                        (isScrolled || !isHomePage)
                          ? 'bg-primary-600 text-white hover:bg-primary-700' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      (isScrolled || !isHomePage) ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <User size={20} />
                    </motion.div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-inter font-medium transition-colors duration-200 ${
                      (isScrolled || !isHomePage)
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-inter font-medium transition-colors duration-200 ${
                      (isScrolled || !isHomePage)
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <UserPlus size={16} />
                    Register
                  </Link>
                </>
              )}
              
              <motion.button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2 rounded-full transition-colors duration-200 ${
                  (isScrolled || !isHomePage) ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingBag size={20} />
                {state.itemCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {state.itemCount}
                  </motion.span>
                )}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className={`md:hidden p-2 rounded-lg ${
                (isScrolled || !isHomePage) ? 'text-gray-700' : 'text-white'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <motion.div key={item.name}>
                    <Link
                      to={item.href}
                      className="block text-gray-700 font-inter font-medium hover:text-primary-600 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                      whileHover={{ x: 10 }}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium text-center"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={20} />
                        Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn size={20} />
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus size={20} />
                        Register
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ShoppingBag size={20} />
                    Cart {state.itemCount > 0 && `(${state.itemCount})`}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;