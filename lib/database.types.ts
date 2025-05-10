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
      subscription_plans: {
        Row: {
          id: number;
          tier: 'free' | 'story_creator' | 'family';
          name: string;
          description: string;
          price_monthly: number;
          features: Record<string, boolean>;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: number;
          tier: 'free' | 'story_creator' | 'family';
          name: string;
          description: string;
          price_monthly: number;
          features?: Record<string, boolean>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          tier?: 'free' | 'story_creator' | 'family';
          name?: string;
          description?: string;
          price_monthly?: number;
          features?: Record<string, boolean>;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: number;
          user_id: string;
          plan_id: number;
          status: 'active' | 'canceled' | 'past_due' | 'unpaid';
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          plan_id: number;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          plan_id?: number;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          current_period_start?: string;
          current_period_end?: string;
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
