import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Heart, Package, Settings, LogOut, Eye, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { wishlistItems, loading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    skinType: '',
    skinConcerns: [],
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        address: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        pincode: profile.address?.pincode || '',
        dateOfBirth: profile.preferences?.date_of_birth || '',
        skinType: profile.skin_type || '',
        skinConcerns: profile.skin_concerns || [],
      });
    }
  }, [profile, user]);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrdersError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
  const skinConcerns = ['Acne', 'Dark Spots', 'Fine Lines', 'Dryness', 'Oiliness', 'Sensitivity', 'Dullness', 'Large Pores'];

  const handleSave = async () => {
    try {
      const updates = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        address: {
          street: profileData.address,
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode,
        },
        skin_type: profileData.skinType,
        skin_concerns: profileData.skinConcerns,
        preferences: {
          ...profile?.preferences,
          date_of_birth: profileData.dateOfBirth,
        },
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        toast.error(error);
        return;
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleSkinConcernToggle = (concern: string) => {
    setProfileData(prev => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter(c => c !== concern)
        : [...prev.skinConcerns, concern]
    }));
  };

  const handleMoveToCart = async (item: any) => {
    addItem({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image_url: item.product.image_url,
      category: item.product.category
    });
    await removeFromWishlist(item.product_id);
  };

  const canCancelOrder = (orderDate: string) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - orderTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Order cancelled successfully');
      // Refresh orders
      if (activeTab === 'orders') {
        const fetchOrders = async () => {
          if (!user) return;
          setOrdersLoading(true);
          try {
            const { data, error } = await supabase
              .from('orders')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            
            if (error) throw error;
            setOrders(data || []);
          } catch (err) {
            console.error('Error fetching orders:', err);
            setOrdersError(err instanceof Error ? err.message : 'Failed to fetch orders');
          } finally {
            setOrdersLoading(false);
          }
        };
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to cancel order');
      console.error('Error cancelling order:', error);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
              {/* Profile Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-sage-400 rounded-full flex items-center justify-center text-white text-2xl font-playfair font-bold mb-4">
                    {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors duration-200">
                    <Camera size={14} />
                  </button>
                </div>
                <h2 className="text-xl font-playfair font-bold text-gray-800">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-gray-600 font-inter">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-inter font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-sage-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.name}
                  </button>
                ))}
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-inter font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-playfair font-bold text-gray-800">
                      Profile Information
                    </h1>
                    {!isEditing ? (
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-sage-600 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Edit3 size={18} />
                        Edit Profile
                      </motion.button>
                    ) : (
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-inter font-medium hover:bg-gray-50 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <X size={18} />
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-sage-600 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Save size={18} />
                          Save Changes
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        Basic Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 font-inter"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                          <textarea
                            value={profileData.address}
                            onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50 resize-none"
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={profileData.state}
                            onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                            placeholder="Enter state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                            PIN Code
                          </label>
                          <input
                            type="text"
                            value={profileData.pincode}
                            onChange={(e) => setProfileData(prev => ({ ...prev, pincode: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                            placeholder="Enter PIN code"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skincare Profile */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        Skincare Profile
                      </h3>

                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          Skin Type
                        </label>
                        <select
                          value={profileData.skinType}
                          onChange={(e) => setProfileData(prev => ({ ...prev, skinType: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter disabled:bg-gray-50"
                        >
                          <option value="">Select your skin type</option>
                          {skinTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-3">
                          Skin Concerns
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {skinConcerns.map(concern => (
                            <label
                              key={concern}
                              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                profileData.skinConcerns.includes(concern)
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              } ${!isEditing ? 'pointer-events-none opacity-60' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={profileData.skinConcerns.includes(concern)}
                                onChange={() => handleSkinConcernToggle(concern)}
                                disabled={!isEditing}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm font-inter">{concern}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h1 className="text-3xl font-playfair font-bold text-gray-800 mb-8">
                    Order History
                  </h1>
                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 font-inter">Loading your orders...</p>
                    </div>
                  ) : ordersError ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                        Error Loading Orders
                      </h3>
                      <p className="text-red-600 font-inter mb-4">{ordersError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                        No Orders Yet
                      </h3>
                      <p className="text-gray-600 font-inter">
                        Your order history will appear here once you make your first purchase.
                      </p>
                      <div className="mt-6">
                        <a
                          href="/products"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                        >
                          Start Shopping
                          <ArrowRight size={18} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                            <div className="flex items-center gap-4 mb-4 lg:mb-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-sage-100 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <h3 className="font-inter font-semibold text-gray-800">
                                  Order #{order.id.slice(-8).toUpperCase()}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-playfair font-bold text-lg text-gray-800">
                                  ₹{order.total_amount.toFixed(2)}
                                </p>
                                {order.discount_amount > 0 && (
                                  <p className="text-sm text-green-600">
                                    Saved ₹{order.discount_amount.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              
                              <span className={`px-3 py-1 rounded-full text-sm font-inter font-medium ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Order Items */}
                          <div className="border-t border-gray-100 pt-4">
                            <h4 className="font-inter font-medium text-gray-800 mb-3">Items Ordered:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <img
                                    src={item.image_url || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg"}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-inter font-medium text-gray-800 text-sm truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Qty: {item.quantity} × ₹{item.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Payment & Shipping Info */}
                          <div className="border-t border-gray-100 pt-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Payment Method:</p>
                                <p className="font-medium capitalize">
                                  {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                                </p>
                              </div>
                              {order.coupon_code && (
                                <div>
                                  <p className="text-gray-600">Coupon Applied:</p>
                                  <p className="font-medium text-green-600">{order.coupon_code}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <div className="border-t border-gray-100 pt-4 mt-4">
                            <div className="flex gap-2">
                              <a
                                href={`/order-confirmation/${order.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg font-inter font-medium text-sm transition-colors duration-200"
                              >
                                <Eye size={16} />
                                View Details
                              </a>
                              
                              {canCancelOrder(order.created_at) && order.status !== 'cancelled' && order.status !== 'delivered' && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-inter font-medium text-sm transition-colors duration-200"
                                >
                                  <X size={16} />
                                  Cancel Order
                                </button>
                              )}
                            </div>
                            
                            {canCancelOrder(order.created_at) && order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <p className="text-xs text-gray-500 mt-2">
                                You can cancel this order within 24 hours of placing it
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h1 className="text-3xl font-playfair font-bold text-gray-800 mb-8">
                    Wishlist
                  </h1>
                  
                  {wishlistLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 font-inter">Loading your wishlist...</p>
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                        Your Wishlist is Empty
                      </h3>
                      <p className="text-gray-600 font-inter mb-6">
                        Save your favorite products here for easy access later.
                      </p>
                      <a
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                      >
                        Browse Products
                        <ArrowRight size={18} />
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="relative h-48">
                            <img
                              src={item.product.image_url || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                            {!item.product.is_available && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-inter font-medium">
                                Coming Soon
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                              {item.product.name}
                            </h3>
                            <p className="text-gray-600 font-inter text-sm mb-3 line-clamp-2">
                              {item.product.description}
                            </p>
                            
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xl font-playfair font-bold text-primary-600">
                                ₹{item.product.price}
                              </span>
                              <span className="text-sm text-gray-500 font-inter capitalize">
                                {item.product.category?.replace('-', ' ')}
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              {item.product.is_available ? (
                                <button
                                  onClick={() => handleMoveToCart(item)}
                                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 px-4 rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                                >
                                  Add to Cart
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-xl font-inter font-medium cursor-not-allowed"
                                >
                                  Coming Soon
                                </button>
                              )}
                              
                              <button
                                onClick={() => removeFromWishlist(item.product_id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                                title="Remove from wishlist"
                              >
                                <Heart size={20} className="fill-current" />
                              </button>
                            </div>
                            
                            <p className="text-xs text-gray-500 font-inter mt-3">
                              Added {new Date(item.created_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h1 className="text-3xl font-playfair font-bold text-gray-800 mb-8">
                    Account Settings
                  </h1>
                  <div className="space-y-6">
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                        Email Notifications
                      </h3>
                      <p className="text-gray-600 font-inter mb-4">
                        Manage your email notification preferences
                      </p>
                      <div className="space-y-3">
                        {[
                          'Product updates and launches',
                          'Special offers and promotions',
                          'Order confirmations and updates',
                          'Skincare tips and advice'
                        ].map((item, index) => (
                          <label key={index} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="font-inter text-gray-700">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                        Privacy Settings
                      </h3>
                      <p className="text-gray-600 font-inter mb-4">
                        Control your privacy and data sharing preferences
                      </p>
                      <div className="space-y-3">
                        {[
                          'Allow personalized product recommendations',
                          'Share usage data for product improvement',
                          'Enable location-based services'
                        ].map((item, index) => (
                          <label key={index} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              defaultChecked={index === 0}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="font-inter text-gray-700">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;