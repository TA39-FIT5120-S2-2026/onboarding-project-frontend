import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import RouteComparisonList from '../components/RouteComparisonList.jsx';
import BandLegend from '../components/BandLegend.jsx';
import CheckInModal from '../components/CheckInModal.jsx';
import Callout from '../components/ui/Callout.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { planRoute } from '../api/routes.js';
import { userMessageFor } from '../api/errors.js';

export default function RouteResults() {
  const navigate = useNavigate();
  const { session, setTolerance, setPlan, setSelectedRouteId, setCheckInSeen } = useSession();
  const { routes } = session;
  const [pendingRoute, setPendingRoute] = useState(null);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [reevaluateError, setReevaluateError] = useState(null);

  function goToRouteDetail(route) {
    setSelectedRouteId(route.routeId);
    navigate(`/routes/${route.routeId}`);
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
    setReevaluateError(null);
    try {
      const result = await planRoute({
        origin: session.origin,
        destination: session.destination,
        crowdTolerance: tolerance,
      });
      setTolerance(tolerance);
      setPlan(result);
    } catch (error) {
      setTolerance(tolerance);
      setReevaluateError(userMessageFor(error));
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
        description="Compare your options, ranked by crowd level and busiest reading - the top result is highlighted first."
      />

      {reevaluateError && (
        <div className="mt-4">
          <Callout tone="alert" role="alert">
            {reevaluateError}
          </Callout>
        </div>
      )}

      <div className="mt-5">
        <RouteComparisonList routes={routes} decision={session.decision} onSelectRoute={handleSelectRoute} />
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
