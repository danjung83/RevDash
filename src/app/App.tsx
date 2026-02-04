import { useState, useEffect, useCallback, useRef } from 'react';
import { UnifiedTreemap } from './components/UnifiedTreemap';
import { generateMockData, DashboardData } from './data/mockData';
import { Monitor, Settings, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ROTATION_INTERVAL_MS,
  REFRESH_INTERVAL_MS,
  MIN_TREEMAP_WIDTH,
  MIN_TREEMAP_HEIGHT,
  DEFAULT_TREEMAP_WIDTH,
  DEFAULT_TREEMAP_HEIGHT,
  TREEMAP_PADDING,
} from './constants';

type TabKey = 'A' | 'B' | 'C';
type Mode = 'tv' | 'ops';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

function App() {
  const [mode, setMode] = useState<Mode>(() => {
    // Check URL params for mode
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'ops' ? 'ops' : 'tv';
  });
  const [currentTab, setCurrentTab] = useState<TabKey>('A');
  const [lastRefresh, setLastRefresh] = useState('');
  const mainRef = useRef<HTMLDivElement>(null);
  const [treemapDimensions, setTreemapDimensions] = useState({ width: DEFAULT_TREEMAP_WIDTH, height: DEFAULT_TREEMAP_HEIGHT });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Calculate treemap dimensions based on viewport
  useEffect(() => {
    const calculateDimensions = () => {
      if (mainRef.current) {
        const containerWidth = mainRef.current.clientWidth;
        const containerHeight = mainRef.current.clientHeight;
        
        setTreemapDimensions({
          width: Math.max(MIN_TREEMAP_WIDTH, containerWidth - TREEMAP_PADDING),
          height: Math.max(MIN_TREEMAP_HEIGHT, containerHeight - TREEMAP_PADDING)
        });
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // Load data based on mode
  const loadData = useCallback(() => {
    setLoadingState('loading');
    setError(null);

    try {
      // In production, this would be an async API call:
      // const response = await fetch('/api/dashboard');
      // const mockData = await response.json();
      const mockData = generateMockData(mode);

      setData(mockData);
      setLastRefresh(new Date(mockData.as_of_ts).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }));
      setLoadingState('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      setLoadingState('error');
      console.error('Failed to load dashboard data:', err);
    }
  }, [mode]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'tv' ? 'ops' : 'tv';
    setMode(newMode);
    
    // Reload data with new mode to get correct data structure
    const mockData = generateMockData(newMode);
    setData(mockData);
    
    // Update URL without storing URL object
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      if (newMode === 'ops') {
        url.searchParams.set('mode', 'ops');
      } else {
        url.searchParams.delete('mode');
      }
      window.history.pushState({}, '', url.toString());
    }
  }, [mode]);

  // Auto-rotation for TV mode
  useEffect(() => {
    if (mode === 'tv') {
      const rotationInterval = setInterval(() => {
        setCurrentTab(prev => {
          if (prev === 'A') return 'B';
          if (prev === 'B') return 'C';
          return 'A';
        });
      }, ROTATION_INTERVAL_MS);

      return () => clearInterval(rotationInterval);
    }
  }, [mode]);

  // Auto-refresh data in TV mode
  useEffect(() => {
    if (mode === 'tv') {
      const refreshInterval = setInterval(loadData, REFRESH_INTERVAL_MS);
      return () => clearInterval(refreshInterval);
    }
  }, [mode, loadData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle mode works in both modes
      if (e.key === 't' || e.key === 'T') {
        toggleMode();
        return;
      }
      
      // Arrow navigation and shortcuts
      if (e.key === 'ArrowLeft') handlePrevTab();
      if (e.key === 'ArrowRight') handleNextTab();
      if (e.key === '1') setCurrentTab('A');
      if (e.key === '2') setCurrentTab('B');
      if (e.key === '3') setCurrentTab('C');
      if (e.key === 'r' || e.key === 'R') loadData();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, loadData, toggleMode]);

  const handleNextTab = () => {
    const tabs: TabKey[] = ['A', 'B', 'C'];
    const currentIndex = tabs.indexOf(currentTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setCurrentTab(tabs[nextIndex]);
  };

  const handlePrevTab = () => {
    const tabs: TabKey[] = ['A', 'B', 'C'];
    const currentIndex = tabs.indexOf(currentTab);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setCurrentTab(tabs[prevIndex]);
  };

  // Loading state
  if (loadingState === 'loading' && !data) {
    return (
      <div className="w-screen h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-xl">데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error' || (!data && error)) {
    return (
      <div className="w-screen h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">데이터 로딩 실패</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // No data state (shouldn't happen normally)
  if (!data) {
    return (
      <div className="w-screen h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">데이터가 없습니다.</div>
      </div>
    );
  }

  const tabData = data.tabs[currentTab];

  return (
    <div className="w-screen h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Branch Revenue Map</h1>
          <p className="text-xs text-gray-400">Area = Rooms (fixed), Color = Change %</p>
        </div>

        <nav className="flex-1 flex items-center justify-center gap-3" aria-label="탭 네비게이션">
          <button
            onClick={handlePrevTab}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Previous tab (Left Arrow)"
            aria-label="이전 탭으로 이동 (왼쪽 화살표)"
          >
            <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
          <div className="text-center" role="status" aria-live="polite">
            <div className="text-lg font-semibold text-white">{tabData.label}</div>
            <div className="text-xs text-gray-400">{tabData.description}</div>
          </div>
          <button
            onClick={handleNextTab}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Next tab (Right Arrow)"
            aria-label="다음 탭으로 이동 (오른쪽 화살표)"
          >
            <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
        </nav>

        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-400">Last Refresh</div>
            <div className="text-sm text-white font-mono">{lastRefresh}</div>
          </div>
          
          <button
            onClick={toggleMode}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={mode === 'tv' ? 'TV 모드 (T키로 전환)' : 'Ops 모드 (T키로 전환)'}
            aria-pressed={mode === 'ops'}
          >
            {mode === 'tv' ? (
              <>
                <Monitor className="w-4 h-4 text-blue-400" aria-hidden="true" />
                <span className="text-sm text-white">TV Mode</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 text-green-400" aria-hidden="true" />
                <span className="text-sm text-white">Ops Mode</span>
              </>
            )}
          </button>

          {mode === 'ops' && (
            <button
              onClick={loadData}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Refresh data (R)"
              aria-label="데이터 새로고침 (R키)"
            >
              <RefreshCw className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Main content - Single unified treemap */}
      <main
        ref={mainRef}
        className="flex-1 relative"
        style={{ overflow: 'visible' }}
      >
        <div className="w-full h-full p-4">
          <div className="w-full h-full border-2 border-gray-800 rounded-lg bg-gray-950" style={{ overflow: 'visible' }}>
            <UnifiedTreemap
              tiles={tabData.tiles}
              mode={mode}
              currentPeriod={tabData.current_period}
              basePeriod={tabData.base_period}
              width={treemapDimensions.width}
              height={treemapDimensions.height}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;