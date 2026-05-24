interface Props { agent: any }
export default function AgentConfiguration({ agent }: Props) {
  return <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-lg font-semibold mb-4">Configuração</h3><p className="text-gray-500">Configure seu agente aqui.</p></div>;
}
