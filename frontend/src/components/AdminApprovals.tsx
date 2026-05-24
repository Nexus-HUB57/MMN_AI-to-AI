import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Mail, Phone, MapPin } from 'lucide-react';

interface AffiliateRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: string[];
  reason?: string;
}

export const AdminApprovals: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<AffiliateRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Mock de dados de solicitações de afiliados
  const allRequests: AffiliateRequest[] = [
    {
      id: '1',
      name: 'Roberto Alves',
      email: 'roberto@example.com',
      phone: '(11) 98765-4321',
      location: 'São Paulo, SP',
      status: 'pending',
      submittedAt: '2026-05-12',
      documents: ['ID', 'Comprovante de Endereço', 'Comprovante Bancário'],
    },
    {
      id: '2',
      name: 'Fernanda Lima',
      email: 'fernanda@example.com',
      phone: '(21) 99876-5432',
      location: 'Rio de Janeiro, RJ',
      status: 'pending',
      submittedAt: '2026-05-11',
      documents: ['ID', 'Comprovante de Endereço'],
    },
    {
      id: '3',
      name: 'Lucas Martins',
      email: 'lucas@example.com',
      phone: '(31) 98765-4321',
      location: 'Belo Horizonte, MG',
      status: 'approved',
      submittedAt: '2026-05-08',
      documents: ['ID', 'Comprovante de Endereço', 'Comprovante Bancário'],
    },
    {
      id: '4',
      name: 'Juliana Santos',
      email: 'juliana@example.com',
      phone: '(85) 99876-5432',
      location: 'Fortaleza, CE',
      status: 'rejected',
      submittedAt: '2026-05-05',
      documents: ['ID'],
      reason: 'Documentação incompleta',
    },
  ];

  // Filtrar solicitações
  let filteredRequests = allRequests;
  if (filterStatus !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.status === filterStatus);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'approved':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'rejected':
        return 'bg-red-900 text-red-200 border-red-700';
      default:
        return 'bg-slate-700 text-gray-300 border-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Pendente';
      case 'approved':
        return '✓ Aprovado';
      case 'rejected':
        return '✗ Rejeitado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-approvals bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Aprovação de Afiliados
        </h3>
      </div>

      <div className="space-y-4">
        {/* Filtro de status */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  filterStatus === status
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovadas' : 'Rejeitadas'}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{allRequests.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-400">{allRequests.filter(r => r.status === 'pending').length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Aprovadas</p>
            <p className="text-2xl font-bold text-green-400">{allRequests.filter(r => r.status === 'approved').length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Rejeitadas</p>
            <p className="text-2xl font-bold text-red-400">{allRequests.filter(r => r.status === 'rejected').length}</p>
          </div>
        </div>

        {/* Lista de solicitações */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{request.name}</h4>
                    <p className="text-xs text-gray-400">{request.submittedAt}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {request.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {request.phone}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-3 h-3" />
                    {request.location}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {request.documents.map((doc) => (
                    <span key={doc} className="bg-slate-700 text-gray-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">Nenhuma solicitação encontrada.</p>
          )}
        </div>

        {/* Detalhes e ações */}
        {selectedRequest && (
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-4">Detalhes da Solicitação</h4>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Nome</p>
                <p className="text-sm text-white">{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <p className="text-sm text-white">{selectedRequest.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Documentos Enviados</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.documents.map((doc) => (
                    <span key={doc} className="bg-slate-700 text-gray-300 text-xs px-2 py-1 rounded">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Motivo da Rejeição (se aplicável)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Descreva o motivo da rejeição..."
                    rows={3}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Aprovar
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors">
                    <XCircle className="w-4 h-4" />
                    Rejeitar
                  </button>
                </div>
              </div>
            )}

            {selectedRequest.status === 'rejected' && selectedRequest.reason && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                <p className="text-sm text-red-200">
                  <strong>Motivo da Rejeição:</strong> {selectedRequest.reason}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
