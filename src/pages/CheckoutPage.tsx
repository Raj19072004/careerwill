import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { ShoppingBag, CreditCard, MapPin, User, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (cartState.items.length === 0) {
      navigate('/products');
    }
  }, [cartState.items.length, navigate]);

  // Load shipping address from profile when profile data is available
  useEffect(() => {
    if (profile) {
      setShippingAddress({
        fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        phone: profile.phone || '',
        address: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        pincode: profile.address?.pincode || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const required = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (cartState.hasSpecialOffer) {
      toast.error('Cannot apply coupon when special offer (₹999 for first 3 items) is active');
      return;
    }

    setCouponLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        toast.error('Invalid or expired coupon code');
        return;
      }

      // Check if coupon is still valid
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = new Date(coupon.valid_until);

      if (now < validFrom || now > validUntil) {
        toast.error('Coupon has expired or is not yet valid');
        return;
      }

      // Check usage limit
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast.error('Coupon usage limit exceeded');
        return;
      }

      applyCoupon(coupon);
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        total_amount: cartState.finalTotal,
        status: 'pending',
        payment_method: paymentMethod,
        items: cartState.items,
        shipping_address: shippingAddress,
        coupon_code: cartState.appliedCoupon?.code || null,
        discount_amount: cartState.hasSpecialOffer ? cartState.discountAmount : cartState.couponDiscount,
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Update coupon usage if applied
      if (cartState.appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ used_count: cartState.appliedCoupon.used_count + 1 })
          .eq('id', cartState.appliedCoupon.id);
      }

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartState.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {cartState.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            {!cartState.hasSpecialOffer && (
              <div className="border-t pt-4 mb-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Coupon Code
                </h3>
                
                {cartState.appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-green-800">{cartState.appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">{cartState.appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {cartState.hasSpecialOffer && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 font-medium">🎉 Special Offer Applied!</p>
                <p className="text-yellow-600 text-sm">First 3 products for ₹999</p>
                <p className="text-xs text-yellow-500 mt-1">Coupons cannot be applied with this offer</p>
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{cartState.total.toFixed(2)}</span>
              </div>
              
              {cartState.hasSpecialOffer && (
                <div className="flex justify-between text-green-600">
                  <span>Special Offer Discount:</span>
                  <span>-₹{cartState.discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              {cartState.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount:</span>
                  <span>-₹{cartState.couponDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span>₹{cartState.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'online')}
                    className="text-indigo-600"
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    disabled
                    className="text-indigo-600"
                  />
                  <span>Online Payment (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Placing Order...' : `Place Order - ₹${cartState.finalTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;