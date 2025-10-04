"use client";
import dynamic from 'next/dynamic';
const ForceGraph2D = dynamic(() => import('react-force-graph').then(m => m.ForceGraph2D), { ssr: false });

type Node = { id: string };
type Link = { source: string; target: string; type: 'ally' | 'enemy' | 'secret' };

export default function StoryArcGraph({ nodes, links }: { nodes: Node[]; links: Link[] }) {
  return (
    <div className="rounded-2xl bg-zinc-900 p-4">
      <div className="h-64">
        <ForceGraph2D
          graphData={{ nodes, links }}
          nodeAutoColorBy="id"
          linkColor={(l: any) => (l.type === 'ally' ? '#22c55e' : l.type === 'enemy' ? '#ef4444' : '#a855f7')}
        />
      </div>
    </div>
  );
}



