import { describe, it, expect } from 'vitest';
import {
  getColorForChangePct,
  formatChangePct,
  formatCurrency,
  COLOR_BUCKETS,
} from './colorScale';

describe('getColorForChangePct', () => {
  it('returns deep red for values < -20%', () => {
    const result = getColorForChangePct(-25);
    expect(result.color).toBe('#FF2A1F'); // Deep Red
  });

  it('returns medium red for values between -20% and -10%', () => {
    const result = getColorForChangePct(-15);
    expect(result.color).toBe('#CF2422'); // Medium Red
  });

  it('returns light red for values between -10% and -1%', () => {
    const result = getColorForChangePct(-5);
    expect(result.color).toBe('#982D33'); // Light Red
  });

  it('returns neutral gray for values between -1% and +1%', () => {
    const result = getColorForChangePct(0);
    expect(result.color).toBe('#393D49'); // Neutral Gray
  });

  it('returns light green for values between +1% and +10%', () => {
    const result = getColorForChangePct(5);
    expect(result.color).toBe('#228744'); // Light Green
  });

  it('returns medium green for values between +10% and +20%', () => {
    const result = getColorForChangePct(15);
    expect(result.color).toBe('#22AF3E'); // Medium Green
  });

  it('returns deep green for values >= +20%', () => {
    const result = getColorForChangePct(25);
    expect(result.color).toBe('#3FD952'); // Deep Green
  });

  it('clamps values above +40%', () => {
    const result = getColorForChangePct(100);
    expect(result.color).toBe('#3FD952'); // Should still be deep green
  });

  it('clamps values below -40%', () => {
    const result = getColorForChangePct(-100);
    expect(result.color).toBe('#FF2A1F'); // Should still be deep red
  });

  it('handles boundary value -20 correctly', () => {
    // -20 should be in the [-20, -10) bucket
    const result = getColorForChangePct(-20);
    expect(result.color).toBe('#CF2422'); // Medium Red, not Deep Red
  });

  it('handles boundary value +20 correctly', () => {
    // +20 should be in the [20, Infinity) bucket
    const result = getColorForChangePct(20);
    expect(result.color).toBe('#3FD952'); // Deep Green
  });

  it('handles boundary value -1 correctly', () => {
    // -1 should be in the [-1, 1) neutral bucket
    const result = getColorForChangePct(-1);
    expect(result.color).toBe('#393D49'); // Neutral Gray
  });

  it('handles boundary value +1 correctly', () => {
    // +1 should be in the [1, 10) light green bucket
    const result = getColorForChangePct(1);
    expect(result.color).toBe('#228744'); // Light Green
  });

  it('returns appropriate text color for readability', () => {
    // Dark backgrounds should have white text
    const deepRed = getColorForChangePct(-25);
    expect(deepRed.textColor).toBe('#FFFFFF');

    // Brightest green has dark text for readability
    const deepGreen = getColorForChangePct(25);
    expect(deepGreen.textColor).toBe('#1F2937');
  });
});

describe('formatChangePct', () => {
  it('formats positive percentage with + sign', () => {
    expect(formatChangePct(10.5)).toBe('+10.5%');
  });

  it('formats negative percentage without + sign', () => {
    expect(formatChangePct(-5.3)).toBe('-5.3%');
  });

  it('formats zero as positive', () => {
    expect(formatChangePct(0)).toBe('+0.0%');
  });

  it('rounds to one decimal place', () => {
    expect(formatChangePct(10.567)).toBe('+10.6%');
    expect(formatChangePct(-3.234)).toBe('-3.2%');
  });
});

describe('formatCurrency', () => {
  it('formats values >= 1억 correctly', () => {
    // 100,000,000 = 1억
    expect(formatCurrency(100000000)).toBe('₩1.0억');
    expect(formatCurrency(250000000)).toBe('₩2.5억');
  });

  it('formats values < 1억 in 천만 units', () => {
    // 50,000,000 = 5천만
    expect(formatCurrency(50000000)).toBe('₩5천만');
  });

  it('rounds to nearest 10M KRW', () => {
    // 135,000,000 -> rounds to 140,000,000 = 1.4억
    expect(formatCurrency(135000000)).toBe('₩1.4억');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toBe('₩0천만');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-100000000)).toBe('₩-1.0억');
  });
});

describe('COLOR_BUCKETS', () => {
  it('has 7 color buckets', () => {
    expect(COLOR_BUCKETS).toHaveLength(7);
  });

  it('covers all possible values without gaps', () => {
    // Each bucket's max should equal next bucket's min
    for (let i = 0; i < COLOR_BUCKETS.length - 1; i++) {
      expect(COLOR_BUCKETS[i].max).toBe(COLOR_BUCKETS[i + 1].min);
    }
  });

  it('starts from -Infinity and ends at Infinity', () => {
    expect(COLOR_BUCKETS[0].min).toBe(-Infinity);
    expect(COLOR_BUCKETS[COLOR_BUCKETS.length - 1].max).toBe(Infinity);
  });
});
