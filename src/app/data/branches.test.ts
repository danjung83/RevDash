import { describe, it, expect } from 'vitest';
import { BRANCHES, REGIONS, getBranchesByRegion, Branch } from './branches';

describe('BRANCHES', () => {
  it('has 28 branches', () => {
    expect(BRANCHES).toHaveLength(28);
  });

  it('all branches have required properties', () => {
    BRANCHES.forEach(branch => {
      expect(branch).toHaveProperty('branch_code');
      expect(branch).toHaveProperty('name');
      expect(branch).toHaveProperty('rooms');
      expect(branch).toHaveProperty('region');
    });
  });

  it('all branch codes are unique', () => {
    const codes = BRANCHES.map(b => b.branch_code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('all branch codes follow S### format', () => {
    BRANCHES.forEach(branch => {
      expect(branch.branch_code).toMatch(/^S\d{3}$/);
    });
  });

  it('all branches have positive room counts', () => {
    BRANCHES.forEach(branch => {
      expect(branch.rooms).toBeGreaterThan(0);
    });
  });

  it('all branches are assigned to valid regions', () => {
    BRANCHES.forEach(branch => {
      expect(REGIONS).toContain(branch.region);
    });
  });
});

describe('REGIONS', () => {
  it('has 6 regions', () => {
    expect(REGIONS).toHaveLength(6);
  });

  it('contains expected regions', () => {
    expect(REGIONS).toContain('서울');
    expect(REGIONS).toContain('경기인천');
    expect(REGIONS).toContain('강원');
    expect(REGIONS).toContain('부산');
    expect(REGIONS).toContain('울산');
    expect(REGIONS).toContain('기타');
  });
});

describe('getBranchesByRegion', () => {
  it('returns branches for a valid region', () => {
    const seoulBranches = getBranchesByRegion('서울');
    expect(seoulBranches.length).toBeGreaterThan(0);
    seoulBranches.forEach(branch => {
      expect(branch.region).toBe('서울');
    });
  });

  it('returns branches sorted by rooms (descending)', () => {
    const branches = getBranchesByRegion('강원');
    for (let i = 0; i < branches.length - 1; i++) {
      expect(branches[i].rooms).toBeGreaterThanOrEqual(branches[i + 1].rooms);
    }
  });

  it('returns empty array for non-existent region', () => {
    // @ts-expect-error - testing invalid input
    const branches = getBranchesByRegion('없는지역');
    expect(branches).toEqual([]);
  });
});

describe('Branch distribution by region', () => {
  const regionCounts: Record<string, number> = {
    '서울': 4,
    '경기인천': 6,
    '강원': 7,
    '부산': 8,
    '울산': 1,
    '기타': 2,
  };

  Object.entries(regionCounts).forEach(([region, expectedCount]) => {
    it(`has ${expectedCount} branches in ${region}`, () => {
      const branches = BRANCHES.filter(b => b.region === region);
      expect(branches).toHaveLength(expectedCount);
    });
  });
});
