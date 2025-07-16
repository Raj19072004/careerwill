import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Plus, Minus, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  images?: string[];
  featured_image?: string;
  benefits: string[];
  price: number;
  is_available: boolean;
  category: string;
  ingredients: string;
  stock_quantity?: number;
  sku?: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
}

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url || product.featured_image || "https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg"];

  useEffect(() => {
    if (isOpen && product) {
      fetchReviews();
      setCurrentImageIndex(0);
    }
  }, [isOpen, product]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      
      // First, get the reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Then, get user profiles for the user names
      const userIds = reviewsData?.map(review => review.user_id).filter(Boolean) || [];
      
      let userProfiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        if (!profilesError) {
          userProfiles = profilesData || [];
        }
      }

      // Combine reviews with user names
      const formattedReviews = reviewsData?.map(review => {
        const userProfile = userProfiles.find(profile => profile.id === review.user_id);
        const userName = userProfile 
          ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Anonymous User'
          : 'Anonymous User';

        return {
          ...review,
          user_name: userName
        };
      }) || [];

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: product.id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment.trim()
        }]);

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this product');
        } else {
          throw error;
        }
      } else {
        toast.success('Review submitted successfully!');
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to submit review');
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: productImages[0],
        category: product.category
      });
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-playfair font-bold text-gray-800">
                    Product Details
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                    {/* Product Images */}
                    <div className="space-y-4">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                        <img
                          src={productImages[currentImageIndex]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Image Navigation */}
                        {productImages.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
                            >
                              <ChevronRight size={20} />
                            </button>
                            
                            {/* Image Indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                              {productImages.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Thumbnail Images */}
                      {productImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {productImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`${product.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-3xl font-playfair font-bold text-gray-800 mb-2">
                          {product.name}
                        </h1>
                        {product.sku && (
                          <p className="text-sm text-gray-500 font-inter mb-2">SKU: {product.sku}</p>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={`${
                                  i < Math.floor(averageRating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-gray-600 font-inter ml-2">
                              {averageRating.toFixed(1)} ({reviews.length} reviews)
                            </span>
                          </div>
                        </div>
                        <p className="text-4xl font-playfair font-bold text-primary-600 mb-4">
                          ₹{product.price}
                        </p>
                        {product.stock_quantity !== undefined && (
                          <p className="text-sm text-gray-600 font-inter mb-4">
                            {product.stock_quantity > 0 
                              ? `${product.stock_quantity} in stock` 
                              : 'Out of stock'
                            }
                          </p>
                        )}
                        <p className="text-gray-600 font-inter leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Benefits */}
                      {product.benefits && product.benefits.length > 0 && (
                        <div>
                          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-3">
                            Key Benefits
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {product.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 font-inter">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ingredients */}
                      {product.ingredients && (
                        <div>
                          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-3">
                            Key Ingredients
                          </h3>
                          <p className="text-gray-600 font-inter">{product.ingredients}</p>
                        </div>
                      )}

                      {/* Quantity and Add to Cart */}
                      {product.is_available && (product.stock_quantity === undefined || product.stock_quantity > 0) && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                              Quantity
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-12 text-center font-inter font-medium">{quantity}</span>
                              <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <motion.button
                              onClick={handleAddToCart}
                              className="flex-1 bg-gradient-to-r from-primary-600 to-sage-600 text-white py-4 rounded-xl font-inter font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <ShoppingCart size={20} />
                              {isInCart(product.id) ? 'Add More to Cart' : 'Add to Cart'}
                            </motion.button>
                            <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                              <Heart size={20} />
                            </button>
                            <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                              <Share2 size={20} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                        <div className="text-center">
                          <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                          <p className="text-sm font-inter font-medium text-gray-800">Free Shipping</p>
                          <p className="text-xs text-gray-600">On orders over ₹999</p>
                        </div>
                        <div className="text-center">
                          <Shield className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                          <p className="text-sm font-inter font-medium text-gray-800">100% Natural</p>
                          <p className="text-xs text-gray-600">Chemical-free formula</p>
                        </div>
                        <div className="text-center">
                          <RotateCcw className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                          <p className="text-sm font-inter font-medium text-gray-800">Easy Returns</p>
                          <p className="text-xs text-gray-600">30-day return policy</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="border-t border-gray-200 p-6">
                    <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-6">
                      Customer Reviews
                    </h3>

                    {/* Rating Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="text-center">
                        <div className="text-5xl font-playfair font-bold text-gray-800 mb-2">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={24}
                              className={`${
                                i < Math.floor(averageRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 font-inter">
                          Based on {reviews.length} reviews
                        </p>
                      </div>

                      <div className="space-y-2">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm font-inter w-8">{rating}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 font-inter w-8">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Write Review */}
                    {user && (
                      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <h4 className="text-lg font-playfair font-semibold text-gray-800 mb-4">
                          Write a Review
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                              Rating
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                  className="p-1"
                                >
                                  <Star
                                    size={24}
                                    className={`${
                                      rating <= newReview.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    } hover:text-yellow-400 transition-colors duration-200`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                              Comment
                            </label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter resize-none"
                              placeholder="Share your experience with this product..."
                            />
                          </div>
                          <motion.button
                            onClick={submitReview}
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-sage-600 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                          >
                            {loading ? 'Submitting...' : 'Submit Review'}
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {reviewsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                          <motion.div 
                            key={review.id} 
                            className="border-b border-gray-200 pb-6 last:border-b-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-sage-400 rounded-full flex items-center justify-center text-white font-inter font-medium">
                                {review.user_name[0]?.toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-inter font-semibold text-gray-800">
                                    {review.user_name}
                                  </h5>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={16}
                                        className={`${
                                          i < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 font-inter">
                                    {new Date(review.created_at).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                                <p className="text-gray-600 font-inter leading-relaxed">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                            No Reviews Yet
                          </h4>
                          <p className="text-gray-600 font-inter">
                            Be the first to review this product!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetail;