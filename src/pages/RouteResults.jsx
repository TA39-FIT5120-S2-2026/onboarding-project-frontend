import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import AccessPointCard from '../components/AccessPointCard.jsx';
import RouteComparisonList from '../components/RouteComparisonList.jsx';
import BandLegend from '../components/BandLegend.jsx';
import CheckInModal from '../components/CheckInModal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
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
      <div className="mx-auto max-w-md">
        <PageHeader title="Route Results" />
        <Card className="text-center">
          <MapPinOff className="mx-auto h-8 w-8 text-ink/30" aria-hidden="true" />
          <p className="mt-3 text-caption text-ink/70">
            No route planned yet. Enter an origin and destination to see your options.
          </p>
          <Button to="/" variant="primary" className="mt-4">
            Go to Route Planner
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Route Results"
        description="Compare your options - the calmest route is highlighted first."
      />

      {accessPoints && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <AccessPointCard label="Nearest stop at origin" accessPoint={accessPoints.origin} />
          <AccessPointCard
            label="Nearest stop at destination"
            accessPoint={accessPoints.destination}
          />
        </div>
      )}

      <div className="mt-5">
        <RouteComparisonList routes={routes} onSelectRoute={handleSelectRoute} />
      </div>

      <div className="mt-5">
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
