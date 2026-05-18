/**
 * ORQUESTRADOR DASHBOARD
 * Multi-Module AI Agent Management Interface
 *
 * Nexus-HUB57 AI-to-AI Marketing Platform
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Agent {
  id: string;
  name: string;
  type: 'afiliado' | 'preditivo' | 'generativo' | 'orquestrador' | 'agente_ca';
  status: 'idle' | 'busy' | 'offline';
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    avgResponseTime: number;
    lastActive: string;
  };
}

interface Task {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  data: Record<string, any>;
  createdAt: string;
  assignedAgent?: string;
}

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
}

interface TrendData {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
}

// Tab types
type TabType = 'overview' | 'tasks' | 'agents' | 'trends' | 'goals' | 'affiliate' | 'dropshipping';

const Orquestrador: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Mock data for dashboard
  const [agents] = useState<Agent[]>([
    { id: '1', name: 'Orquestrador-Master', type: 'orquestrador', status: 'idle', metrics: { tasksCompleted: 156, tasksFailed: 2, avgResponseTime: 245, lastActive: new Date().toISOString() } },
    { id: '2', name: 'Agente-Afiliado', type: 'afiliado', status: 'busy', metrics: { tasksCompleted: 89, tasksFailed: 1, avgResponseTime: 180, lastActive: new Date().toISOString() } },
    { id: '3', name: 'Agente-Preditivo', type: 'preditivo', status: 'idle', metrics: { tasksCompleted: 234, tasksFailed: 5, avgResponseTime: 320, lastActive: new Date().toISOString() } },
    { id: '4', name: 'Agente-Generativo', type: 'generativo', status: 'idle', metrics: { tasksCompleted: 567, tasksFailed: 8, avgResponseTime: 150, lastActive: new Date().toISOString() } },
    { id: '5', name: 'Agente-IA', type: 'agente_ca', status: 'idle', metrics: { tasksCompleted: 78, tasksFailed: 0, avgResponseTime: 420, lastActive: new Date().toISOString() } }
  ]);

  const [tasks] = useState<Task[]>([
    { id: '1', type: 'affiliate_management', priority: 'high', status: 'in_progress', data: {}, createdAt: new Date().toISOString(), assignedAgent: '2' },
    { id: '2', type: 'predictive_analysis', priority: 'medium', status: 'pending', data: {}, createdAt: new Date().toISOString() },
    { id: '3', type: 'content_generation', priority: 'low', status: 'completed', data: {}, createdAt: new Date(Date.now() - 3600000).toISOString(), assignedAgent: '4' }
  ]);

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeAgents = agents.filter(a => a.status === 'busy').length;
  const systemHealth = 98.5;

  const metrics: Metric[] = [
    { label: 'Total Tasks', value: totalTasks, change: 12, icon: '📋' },
    { label: 'Completed', value: completedTasks, change: 8, icon: '✅' },
    { label: 'Active Agents', value: activeAgents, change: 2, icon: '🤖' },
    { label: 'System Health', value: `${systemHealth}%`, change: 0.5, icon: '💚' }
  ];

  const trends: TrendData[] = [
    { metric: 'Tasks/hour', value: 24, trend: 'up', timeframe: 'Last 24h' },
    { metric: 'Agent Efficiency', value: 94, trend: 'up', timeframe: 'Last 7 days' },
    { metric: 'Response Time', value: 230, trend: 'down', timeframe: 'Last 24h' },
    { metric: 'Error Rate', value: 1.2, trend: 'down', timeframe: 'Last 7 days' }
  ];

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'affiliate', label: 'Affiliate', icon: '💰' },
    { id: 'dropshipping', label: 'Dropshipping', icon: '🛒' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Orquestrador</h1>
              <p className="text-sm text-gray-400">Multi-Module AI Agent System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              System Operational
            </span>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span>👤</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab metrics={metrics} agents={agents} tasks={tasks} trends={trends} />
        )}
        {activeTab === 'tasks' && (
          <TasksTab tasks={tasks} onCreateTask={() => setShowTaskModal(true)} />
        )}
        {activeTab === 'agents' && (
          <AgentsTab agents={agents} onCreateAgent={() => setShowAgentModal(true)} />
        )}
        {activeTab === 'trends' && (
          <TrendsTab trends={trends} />
        )}
        {activeTab === 'goals' && (
          <GoalsTab onCreateGoal={() => setShowGoalModal(true)} />
        )}
        {activeTab === 'affiliate' && (
          <AffiliateTab />
        )}
        {activeTab === 'dropshipping' && (
          <DropshippingTab />
        )}
      </main>

      {/* Modals */}
      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} />
      )}
      {showAgentModal && (
        <AgentModal onClose={() => setShowAgentModal(false)} />
      )}
      {showGoalModal && (
        <GoalModal onClose={() => setShowGoalModal(false)} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ metrics: Metric[]; agents: Agent[]; tasks: Task[]; trends: TrendData[] }> = ({ metrics, agents, tasks, trends }) => (
  <div className="space-y-6">
    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-2xl">{metric.icon}</span>
            {metric.change !== undefined && (
              <span className={`text-sm ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-gray-400 text-sm">{metric.label}</p>
            <p className="text-2xl font-bold mt-1">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Two Column Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agents Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Agent Status</h3>
        <div className="space-y-3">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  agent.status === 'idle' ? 'bg-green-500' :
                  agent.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-gray-400">{agent.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                agent.status === 'idle' ? 'bg-green-500/20 text-green-400' :
                agent.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {agent.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trends */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">System Trends</h3>
        <div className="space-y-3">
          {trends.map((trend, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium">{trend.metric}</p>
                <p className="text-sm text-gray-400">{trend.timeframe}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">{trend.value}</span>
                <span className={`text-lg ${
                  trend.trend === 'up' ? 'text-green-400' :
                  trend.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Recent Tasks */}
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3">Task ID</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Priority</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {tasks.slice(0, 5).map(task => (
              <tr key={task.id} className="border-b border-gray-700/50">
                <td className="py-3 font-mono text-sm">{task.id}</td>
                <td className="py-3">{task.type}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="py-3 text-gray-400 text-sm">
                  {new Date(task.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Tasks Tab Component
const TasksTab: React.FC<{ tasks: Task[]; onCreateTask: () => void }> = ({ tasks, onCreateTask }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Task Management</h2>
      <button
        onClick={onCreateTask}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
      >
        + Create Task
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {['pending', 'in_progress', 'completed'].map(status => (
        <div key={status} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="font-semibold mb-4 capitalize">{status.replace('_', ' ')}</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} className="bg-gray-700/50 p-3 rounded-lg">
                <p className="font-mono text-sm text-gray-400">{task.id}</p>
                <p className="font-medium mt-1">{task.type}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                  task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Agents Tab Component
const AgentsTab: React.FC<{ agents: Agent[]; onCreateAgent: () => void }> = ({ agents, onCreateAgent }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Agent Management</h2>
      <button
        onClick={onCreateAgent}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
      >
        + Register Agent
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map(agent => (
        <div key={agent.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold">{agent.name}</h3>
              <p className="text-sm text-gray-400">{agent.type}</p>
            </div>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm ${
            agent.status === 'idle' ? 'bg-green-500/20 text-green-400' :
            agent.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {agent.status}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Tasks</p>
              <p className="font-semibold">{agent.metrics.tasksCompleted}</p>
            </div>
            <div>
              <p className="text-gray-400">Avg Time</p>
              <p className="font-semibold">{agent.metrics.avgResponseTime}ms</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Trends Tab Component
const TrendsTab: React.FC<{ trends: TrendData[] }> = ({ trends }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">System Trends</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {trends.map((trend, idx) => (
        <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{trend.metric}</h3>
            <span className={`text-2xl ${
              trend.trend === 'up' ? 'text-green-400' :
              trend.trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️'}
            </span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold">{trend.value}</span>
            <span className="text-gray-400 mb-1">{trend.timeframe}</span>
          </div>
          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                trend.trend === 'up' ? 'bg-green-500' :
                trend.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
              }`}
              style={{ width: `${Math.min(100, trend.value)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Goals Tab Component
const GoalsTab: React.FC<{ onCreateGoal: () => void }> = ({ onCreateGoal }) => {
  const [goals] = useState([
    { id: '1', title: 'Increase Task Completion', progress: 75, target: 100 },
    { id: '2', title: 'Reduce Response Time', progress: 60, target: 50 },
    { id: '3', title: 'Register 5 New Agents', progress: 3, target: 5 }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Goals & Objectives</h2>
        <button
          onClick={onCreateGoal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
        >
          + Create Goal
        </button>
      </div>

      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{goal.title}</h3>
              <span className="text-gray-400">{goal.progress}/{goal.target}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${(goal.progress / goal.target) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {((goal.progress / goal.target) * 100).toFixed(0)}% complete
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Affiliate Tab Component
const AffiliateTab: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Affiliate Management</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-gray-400 mb-2">Total Affiliates</h3>
        <p className="text-3xl font-bold">1,234</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-gray-400 mb-2">Total Commission</h3>
        <p className="text-3xl font-bold">R$ 45,678</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-gray-400 mb-2">Conversion Rate</h3>
        <p className="text-3xl font-bold">8.5%</p>
      </div>
    </div>
  </div>
);

// Dropshipping Tab Component
const DropshippingTab: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Dropshipping Integration</h2>
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <p className="text-gray-400">Dropshipping module configuration coming soon...</p>
    </div>
  </div>
);

// Task Modal Component
const TaskModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Task Type</label>
          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
            <option>affiliate_management</option>
            <option>predictive_analysis</option>
            <option>content_generation</option>
            <option>agent_orchestration</option>
            <option>autonomous_execution</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Priority</label>
          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
            <option>low</option>
            <option>medium</option>
            <option>high</option>
            <option>critical</option>
          </select>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Agent Modal Component
const AgentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Register New Agent</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Agent Name</label>
          <input
            type="text"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
            placeholder="Enter agent name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Agent Type</label>
          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
            <option value="afiliado">Afiliado</option>
            <option value="preditivo">Preditivo</option>
            <option value="generativo">Generativo</option>
            <option value="orquestrador">Orquestrador</option>
            <option value="agente_ca">Agente IA</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Capabilities (comma separated)</label>
          <input
            type="text"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
            placeholder="capability1, capability2"
          />
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Goal Modal Component
const GoalModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Goal Title</label>
          <input
            type="text"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
            placeholder="Enter goal title"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Target Value</label>
          <input
            type="number"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
            placeholder="Enter target value"
          />
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default Orquestrador;