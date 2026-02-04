# Branch Revenue Map Dashboard

A full-screen 4K (3840x2160) revenue performance dashboard for branch locations, featuring a treemap visualization with diverging color scale.

## Features

### Two Operating Modes

**TV Mode (Default)**
- Auto-rotates between tabs A, B, C every 5 minutes
- No revenue amounts displayed (privacy)
- No hover effects or tooltips
- Auto-refreshes data every 5 minutes
- Ideal for public display on office TVs

**Ops Mode**
- Manual tab switching (buttons or keyboard: 1/2/3)
- Hover tooltips show detailed revenue amounts (rounded to ₩10M)
- Manual refresh button (or press R)
- Keyboard shortcuts enabled
- Enable via URL param: `?mode=ops` or toggle button

### Three Data Tabs

**Tab A: Actual (Checkout) MTD vs Prev MTD**
- Current period: This month day 1 → today
- Base period: Previous month day 1 → same day-of-month
- Values: Gross revenue based on checkout (취소/환불 반영)

**Tab B: Forecast (Checkout) Week Bucket vs Prev Month Same Week**
- Current period: This month week bucket (1-7, 8-14, 15-21, 22-end)
- Base period: Previous month same week bucket
- Values: Forecast revenue based on reservations (예약 기반 예상매출)

**Tab C: Pickup MTD vs Prev MTD**
- Current period: This month day 1 → today (PICKUP basis)
- Base period: Previous month day 1 → same day-of-month
- Values: Booking created/confirmed revenue (픽업 기준)

### Treemap Layout

- **Block Area**: Fixed by number of rooms (객실수) - stable across all tabs
- **Block Color**: Diverging heat scale based on change_pct (%)
- **Six Regions**: 서울, 경기인천, 강원, 부산, 울산, 기타
- Deterministic layout using squarify algorithm
- Smooth crossfade transitions between tabs

### Color Scale (Diverging 7-Bucket)

| Color | Range | Description |
|-------|-------|-------------|
| Deep Red | ≤ -20% | Severe underperformance |
| Red | -20 to -10% | Underperforming |
| Light Red | -10 to -3% | Slightly below target |
| Neutral Gray | -3 to +3% | Near baseline |
| Light Green | +3 to +10% | Slight growth |
| Green | +10 to +20% | Strong growth |
| Deep Green | ≥ +20% | Exceptional growth |

Change % is clamped to [-40%, +40%] for color mapping.

## Keyboard Shortcuts

**Available in Ops Mode:**
- `1` - Switch to Tab A
- `2` - Switch to Tab B
- `3` - Switch to Tab C
- `R` - Refresh data
- `T` - Toggle between TV/Ops mode (works in both modes)

## URL Parameters

- `?mode=ops` - Start in Ops mode (default is TV mode)

## Branch Master (33 Branches)

### 서울 (4 branches)
- S004 명동 (55 rooms)
- S015 강남 시그니티 (92 rooms)
- S017 부티크익선 (54 rooms)
- S021 강남 로이움 (114 rooms)

### 경기인천 (6 branches)
- S007 송도달빛공원 (144 rooms)
- S018 시흥웨이브파크 (271 rooms)
- S024 인천차이나타운 (140 rooms)
- S026 시흥거북섬 (141 rooms)
- S031 동탄(호텔) (71 rooms)
- S033 오버더마운틴 (30 rooms)

### 강원 (7 branches)
- S008 속초해변C (70 rooms)
- S010 속초등대해변 (251 rooms)
- S023 속초해변AB (115 rooms)
- S028 낙산해변 (58 rooms)
- S029 속초해변 (126 rooms)
- S030 속초중앙 (206 rooms)
- S032 속초자이엘라 (225 rooms)

### 부산 (8 branches)
- S002 서면 (270 rooms)
- S006 부산역 (40 rooms)
- S011 부산시청 (74 rooms)
- S012 부산기장 (61 rooms)
- S013 부티크남포BIFF (76 rooms)
- S019 부산송도해변 (159 rooms)
- S025 해운대 패러그라프 (52 rooms)
- S027 해운대역 (114 rooms)

### 울산 (1 branch)
- S014 스타즈울산 (327 rooms)

### 기타 (2 branches)
- S005 제주공항 (67 rooms)
- S022 당진터미널 (153 rooms)

## Mock Data

The dashboard includes mock data generator for demonstration. In production, replace with API calls:

- TV endpoint: `/api/revmap/tv` (no currency amounts)
- Ops endpoint: `/api/revmap/ops` (with currency amounts)

## Technical Details

- Built with React + TypeScript + Tailwind CSS v4
- Treemap algorithm: d3-hierarchy with squarify tiling
- Optimized for 4K displays (3840x2160) but responsive
- Smooth animations with CSS transitions
- Performance-optimized memoization

## Display Recommendations

- Use full-screen mode (F11) for TV displays
- Recommended minimum resolution: 1920x1080
- Optimal resolution: 3840x2160 (4K)
- Chrome or Edge browser recommended for best performance
