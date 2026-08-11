import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useEffect } from 'react';
import { SessionProvider, useSession } from '../../context/SessionContext.jsx';
import { useRouteExposureRefresh } from '../useRouteExposureRefresh.jsx';

vi.mock('../../api/routes.js', () => ({
  refreshRouteExposures: vi.fn(),
}));

const { refreshRouteExposures } = await import('../../api/routes.js');

const exampleRoute = {
  routeId: 1,
  geometry: {
    type: 'LineString',
    coordinates: [
      [144.9631, -37.8136],
      [144.9650, -37.8140],
    ],
  },
  distance: { meters: 300, kilometres: 0.3 },
  duration: { seconds: 360, minutes: 6 },
  segments: [],
};

function TestHarness() {
  const { session, setPlan } = useSession();

  useEffect(() => {
    setPlan(
      {
        routes: [exampleRoute],
        decision: { message: 'Test decision' },
        alternativeComparison: null,
        hasAcceptableRoute: true,
      },
      {
        origin: { name: 'Origin', lat: -37.8136, lng: 144.9631 },
        destination: { name: 'Destination', lat: -37.8140, lng: 144.9650 },
      },
    );
  }, [setPlan]);

  useRouteExposureRefresh();

  return <div>{session.routes.length}</div>;
}

describe('useRouteExposureRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    refreshRouteExposures.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('polls route exposure every 15 minutes and refreshes on window focus', async () => {
    refreshRouteExposures.mockResolvedValue({
      routeCount: 1,
      recommendedRouteId: 1,
      crowdTolerance: 'MEDIUM',
      acceptableRouteCount: 1,
      hasAcceptableRoute: true,
      fallbackRouteId: null,
      decision: { message: 'Test decision' },
      alternativeComparison: null,
      routes: [exampleRoute],
    });

    render(
      <SessionProvider>
        <TestHarness />
      </SessionProvider>,
    );

    expect(refreshRouteExposures).not.toHaveBeenCalled();

    await vi.runOnlyPendingTimersAsync();
    expect(refreshRouteExposures).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('focus'));
    await vi.runOnlyPendingTimersAsync();
    expect(refreshRouteExposures).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(15 * 60 * 1000);
    await vi.runOnlyPendingTimersAsync();
    expect(refreshRouteExposures).toHaveBeenCalledTimes(3);
  });

  it('cleans up its interval and focus listener on unmount', () => {
    const clearSpy = vi.spyOn(window, 'clearInterval');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <SessionProvider>
        <TestHarness />
      </SessionProvider>,
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(clearSpy).toHaveBeenCalled();

    clearSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
