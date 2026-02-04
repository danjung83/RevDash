import React, { useMemo } from 'react';
import { Region, getBranchesByRegion } from '../data/branches';
import { computeTreemapLayout } from '../utils/treemap';
import { TreemapTile } from './TreemapTile';
import { TileData } from '../data/mockData';

interface RegionTreemapProps {
  region: Region;
  tiles: TileData[];
  mode: 'tv' | 'ops';
  currentPeriod: string;
  basePeriod: string;
  width: number;
  height: number;
}

export function RegionTreemap({
  region,
  tiles,
  mode,
  currentPeriod,
  basePeriod,
  width,
  height,
}: RegionTreemapProps) {
  const branches = getBranchesByRegion(region);
  
  // Compute treemap layout - memoized to avoid recomputation
  const nodes = useMemo(() => {
    return computeTreemapLayout(branches, width, height);
  }, [branches, width, height]);

  // Calculate region summary
  const totalRooms = branches.reduce((sum, b) => sum + b.rooms, 0);
  const branchCount = branches.length;
  
  // Calculate average change for region
  const avgChange = useMemo(() => {
    const branchCodes = branches.map(b => b.branch_code);
    const regionTiles = tiles.filter(t => branchCodes.includes(t.branch_code));
    if (regionTiles.length === 0) return 0;
    const sum = regionTiles.reduce((acc, t) => acc + t.change_pct, 0);
    return sum / regionTiles.length;
  }, [branches, tiles]);

  const avgChangeFormatted = avgChange >= 0 ? `+${avgChange.toFixed(1)}%` : `${avgChange.toFixed(1)}%`;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{region}</h3>
          <span className={`text-xs font-semibold ${
            avgChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            Avg {avgChangeFormatted}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {branchCount} branches · {totalRooms} rooms
        </div>
      </div>
      <div className="flex-1 relative bg-gray-950" style={{ minHeight: height }}>
        {nodes.map(node => {
          const tileData = tiles.find(t => t.branch_code === node.branch_code);
          return (
            <TreemapTile
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
    </div>
  );
}