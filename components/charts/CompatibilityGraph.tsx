"use client";

import { useMemo } from "react";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force";

const WIDTH = 360;
const HEIGHT = 260;

export type GraphMember = {
  id: string;
  name: string;
  x?: number;
  y?: number;
};

export type GraphPair = {
  memberA: string;
  memberB: string;
  score: number;
};

const scoreColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#93c5fd";
  if (score >= 40) return "#f97316";
  return "#ef4444";
};

export function CompatibilityGraph({ members, pairs }: { members: GraphMember[]; pairs: GraphPair[] }) {
  const { nodes, links } = useMemo(() => {
    if (!members.length) return { nodes: [], links: [] };
    const nodeMap = members.map((member) => ({ ...member, x: 0, y: 0 }));
    const linkData = pairs.map((pair) => ({
      source: pair.memberA,
      target: pair.memberB,
      score: pair.score,
    }));

    const sim = forceSimulation(nodeMap)
      .force(
        "link",
        forceLink(linkData)
          .id((d: any) => d.id)
          .distance((d: any) => Math.max(40, 120 - d.score)),
      )
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .stop();

    for (let i = 0; i < 200; i += 1) {
      sim.tick();
    }

    return { nodes: nodeMap, links: linkData };
  }, [members, pairs]);

  if (!nodes.length) {
    return <p className="text-sm text-slate-500">네트워크 데이터를 표시할 수 없습니다.</p>;
  }

  return (
    <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="border border-slate-200 rounded">
      {links.map((link, index) => {
        const source = nodes.find((node) => node.id === link.source) ?? nodes[0];
        const target = nodes.find((node) => node.id === link.target) ?? nodes[0];
        return (
          <line
            key={index}
            x1={source.x ?? 0}
            y1={source.y ?? 0}
            x2={target.x ?? 0}
            y2={target.y ?? 0}
            stroke={scoreColor(link.score)}
            strokeWidth={Math.max(1, link.score / 40)}
            opacity={0.8}
          />
        );
      })}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x ?? 0} cy={node.y ?? 0} r={16} fill="#1d4ed8" fillOpacity={0.85} />
          <text x={node.x ?? 0} y={(node.y ?? 0) + 4} textAnchor="middle" fontSize={10} fill="#fff">
            {node.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
