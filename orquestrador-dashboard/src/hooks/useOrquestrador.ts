/**
 * useOrquestrador - Custom hook for Orquestrador data management
 * Nexus-HUB57 MMN AI-to-AI Platform
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, Database } from '../lib/supabase';

type Agent = Database['public']['Tables']['agents']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Affiliate = Database['public']['Tables']['affiliates']['Row'];
type Commission = Database['public']['Tables']['commissions']['Row'];
type Prediction = Database['public']['Tables']['predictions']['Row'];
type Workflow = Database['public']['Tables']['workflows']['Row'];
type Execution = Database['public']['Tables']['executions']['Row'];

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  avgResponseTime: number;
  lastActive: string | null;
}

// =============================================
// AGENTS HOOK
// =============================================
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgent = async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single();

    if (error) throw error;
    setAgents(prev => [...prev, data]);
    return data;
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setAgents(prev => prev.map(a => a.id === id ? data : a));
    return data;
  };

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, loading, error, createAgent, updateAgent, refetch: fetchAgents };
}

// =============================================
// TASKS HOOK
// =============================================
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    setTasks(prev => [data, ...prev]);
    return data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setTasks(prev => prev.map(t => t.id === id ? data : t));
    return data;
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, createTask, updateTask, refetch: fetchTasks };
}

// =============================================
// AFFILIATES HOOK
// =============================================
export function useAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAffiliates = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAffiliate = async (affiliate: Omit<Affiliate, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('affiliates')
      .insert(affiliate)
      .select()
      .single();

    if (error) throw error;
    setAffiliates(prev => [data, ...prev]);
    return data;
  };

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  return { affiliates, loading, error, createAffiliate, refetch: fetchAffiliates };
}

// =============================================
// COMMISSIONS HOOK
// =============================================
export function useCommissions(affiliateId?: string) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (affiliateId) {
        query = query.eq('affiliate_id', affiliateId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCommissions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  const createCommission = async (commission: Omit<Commission, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('commissions')
      .insert(commission)
      .select()
      .single();

    if (error) throw error;
    setCommissions(prev => [data, ...prev]);
    return data;
  };

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  return { commissions, loading, error, createCommission, refetch: fetchCommissions };
}

// =============================================
// PREDICTIONS HOOK
// =============================================
export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setPredictions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPrediction = async (prediction: Omit<Prediction, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('predictions')
      .insert(prediction)
      .select()
      .single();

    if (error) throw error;
    setPredictions(prev => [data, ...prev]);
    return data;
  };

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, loading, error, createPrediction, refetch: fetchPredictions };
}

// =============================================
// WORKFLOWS HOOK
// =============================================
export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkflow = async (workflow: Omit<Workflow, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('workflows')
      .insert(workflow)
      .select()
      .single();

    if (error) throw error;
    setWorkflows(prev => [data, ...prev]);
    return data;
  };

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return { workflows, loading, error, createWorkflow, refetch: fetchWorkflows };
}

// =============================================
// EXECUTIONS HOOK
// =============================================
export function useExecutions() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExecutions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createExecution = async (execution: Omit<Execution, 'id' | 'started_at'>) => {
    const { data, error } = await supabase
      .from('executions')
      .insert(execution)
      .select()
      .single();

    if (error) throw error;
    setExecutions(prev => [data, ...prev]);
    return data;
  };

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  return { executions, loading, error, createExecution, refetch: fetchExecutions };
}

// =============================================
// SYSTEM METRICS HOOK
// =============================================
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeAgents: 0,
    totalAffiliates: 0,
    totalCommissions: 0,
    systemHealth: 100
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);

      const [tasksRes, agentsRes, affiliatesRes, commissionsRes] = await Promise.all([
        supabase.from('tasks').select('status'),
        supabase.from('agents').select('status'),
        supabase.from('affiliates').select('id'),
        supabase.from('commissions').select('commission')
      ]);

      const tasks = tasksRes.data || [];
      const agents = agentsRes.data || [];
      const affiliates = affiliatesRes.data || [];
      const commissions = commissionsRes.data || [];

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const activeAgents = agents.filter(a => a.status === 'busy').length;
      const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commission), 0);

      // Calculate system health based on error rates and active agents
      const failedTasks = tasks.filter(t => t.status === 'failed').length;
      const errorRate = tasks.length > 0 ? failedTasks / tasks.length : 0;
      const healthPenalty = errorRate * 50;
      const systemHealth = Math.max(0, 100 - healthPenalty);

      setMetrics({
        totalTasks: tasks.length,
        completedTasks,
        activeAgents,
        totalAffiliates: affiliates.length,
        totalCommissions,
        systemHealth
      });
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { metrics, loading, refetch: fetchMetrics };
}

export default {
  useAgents,
  useTasks,
  useAffiliates,
  useCommissions,
  usePredictions,
  useWorkflows,
  useExecutions,
  useSystemMetrics
};