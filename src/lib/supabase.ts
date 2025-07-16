import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string | null;
          benefits: string[];
          price: number;
          is_available: boolean;
          category: string;
          ingredients: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image_url?: string | null;
          benefits?: string[];
          price?: number;
          is_available?: boolean;
          category?: string;
          ingredients?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image_url?: string | null;
          benefits?: string[];
          price?: number;
          is_available?: boolean;
          category?: string;
          ingredients?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          total_amount: number;
          status: string;
          payment_method: string;
          payment_id: string | null;
          items: any;
          shipping_address: any;
          coupon_code: string | null;
          discount_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          total_amount: number;
          status?: string;
          payment_method: string;
          payment_id?: string | null;
          items: any;
          shipping_address?: any;
          coupon_code?: string | null;
          discount_amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          total_amount?: number;
          status?: string;
          payment_method?: string;
          payment_id?: string | null;
          items?: any;
          shipping_address?: any;
          coupon_code?: string | null;
          discount_amount?: number;
          created_at?: string;
        };
      };
    };
  };
};