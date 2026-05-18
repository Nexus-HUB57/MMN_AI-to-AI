import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Agent = {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'busy'
  tasks_completed: number
  current_task?: string
  created_at: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  assigned_agent?: string
  created_at: string
  completed_at?: string
}

export type Affiliate = {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  total_commissions: number
  referrals: number
  created_at: string
}

export type Commission = {
  id: string
  affiliate_id: string
  amount: number
  status: 'pending' | 'paid'
  created_at: string
}

export type Prediction = {
  id: string
  model: string
  input_data: string
  result: string
  confidence: number
  created_at: string
}

export type Conversation = {
  id: string
  user_id: string
  agent_id?: string
  message: string
  response?: string
  created_at: string
}

export type SystemMetrics = {
  id: string
  cpu_usage: number
  memory_usage: number
  active_agents: number
  tasks_queue: number
  timestamp: string
}