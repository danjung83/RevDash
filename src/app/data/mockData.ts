// Mock data generator for all three tabs
import { BRANCHES } from './branches';

export interface TileData {
  branch_code: string;
  value_current?: number; // Only in Ops mode
  value_base?: number; // Only in Ops mode
  change_pct: number;
  trend?: number[]; // 7-day trend for sparkline (only in Ops mode)
}

export interface TabData {
  label: string;
  description: string;
  current_period: string;
  base_period: string;
  tiles: TileData[];
}

export interface DashboardData {
  as_of_ts: string;
  tabs: {
    A: TabData;
    B: TabData;
    C: TabData;
  };
}

// Generate realistic mock data
function generateMockTiles(mode: 'tv' | 'ops'): TileData[] {
  return BRANCHES.map(branch => {
    // Generate realistic change percentages with variety
    const seed = parseInt(branch.branch_code.substring(1));
    const randomFactor = (seed * 17) % 100;
    
    let change_pct: number;
    if (randomFactor < 15) {
      change_pct = -25 + (randomFactor / 15) * 15; // Deep negative
    } else if (randomFactor < 30) {
      change_pct = -10 + ((randomFactor - 15) / 15) * 8; // Light negative
    } else if (randomFactor < 50) {
      change_pct = -2 + ((randomFactor - 30) / 20) * 4; // Near neutral
    } else if (randomFactor < 70) {
      change_pct = 3 + ((randomFactor - 50) / 20) * 7; // Light positive
    } else if (randomFactor < 90) {
      change_pct = 10 + ((randomFactor - 70) / 20) * 10; // Positive
    } else {
      change_pct = 20 + ((randomFactor - 90) / 10) * 15; // Deep positive
    }

    const tile: TileData = {
      branch_code: branch.branch_code,
      change_pct: Math.round(change_pct * 10) / 10, // Round to 1 decimal
    };

    if (mode === 'ops') {
      // Generate realistic revenue values (in KRW)
      const baseRevenue = branch.rooms * 80000 * 25; // rooms * avg_rate * days
      const variance = 0.3 + (seed % 7) * 0.1;
      tile.value_base = Math.round(baseRevenue * variance);
      tile.value_current = Math.round(tile.value_base * (1 + change_pct / 100));
      
      // Generate 7-day trend data for sparkline
      tile.trend = Array.from({ length: 7 }, (_, i) => {
        const trendVariance = Math.sin((seed + i) * 0.5) * 5 + change_pct;
        return Math.round((tile.value_base! * (1 + trendVariance / 100)) / 1000000) / 10; // in 10M KRW
      });
    }

    return tile;
  });
}

function generateMockTilesTabSpecific(mode: 'tv' | 'ops', tabOffset: number): TileData[] {
  return BRANCHES.map(branch => {
    const seed = parseInt(branch.branch_code.substring(1)) + tabOffset * 7;
    const randomFactor = (seed * 23 + tabOffset * 31) % 100;
    
    let change_pct: number;
    // Create more varied distribution across the color scale
    if (randomFactor < 8) {
      // Deep negative: <= -20%
      change_pct = -35 + (randomFactor / 8) * 10;
    } else if (randomFactor < 20) {
      // Red: -20 to -10%
      change_pct = -20 + ((randomFactor - 8) / 12) * 10;
    } else if (randomFactor < 35) {
      // Light Red: -10 to -3%
      change_pct = -10 + ((randomFactor - 20) / 15) * 7;
    } else if (randomFactor < 50) {
      // Neutral: -3 to +3%
      change_pct = -3 + ((randomFactor - 35) / 15) * 6;
    } else if (randomFactor < 65) {
      // Light Green: +3 to +10%
      change_pct = 3 + ((randomFactor - 50) / 15) * 7;
    } else if (randomFactor < 85) {
      // Green: +10 to +20%
      change_pct = 10 + ((randomFactor - 65) / 20) * 10;
    } else {
      // Deep Green: >= +20%
      change_pct = 20 + ((randomFactor - 85) / 15) * 18;
    }

    const tile: TileData = {
      branch_code: branch.branch_code,
      change_pct: Math.round(change_pct * 10) / 10,
    };

    if (mode === 'ops') {
      const baseRevenue = branch.rooms * 75000 * (20 + tabOffset * 3);
      const variance = 0.4 + ((seed * 7) % 5) * 0.15;
      tile.value_base = Math.round(baseRevenue * variance);
      tile.value_current = Math.round(tile.value_base * (1 + change_pct / 100));
      
      // Generate 7-day trend data for sparkline
      tile.trend = Array.from({ length: 7 }, (_, i) => {
        const trendVariance = Math.sin((seed + i) * 0.5) * 5 + change_pct;
        return Math.round((tile.value_base! * (1 + trendVariance / 100)) / 1000000) / 10; // in 10M KRW
      });
    }

    return tile;
  });
}

export function generateMockData(mode: 'tv' | 'ops'): DashboardData {
  const now = new Date('2026-02-04T14:30:00+09:00');
  
  return {
    as_of_ts: now.toISOString(),
    tabs: {
      A: {
        label: '체크아웃기준 MTD',
        description: '이번달 1일 ~ 4일 vs 이전달 1일 ~ 4일',
        current_period: '2026-02-01 ~ 2026-02-04',
        base_period: '2026-01-01 ~ 2026-01-04',
        tiles: generateMockTilesTabSpecific(mode, 0),
      },
      B: {
        label: '확정예약기준 MTD',
        description: '이번달 1일 ~ 28일 vs 이전달 1일 ~ 31일',
        current_period: '2026-02-01 ~ 2026-02-28',
        base_period: '2026-01-01 ~ 2026-01-31',
        tiles: generateMockTilesTabSpecific(mode, 1),
      },
      C: {
        label: '픽업예약기준 MTF',
        description: '최근 7일 기준',
        current_period: '2026-01-29 ~ 2026-02-04',
        base_period: '2026-01-22 ~ 2026-01-28',
        tiles: generateMockTilesTabSpecific(mode, 2),
      },
    },
  };
}