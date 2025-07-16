import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, Users, BarChart3, Settings, LogOut, Mail, MessageSquare, TrendingUp, ShoppingCart, Star, DollarSign, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import ProductList from './ProductList';
import AddProductForm from './AddProductForm';
import ContactMessages from './ContactMessages';
import Analytics from './Analytics';
import UserManagement from './UserManagement';
import AdminSettings from './AdminSettings';
import CouponManagement from './CouponManagement';
import OrderManagement from './OrderManagement';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { user, signOut } = useAuth();
  const { products, loading } = useProducts();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const tabs = [
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'coupons', name: 'Coupons', icon: Tag },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const stats = [
    { 
      name: 'Total Products', 
      value: products.length, 
      change: '+12%', 
      icon: Package,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Available Products', 
      value: products.filter(p => p.is_available).length, 
      change: '+8%', 
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600'
    },
    { 
      name: 'Coming Soon', 
      value: products.filter(p => !p.is_available).length, 
      change: '+4%', 
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      name: 'Categories', 
      value: new Set(products.map(p => p.category)).size, 
      change: '0%', 
      icon: Star,
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img 
                src="/WhatsApp Image 2025-05-26 at 18.14.07.jpeg" 
                alt="Auresta Logo" 
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-playfair font-bold text-gray-800">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-inter">
                Welcome, {user?.user_metadata?.first_name || 'Admin'}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-playfair font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <p className="text-sm font-inter text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-inter font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-playfair font-bold text-gray-800">
                    Product Management
                  </h2>
                  <motion.button
                    onClick={() => setShowAddProduct(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={18} />
                    Add Product
                  </motion.button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <ProductList />
                )}
              </div>
            )}

            {activeTab === 'orders' && <OrderManagement />}
            {activeTab === 'coupons' && <CouponManagement />}
            {activeTab === 'messages' && <ContactMessages />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductForm onClose={() => setShowAddProduct(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;