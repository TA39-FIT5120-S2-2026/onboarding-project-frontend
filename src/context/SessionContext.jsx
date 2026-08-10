import { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_TOLERANCE } from '../utils/tolerance.js';

const SessionContext = createContext(null);

const INITIAL_STATE = {
  tolerance: DEFAULT_TOLERANCE,
  lastSelectedRoute: null,
  routes: [],
  accessPoints: null,
  toleranceApplied: DEFAULT_TOLERANCE,
  noRouteMeetsTolerance: false,
  origin: null,
  destination: null,
  checkInSeen: false,
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState(INITIAL_STATE);

  const value = useMemo(
    () => ({
      session,
      setTolerance: (tolerance) => setSession((prev) => ({ ...prev, tolerance })),
      setRouteSearchResult: ({
        routes,
        accessPoints,
        toleranceApplied,
        noRouteMeetsTolerance,
        origin,
        destination,
      }) =>
        setSession((prev) => ({
          ...prev,
          routes,
          accessPoints,
          toleranceApplied,
          noRouteMeetsTolerance,
          origin: origin ?? prev.origin,
          destination: destination ?? prev.destination,
        })),
      setLastSelectedRoute: (route) =>
        setSession((prev) => ({ ...prev, lastSelectedRoute: route })),
      setCheckInSeen: (seen) => setSession((prev) => ({ ...prev, checkInSeen: seen })),
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
