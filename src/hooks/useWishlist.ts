import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    price: number;
    category: string;
    is_available: boolean;
  };
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products(
            id,
            name,
            description,
            image_url,
            price,
            category,
            is_available
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{
          user_id: user.id,
          product_id: productId
        }])
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products(
            id,
            name,
            description,
            image_url,
            price,
            category,
            is_available
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Item already in wishlist');
          return { error: 'Already in wishlist' };
        }
        throw error;
      }

      setWishlistItems(prev => [data, ...prev]);
      toast.success('Added to wishlist');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add to wishlist';
      toast.error(error);
      return { error };
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Removed from wishlist');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      toast.error(error);
      return { error };
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  return {
    wishlistItems,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
};