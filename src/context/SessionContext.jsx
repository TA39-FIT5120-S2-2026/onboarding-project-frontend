import { createContext, useContext, useMemo, useState } from 'react';
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
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState(INITIAL_STATE);

  const value = useMemo(
    () => ({
      session,
      setTolerance: (tolerance) => setSession((prev) => ({ ...prev, tolerance })),
      setPlan: (planData, { origin, destination } = {}) =>
        setSession((prev) => ({
          ...prev,
          routes: planData.routes,
          decision: planData.decision,
          alternativeComparison: planData.alternativeComparison ?? null,
          hasAcceptableRoute: planData.hasAcceptableRoute,
          origin: origin ?? prev.origin,
          destination: destination ?? prev.destination,
        })),
      setSelectedRouteId: (routeId) => setSession((prev) => ({ ...prev, selectedRouteId: routeId })),
      resetSession: () => setSession(INITIAL_STATE),
    }),
    [session],
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
