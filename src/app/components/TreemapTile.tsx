import React, { useState } from 'react';
import { TreemapNode } from '../utils/treemap';
import { getColorForChangePct, formatChangePct, formatCurrency } from '../utils/colorScale';
import { TileData } from '../data/mockData';

interface TreemapTileProps {
  node: TreemapNode;
  tileData: TileData | undefined;
  mode: 'tv' | 'ops';
  currentPeriod: string;
  basePeriod: string;
}

export function TreemapTile({ node, tileData, mode, currentPeriod, basePeriod }: TreemapTileProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const changePct = tileData?.change_pct ?? 0;
  const { color, textColor } = getColorForChangePct(changePct);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === 'ops') {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseEnter = () => {
    if (mode === 'ops') {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Determine font size based on tile size
  const getFontSize = () => {
    const area = node.width * node.height;
    if (area < 2000) return { name: 'text-[9px]', pct: 'text-[9px]' };
    if (area < 4000) return { name: 'text-[10px]', pct: 'text-[10px]' };
    if (area < 8000) return { name: 'text-xs', pct: 'text-xs' };
    if (area < 15000) return { name: 'text-sm', pct: 'text-sm' };
    if (area < 25000) return { name: 'text-base', pct: 'text-base' };
    return { name: 'text-lg', pct: 'text-lg' };
  };

  const fontSize = getFontSize();

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: node.x0,
          top: node.y0,
          width: node.width,
          height: node.height,
          backgroundColor: color,
          color: textColor,
        }}
        className={`flex flex-col items-center justify-center p-1 overflow-hidden transition-opacity duration-300 ${
          mode === 'ops' ? 'cursor-pointer hover:opacity-90' : ''
        }`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`${fontSize.name} font-medium text-center leading-tight line-clamp-2 px-1`}>
          {node.name}
        </div>
        <div className={`${fontSize.pct} font-bold mt-0.5`}>
          {formatChangePct(changePct)}
        </div>
      </div>

      {showTooltip && mode === 'ops' && tileData && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x + 10,
            top: tooltipPos.y + 10,
            zIndex: 9999,
          }}
          className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 text-sm pointer-events-none max-w-sm"
        >
          <div className="font-bold text-base mb-2">{node.name}</div>
          {tileData.value_current !== undefined && tileData.value_base !== undefined && (
            <>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-400">Current:</span>
                <span className="font-semibold">{formatCurrency(tileData.value_current)}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-400">Base:</span>
                <span className="font-semibold">{formatCurrency(tileData.value_base)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between gap-4 text-sm font-bold mt-2 pt-2 border-t border-gray-700">
            <span>Change:</span>
            <span style={{ color: color }}>
              {formatChangePct(changePct)}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-700 space-y-1">
            <div><span className="font-semibold">Current:</span> {currentPeriod}</div>
            <div><span className="font-semibold">Base:</span> {basePeriod}</div>
          </div>
        </div>
      )}
    </>
  );
}