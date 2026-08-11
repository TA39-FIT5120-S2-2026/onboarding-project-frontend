import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { buildTripQuery, parseTripQuery } from '../utils/tripQuery.js';

export default function RouteResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, setTolerance, setPlan, setSelectedRouteId } = useSession();
  const { routes } = session;
  const [pendingRoute, setPendingRoute] = useState(null);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [reevaluateError, setReevaluateError] = useState(null);
  const [isReplanning, setIsReplanning] = useState(false);

  // Session state is in-memory only (no localStorage/sessionStorage - see
  // CLAUDE.md), so a refresh clears it. If the trip is still encoded in the
  // URL, re-plan it rather than showing an empty state - the URL isn't
  // persisted storage, it just doesn't survive closing the tab either.
  useEffect(() => {
    if (routes.length > 0) return;
    const trip = parseTripQuery(searchParams);
    if (!trip) return;

    let cancelled = false;
    setIsReplanning(true);
    planRoute({
      origin: trip.origin,
      destination: trip.destination,
      crowdTolerance: trip.tolerance ?? session.tolerance,
    })
      .then((result) => {
        if (cancelled) return;
        if (trip.tolerance) setTolerance(trip.tolerance);
        setPlan(result, { origin: trip.origin, destination: trip.destination });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsReplanning(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes.length, searchParams]);

  function goToRouteDetail(route) {
    setSelectedRouteId(route.routeId);
    navigate(`/routes/${route.routeId}${buildTripQuery(session)}`);
  }

  function handleSelectRoute(route) {
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
      navigate(`/routes${buildTripQuery({ ...session, tolerance })}`, {
        replace: true,
      });
    } catch (error) {
      setTolerance(tolerance);
      setReevaluateError(userMessageFor(error));
    } finally {
      setIsReevaluating(false);
      const route = pendingRoute;
      setPendingRoute(null);
      if (route) goToRouteDetail(route);
    }
  }

  function handleCheckInSkip() {
    const route = pendingRoute;
    setPendingRoute(null);
    if (route) goToRouteDetail(route);
  }

  if (!routes.length) {
    if (isReplanning) {
      return (
        <div className="mx-auto max-w-md">
          <PageHeader title="Route Results" />
          <Card className="animate-pulse text-center">
            <p className="text-caption text-ink/60">Getting your trip back…</p>
          </Card>
        </div>
      );
    }

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
