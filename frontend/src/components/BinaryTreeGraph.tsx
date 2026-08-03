import { useMemo } from "react";

/**
 * BinaryTreeGraph — grafo binario classico (raiz no topo, ramos descendo).
 *
 * P0-FIX-2026-08-03: substitui o placeholder "apenas nomes" da pagina Network
 * pelo grafo hierarquico com pontos coloridos por status.
 *
 * A entrada e um array plano de nos (root + directs + descendentes) no
 * formato retornado por networkExtended.getMyBinaryNetwork. Cada no precisa
 * conter: id/affiliateId, name, level, side ("left" | "right" | undefined),
 * parentId, packAcquired?, monthlyActive?, status?
 */

export interface BinaryNode {
  affiliateId?: number | string;
  id?: number | string;
  name?: string;
  email?: string;
  level?: number;
  side?: "left" | "right" | null;
  parentId?: number | string | null;
  packAcquired?: boolean;
  monthlyActive?: boolean;
  status?: string;
}

interface Props {
  root: { name?: string; id?: number | string } | null | undefined;
  nodes: BinaryNode[];
  maxDepth?: number;
}

interface LayoutNode {
  key: string;
  name: string;
  x: number;
  y: number;
  level: number;
  packAcquired: boolean;
  monthlyActive: boolean;
  parentKey: string | null;
}

const NODE_W = 130;
const NODE_H = 44;
const V_GAP = 90;
const H_GAP = 24;

function buildLayout(root: Props["root"], nodes: BinaryNode[], maxDepth: number): { nodes: LayoutNode[]; width: number; height: number } {
  const rootKey = "root";
  const byParent = new Map<string, BinaryNode[]>();
  for (const n of nodes) {
    const parent = n.parentId == null ? rootKey : String(n.parentId);
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent)!.push(n);
  }
  // ordenar filhos por side (left antes de right) para pintar o binario certo
  for (const list of byParent.values()) {
    list.sort((a, b) => {
      const sa = a.side === "left" ? 0 : a.side === "right" ? 1 : 2;
      const sb = b.side === "left" ? 0 : b.side === "right" ? 1 : 2;
      return sa - sb;
    });
  }

  // calcula largura de cada subarvore (leaves = NODE_W + H_GAP)
  const widthCache = new Map<string, number>();
  const walkWidth = (key: string, depth: number): number => {
    if (widthCache.has(key)) return widthCache.get(key)!;
    const kids = depth < maxDepth ? (byParent.get(key) ?? []) : [];
    if (kids.length === 0) {
      widthCache.set(key, NODE_W + H_GAP);
      return NODE_W + H_GAP;
    }
    let w = 0;
    for (const k of kids) w += walkWidth(String(k.affiliateId ?? k.id ?? Math.random()), depth + 1);
    w = Math.max(w, NODE_W + H_GAP);
    widthCache.set(key, w);
    return w;
  };

  const totalWidth = walkWidth(rootKey, 0);
  const out: LayoutNode[] = [];
  let maxLevel = 0;

  const placeNode = (
    key: string,
    node: { name?: string; packAcquired?: boolean; monthlyActive?: boolean } | null,
    depth: number,
    cursorX: number,
    parentKey: string | null,
  ): number => {
    const subtreeWidth = walkWidth(key, depth);
    const cx = cursorX + subtreeWidth / 2;
    out.push({
      key,
      name: node?.name || "—",
      x: cx,
      y: depth * V_GAP + NODE_H / 2 + 10,
      level: depth,
      packAcquired: !!node?.packAcquired,
      monthlyActive: !!node?.monthlyActive,
      parentKey,
    });
    if (depth > maxLevel) maxLevel = depth;

    if (depth >= maxDepth) return subtreeWidth;
    const kids = byParent.get(key) ?? [];
    let localCursor = cursorX;
    for (const k of kids) {
      const kKey = String(k.affiliateId ?? k.id ?? Math.random());
      const kw = walkWidth(kKey, depth + 1);
      placeNode(kKey, {
        name: k.name,
        packAcquired: k.packAcquired,
        monthlyActive: k.monthlyActive,
      }, depth + 1, localCursor, key);
      localCursor += kw;
    }
    return subtreeWidth;
  };

  placeNode(rootKey, { name: root?.name || "Você", packAcquired: true, monthlyActive: true }, 0, 0, null);

  const height = (maxLevel + 1) * V_GAP + NODE_H + 20;
  return { nodes: out, width: totalWidth, height };
}

export default function BinaryTreeGraph({ root, nodes, maxDepth = 4 }: Props) {
  const layout = useMemo(() => buildLayout(root, nodes ?? [], maxDepth), [root, nodes, maxDepth]);
  const byKey = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    for (const n of layout.nodes) m.set(n.key, n);
    return m;
  }, [layout]);

  if (!layout.nodes.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/30 p-6 text-center text-sm text-slate-400">
        Sem dados suficientes para renderizar o grafo binário.
      </div>
    );
  }

  const viewBox = `0 0 ${layout.width} ${layout.height}`;
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.10),rgba(2,6,23,0.9))] p-4">
      <svg viewBox={viewBox} width={layout.width} height={layout.height} className="mx-auto block">
        {/* arestas */}
        {layout.nodes.map((n) => {
          if (!n.parentKey) return null;
          const p = byKey.get(n.parentKey);
          if (!p) return null;
          const midY = (p.y + n.y) / 2;
          const d = `M ${p.x} ${p.y + NODE_H / 2} L ${p.x} ${midY} L ${n.x} ${midY} L ${n.x} ${n.y - NODE_H / 2}`;
          return (
            <path
              key={`edge-${n.key}`}
              d={d}
              fill="none"
              stroke="rgba(148,163,184,0.55)"
              strokeWidth={1.2}
            />
          );
        })}
        {/* nos */}
        {layout.nodes.map((n) => {
          const isRoot = n.parentKey === null;
          const active = n.packAcquired || n.monthlyActive || isRoot;
          const fill = isRoot
            ? "rgba(34,211,238,0.18)"
            : active
              ? "rgba(52,211,153,0.14)"
              : "rgba(244,63,94,0.12)";
          const stroke = isRoot
            ? "rgba(34,211,238,0.85)"
            : active
              ? "rgba(52,211,153,0.75)"
              : "rgba(244,63,94,0.75)";
          return (
            <g key={`node-${n.key}`} transform={`translate(${n.x - NODE_W / 2} ${n.y - NODE_H / 2})`}>
              <rect width={NODE_W} height={NODE_H} rx={10} ry={10} fill={fill} stroke={stroke} strokeWidth={1.2} />
              <circle cx={12} cy={NODE_H / 2} r={4} fill={n.packAcquired || isRoot ? "#34d399" : "#f43f5e"} />
              <circle cx={22} cy={NODE_H / 2} r={4} fill={n.monthlyActive || isRoot ? "#34d399" : "#f43f5e"} />
              <text x={32} y={NODE_H / 2 - 4} fill="#e2e8f0" fontSize="10" fontFamily="ui-sans-serif,system-ui" fontWeight={600}>
                {n.name.length > 14 ? `${n.name.slice(0, 13)}…` : n.name}
              </text>
              <text x={32} y={NODE_H / 2 + 10} fill="#94a3b8" fontSize="8" fontFamily="ui-monospace,monospace">
                L{n.level}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
