export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string | null;
          email: string;
          avatar_url: string | null;
          subscription_tier: 'free' | 'basic' | 'premium' | null;
        };
        Insert: {
          id: string;
          created_at: string;
          updated_at?: string;
          name?: string | null;
          email: string;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'basic' | 'premium' | null;
        };
        Update: {
          id?: string;
          created_at: string;
          updated_at?: string;
          name?: string | null;
          email?: string;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'basic' | 'premium' | null;
        };
      };
      stories: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          content: string | null;
          character: Json | null;
          setting: string | null;
          theme: string | null;
          plot_elements: string[] | null;
          is_published: boolean;
          thumbnail_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          content?: string | null;
          character?: Json | null;
          setting?: string | null;
          theme?: string | null;
          plot_elements?: string[] | null;
          is_published?: boolean;
          thumbnail_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          character?: Json | null;
          setting?: string | null;
          theme?: string | null;
          plot_elements?: string[] | null;
          is_published?: boolean;
          thumbnail_url?: string | null;
        };
      };
      child_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          age: number | null;
          avatar_url: string | null;
          favorite_themes: string[] | null;
          interests: string[] | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          name: string;
          age?: number | null;
          avatar_url?: string | null;
          favorite_themes?: string[] | null;
          interests?: string[] | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          name?: string;
          age?: number | null;
          avatar_url?: string | null;
          favorite_themes?: string[] | null;
          interests?: string[] | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
          plan_id: string;
          subscription_start: string | null;
          subscription_end: string | null;
          trial_end: string | null;
          payment_provider: 'stripe' | 'paypal' | null;
          payment_provider_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
          plan_id: string;
          subscription_start?: string | null;
          subscription_end?: string | null;
          trial_end?: string | null;
          payment_provider?: 'stripe' | 'paypal' | null;
          payment_provider_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          status?: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
          plan_id?: string;
          subscription_start?: string | null;
          subscription_end?: string | null;
          trial_end?: string | null;
          payment_provider?: 'stripe' | 'paypal' | null;
          payment_provider_id?: string | null;
        };
      };
      subscription_items: {
        Row: {
          id: string;
          created_at: string;
          subscription_id: string;
          feature_id: string;
          quantity: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          subscription_id: string;
          feature_id: string;
          quantity?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          subscription_id?: string;
          feature_id?: string;
          quantity?: number;
        };
      };
      subscription_plans: {
        Row: {
          id: number;
          tier: 'free' | 'story_creator' | 'family';
          name: string;
          description: string;
          price_monthly: number;
          story_limit: number;
          features: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          tier: 'free' | 'story_creator' | 'family';
          name: string;
          description: string;
          price_monthly: number;
          story_limit?: number;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          tier?: 'free' | 'story_creator' | 'family';
          name?: string;
          description?: string;
          price_monthly?: number;
          story_limit?: number;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      story_usage: {
        Row: {
          id: number;
          user_id: string;
          story_count: number;
          reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          story_count?: number;
          reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          story_count?: number;
          reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_story_usage: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
