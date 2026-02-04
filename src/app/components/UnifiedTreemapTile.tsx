import { useState } from 'react';
import { TreemapNode } from '../utils/treemap';
import { getColorForChangePct, formatChangePct, formatCurrency } from '../utils/colorScale';
import { TileData } from '../data/mockData';
import { SPARKLINE_WIDTH, SPARKLINE_HEIGHT, SPARKLINE_PADDING } from '../constants';

interface UnifiedTreemapTileProps {
  node: TreemapNode;
  tileData: TileData | undefined;
  mode: 'tv' | 'ops';
  currentPeriod: string;
  basePeriod: string;
}

export function UnifiedTreemapTile({
  node,
  tileData,
  mode,
  currentPeriod,
  basePeriod,
}: UnifiedTreemapTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Region header tile
  if (node.isRegion) {
    return (
      <div
        role="heading"
        aria-level={2}
        aria-label={`${node.name} 지역`}
        style={{
          position: 'absolute',
          left: node.x0,
          top: node.y0,
          width: node.width,
          height: 24,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
          color: '#FFFFFF',
        }}
        className="flex items-center px-2"
      >
        <span className="text-xs font-bold uppercase tracking-wide">
          {node.name}
        </span>
      </div>
    );
  }

  // Branch tile
  const changePct = tileData?.change_pct ?? 0;
  const { color, textColor } = getColorForChangePct(changePct);
  
  // Force white text for red colors (negative changes)
  const finalTextColor = changePct < 0 ? '#ffffff' : textColor;

  // Determine font size based on tile area
  const getFontSize = () => {
    const area = node.width * node.height;
    if (area < 1500) return { name: 'text-[8px]', pct: 'text-[8px]' };
    if (area < 3000) return { name: 'text-[9px]', pct: 'text-[9px]' };
    if (area < 5000) return { name: 'text-[10px]', pct: 'text-[10px]' };
    if (area < 8000) return { name: 'text-xs', pct: 'text-xs' };
    if (area < 12000) return { name: 'text-sm', pct: 'text-sm' };
    if (area < 20000) return { name: 'text-base', pct: 'text-base' };
    if (area < 35000) return { name: 'text-lg', pct: 'text-lg' };
    return { name: 'text-xl', pct: 'text-xl' };
  };

  const fontSize = getFontSize();
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === 'ops') {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Generate sparkline path (straight lines - step chart)
  const generateSparklinePath = (trend: number[]) => {
    if (!trend || trend.length === 0) return '';

    const minValue = Math.min(...trend);
    const maxValue = Math.max(...trend);
    const valueRange = maxValue - minValue || 1;

    let path = '';

    trend.forEach((value, index) => {
      const x = SPARKLINE_PADDING + (index / (trend.length - 1)) * (SPARKLINE_WIDTH - 2 * SPARKLINE_PADDING);
      const y = SPARKLINE_HEIGHT - SPARKLINE_PADDING - ((value - minValue) / valueRange) * (SPARKLINE_HEIGHT - 2 * SPARKLINE_PADDING);

      if (index === 0) {
        path += `M ${x},${y}`;
      } else {
        // Draw straight line to current point
        path += ` L ${x},${y}`;
      }
    });

    return path;
  };

  // Build aria-label for screen readers
  const ariaLabel = tileData
    ? `${node.name}, ${node.region} 지역, 변화율 ${formatChangePct(changePct)}`
    : `${node.name}, ${node.region} 지역`;

  return (
    <>
      <div
        role="button"
        tabIndex={mode === 'ops' ? 0 : -1}
        aria-label={ariaLabel}
        aria-describedby={isHovered && mode === 'ops' ? `tooltip-${node.branch_code}` : undefined}
        style={{
          position: 'absolute',
          left: node.x0,
          top: node.y0,
          width: node.width,
          height: node.height,
          backgroundColor: color,
          color: finalTextColor,
          border: isHovered && mode === 'ops' ? '5px solid #fbbf24' : '1px solid rgba(0,0,0,0.2)',
          boxSizing: 'border-box',
        }}
        className={`flex flex-col items-center justify-center p-1 overflow-hidden transition-all duration-200 ${
          mode === 'ops' ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset' : ''
        }`}
        onMouseEnter={() => mode === 'ops' && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onFocus={() => mode === 'ops' && setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <div className={`${fontSize.name} font-semibold text-center leading-tight line-clamp-2 px-1`}>
          {node.name}
        </div>
        <div className={`${fontSize.pct} font-bold mt-0.5`}>
          {formatChangePct(changePct)}
        </div>
      </div>

      {/* Enhanced Tooltip with Sparkline - Finviz style */}
      {isHovered && mode === 'ops' && tileData && (
        <div
          id={`tooltip-${node.branch_code}`}
          role="tooltip"
          style={{
            position: 'fixed',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, calc(-100% - 10px))',
            zIndex: 10000,
            minWidth: '320px',
          }}
          className="bg-gray-800 text-white px-4 py-3 rounded shadow-2xl border-4 border-yellow-400 pointer-events-none"
        >
          {/* Header with region label */}
          <div className="mb-2 pb-2 border-b border-gray-700">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {node.region}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">{node.name}</span>
              {tileData.trend && (
                <svg
                  width="100"
                  height="30"
                  className="inline-block ml-2"
                  aria-label={`7일 추세: ${tileData.trend.join(', ')}`}
                  role="img"
                >
                  <path
                    d={generateSparklinePath(tileData.trend)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={changePct >= 0 ? 'text-green-400' : 'text-red-400'}
                  />
                </svg>
              )}
              <span className="text-lg font-bold ml-auto" style={{ color }}>
                {formatChangePct(changePct)}
              </span>
            </div>
          </div>

          {/* Values */}
          {tileData.value_current !== undefined && tileData.value_base !== undefined && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="text-gray-400">Current:</div>
              <div className="font-semibold text-right">{formatCurrency(tileData.value_current)}</div>

              <div className="text-gray-400">Base:</div>
              <div className="font-semibold text-right">{formatCurrency(tileData.value_base)}</div>
            </div>
          )}

          {/* Periods */}
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-700 space-y-0.5">
            <div><span className="font-semibold">Current:</span> {currentPeriod}</div>
            <div><span className="font-semibold">Base:</span> {basePeriod}</div>
          </div>
        </div>
      )}
    </>
  );
}