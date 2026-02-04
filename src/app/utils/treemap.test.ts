import { describe, it, expect } from 'vitest';
import { computeUnifiedTreemapLayout, TreemapNode } from './treemap';
import { Branch } from '../data/branches';

// Test data
const testBranches: Branch[] = [
  { branch_code: 'S001', name: '테스트지점A', rooms: 100, region: '서울' },
  { branch_code: 'S002', name: '테스트지점B', rooms: 200, region: '서울' },
  { branch_code: 'S003', name: '테스트지점C', rooms: 150, region: '부산' },
];

describe('computeUnifiedTreemapLayout', () => {
  it('returns empty array for empty branches', () => {
    const result = computeUnifiedTreemapLayout([], 800, 600);
    expect(result).toEqual([]);
  });

  it('returns nodes for all branches plus region headers', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    // Should have 2 region headers (서울, 부산) + 3 branch nodes
    expect(result).toHaveLength(5);
  });

  it('includes region nodes with isRegion flag', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    const regionNodes = result.filter(node => node.isRegion);
    expect(regionNodes).toHaveLength(2);

    const regionNames = regionNodes.map(n => n.name);
    expect(regionNames).toContain('서울');
    expect(regionNames).toContain('부산');
  });

  it('includes branch nodes with correct branch_code', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    const branchNodes = result.filter(node => !node.isRegion);
    expect(branchNodes).toHaveLength(3);

    const branchCodes = branchNodes.map(n => n.branch_code);
    expect(branchCodes).toContain('S001');
    expect(branchCodes).toContain('S002');
    expect(branchCodes).toContain('S003');
  });

  it('assigns region to branch nodes', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    const seoulBranches = result.filter(
      node => !node.isRegion && node.region === '서울'
    );
    expect(seoulBranches).toHaveLength(2);

    const busanBranches = result.filter(
      node => !node.isRegion && node.region === '부산'
    );
    expect(busanBranches).toHaveLength(1);
  });

  it('calculates valid coordinates within bounds', () => {
    const width = 800;
    const height = 600;
    const result = computeUnifiedTreemapLayout(testBranches, width, height);

    result.forEach(node => {
      expect(node.x0).toBeGreaterThanOrEqual(0);
      expect(node.y0).toBeGreaterThanOrEqual(0);
      expect(node.x1).toBeLessThanOrEqual(width);
      expect(node.y1).toBeLessThanOrEqual(height);
      expect(node.x1).toBeGreaterThan(node.x0);
      expect(node.y1).toBeGreaterThan(node.y0);
    });
  });

  it('calculates width and height correctly', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    result.forEach(node => {
      expect(node.width).toBeCloseTo(node.x1 - node.x0, 5);
      expect(node.height).toBeCloseTo(node.y1 - node.y0, 5);
    });
  });

  it('produces larger areas for branches with more rooms', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    const branchA = result.find(n => n.branch_code === 'S001'); // 100 rooms
    const branchB = result.find(n => n.branch_code === 'S002'); // 200 rooms

    if (branchA && branchB) {
      const areaA = branchA.width * branchA.height;
      const areaB = branchB.width * branchB.height;
      expect(areaB).toBeGreaterThan(areaA);
    }
  });

  it('returns plain objects without circular references', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    // Should be serializable to JSON without errors
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('handles single branch correctly', () => {
    const singleBranch: Branch[] = [
      { branch_code: 'S001', name: '단일지점', rooms: 100, region: '서울' },
    ];

    const result = computeUnifiedTreemapLayout(singleBranch, 800, 600);

    // Should have 1 region header + 1 branch node
    expect(result).toHaveLength(2);
  });

  it('handles branches with same room count', () => {
    const sameSizeBranches: Branch[] = [
      { branch_code: 'S001', name: '지점A', rooms: 100, region: '서울' },
      { branch_code: 'S002', name: '지점B', rooms: 100, region: '서울' },
    ];

    const result = computeUnifiedTreemapLayout(sameSizeBranches, 800, 600);

    const branchNodes = result.filter(node => !node.isRegion);
    expect(branchNodes).toHaveLength(2);

    // Areas should be approximately equal (within 5% tolerance)
    const areas = branchNodes.map(n => n.width * n.height);
    const ratio = areas[0] / areas[1];
    expect(ratio).toBeGreaterThan(0.95);
    expect(ratio).toBeLessThan(1.05);
  });
});

describe('TreemapNode interface', () => {
  it('has all required properties', () => {
    const result = computeUnifiedTreemapLayout(testBranches, 800, 600);

    result.forEach(node => {
      expect(node).toHaveProperty('branch_code');
      expect(node).toHaveProperty('name');
      expect(node).toHaveProperty('x0');
      expect(node).toHaveProperty('y0');
      expect(node).toHaveProperty('x1');
      expect(node).toHaveProperty('y1');
      expect(node).toHaveProperty('width');
      expect(node).toHaveProperty('height');
    });
  });
});
