import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, X, Eye, MapPin, User, Phone, Mail, CreditCard, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_id: string;
  items: any[];
  shipping_address: any;
  coupon_code: string | null;
  discount_amount: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get user details for each order
      const userIds = [...new Set(ordersData?.map(order => order.user_id).filter(Boolean))];
      
      let userProfiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        userProfiles = profilesData || [];
      }

      // Combine orders with user data
      const ordersWithUsers = ordersData?.map(order => {
        const userProfile = userProfiles.find(profile => profile.id === order.user_id);
        return {
          ...order,
          user_name: userProfile 
            ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User'
            : 'Unknown User',
          user_email: order.shipping_address?.email || 'No email'
        };
      }) || [];

      setOrders(ordersWithUsers);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const orderStats = [
    { 
      name: 'Total Orders', 
      value: orders.length, 
      icon: Package, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'Pending', 
      value: orders.filter(o => o.status === 'pending').length, 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    { 
      name: 'Shipped', 
      value: orders.filter(o => o.status === 'shipped').length, 
      icon: Truck, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      name: 'Delivered', 
      value: orders.filter(o => o.status === 'delivered').length, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-bold text-gray-800">
          Order Management
        </h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderStats.map((stat, index) => (
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
                <p className="text-2xl font-playfair font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Order ID</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Customer</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Amount</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Status</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Payment</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Date</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="py-4 px-4">
                    <p className="font-inter font-medium text-gray-800">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-inter font-medium text-gray-800">
                        {order.user_name}
                      </p>
                      <p className="text-sm text-gray-600">{order.user_email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-inter font-semibold text-gray-800">
                      ₹{order.total_amount.toFixed(2)}
                    </p>
                    {order.discount_amount > 0 && (
                      <p className="text-sm text-green-600">
                        Discount: ₹{order.discount_amount.toFixed(2)}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-inter font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-inter text-gray-600 capitalize">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-inter text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Confirm order"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                          title="Mark as shipped"
                        >
                          <Truck size={16} />
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Mark as delivered"
                        >
                          <Package size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600 font-inter">
              {filterStatus === 'all' 
                ? 'No orders have been placed yet.'
                : `No ${filterStatus} orders found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-playfair font-bold text-gray-800">
                  Order Details #{selectedOrder.id.slice(-8).toUpperCase()}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
                      Order Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">#{selectedOrder.id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">
                          {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}
                        </span>
                      </div>
                      {selectedOrder.coupon_code && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coupon Used:</span>
                          <span className="font-medium text-green-600">{selectedOrder.coupon_code}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.user_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.user_email}</span>
                      </div>
                      {selectedOrder.shipping_address?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedOrder.shipping_address.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
                      Shipping Address
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium">
                            {selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}
                          </p>
                          <p className="text-gray-600">{selectedOrder.shipping_address?.address}</p>
                          <p className="text-gray-600">
                            {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img
                          src={item.image_url || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-inter font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{item.category?.replace('-', ' ')}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-inter font-semibold text-gray-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>₹{(selectedOrder.total_amount + selectedOrder.discount_amount).toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-₹{selectedOrder.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                        <span>Total:</span>
                        <span className="text-primary-600">₹{selectedOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  <div className="mt-6">
                    <h4 className="font-inter font-semibold text-gray-800 mb-3">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          disabled={selectedOrder.status === status}
                          className={`px-4 py-2 rounded-lg font-inter font-medium text-sm transition-colors duration-200 ${
                            selectedOrder.status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;