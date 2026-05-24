interface Props { agent: any }
export default function ImageGenerator({ agent }: Props) {
  return <div className="p-6 bg-white rounded-lg shadow"><h3 className="text-lg font-semibold mb-4">Gerador de Imagens</h3><p className="text-gray-500">Gere imagens com IA.</p></div>;
}
