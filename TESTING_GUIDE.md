# Testing Guide for Branch Revenue Map Dashboard

## Quick Start

1. **Default TV Mode**: Open the app - it will start in TV mode
   - Tabs auto-rotate every 5 minutes (A → B → C)
   - No revenue amounts shown
   - Press `T` to switch to Ops mode

2. **Ops Mode via URL**: Open `?mode=ops`
   - Manual tab controls appear
   - Hover over tiles to see revenue details
   - Keyboard shortcuts active

## Test Scenarios

### TV Mode Testing

✅ **Auto-rotation**
- Wait 5 minutes (or modify interval in code for testing)
- Verify tab changes A → B → C → A
- Check smooth crossfade transition (300ms opacity)

✅ **No Data Leakage**
- Hover over tiles - no tooltips should appear
- Check that only change % is visible, no currency amounts
- Verify "TV Mode: No revenue amounts displayed" in legend

✅ **Auto-refresh**
- Wait 5 minutes for data refresh
- Check "Last Refresh" timestamp updates
- Verify data changes (mock data regenerates)

### Ops Mode Testing

✅ **Manual Tab Switching**
- Click Tab A/B/C buttons
- Press keyboard 1/2/3
- Verify smooth transition (300ms)
- Check active tab highlight (blue)

✅ **Hover Tooltips**
- Hover over any tile
- Verify tooltip shows:
  - Branch name
  - Current value (in ₩억 format)
  - Base value (in ₩억 format)
  - Change % with color
  - Period dates

✅ **Keyboard Shortcuts**
- Press `1` → switches to Tab A
- Press `2` → switches to Tab B
- Press `3` → switches to Tab C
- Press `R` → refreshes data (timestamp updates)
- Press `T` → toggles to TV mode

✅ **Refresh Button**
- Click refresh icon in header
- Verify "Last Refresh" timestamp updates
- Check data changes

### Visual/Layout Testing

✅ **Responsive Sizing**
- Resize browser window
- Verify treemap tiles resize proportionally
- Check that regions maintain relative positions
- Confirm 3x2 grid layout remains stable

✅ **Color Scale**
- Identify tiles in each color bucket:
  - Deep Red (≤-20%)
  - Red (-20 to -10%)
  - Light Red (-10 to -3%)
  - Neutral Gray (-3 to +3%)
  - Light Green (+3 to +10%)
  - Green (+10 to +20%)
  - Deep Green (≥+20%)
- Verify text contrast (white on dark, dark on light)

✅ **Region Headers**
- Check all 6 regions display correctly
- Verify branch count and room totals
- Check average change % calculation
- Color coding of avg change (green/red)

✅ **Font Sizing**
- Check small tiles (S033 오버더마운틴 - 30 rooms)
- Check large tiles (S014 스타즈울산 - 327 rooms)
- Verify text doesn't overflow
- Confirm font scales with tile size

### Data Accuracy Testing

✅ **All 33 Branches Display**
- Count total tiles across all regions = 33
- Verify each branch code appears once
- Check no duplicates

✅ **Region Groupings**
- 서울: 4 branches (S004, S015, S017, S021)
- 경기인천: 6 branches (S007, S018, S024, S026, S031, S033)
- 강원: 7 branches (S008, S010, S023, S028, S029, S030, S032)
- 부산: 8 branches (S002, S006, S011, S012, S013, S019, S025, S027)
- 울산: 1 branch (S014)
- 기타: 2 branches (S005, S022)

✅ **Stable Layout Across Tabs**
- Switch between tabs A/B/C
- Verify tile positions don't move
- Only colors and percentages should change
- Layout remains deterministic

✅ **Currency Formatting (Ops Mode)**
- Find a tile with large value (e.g., S014 스타즈울산)
- Verify format: `₩X.X억` for values ≥ 100M
- Verify format: `₩X천만` for values < 100M
- Check rounding to nearest 10M KRW

### Edge Cases

✅ **Mode Toggle**
- Toggle from TV → Ops
- Verify data reloads with currency amounts
- Toggle from Ops → TV
- Verify tooltips no longer work
- Check URL parameter updates correctly

✅ **URL Parameters**
- Open `?mode=ops` directly
- Verify starts in Ops mode
- Open without params
- Verify starts in TV mode

✅ **Performance**
- Monitor for 5+ minutes in TV mode
- Check for memory leaks (DevTools Memory tab)
- Verify smooth animations throughout
- No lag when hovering in Ops mode

## Quick Test Checklist

- [ ] TV mode auto-rotates tabs every 5 minutes
- [ ] Ops mode allows manual tab switching
- [ ] Hover tooltips work in Ops mode only
- [ ] All keyboard shortcuts function (1/2/3/R/T)
- [ ] Color scale displays all 7 buckets
- [ ] All 33 branches render correctly
- [ ] Layout is stable across tab switches
- [ ] Currency formatting is correct
- [ ] Mode toggle works both ways
- [ ] URL parameters work correctly
- [ ] Responsive sizing works
- [ ] Average change per region calculates correctly

## Performance Metrics

**Expected Performance:**
- Initial load: < 500ms
- Tab switch transition: 300ms
- Hover tooltip: < 50ms
- Data refresh: < 100ms (mock data)
- Memory usage: Stable over time (no leaks)

## Notes for Developers

**To test faster auto-rotation:**
```typescript
// In App.tsx, change:
300000  // 5 minutes
// to:
10000   // 10 seconds
```

**To generate different mock data:**
- Refresh the page (data regenerates on mount)
- Press R in Ops mode
- Toggle between modes

**To test with real API:**
- Replace `generateMockData(mode)` calls
- Implement fetch to `/api/revmap/tv` or `/api/revmap/ops`
- Match the data contract in mockData.ts
