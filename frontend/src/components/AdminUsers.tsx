import React, { useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'affiliate' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  lastLogin: string;
  commissions: number;
}

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'affiliate' | 'moderator' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock de dados de usuários
  const allUsers: User[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2026-01-15',
      lastLogin: '2026-05-13',
      commissions: 5000,
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@example.com',
      role: 'affiliate',
      status: 'active',
      joinedAt: '2026-02-20',
      lastLogin: '2026-05-12',
      commissions: 2500,
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      role: 'moderator',
      status: 'active',
      joinedAt: '2026-03-10',
      lastLogin: '2026-05-11',
      commissions: 1200,
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      role: 'affiliate',
      status: 'inactive',
      joinedAt: '2026-01-05',
      lastLogin: '2026-04-20',
      commissions: 800,
    },
    {
      id: '5',
      name: 'Carlos Mendes',
      email: 'carlos@example.com',
      role: 'user',
      status: 'suspended',
      joinedAt: '2026-02-01',
      lastLogin: '2026-05-01',
      commissions: 0,
    },
  ];

  // Filtrar usuários
  let filteredUsers = allUsers;
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(
      u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (filterRole !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.role === filterRole);
  }
  if (filterStatus !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.status === filterStatus);
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900 text-red-200';
      case 'moderator':
        return 'bg-purple-900 text-purple-200';
      case 'affiliate':
        return 'bg-blue-900 text-blue-200';
      case 'user':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-slate-700 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'inactive':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'suspended':
        return 'bg-red-900 text-red-200 border-red-700';
      default:
        return 'bg-slate-700 text-gray-300 border-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '✓ Ativo';
      case 'inactive':
        return '→ Inativo';
      case 'suspended':
        return '✗ Suspenso';
      default:
        return status;
    }
  };

  return (
    <div className="admin-users bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Gerenciamento de Usuários
        </h3>
        <button
          onClick={() => setShowNewUserForm(!showNewUserForm)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      <div className="space-y-4">
        {/* Filtros */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded pl-10 pr-3 py-2 text-sm placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Função
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
              >
                <option value="all">Todas</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderador</option>
                <option value="affiliate">Afiliado</option>
                <option value="user">Usuário</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Novo usuário */}
        {showNewUserForm && (
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
            <h4 className="text-sm font-semibold text-white">Criar Novo Usuário</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome completo"
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
              />
              <input
                type="email"
                placeholder="Email"
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
              />
              <select className="bg-slate-700 text-white rounded px-3 py-2 text-sm">
                <option>Selecionar Função</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderador</option>
                <option value="affiliate">Afiliado</option>
                <option value="user">Usuário</option>
              </select>
              <input
                type="password"
                placeholder="Senha"
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                Criar Usuário
              </button>
              <button
                onClick={() => setShowNewUserForm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Tabela de usuários */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="text-left px-3 py-3 font-semibold text-gray-300">Usuário</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-300">Função</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-300">Status</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-300">Último Acesso</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-300">Comissões</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? '👑 Admin' : 
                         user.role === 'moderator' ? '🛡️ Moderador' :
                         user.role === 'affiliate' ? '🤝 Afiliado' : '👤 Usuário'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-300">{user.lastLogin}</td>
                    <td className="px-3 py-3 text-right text-green-400 font-medium">
                      R$ {user.commissions.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-600 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Total de Usuários</p>
            <p className="text-2xl font-bold text-white">{allUsers.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Ativos</p>
            <p className="text-2xl font-bold text-green-400">{allUsers.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Inativos</p>
            <p className="text-2xl font-bold text-yellow-400">{allUsers.filter(u => u.status === 'inactive').length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Suspensos</p>
            <p className="text-2xl font-bold text-red-400">{allUsers.filter(u => u.status === 'suspended').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
