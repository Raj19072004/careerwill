import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import EditProductForm from './EditProductForm';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { products, deleteProduct, updateProduct } = useProducts();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const { error } = await deleteProduct(id);
      if (error) {
        toast.error('Failed to delete product');
      } else {
        toast.success('Product deleted successfully');
      }
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await updateProduct(id, { is_available: !currentStatus });
    if (error) {
      toast.error('Failed to update product status');
    } else {
      toast.success(`Product ${!currentStatus ? 'made available' : 'marked as coming soon'}`);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
          No Products Yet
        </h3>
        <p className="text-gray-600 font-inter">
          Add your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-200">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Eye className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-inter font-medium ${
                product.is_available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {product.is_available ? 'Available' : 'Coming Soon'}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 font-inter text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-playfair font-bold text-primary-600">
                  ${product.price}
                </span>
                <span className="text-sm text-gray-500 font-inter">
                  {product.category}
                </span>
              </div>

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {product.benefits.slice(0, 2).map((benefit, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full font-inter"
                      >
                        {benefit}
                      </span>
                    ))}
                    {product.benefits.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-inter">
                        +{product.benefits.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleAvailability(product.id, product.is_available)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-inter font-medium text-sm transition-colors duration-200 ${
                    product.is_available
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.is_available ? <EyeOff size={14} /> : <Eye size={14} />}
                  {product.is_available ? 'Hide' : 'Show'}
                </button>
                
                <button
                  onClick={() => setEditingProduct(product.id)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-inter font-medium text-sm transition-colors duration-200"
                >
                  <Edit size={14} />
                  Edit
                </button>
                
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-inter font-medium text-sm transition-colors duration-200"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductForm
          productId={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  );
};

export default ProductList;