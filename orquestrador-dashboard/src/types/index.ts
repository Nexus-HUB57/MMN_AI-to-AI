// ==============================================================================
// TYPES AND INTERFACES - Orquestrador Dashboard
// ==============================================================================

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  tasks_completed: number;
  current_task?: string;
  avatar?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assigned_agent?: string;
  created_at: string;
  completed_at?: string;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  total_commissions: number;
  referrals: number;
  created_at: string;
}

export interface Commission {
  id: string;
  affiliate_id: string;
  affiliate_name?: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface Prediction {
  id: string;
  model: string;
  input_data: string;
  result: string;
  confidence: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  agent_id?: string;
  message: string;
  response?: string;
  created_at: string;
}

export interface SystemMetrics {
  id: string;
  cpu_usage: number;
  memory_usage: number;
  active_agents: number;
  tasks_queue: number;
  timestamp: string;
}

export interface DashboardStats {
  totalAgents: number;
  activeTasks: number;
  pendingCommissions: number;
  totalRevenue: number;
}

export type ViewMode = 'dashboard' | 'agents' | 'tasks' | 'affiliates' | 'commissions' | 'predictions';
