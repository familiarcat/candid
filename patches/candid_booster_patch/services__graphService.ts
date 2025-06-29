const GRAPH_ENDPOINT = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT || '/api/graph';

export type GraphNode = {
  id: string;
  label: string;
  group?: string;
};

export type GraphEdge = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export async function getGraph(): Promise<GraphData> {
  const res = await fetch(GRAPH_ENDPOINT);
  if (!res.ok) throw new Error('Failed to fetch graph data');
  return res.json();
}

export async function updateGraph(data: GraphData): Promise<void> {
  const res = await fetch(GRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update graph');
}
