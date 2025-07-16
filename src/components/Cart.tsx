import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, Heart, ArrowRight, CreditCard, Sparkles, Gift, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Debug cart state
  useEffect(() => {
    console.log('Cart component - current state:', state);
  }, [state]);

  const handleCheckout = async () => {
    if (!user) {
      onClose();
      return;
    }

    setIsCheckingOut(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsCheckingOut(false);
      clearCart();
      onClose();
      toast.success('Order placed successfully! 🎉');
    }, 2000);
  };

  const handlePayment = () => {
    // In a real app, this would integrate with a payment gateway like Razorpay
    toast.success('Redirecting to payment gateway...');
    handleCheckout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Cart Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-sage-50">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-playfair font-bold text-gray-800">
                    Shopping Cart
                  </h2>
                  {state.itemCount > 0 && (
                    <span className="bg-primary-600 text-white text-sm font-inter font-medium px-2 py-1 rounded-full">
                      {state.itemCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {state.items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-600 font-inter mb-6">
                      Add some products to get started
                    </p>
                    <Link
                      to="/products"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-sage-600 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                    >
                      Shop Now
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Special Offer Banner */}
                    {state.hasSpecialOffer && (
                      <motion.div
                        className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl mb-6 overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 bg-white rounded-full"
                              animate={{
                                y: [0, -20, 0],
                                opacity: [0.3, 1, 0.3],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                              }}
                            />
                          ))}
                        </div>
                        
                        <div className="relative z-10 text-center">
                          <motion.div
                            className="flex items-center justify-center gap-2 mb-3"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Gift className="w-6 h-6" />
                            <p className="font-playfair font-bold text-xl">🎉 Special Offer Applied!</p>
                            <Gift className="w-6 h-6" />
                          </motion.div>
                          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                            <p className="font-inter text-lg font-semibold">Buy Any 3+ Products for ₹999</p>
                            <p className="font-inter text-sm opacity-90 mt-1">
                              You saved ₹{state.discountAmount.toFixed(2)}! 💰
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Offer Progress Bar */}
                    {!state.hasSpecialOffer && state.itemCount < 3 && (
                      <motion.div
                        className="mb-6 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5 text-yellow-600" />
                          </motion.div>
                          <p className="text-sm font-inter font-semibold text-yellow-800">
                            Add {3 - state.itemCount} more item{3 - state.itemCount > 1 ? 's' : ''} to unlock special offer!
                          </p>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-yellow-200 rounded-full h-3 overflow-hidden">
                            <motion.div 
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full relative"
                              initial={{ width: 0 }}
                              animate={{ width: `${(state.itemCount / 3) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </motion.div>
                          </div>
                          <div className="flex justify-between text-xs font-inter text-yellow-700 mt-1">
                            <span>{state.itemCount} items</span>
                            <span>3 items needed</span>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-inter font-medium">
                            <Tag size={12} />
                            Get all products for just ₹999
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Cart Items List */}
                    {state.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        layout
                      >
                        <div className="relative">
                          <img
                            src={item.image_url || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          {state.hasSpecialOffer && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Sparkles size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-playfair font-semibold text-gray-800 text-sm">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 font-inter text-xs capitalize">
                            {item.category?.replace('-', ' ')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-primary-600 font-playfair font-bold">
                              ₹{item.price}
                            </p>
                            {state.hasSpecialOffer && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-inter">
                                Offer Applied
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-inter font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors duration-200">
                              <Heart size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {state.items.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {/* Totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between font-inter">
                      <span className="text-gray-600">Subtotal ({state.itemCount} items):</span>
                      <span className="text-gray-800 font-medium">₹{state.total.toFixed(2)}</span>
                    </div>
                    {state.hasSpecialOffer && (
                      <motion.div 
                        className="flex justify-between font-inter text-green-600 bg-green-50 px-3 py-2 rounded-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="flex items-center gap-2">
                          <Gift size={16} />
                          Special Offer Discount:
                        </span>
                        <span className="font-semibold">-₹{state.discountAmount.toFixed(2)}</span>
                      </motion.div>
                    )}
                    <div className="flex justify-between font-playfair font-bold text-lg border-t border-gray-300 pt-3">
                      <span>Total:</span>
                      <span className="text-primary-600">₹{state.finalTotal.toFixed(2)}</span>
                    </div>
                    {state.hasSpecialOffer && (
                      <p className="text-xs text-green-600 font-inter text-center">
                        🎉 You're getting an amazing deal!
                      </p>
                    )}
                  </div>

                  {/* Checkout Button */}
                  {user ? (
                    <motion.button
                      onClick={() => {
                        onClose();
                        window.location.href = '/checkout';
                      }}
                      disabled={isCheckingOut}
                      className="w-full bg-gradient-to-r from-primary-600 to-sage-600 text-white py-4 rounded-xl font-inter font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: isCheckingOut ? 1 : 1.02 }}
                      whileTap={{ scale: isCheckingOut ? 1 : 0.98 }}
                    >
                      <CreditCard size={18} />
                      Proceed to Checkout
                    </motion.button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-center text-gray-600 font-inter text-sm">
                        Please sign in to continue
                      </p>
                      <Link
                        to="/login"
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-primary-600 to-sage-600 text-white py-4 rounded-xl font-inter font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                      >
                        Sign In to Checkout
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  )}

                  {/* Continue Shopping */}
                  <Link
                    to="/products"
                    onClick={onClose}
                    className="block text-center text-gray-600 font-inter text-sm mt-4 hover:text-primary-600 transition-colors duration-200"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;