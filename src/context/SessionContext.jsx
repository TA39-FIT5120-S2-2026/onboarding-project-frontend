import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_TOLERANCE } from '../utils/tolerance.js';

const SessionContext = createContext(null);

const INITIAL_STATE = {
  tolerance: DEFAULT_TOLERANCE,
  selectedRouteId: null,
  routes: [],
  decision: null,
  alternativeComparison: null,
  hasAcceptableRoute: true,
  origin: null,
  destination: null,
  checkInSeen: false,
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState(INITIAL_STATE);

  const setTolerance = useCallback(
    (tolerance) => setSession((prev) => ({ ...prev, tolerance })),
    [],
  );
  const setPlan = useCallback((planData, { origin, destination } = {}) => {
    setSession((prev) => ({
      ...prev,
      routes: planData.routes,
      decision: planData.decision,
      alternativeComparison: planData.alternativeComparison ?? null,
      hasAcceptableRoute: planData.hasAcceptableRoute,
      origin: origin ?? prev.origin,
      destination: destination ?? prev.destination,
    }));
  }, []);
  const setSelectedRouteId = useCallback(
    (routeId) => setSession((prev) => ({ ...prev, selectedRouteId: routeId })),
    [],
  );
  const setCheckInSeen = useCallback(
    (seen) => setSession((prev) => ({ ...prev, checkInSeen: seen })),
    [],
  );
  const resetSession = useCallback(() => setSession(INITIAL_STATE), []);

  const value = useMemo(
    () => ({
      session,
      setTolerance,
      setPlan,
      setSelectedRouteId,
      setCheckInSeen,
      resetSession,
    }),
    [session, setTolerance, setPlan, setSelectedRouteId, setCheckInSeen, resetSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
