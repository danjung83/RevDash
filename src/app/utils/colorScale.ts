import { COLOR_CLAMP_MIN, COLOR_CLAMP_MAX } from '../constants';

// Diverging color scale for change_pct
// Buckets use half-open intervals [min, max) - min is inclusive, max is exclusive
export interface ColorBucket {
  min: number;
  max: number;
  color: string;
  textColor: string;
  label: string;
}

// Color buckets with half-open intervals [min, max)
// Neutral zone: -1% ~ 1%, 3 grades for negative, 3 grades for positive
// Colors have +30% saturation from original values (except neutral gray)
export const COLOR_BUCKETS: ColorBucket[] = [
  { min: -Infinity, max: -20, color: '#FF2A1F', textColor: '#FFFFFF', label: '< -20%' },    // Deep Red (+30% sat)
  { min: -20, max: -10, color: '#CF2422', textColor: '#FFFFFF', label: '-20% ~ -10%' },     // Medium Red (+30% sat)
  { min: -10, max: -1, color: '#982D33', textColor: '#FFFFFF', label: '-10% ~ -1%' },       // Light Red (+30% sat)
  { min: -1, max: 1, color: '#393D49', textColor: '#FFFFFF', label: '-1% ~ +1%' },          // Neutral Gray (unchanged)
  { min: 1, max: 10, color: '#228744', textColor: '#FFFFFF', label: '+1% ~ +10%' },         // Light Green (+30% sat)
  { min: 10, max: 20, color: '#22AF3E', textColor: '#FFFFFF', label: '+10% ~ +20%' },       // Medium Green (+30% sat)
  { min: 20, max: Infinity, color: '#3FD952', textColor: '#1F2937', label: '≥ +20%' },      // Deep Green (+30% sat)
];

// Neutral color bucket index for fallback
const NEUTRAL_BUCKET_INDEX = 3;

export function getColorForChangePct(changePct: number): { color: string; textColor: string } {
  // Clamp to configured range for color mapping
  const clamped = Math.max(COLOR_CLAMP_MIN, Math.min(COLOR_CLAMP_MAX, changePct));

  // Find matching bucket using half-open interval [min, max)
  const bucket = COLOR_BUCKETS.find(b => clamped >= b.min && clamped < b.max);

  // Return found bucket or fallback to neutral
  const fallback = COLOR_BUCKETS[NEUTRAL_BUCKET_INDEX];
  return {
    color: bucket?.color ?? fallback.color,
    textColor: bucket?.textColor ?? fallback.textColor,
  };
}

// Format currency to nearest 10M KRW (천만 단위)
export function formatCurrency(value: number): string {
  // Round to nearest 10,000,000 (10M KRW = 1억 KRW / 10)
  const rounded = Math.round(value / 10000000) * 10000000;
  const inHundredMillion = rounded / 100000000; // Convert to 억
  
  if (inHundredMillion >= 1 || inHundredMillion <= -1) {
    return `₩${inHundredMillion.toFixed(1)}억`;
  } else {
    // Less than 1억, show in 천만
    const inTenMillion = rounded / 10000000;
    return `₩${inTenMillion}천만`;
  }
}

// Format change percentage
export function formatChangePct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}
