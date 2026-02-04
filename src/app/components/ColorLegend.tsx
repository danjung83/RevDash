import React from 'react';
import { COLOR_BUCKETS } from '../utils/colorScale';

interface ColorLegendProps {
  mode: 'tv' | 'ops';
}

export function ColorLegend({ mode }: ColorLegendProps) {
  return (
    <div className="bg-gray-900 border-t border-gray-700 px-6 py-3">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-400 font-semibold mr-2">Change % Scale:</span>
            {COLOR_BUCKETS.map((bucket, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div
                  style={{ backgroundColor: bucket.color }}
                  className="w-16 h-7 rounded shadow-sm"
                />
                <span className="text-xs text-gray-300 whitespace-nowrap font-medium">
                  {bucket.label}
                </span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-400 font-medium">
            {mode === 'tv' ? (
              <span className="text-blue-400">📺 TV Mode: No revenue amounts displayed</span>
            ) : (
              <span className="text-green-400">⚙️ Ops Mode: Hover for details · Change% = current vs base period</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}