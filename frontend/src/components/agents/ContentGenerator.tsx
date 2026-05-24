interface Props { agent: any }
export default function ContentGenerator({ agent }: Props) {
  return <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-lg font-semibold mb-4">Gerador de Conteúdo</h3><p className="text-gray-500">Gere conteúdo com IA.</p></div>;
}
