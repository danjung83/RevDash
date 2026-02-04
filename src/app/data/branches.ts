// Branch master data with region mapping
export interface Branch {
  branch_code: string;
  name: string;
  rooms: number;
  region: string;
}

export const BRANCHES: Branch[] = [
  { branch_code: 'S002', name: '서면', rooms: 270, region: '부산' },
  { branch_code: 'S004', name: '명동', rooms: 55, region: '서울' },
  { branch_code: 'S005', name: '제주공항', rooms: 67, region: '기타' },
  { branch_code: 'S006', name: '부산역', rooms: 40, region: '부산' },
  { branch_code: 'S007', name: '송도달빛공원', rooms: 144, region: '경기인천' },
  { branch_code: 'S008', name: '속초해변C', rooms: 70, region: '강원' },
  { branch_code: 'S010', name: '속초등대해변', rooms: 251, region: '강원' },
  { branch_code: 'S011', name: '부산시청', rooms: 74, region: '부산' },
  { branch_code: 'S012', name: '부산기장', rooms: 61, region: '부산' },
  { branch_code: 'S013', name: '부티크남포BIFF', rooms: 76, region: '부산' },
  { branch_code: 'S014', name: '스타즈울산', rooms: 327, region: '울산' },
  { branch_code: 'S015', name: '강남 시그니티', rooms: 92, region: '서울' },
  { branch_code: 'S017', name: '부티크익선', rooms: 54, region: '서울' },
  { branch_code: 'S018', name: '시흥웨이브파크', rooms: 271, region: '경기인천' },
  { branch_code: 'S019', name: '부산송도해변', rooms: 159, region: '부산' },
  { branch_code: 'S021', name: '강남 로이움', rooms: 114, region: '서울' },
  { branch_code: 'S022', name: '당진터미널', rooms: 153, region: '기타' },
  { branch_code: 'S023', name: '속초해변AB', rooms: 115, region: '강원' },
  { branch_code: 'S024', name: '인천차이나타운', rooms: 140, region: '경기인천' },
  { branch_code: 'S025', name: '해운대 패러그라프', rooms: 52, region: '부산' },
  { branch_code: 'S026', name: '시흥거북섬', rooms: 141, region: '경기인천' },
  { branch_code: 'S027', name: '해운대역', rooms: 114, region: '부산' },
  { branch_code: 'S028', name: '낙산해변', rooms: 58, region: '강원' },
  { branch_code: 'S029', name: '속초해변', rooms: 126, region: '강원' },
  { branch_code: 'S030', name: '속초중앙', rooms: 206, region: '강원' },
  { branch_code: 'S031', name: '동탄(호텔)', rooms: 71, region: '경기인천' },
  { branch_code: 'S032', name: '속초자이엘라', rooms: 225, region: '강원' },
  { branch_code: 'S033', name: '오버더마운틴', rooms: 30, region: '경기인천' },
];

export const REGIONS = ['서울', '경기인천', '강원', '부산', '울산', '기타'] as const;
export type Region = typeof REGIONS[number];

export function getBranchesByRegion(region: Region): Branch[] {
  return BRANCHES
    .filter(b => b.region === region)
    .sort((a, b) => {
      // Sort by rooms desc, then by branch_code asc for deterministic layout
      if (b.rooms !== a.rooms) return b.rooms - a.rooms;
      return a.branch_code.localeCompare(b.branch_code);
    });
}
