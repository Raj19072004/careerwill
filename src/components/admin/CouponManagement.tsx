import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Calendar, Percent, DollarSign, Users, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

interface CouponForm {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponForm>();

  const discountType = watch('discount_type');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      toast.error('Failed to fetch coupons');
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CouponForm) => {
    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(data)
          .eq('id', editingCoupon.id);

        if (error) throw error;
        toast.success('Coupon updated successfully');
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([{ ...data, code: data.code.toUpperCase() }]);

        if (error) throw error;
        toast.success('Coupon created successfully');
      }

      fetchCoupons();
      handleCloseForm();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Coupon code already exists');
      } else {
        toast.error('Failed to save coupon');
      }
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setValue('code', coupon.code);
    setValue('description', coupon.description);
    setValue('discount_type', coupon.discount_type);
    setValue('discount_value', coupon.discount_value);
    setValue('min_order_amount', coupon.min_order_amount);
    setValue('max_uses', coupon.max_uses);
    setValue('valid_from', coupon.valid_from.split('T')[0]);
    setValue('valid_until', coupon.valid_until.split('T')[0]);
    setValue('is_active', coupon.is_active);
    setShowForm(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    reset();
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('code', result);
  };

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
          Coupon Management
        </h2>
        <motion.button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Create Coupon
        </motion.button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon, index) => (
          <motion.div
            key={coupon.id}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-primary-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-playfair font-bold text-gray-800">
                  {coupon.code}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-inter ${
                coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {coupon.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-gray-600 font-inter mb-4">{coupon.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold text-primary-600">
                  {coupon.discount_type === 'percentage' 
                    ? `${coupon.discount_value}%` 
                    : `₹${coupon.discount_value}`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Min Order:</span>
                <span className="font-semibold">₹{coupon.min_order_amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Usage:</span>
                <span className="font-semibold">
                  {coupon.used_count}/{coupon.max_uses || '∞'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valid Until:</span>
                <span className="font-semibold">
                  {new Date(coupon.valid_until).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-inter font-medium text-sm transition-colors duration-200 ${
                  coupon.is_active
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {coupon.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                {coupon.is_active ? 'Deactivate' : 'Activate'}
              </button>
              
              <button
                onClick={() => handleEdit(coupon)}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-inter font-medium text-sm transition-colors duration-200"
              >
                <Edit size={14} />
              </button>
              
              <button
                onClick={() => handleDelete(coupon.id, coupon.code)}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-inter font-medium text-sm transition-colors duration-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
            No Coupons Yet
          </h3>
          <p className="text-gray-600 font-inter">
            Create your first coupon to offer discounts to customers.
          </p>
        </div>
      )}

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-playfair font-bold text-gray-800">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        {...register('code', { required: 'Coupon code is required' })}
                        type="text"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter uppercase"
                        placeholder="SAVE20"
                      />
                      <button
                        type="button"
                        onClick={generateCouponCode}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      Discount Type
                    </label>
                    <select
                      {...register('discount_type', { required: 'Discount type is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    {...register('description', { required: 'Description is required' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                    placeholder="Get 20% off on your order"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                    </label>
                    <input
                      {...register('discount_value', { 
                        required: 'Discount value is required',
                        min: { value: 0, message: 'Value must be positive' }
                      })}
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                      placeholder={discountType === 'percentage' ? '20' : '100'}
                    />
                    {errors.discount_value && (
                      <p className="mt-1 text-sm text-red-600">{errors.discount_value.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      {...register('min_order_amount', { 
                        required: 'Minimum order amount is required',
                        min: { value: 0, message: 'Amount must be positive' }
                      })}
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                      placeholder="500"
                    />
                    {errors.min_order_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.min_order_amount.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Maximum Uses (leave empty for unlimited)
                  </label>
                  <input
                    {...register('max_uses')}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                    placeholder="100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      Valid From
                    </label>
                    <input
                      {...register('valid_from', { required: 'Start date is required' })}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                    />
                    {errors.valid_from && (
                      <p className="mt-1 text-sm text-red-600">{errors.valid_from.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                      Valid Until
                    </label>
                    <input
                      {...register('valid_until', { required: 'End date is required' })}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
                    />
                    {errors.valid_until && (
                      <p className="mt-1 text-sm text-red-600">{errors.valid_until.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    {...register('is_active')}
                    type="checkbox"
                    id="is_active"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-inter font-medium text-gray-700">
                    Activate coupon immediately
                  </label>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-inter font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;