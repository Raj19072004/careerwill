import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, ShoppingCart, Eye, Star, DollarSign, Package, MessageSquare, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  totalProducts: number;
  availableProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  totalMessages: number;
  totalWishlistItems: number;
  averageRating: number;
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    review_count: number;
    average_rating: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  monthlyStats: {
    users: number;
    orders: number;
    revenue: number;
    reviews: number;
  };
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
  }>;
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Get date range
      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      // Fetch all data in parallel
      const [
        productsResult,
        usersResult,
        ordersResult,
        reviewsResult,
        messagesResult,
        wishlistResult,
        topProductsResult
      ] = await Promise.all([
        // Products
        supabase.from('products').select('id, is_available, category, price'),
        
        // Users from user_profiles (real data)
        supabase.from('user_profiles').select('id, created_at'),
        
        // Orders
        supabase
          .from('orders')
          .select('id, total_amount, created_at')
          .gte('created_at', startDate.toISOString()),
        
        // Reviews with ratings
        supabase
          .from('reviews')
          .select('id, rating, created_at')
          .gte('created_at', startDate.toISOString()),
        
        // Contact messages
        supabase
          .from('contact_messages')
          .select('id, created_at')
          .gte('created_at', startDate.toISOString()),
        
        // Wishlist items
        supabase
          .from('wishlist')
          .select('id, created_at')
          .gte('created_at', startDate.toISOString()),
        
        // Top products with reviews
        supabase
          .from('products')
          .select(`
            id, name, category, price,
            reviews(rating)
          `)
          .eq('is_available', true)
          .limit(5)
      ]);

      // Process the data
      const products = productsResult.data || [];
      const users = usersResult.data || [];
      const orders = ordersResult.data || [];
      const reviews = reviewsResult.data || [];
      const messages = messagesResult.data || [];
      const wishlistItems = wishlistResult.data || [];
      const topProducts = topProductsResult.data || [];

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Process top products
      const processedTopProducts = topProducts.map(product => {
        const productReviews = product.reviews || [];
        const avgRating = productReviews.length > 0
          ? productReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / productReviews.length
          : 0;
        
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          review_count: productReviews.length,
          average_rating: avgRating
        };
      }).sort((a, b) => b.review_count - a.review_count);

      // Generate recent activity from real data
      const recentActivity = [
        ...orders.slice(-5).map(order => ({
          id: order.id,
          type: 'order',
          description: `New order placed - ₹${order.total_amount}`,
          timestamp: order.created_at
        })),
        ...reviews.slice(-5).map(review => ({
          id: review.id,
          type: 'review',
          description: `${review.rating}-star review submitted`,
          timestamp: review.created_at
        })),
        ...messages.slice(-3).map(message => ({
          id: message.id,
          type: 'message',
          description: 'New contact message received',
          timestamp: message.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      // Calculate monthly stats (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const monthlyUsers = users.filter(user => new Date(user.created_at) >= thirtyDaysAgo).length;
      const monthlyOrders = orders.filter(order => new Date(order.created_at) >= thirtyDaysAgo).length;
      const monthlyRevenue = orders
        .filter(order => new Date(order.created_at) >= thirtyDaysAgo)
        .reduce((sum, order) => sum + Number(order.total_amount), 0);
      const monthlyReviews = reviews.filter(review => new Date(review.created_at) >= thirtyDaysAgo).length;

      // Calculate category stats
      const categoryCount = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryStats = Object.entries(categoryCount).map(([category, count]) => ({
        category: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        percentage: (count / products.length) * 100
      }));

      // Calculate user growth (last 6 months)
      const userGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthUsers = users.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= monthStart && userDate <= monthEnd;
        }).length;
        
        userGrowth.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          users: monthUsers
        });
      }

      setAnalyticsData({
        totalProducts: products.length,
        availableProducts: products.filter(p => p.is_available).length,
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        totalReviews: reviews.length,
        totalMessages: messages.length,
        totalWishlistItems: wishlistItems.length,
        averageRating,
        topProducts: processedTopProducts,
        recentActivity,
        monthlyStats: {
          users: monthlyUsers,
          orders: monthlyOrders,
          revenue: monthlyRevenue,
          reviews: monthlyReviews
        },
        categoryStats,
        userGrowth
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-inter">Failed to load analytics data</p>
      </div>
    );
  }

  const overviewStats = [
    { 
      name: 'Total Revenue', 
      value: `₹${analyticsData.totalRevenue.toLocaleString()}`, 
      change: '+12.5%', 
      icon: DollarSign, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      name: 'Total Orders', 
      value: analyticsData.totalOrders.toString(), 
      change: '+8.2%', 
      icon: ShoppingCart, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'Total Users', 
      value: analyticsData.totalUsers.toString(), 
      change: '+15.3%', 
      icon: Users, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      name: 'Avg Rating', 
      value: analyticsData.averageRating.toFixed(1), 
      change: '+0.2', 
      icon: Star, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
  ];

  const additionalStats = [
    { name: 'Products', value: analyticsData.totalProducts, icon: Package },
    { name: 'Reviews', value: analyticsData.totalReviews, icon: Star },
    { name: 'Messages', value: analyticsData.totalMessages, icon: MessageSquare },
    { name: 'Wishlist Items', value: analyticsData.totalWishlistItems, icon: Heart },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-bold text-gray-800">
          Analytics Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((item, index) => (
          <motion.div
            key={item.name}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">{item.name}</p>
                <p className="text-2xl font-playfair font-bold text-gray-800 mt-1">
                  {item.value}
                </p>
                <p className="text-sm font-inter text-green-600 mt-1">{item.change}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.bgColor}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {additionalStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            className="bg-white rounded-xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-playfair font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm font-inter text-gray-600">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-6">
            Product Categories
          </h3>
          <div className="space-y-4">
            {analyticsData.categoryStats.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="font-inter text-gray-700">{category.category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-inter text-gray-600 w-12 text-right">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Growth */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-6">
            User Growth (Last 6 Months)
          </h3>
          <div className="space-y-4">
            {analyticsData.userGrowth.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="font-inter text-gray-700">{month.month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(10, (month.users / Math.max(...analyticsData.userGrowth.map(m => m.users))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-inter text-gray-600 w-8 text-right">
                    {month.users}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-6">
            Top Performing Products
          </h3>
          <div className="space-y-4">
            {analyticsData.topProducts.length > 0 ? (
              analyticsData.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-inter font-medium text-gray-800">{product.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="capitalize">{product.category.replace('-', ' ')}</span>
                      <span>•</span>
                      <span>{product.review_count} reviews</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-current" />
                        <span>{product.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-inter font-semibold text-gray-800">₹{product.price}</p>
                    <p className="text-sm text-gray-600">price</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No product data available</p>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {analyticsData.recentActivity.length > 0 ? (
              analyticsData.recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'order' ? 'bg-green-500' :
                    activity.type === 'review' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-inter font-medium text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Monthly Performance */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-6">
          Monthly Performance (Last 30 Days)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-playfair font-bold text-blue-600">{analyticsData.monthlyStats.users}</p>
            <p className="text-sm font-inter text-gray-600">New Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-playfair font-bold text-green-600">{analyticsData.monthlyStats.orders}</p>
            <p className="text-sm font-inter text-gray-600">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-playfair font-bold text-purple-600">₹{analyticsData.monthlyStats.revenue.toLocaleString()}</p>
            <p className="text-sm font-inter text-gray-600">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-playfair font-bold text-yellow-600">{analyticsData.monthlyStats.reviews}</p>
            <p className="text-sm font-inter text-gray-600">Reviews</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;