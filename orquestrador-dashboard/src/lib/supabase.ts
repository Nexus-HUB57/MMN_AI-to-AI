/**
 * Supabase Client Configuration
 * Nexus-HUB57 Orquestrador System
 */

import { createClient } from '@supabase/supabase-js';

// Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          type: 'afiliado' | 'preditivo' | 'generativo' | 'orquestrador' | 'agente_ca';
          status: 'idle' | 'busy' | 'offline';
          capabilities: string[];
          metrics: {
            tasksCompleted: number;
            tasksFailed: number;
            avgResponseTime: number;
            lastActive: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          type: 'affiliate_management' | 'predictive_analysis' | 'content_generation' | 'agent_orchestration' | 'autonomous_execution';
          priority: 'low' | 'medium' | 'high' | 'critical';
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          data: Record<string, any>;
          result: Record<string, any> | null;
          error: string | null;
          assigned_agent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      affiliates: {
        Row: {
          id: string;
          name: string;
          email: string;
          status: 'active' | 'inactive' | 'suspended';
          tier: 'bronze' | 'silver' | 'gold' | 'platinum';
          metrics: {
            totalSales: number;
            totalCommission: number;
            conversionRate: number;
            activeLinks: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['affiliates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['affiliates']['Insert']>;
      };
      commissions: {
        Row: {
          id: string;
          affiliate_id: string;
          amount: number;
          commission: number;
          tier: string;
          source: string;
          status: 'pending' | 'approved' | 'paid' | 'cancelled';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['commissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['commissions']['Insert']>;
      };
      predictions: {
        Row: {
          id: string;
          type: string;
          target: string;
          value: number;
          confidence: number;
          timeframe: string;
          factors: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>;
      };
      generated_content: {
        Row: {
          id: string;
          type: string;
          prompt: string;
          content: string;
          metadata: {
            tokens: number;
            model: string;
            temperature: number;
          };
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['generated_content']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['generated_content']['Insert']>;
      };
      workflows: {
        Row: {
          id: string;
          name: string;
          steps: {
            name: string;
            action: string;
            parameters?: Record<string, any>;
          }[];
          triggers: string[];
          status: 'active' | 'inactive' | 'archived';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workflows']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['workflows']['Insert']>;
      };
      executions: {
        Row: {
          id: string;
          command: string;
          parameters: Record<string, any>;
          status: 'pending' | 'running' | 'completed' | 'failed';
          steps: {
            step: string;
            status: string;
            result?: any;
            error?: string;
          }[];
          workflow_id: string | null;
          result: Record<string, any> | null;
          error: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['executions']['Row'], 'id' | 'started_at'>;
        Update: Partial<Database['public']['Tables']['executions']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          type: string;
          source: string;
          data: Record<string, any>;
          timestamp: string;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'timestamp'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
    };
  };
}

export default supabase;