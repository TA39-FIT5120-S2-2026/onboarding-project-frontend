import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext.jsx';
import AccessPointCard from '../components/AccessPointCard.jsx';
import RouteComparisonList from '../components/RouteComparisonList.jsx';
import BandLegend from '../components/BandLegend.jsx';
import CheckInModal from '../components/CheckInModal.jsx';
import { getRoutes } from '../api/routes.js';

export default function RouteResults() {
  const navigate = useNavigate();
  const { session, setTolerance, setRouteSearchResult, setLastSelectedRoute, setCheckInSeen } =
    useSession();
  const { routes, accessPoints } = session;
  const [pendingRoute, setPendingRoute] = useState(null);
  const [isReevaluating, setIsReevaluating] = useState(false);

  function goToRouteDetail(route) {
    setLastSelectedRoute(route);
    navigate(`/routes/${route.id}`);
  }

  function handleSelectRoute(route) {
    if (session.checkInSeen) {
      goToRouteDetail(route);
      return;
    }
    setPendingRoute(route);
  }

  async function handleCheckInSelect(tolerance) {
    setIsReevaluating(true);
    try {
      const result = await getRoutes({
        origin: session.origin,
        destination: session.destination,
        tolerance,
      });
      setTolerance(tolerance);
      setRouteSearchResult({
        routes: result.routes,
        accessPoints: result.accessPoints,
        toleranceApplied: result.toleranceApplied,
        noRouteMeetsTolerance: result.noRouteMeetsTolerance,
      });
    } catch {
      setTolerance(tolerance);
    } finally {
      setIsReevaluating(false);
      setCheckInSeen(true);
      const route = pendingRoute;
      setPendingRoute(null);
      if (route) goToRouteDetail(route);
    }
  }

  function handleCheckInSkip() {
    setCheckInSeen(true);
    const route = pendingRoute;
    setPendingRoute(null);
    if (route) goToRouteDetail(route);
  }

  if (!routes.length) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Route Results</h1>
        <p className="mt-3 text-ink/70">
          No route planned yet.{' '}
          <Link to="/" className="font-medium text-accent underline">
            Go to Route Planner
          </Link>{' '}
          to enter an origin and destination.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md md:max-w-4xl">
      <h1 className="text-2xl font-semibold">Route Results</h1>

      {accessPoints && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <AccessPointCard label="Nearest stop at origin" accessPoint={accessPoints.origin} />
          <AccessPointCard
            label="Nearest stop at destination"
            accessPoint={accessPoints.destination}
          />
        </div>
      )}

      <div className="mt-4">
        <RouteComparisonList routes={routes} onSelectRoute={handleSelectRoute} />
      </div>

      <div className="mt-4">
        <BandLegend />
      </div>

      <CheckInModal
        isOpen={pendingRoute != null}
        isBusy={isReevaluating}
        onSelect={handleCheckInSelect}
        onSkip={handleCheckInSkip}
      />
    </div>
  );
}
