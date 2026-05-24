interface Props { agent: any }
export default function AgentStatus({ agent }: Props) {
  return <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-lg font-semibold mb-4">Status do Agente</h3><p className="text-gray-600">Agente: {agent?.name || 'N/A'}</p></div>;
}
