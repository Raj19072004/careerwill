import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, Calendar, CreditCard, ArrowRight, Download, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_id: string;
  items: any[];
  shipping_address: any;
  coupon_code: string | null;
  discount_amount: number;
  created_at: string;
}

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => [
    { id: 'confirmed', name: 'Order Confirmed', icon: CheckCircle, completed: true },
    { id: 'processing', name: 'Processing', icon: Package, completed: order?.status !== 'pending' },
    { id: 'shipped', name: 'Shipped', icon: Truck, completed: ['shipped', 'delivered'].includes(order?.status || '') },
    { id: 'delivered', name: 'Delivered', icon: MapPin, completed: order?.status === 'delivered' },
  ];

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 font-inter mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-4xl font-playfair font-bold text-gray-800 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 font-inter">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          className="bg-white rounded-3xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-2">
                Order #{order.id.slice(-8).toUpperCase()}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard size={16} />
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Download size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Order Status */}
          <div className="mb-8">
            <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
              Order Status
            </h3>
            <div className="flex items-center justify-between">
              {getStatusSteps().map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      step.completed
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <step.icon size={20} />
                    </div>
                    <span className={`mt-2 text-sm font-inter ${
                      step.completed ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < getStatusSteps().length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      getStatusSteps()[index + 1].completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
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
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
              Shipping Address
            </h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-inter font-medium text-gray-800">
                    {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                  </p>
                  <p className="text-gray-600">{order.shipping_address?.address}</p>
                  <p className="text-gray-600">
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
                  </p>
                  <p className="text-gray-600">{order.shipping_address?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{(order.total_amount + order.discount_amount).toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.coupon_code && `(${order.coupon_code})`}:</span>
                  <span>-₹{order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
                <span>Total:</span>
                <span className="text-primary-600">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          className="bg-white rounded-3xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
            What's Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-primary-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-inter font-medium text-gray-800">Order Confirmation</p>
                <p className="text-sm text-gray-600">You'll receive an email confirmation shortly with your order details.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-primary-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-inter font-medium text-gray-800">Processing</p>
                <p className="text-sm text-gray-600">We'll prepare your order for shipment within 1-2 business days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-primary-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-inter font-medium text-gray-800">Shipping</p>
                <p className="text-sm text-gray-600">Your order will be shipped and you'll receive tracking information.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-inter font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            View Order History
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;