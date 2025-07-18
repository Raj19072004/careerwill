import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  category: string;
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

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  discountAmount: number;
  finalTotal: number;
  hasSpecialOffer: boolean;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'APPLY_COUPON'; payload: { coupon: Coupon; discount: number } }
  | { type: 'REMOVE_COUPON' };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateTotals = (state: CartState): CartState => {
  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Special offer: First 3 products for ₹999, additional items at original price
  let discountAmount = 0;
  let hasSpecialOffer = false;
  let finalTotal = total;
  let couponDiscount = 0;
  
  if (itemCount >= 3) {
    // Calculate cost for first 3 items
    let itemsProcessed = 0;
    let firstThreeItemsCost = 0;
    let additionalItemsCost = 0;
    
    for (const item of state.items) {
      const remainingForOffer = Math.max(0, 3 - itemsProcessed);
      const itemsInOffer = Math.min(item.quantity, remainingForOffer);
      const additionalItems = item.quantity - itemsInOffer;
      
      firstThreeItemsCost += item.price * itemsInOffer;
      additionalItemsCost += item.price * additionalItems;
      itemsProcessed += item.quantity;
    }
    
    // Apply special offer only if first 3 items cost more than ₹999
    if (firstThreeItemsCost > 999) {
      discountAmount = firstThreeItemsCost - 999;
      finalTotal = 999 + additionalItemsCost;
      hasSpecialOffer = true;
    } else {
      // If first 3 items cost ≤ ₹999, no special offer
      finalTotal = total;
    }
  } else {
    // Less than 3 items, check for coupon
    if (state.appliedCoupon) {
      if (total >= state.appliedCoupon.min_order_amount) {
        if (state.appliedCoupon.discount_type === 'percentage') {
          couponDiscount = (total * state.appliedCoupon.discount_value) / 100;
        } else {
          couponDiscount = state.appliedCoupon.discount_value;
        }
        finalTotal = Math.max(0, total - couponDiscount);
      }
    }
  }
  
  // Only apply coupon if special offer is not active
  if (!hasSpecialOffer && state.appliedCoupon) {
    if (total >= state.appliedCoupon.min_order_amount) {
      if (state.appliedCoupon.discount_type === 'percentage') {
        couponDiscount = (total * state.appliedCoupon.discount_value) / 100;
      } else {
        couponDiscount = state.appliedCoupon.discount_value;
      }
      finalTotal = Math.max(0, total - couponDiscount);
    }
  }
  
  return { 
    ...state, 
    total, 
    itemCount, 
    discountAmount,
    finalTotal,
    hasSpecialOffer = true;
    couponDiscount
  };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      console.log('Adding item to cart:', action.payload);
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        const newState = calculateTotals({ ...state, items: updatedItems });
        console.log('Updated cart state:', newState);
        return newState;
      } else {
        const newItem = { ...action.payload, quantity: 1 };
        const newState = calculateTotals({ ...state, items: [...state.items, newItem] });
        console.log('New cart state:', newState);
        return newState;
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return calculateTotals({ ...state, items: updatedItems });
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const updatedItems = state.items.filter(item => item.id !== action.payload.id);
        return calculateTotals({ ...state, items: updatedItems });
      }
      
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return calculateTotals({ ...state, items: updatedItems });
    }
    
    case 'CLEAR_CART':
      return { 
        items: [], 
        total: 0, 
        itemCount: 0, 
        discountAmount: 0, 
        finalTotal: 0, 
        hasSpecialOffer: false,
        appliedCoupon: null,
        couponDiscount: 0
      };
    
    case 'LOAD_CART':
      console.log('Loading cart from storage:', action.payload);
      return calculateTotals({ ...state, items: action.payload });
    
    case 'APPLY_COUPON':
      // Don't allow coupon if special offer is active
      const currentState = { ...state, appliedCoupon: action.payload.coupon };
      const tempCalculated = calculateTotals(currentState);
      
      if (tempCalculated.hasSpecialOffer) {
        return state; // Don't apply coupon if special offer is active
      }
      
      return calculateTotals({
        ...state,
        appliedCoupon: action.payload.coupon,
        couponDiscount: 0 // Will be calculated in calculateTotals
      });
    
    case 'REMOVE_COUPON':
      return calculateTotals({
        ...state,
        appliedCoupon: null,
        couponDiscount: 0
      });
    
    default:
      return state;
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    discountAmount: 0,
    finalTotal: 0,
    hasSpecialOffer: false,
    appliedCoupon: null,
    couponDiscount: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('auresta-cart');
      const savedCoupon = localStorage.getItem('auresta-coupon');
      
      console.log('Loading saved cart:', savedCart);
      
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        }
      }
      
      if (savedCoupon) {
        const { coupon, discount } = JSON.parse(savedCoupon);
        dispatch({ type: 'APPLY_COUPON', payload: { coupon, discount } });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('auresta-cart');
      localStorage.removeItem('auresta-coupon');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      console.log('Saving cart to localStorage:', state.items);
      localStorage.setItem('auresta-cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    try {
      if (state.appliedCoupon) {
        localStorage.setItem('auresta-coupon', JSON.stringify({
          coupon: state.appliedCoupon,
          discount: state.couponDiscount
        }));
      } else {
        localStorage.removeItem('auresta-coupon');
      }
    } catch (error) {
      console.error('Error saving coupon to localStorage:', error);
    }
  }, [state.appliedCoupon, state.couponDiscount]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    console.log('addItem called with:', item);
    
    // Validate item data
    if (!item.id || !item.name || !item.price) {
      
      // Calculate if this triggers the special offer
      let triggersSpecialOffer = false;
      if (newItemCount === 3) {
        // Check if first 3 items would cost more than ₹999
        let itemsProcessed = 0;
        let firstThreeItemsCost = 0;
        const tempItems = [...state.items];
        
        // Add the new item temporarily
        const existingItem = tempItems.find(i => i.id === item.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          tempItems.push({ ...item, quantity: 1 });
        }
        
        for (const cartItem of tempItems) {
          const remainingForOffer = Math.max(0, 3 - itemsProcessed);
          const itemsInOffer = Math.min(cartItem.quantity, remainingForOffer);
          firstThreeItemsCost += cartItem.price * itemsInOffer;
          itemsProcessed += cartItem.quantity;
          if (itemsProcessed >= 3) break;
        }
        
        triggersSpecialOffer = firstThreeItemsCost > 999;
      }
      toast.error('Invalid product data');
      return;
      if (triggersSpecialOffer) {
      }
    }

    dispatch({ type: 'ADD_ITEM', payload: item });
    
    // Show special offer notification if applicable
    const newItemCount = state.itemCount + 1;
    const newTotal = state.total + item.price;
        toast.success(`🎉 Special Offer Applied! First 3 products for ₹999`, {
        }
        )
    // Remove any applied coupon when special offer becomes active
    if (newItemCount === 3 && newTotal > 999) {
      if (state.appliedCoupon) {
        dispatch({ type: 'REMOVE_COUPON' });
        toast.success(`Coupon removed - Special offer applied instead!`, {
          duration: 3000,
        });
      }
      toast.success(`🎉 Special Offer Applied! Buy any 3 products for ₹999`, {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white',
          fontWeight: 'bold',
        },
      });
    } else {
      toast.success(`${item.name} added to cart!`);
    }
  };

  const removeItem = (id: string) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    if (item) {
      toast.success(`${item.name} removed from cart`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('auresta-cart');
    localStorage.removeItem('auresta-coupon');
    toast.success('Cart cleared');
  };

  const isInCart = (id: string) => {
    return state.items.some(item => item.id === id);
  };

  const applyCoupon = (coupon: Coupon) => {
    // Check if special offer is already active
    if (state.hasSpecialOffer) {
      toast.error('Cannot apply coupon when special offer (₹999 for 3+ items) is active');
      return;
    }
    
    // Check minimum order amount
    if (state.total < coupon.min_order_amount) {
      toast.error(`Minimum order amount of ₹${coupon.min_order_amount} required for this coupon`);
      return;
    }
    
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (state.total * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }
    
    dispatch({ type: 'APPLY_COUPON', payload: { coupon, discount: 0 } });
    toast.success(`Coupon "${coupon.code}" applied! You saved ₹${discount.toFixed(2)}`);
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
    toast.success('Coupon removed');
  };

  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};