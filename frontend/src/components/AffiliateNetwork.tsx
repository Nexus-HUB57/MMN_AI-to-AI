import React from 'react';
import { useAffiliates } from '../hooks/useAffiliates';

interface AffiliateNode {
  id: string;
  name: string;
  level: number;
  children?: AffiliateNode[];
}

const renderNode = (node: AffiliateNode) => (
  <li key={node.id} style={{ marginLeft: node.level * 20 }}>
    {node.name}
    {node.children && node.children.length > 0 && (
      <ul>{node.children.map(renderNode)}</ul>
    )}
  </li>
);

export const AffiliateNetwork: React.FC = () => {
  const { network, isLoading, error } = useAffiliates();

  if (isLoading) return <div>Carregando rede de afiliados...</div>;
  if (error) return <div>Erro ao carregar rede de afiliados: {error.message}</div>;

  return (
    <div className="affiliate-network">
      <h3>Rede de Afiliados</h3>
      {network ? <ul>{renderNode(network)}</ul> : <p>Nenhuma rede encontrada.</p>}
    </div>
  );
};
