import { useState, useEffect } from 'react'
import {
  Users,
  ListTodo,
  DollarSign,
  TrendingUp,
  Activity,
  Bot,
  LayoutDashboard,
  Menu,
  X,
  RefreshCw,
  Settings,
  Bell,
  Search
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, ProgressBar, Avatar, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui'
import type { Agent, Task, Affiliate, Commission } from '@/types'

// Mock data for demonstration
const mockAgents: Agent[] = [
  { id: '1', name: 'Nexus Core', role: 'Orchestrator', status: 'online', tasks_completed: 156, created_at: '2024-01-15' },
  { id: '2', name: 'Data Processor', role: 'Data Agent', status: 'online', tasks_completed: 89, created_at: '2024-02-20' },
  { id: '3', name: 'Code Assistant', role: 'Dev Agent', status: 'busy', tasks_completed: 234, current_task: 'Building API', created_at: '2024-01-10' },
  { id: '4', name: 'Research Bot', role: 'Research Agent', status: 'offline', tasks_completed: 67, created_at: '2024-03-05' },
]

const mockTasks: Task[] = [
  { id: '1', title: 'Process new leads', description: 'Analyze and categorize incoming leads', status: 'in_progress', priority: 'high', assigned_agent: 'Data Processor', created_at: '2024-05-15' },
  { id: '2', title: 'Update database', description: 'Sync customer data with CRM', status: 'pending', priority: 'medium', created_at: '2024-05-16' },
  { id: '3', title: 'Generate report', description: 'Create weekly performance report', status: 'completed', priority: 'low', completed_at: '2024-05-17', created_at: '2024-05-10' },
  { id: '4', title: 'Train model', description: 'Update ML model with new data', status: 'pending', priority: 'high', created_at: '2024-05-18' },
]

const mockAffiliates: Affiliate[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', status: 'active', total_commissions: 1250.00, referrals: 15, created_at: '2024-01-20' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', status: 'active', total_commissions: 890.50, referrals: 8, created_at: '2024-02-15' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', status: 'inactive', total_commissions: 340.00, referrals: 3, created_at: '2024-03-10' },
]

const mockCommissions: Commission[] = [
  { id: '1', affiliate_id: '1', affiliate_name: 'João Silva', amount: 150.00, status: 'paid', created_at: '2024-05-01' },
  { id: '2', affiliate_id: '1', affiliate_name: 'João Silva', amount: 200.00, status: 'pending', created_at: '2024-05-15' },
  { id: '3', affiliate_id: '2', affiliate_name: 'Maria Santos', amount: 95.50, status: 'paid', created_at: '2024-05-10' },
  { id: '4', affiliate_id: '2', affiliate_name: 'Maria Santos', amount: 180.00, status: 'pending', created_at: '2024-05-18' },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'agents' | 'tasks' | 'affiliates' | 'commissions'>('dashboard')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate loading
    setLoading(false)
  }, [activeView])

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do sistema Orquestrador</p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Agentes"
          value={mockAgents.length}
          description="Agentes ativos no sistema"
          icon={Bot}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Tarefas em Progresso"
          value={mockTasks.filter(t => t.status === 'in_progress').length}
          description="Executando agora"
          icon={ListTodo}
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          title="Comissões Pendentes"
          value={mockCommissions.filter(c => c.status === 'pending').length}
          description="Aguardando pagamento"
          icon={DollarSign}
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${mockAffiliates.reduce((sum, a) => sum + a.total_commissions, 0).toLocaleString('pt-BR')}`}
          description="Comissões acumuladas"
          icon={TrendingUp}
          trend={{ value: 23, positive: true }}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade dos Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAgents.slice(0, 4).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={agent.name.substring(0, 2).toUpperCase()} />
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'warning' : 'default'}>
                      {agent.status}
                    </Badge>
                    <span className="text-sm font-medium">{agent.tasks_completed} tarefas</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Saúde do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CPU</span>
                <span className="font-medium">45%</span>
              </div>
              <ProgressBar value={45} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Memória</span>
                <span className="font-medium">62%</span>
              </div>
              <ProgressBar value={62} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rede</span>
                <span className="font-medium">28%</span>
              </div>
              <ProgressBar value={28} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Uptime</span>
                <span className="font-medium text-green-600">99.9%</span>
              </div>
              <ProgressBar value={100} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAgents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agentes</h1>
          <p className="text-gray-500 mt-1">Gerenciar agentes do sistema</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Novo Agente
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tarefas</TableHead>
                <TableHead>Tarefa Atual</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar fallback={agent.name.substring(0, 2).toUpperCase()} />
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-gray-500">ID: {agent.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{agent.role}</TableCell>
                  <TableCell>
                    <Badge variant={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'warning' : 'default'}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{agent.tasks_completed}</TableCell>
                  <TableCell>{agent.current_task || '-'}</TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500 mt-1">Visualizar e gerenciar tarefas</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Nova Tarefa
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500">ID: {task.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                  <TableCell>
                    <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.assigned_agent || '-'}</TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderAffiliates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Afiliados</h1>
          <p className="text-gray-500 mt-1">Gerenciar programa de afiliados</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Novo Afiliado
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comissões</TableHead>
                <TableHead>Indicações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAffiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar fallback={affiliate.name.substring(0, 2).toUpperCase()} />
                      <p className="font-medium">{affiliate.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{affiliate.email}</TableCell>
                  <TableCell>
                    <Badge variant={affiliate.status === 'active' ? 'success' : 'default'}>
                      {affiliate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {affiliate.total_commissions.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{affiliate.referrals}</TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderCommissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500 mt-1">Histórico de comissões e pagamentos</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Afiliado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-mono text-sm">{commission.id}</TableCell>
                  <TableCell>{commission.affiliate_name}</TableCell>
                  <TableCell className="font-semibold">R$ {commission.amount.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant={commission.status === 'paid' ? 'success' : 'warning'}>
                      {commission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(commission.created_at).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'Agentes', icon: Bot },
    { id: 'tasks', label: 'Tarefas', icon: ListTodo },
    { id: 'affiliates', label: 'Afiliados', icon: Users },
    { id: 'commissions', label: 'Comissões', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-gray-900">Orquestrador</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as typeof activeView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            {sidebarOpen && <span>Ocultar Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'agents' && renderAgents()}
          {activeView === 'tasks' && renderTasks()}
          {activeView === 'affiliates' && renderAffiliates()}
          {activeView === 'commissions' && renderCommissions()}
        </div>
      </main>
    </div>
  )
}