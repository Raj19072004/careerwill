import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Plus, Minus, Save } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import toast from 'react-hot-toast';

interface ProductForm {
  name: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  ingredients: string;
  is_available: boolean;
}

interface EditProductFormProps {
  productId: string;
  onClose: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ productId, onClose }) => {
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const { products, updateProduct } = useProducts();

  const product = products.find(p => p.id === productId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>();

  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('image_url', product.image_url || '');
      setValue('price', product.price);
      setValue('category', product.category);
      setValue('ingredients', product.ingredients || '');
      setValue('is_available', product.is_available);
      setBenefits(product.benefits.length > 0 ? product.benefits : ['']);
    }
  }, [product, setValue]);

  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      setLoading(true);
      const filteredBenefits = benefits.filter(benefit => benefit.trim() !== '');
      
      const { error } = await updateProduct(productId, {
        ...data,
        benefits: filteredBenefits,
        price: Number(data.price),
      });

      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated successfully');
        onClose();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-playfair font-bold text-gray-800">
            Edit Product
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                {...register('name', { required: 'Product name is required' })}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 font-inter">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
              >
                <option value="">Select category</option>
                <option value="face-wash">Face Wash</option>
                <option value="scrub">Scrub</option>
                <option value="serum">Serum</option>
                <option value="moisturizer">Moisturizer</option>
                <option value="eye-cream">Eye Cream</option>
                <option value="mask">Mask</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 font-inter">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter resize-none"
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 font-inter">{errors.description.message}</p>
            )}
          </div>

          {/* Image URL and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                {...register('image_url')}
                type="url"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 font-inter">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
              Benefits
            </label>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                    placeholder="Enter benefit"
                  />
                  {benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addBenefit}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200 font-inter font-medium"
              >
                <Plus size={16} />
                Add Benefit
              </button>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
              Ingredients
            </label>
            <textarea
              {...register('ingredients')}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter resize-none"
              placeholder="List key ingredients separated by commas"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              {...register('is_available')}
              type="checkbox"
              id="is_available"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_available" className="text-sm font-inter font-medium text-gray-700">
              Product is available for purchase
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-inter font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Update Product
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProductForm;