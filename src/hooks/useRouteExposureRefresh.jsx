import { useEffect, useCallback, useRef } from 'react';
import { refreshRouteExposures } from '../api/routes.js';
import { useSession } from '../context/SessionContext.jsx';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

export function useRouteExposureRefresh() {
  const { session, setPlan } = useSession();
  const intervalRef = useRef(null);

  const refreshRoutes = useCallback(async () => {
    if (!session.routes.length) {
      return;
    }

    try {
      const result = await refreshRouteExposures({
        routes: session.routes,
        crowdTolerance: session.tolerance,
      });

      setPlan(result, {
        origin: session.origin,
        destination: session.destination,
      });
    } catch (error) {
      console.warn('Route exposure refresh failed.', error);
    }
  }, [session.routes, session.tolerance, session.origin, session.destination, setPlan]);

  useEffect(() => {
    if (!session.routes.length) {
      return undefined;
    }

    const handleFocus = () => {
      refreshRoutes();
    };

    window.addEventListener('focus', handleFocus);
    intervalRef.current = window.setInterval(refreshRoutes, REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalRef.current);
    };
  }, [refreshRoutes, session.routes.length]);
}
