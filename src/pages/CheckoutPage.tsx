import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, Lock, CheckCircle, Truck, Shield, Tag, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'card' | 'upi' | 'cod';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
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

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const { state: cartState, clearCart, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Debug cart state on checkout page
  useEffect(() => {
    console.log('Checkout page - cart state:', cartState);
  }, [cartState]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>();

  const paymentMethod = watch('paymentMethod');

  // Pre-fill form with user data
  React.useEffect(() => {
    if (user && profile) {
      setValue('firstName', profile.first_name || '');
      setValue('lastName', profile.last_name || '');
      setValue('email', user.email || '');
      setValue('phone', profile.phone || '');
      
      if (profile.address) {
        setValue('address', profile.address.street || '');
        setValue('city', profile.address.city || '');
        setValue('state', profile.address.state || '');
        setValue('pincode', profile.address.pincode || '');
      }
    }
  }, [user, profile, setValue]);

  const steps = [
    { id: 1, name: 'Shipping', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Confirmation', icon: CheckCircle },
  ];

  const applyCouponCode = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching coupon:', error);
        toast.error('Failed to validate coupon');
        return;
      }

      if (!coupons || coupons.length === 0) {
        toast.error('Invalid or expired coupon code');
        return;
      }

      const coupon = coupons[0];

      // Check if coupon is still valid
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = new Date(coupon.valid_until);

      if (now < validFrom || now > validUntil) {
        toast.error('Coupon has expired');
        return;
      }

      // Check usage limit
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast.error('Coupon usage limit exceeded');
        return;
      }

      // Check minimum order amount
      const orderTotal = cartState.hasSpecialOffer ? 999 : cartState.total;
      if (orderTotal < coupon.min_order_amount) {
        toast.error(`Minimum order amount of ₹${coupon.min_order_amount} required`);
        return;
      }

      applyCoupon(coupon);
      setCouponCode('');
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      setLoading(true);

      // Create order in database
      const orderData = {
        user_id: user?.id,
        total_amount: cartState.finalTotal,
        status: 'pending',
        items: cartState.items,
        shipping_address: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          phone: data.phone,
        },
        payment_method: data.paymentMethod,
        payment_id: data.paymentMethod === 'cod' ? 'COD' : `PAY_${Date.now()}`,
        coupon_code: cartState.appliedCoupon?.code || null,
        discount_amount: (cartState.discountAmount || 0) + (cartState.couponDiscount || 0),
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

      // Update user profile with shipping address
      if (profile) {
        await supabase
          .from('user_profiles')
          .update({
            address: {
              street: data.address,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
            },
            phone: data.phone,
          })
          .eq('id', user?.id);
      }

      // Clear cart and redirect
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-confirmation/${order.id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 font-inter mb-6">
            Add some products to proceed with checkout
          </p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-playfair font-bold text-gray-800">
            Checkout
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <step.icon size={20} />
                  </div>
                  <span className={`ml-3 font-inter font-medium ${
                    currentStep >= step.id ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-6">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-playfair font-bold text-gray-800 mb-6">
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          {...register('firstName', { required: 'First name is required' })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                          placeholder="Enter first name"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                        placeholder="Enter last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          {...register('email', { required: 'Email is required' })}
                          type="email"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                          placeholder="Enter email"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          {...register('phone', { required: 'Phone is required' })}
                          type="tel"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                          placeholder="Enter phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <textarea
                        {...register('address', { required: 'Address is required' })}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter resize-none"
                        placeholder="Enter full address"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        {...register('city', { required: 'City is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                        placeholder="Enter city"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        {...register('state', { required: 'State is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                        placeholder="Enter state"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      <input
                        {...register('pincode', { required: 'PIN code is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                        placeholder="Enter PIN code"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-playfair font-bold text-gray-800 mb-6">
                    Payment Information
                  </h2>

                  <div className="mb-6">
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
                        { id: 'upi', name: 'UPI', icon: Phone },
                        { id: 'cod', name: 'Cash on Delivery', icon: Truck },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            paymentMethod === method.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            {...register('paymentMethod', { required: 'Payment method is required' })}
                            type="radio"
                            value={method.id}
                            className="sr-only"
                          />
                          <method.icon className="w-5 h-5 text-gray-600 mr-3" />
                          <span className="font-inter font-medium">{method.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            {...register('cardNumber', { required: paymentMethod === 'card' ? 'Card number is required' : false })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            {...register('expiryDate', { required: paymentMethod === 'card' ? 'Expiry date is required' : false })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                            placeholder="MM/YY"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              {...register('cvv', { required: paymentMethod === 'card' ? 'CVV is required' : false })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        {...register('upiId', { required: paymentMethod === 'upi' ? 'UPI ID is required' : false })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                        placeholder="yourname@upi"
                      />
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm font-inter text-yellow-800">
                        You will pay ₹{cartState.finalTotal.toFixed(2)} in cash when your order is delivered.
                        A small convenience fee may apply for Cash on Delivery orders.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-playfair font-bold text-gray-800 mb-6">
                    Order Confirmation
                  </h2>

                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-inter font-semibold text-green-800">
                            Ready to place your order
                          </h3>
                          <p className="text-sm text-green-600">
                            Please review your order details before confirming
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-inter font-semibold text-gray-800 mb-3">Shipping Address</h4>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="font-inter">{watch('firstName')} {watch('lastName')}</p>
                          <p className="text-sm text-gray-600">{watch('address')}</p>
                          <p className="text-sm text-gray-600">{watch('city')}, {watch('state')} {watch('pincode')}</p>
                          <p className="text-sm text-gray-600">{watch('phone')}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-inter font-semibold text-gray-800 mb-3">Payment Method</h4>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="font-inter capitalize">
                            {paymentMethod === 'card' ? 'Credit/Debit Card' : 
                             paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                          </p>
                          {paymentMethod === 'card' && watch('cardNumber') && (
                            <p className="text-sm text-gray-600">**** **** **** {watch('cardNumber')?.slice(-4)}</p>
                          )}
                          {paymentMethod === 'upi' && watch('upiId') && (
                            <p className="text-sm text-gray-600">{watch('upiId')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-inter font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back
                  </button>
                )}
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : currentStep === 3 ? (
                    'Place Order'
                  ) : (
                    'Continue'
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-playfair font-bold text-gray-800 mb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-inter font-medium text-gray-800 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-inter font-semibold text-gray-800">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-inter font-semibold text-gray-800 mb-3">Apply Coupon</h4>
                {cartState.appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-inter font-medium text-green-800">{cartState.appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">{cartState.appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter text-sm"
                    />
                    <button
                      onClick={applyCouponCode}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {couponLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Tag size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-800">₹{cartState.total.toFixed(2)}</span>
                </div>
                
                {cartState.hasSpecialOffer && (
                  <div className="flex justify-between font-inter text-green-600">
                    <span>Special Offer Discount:</span>
                    <span>-₹{cartState.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {cartState.appliedCoupon && (
                  <div className="flex justify-between font-inter text-blue-600">
                    <span>Coupon Discount:</span>
                    <span>-₹{cartState.couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-800">Free</span>
                </div>
                
                <div className="flex justify-between font-playfair font-bold text-lg border-t border-gray-200 pt-3">
                  <span>Total:</span>
                  <span className="text-primary-600">₹{cartState.finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;