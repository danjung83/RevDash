import { useMemo } from 'react';
import { BRANCHES } from '../data/branches';
import { computeUnifiedTreemapLayout } from '../utils/treemap';
import { UnifiedTreemapTile } from './UnifiedTreemapTile';
import { TileData } from '../data/mockData';

interface UnifiedTreemapProps {
  tiles: TileData[];
  mode: 'tv' | 'ops';
  currentPeriod: string;
  basePeriod: string;
  width: number;
  height: number;
}

export function UnifiedTreemap({
  tiles,
  mode,
  currentPeriod,
  basePeriod,
  width,
  height,
}: UnifiedTreemapProps) {
  // Compute treemap layout - memoized to avoid recomputation
  const nodes = useMemo(() => {
    return computeUnifiedTreemapLayout(BRANCHES, width, height);
  }, [width, height]);

  // Create tile lookup map for O(1) access instead of O(n) find
  const tileMap = useMemo(() => {
    return new Map(tiles.map(t => [t.branch_code, t]));
  }, [tiles]);

  return (
    <div className="relative w-full h-full bg-gray-950">
      {nodes.map(node => {
        const tileData = tileMap.get(node.branch_code);

        return (
          <UnifiedTreemapTile
            key={node.branch_code}
            node={node}
            tileData={tileData}
            mode={mode}
            currentPeriod={currentPeriod}
            basePeriod={basePeriod}
          />
        );
      })}
    </div>
  );
}