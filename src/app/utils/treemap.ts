// Treemap layout using d3-hierarchy
import { hierarchy, treemap as d3Treemap, treemapSquarify, HierarchyNode } from 'd3-hierarchy';
import { Branch, REGIONS } from '../data/branches';

// Type definitions for hierarchy data structures
interface BranchNodeData {
  name: string;
  branch_code: string;
  region: string;
  value: number;
}

interface RegionNodeData {
  name: string;
  region: string;
  isRegion: boolean;
  children: BranchNodeData[];
  value?: number;
}

interface RootNodeData {
  name: string;
  children: RegionNodeData[];
  value?: number;
}

type TreemapHierarchyData = RootNodeData | RegionNodeData | BranchNodeData;

export interface TreemapNode {
  branch_code: string;
  name: string;
  region?: string;
  isRegion?: boolean;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
}

// Type guard to check if node data is a branch
function isBranchNodeData(data: TreemapHierarchyData): data is BranchNodeData {
  return 'branch_code' in data && !('isRegion' in data);
}

// Type guard to check if node data is a region
function isRegionNodeData(data: TreemapHierarchyData): data is RegionNodeData {
  return 'isRegion' in data && data.isRegion === true;
}

// Compute unified treemap layout with all branches organized by region
export function computeUnifiedTreemapLayout(
  branches: Branch[],
  width: number,
  height: number
): TreemapNode[] {
  if (branches.length === 0) return [];

  // Group branches by region
  const regionGroups: RegionNodeData[] = REGIONS.map(region => ({
    name: region,
    region: region,
    isRegion: true,
    children: branches
      .filter(b => b.region === region)
      .map(b => ({
        name: b.name,
        branch_code: b.branch_code,
        region: region,
        value: b.rooms,
      }))
      .sort((a, b) => b.value - a.value),
  })).filter(group => group.children.length > 0);

  // Create hierarchy data structure
  const data: RootNodeData = {
    name: 'root',
    children: regionGroups,
  };

  const root = hierarchy<TreemapHierarchyData>(data)
    .sum((d: TreemapHierarchyData) => isBranchNodeData(d) ? d.value : 0)
    .sort((a: HierarchyNode<TreemapHierarchyData>, b: HierarchyNode<TreemapHierarchyData>) => (b.value || 0) - (a.value || 0));

  // Apply treemap layout with squarify algorithm
  const treemapLayout = d3Treemap<TreemapHierarchyData>()
    .size([width, height])
    .paddingInner(1)
    .paddingOuter(2)
    .paddingTop(24) // Space for region labels
    .tile(treemapSquarify)
    .round(true);

  treemapLayout(root);

  // Extract all nodes (both regions and branches)
  const nodes: TreemapNode[] = [];

  root.each((node: HierarchyNode<TreemapHierarchyData> & { x0?: number; y0?: number; x1?: number; y1?: number }) => {
    if (node.depth === 0) return; // Skip root

    const nodeData = node.data;
    const x0 = node.x0 ?? 0;
    const y0 = node.y0 ?? 0;
    const x1 = node.x1 ?? 0;
    const y1 = node.y1 ?? 0;

    if (node.depth === 1 && isRegionNodeData(nodeData)) {
      // Region node
      nodes.push({
        branch_code: `region_${nodeData.name}`,
        name: nodeData.name,
        region: nodeData.region,
        isRegion: true,
        x0,
        y0,
        x1,
        y1,
        width: x1 - x0,
        height: y1 - y0,
      });
    } else if (node.depth === 2 && isBranchNodeData(nodeData)) {
      // Branch node
      nodes.push({
        branch_code: nodeData.branch_code,
        name: nodeData.name,
        region: nodeData.region,
        isRegion: false,
        x0,
        y0,
        x1,
        y1,
        width: x1 - x0,
        height: y1 - y0,
      });
    }
  });

  // Return a new array with plain objects to avoid any references to hierarchy nodes
  return nodes.map(node => ({ ...node }));
}