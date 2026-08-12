import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Footprints, Info, MapPinOff } from 'lucide-react';
import { useRouteExposureRefresh } from '../hooks/useRouteExposureRefresh.jsx';
import { useSession } from '../context/SessionContext.jsx';
import SensoryIndicator from '../components/SensoryIndicator.jsx';
import ToleranceWarning from '../components/ToleranceWarning.jsx';
import NoQualifyingRouteMessage from '../components/NoQualifyingRouteMessage.jsx';
import CrowdWarning from '../components/CrowdWarning.jsx';
import RouteMap from '../components/RouteMap.jsx';
import MapLegend from '../components/MapLegend.jsx';
import Card from '../components/ui/Card.jsx';
import Stat from '../components/ui/Stat.jsx';
import Section from '../components/ui/Section.jsx';
import Button from '../components/ui/Button.jsx';
import Callout from '../components/ui/Callout.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { BAND_COLORS } from '../utils/bandLabels.js';
import { formatDistance, formatDuration } from '../utils/format.js';
import { mergeSections } from '../utils/routeSections.js';
import { planRoute } from '../api/routes.js';
import { buildTripQuery, parseTripQuery } from '../utils/tripQuery.js';

const FALLBACK_SOURCE = 'City of Melbourne Open Data';
const NAMED_SENSORS_SHOWN = 2;

const MAP_LEGEND_ITEMS = [
  { label: 'Low', lineStyle: { color: BAND_COLORS.LOW } },
  { label: 'Medium', lineStyle: { color: BAND_COLORS.MEDIUM, pattern: 'dashed' } },
  { label: 'High (busier than usual)', lineStyle: { color: BAND_COLORS.HIGH, pattern: 'dotted' } },
  { label: 'No sensor data', lineStyle: { color: BAND_COLORS.NO_DATA, pattern: 'dashed' } },
  {
    label: 'Start',
    icon: (
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-accent shadow"
      />
    ),
  },
  {
    label: 'Destination',
    icon: (
      <span
        aria-hidden="true"
        className="inline-block h-3.5 w-3.5 flex-shrink-0 rounded-sm rounded-bl-none bg-ink"
        style={{ transform: 'rotate(45deg)' }}
      />
    ),
  },
];

function stretchLabel(stretch) {
  if (stretch.sensors.length === 0) {
    return 'No sensor on this stretch, so the crowd level here is unknown.';
  }
  const shown = stretch.sensors.slice(0, NAMED_SENSORS_SHOWN);
  const remaining = stretch.sensors.length - shown.length;
  return { shown, remaining };
}

export default function RouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, setPlan, setTolerance, setSelectedRouteId } = useSession();
  const route = session.routes.find((r) => String(r.routeId) === routeId);
  const [showDirections, setShowDirections] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [wasReplanned, setWasReplanned] = useState(false);

  useRouteExposureRefresh();

  // Session state is in-memory only (no localStorage/sessionStorage - see
  // CLAUDE.md), so a refresh clears it. If the trip is still encoded in the
  // URL, re-plan it. routeId isn't guaranteed stable across /plan calls
  // (it's just a 1-based index into that response), so if the exact id
  // doesn't come back, fall back to the recommended route and say so rather
  // than silently showing a different route under the same URL.
  useEffect(() => {
    if (route) return;
    if (session.routes.length > 0) return; // had a session, this id just doesn't exist
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

        const stillExists = result.routes.some((r) => String(r.routeId) === routeId);
        if (!stillExists) {
          const recommended = result.routes.find((r) => r.recommended) ?? result.routes[0];
          setWasReplanned(true);
          setSelectedRouteId(recommended.routeId);
          navigate(`/routes/${recommended.routeId}${buildTripQuery(trip)}`, { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsReplanning(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, session.routes.length, searchParams]);

  const backLink = (
    <Link
      to="/routes"
      className="mb-2 inline-flex items-center gap-1.5 text-caption font-medium text-ink/60 hover:text-accent"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to results
    </Link>
  );

  if (!route) {
    if (isReplanning) {
      return (
        <div className="mx-auto max-w-md">
          {backLink}
          <h1 className="text-display-sm text-ink">Route Detail</h1>
          <Card className="mt-4 animate-pulse text-center">
            <p className="text-caption text-ink/60">Getting your trip back</p>
          </Card>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-md">
        {backLink}
        <h1 className="text-display-sm text-ink">Route Detail</h1>
        <Card className="mt-4 text-center">
          <MapPinOff className="mx-auto h-8 w-8 text-ink/30" aria-hidden="true" />
          <p className="mt-3 text-caption text-ink/70">We couldn&apos;t find that route.</p>
          <Button to="/" variant="primary" className="mt-4">
            Plan a new route
          </Button>
        </Card>
      </div>
    );
  }

  const showNoQualifyingMessage = !session.hasAcceptableRoute;
  const showToleranceWarning = !route.withinTolerance && !showNoQualifyingMessage;
  const alternative = showToleranceWarning
    ? (session.routes.find((r) => r.routeId !== route.routeId && r.withinTolerance) ?? null)
    : null;

  const directionSteps = route.segments.flatMap((segment) => segment.steps ?? []);
  const stretches = mergeSections(route.routeSections);

  function handleSwitch(altRoute) {
    setSelectedRouteId(altRoute.routeId);
    navigate(`/routes/${altRoute.routeId}${buildTripQuery(session)}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back={backLink}
        title="Route Detail"
        eyebrow={
          session.origin && session.destination
            ? `${session.origin.name} → ${session.destination.name}`
            : undefined
        }
      />

      {wasReplanned && (
        <div className="mb-4">
          <Callout tone="info" role="status">
            We replanned this trip after your session refreshed. This may not be exactly the route
            you had before.
          </Callout>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Stat
            icon={Footprints}
            value={formatDuration(route.duration.minutes)}
            label={formatDistance(route.distance.meters)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SensoryIndicator
              band={route.exposure.sensoryBand}
              countPerMinute={route.exposure.averagePedestrianCount}
            />
            {showNoQualifyingMessage && (
              <span className="inline-flex items-center rounded-full bg-band-highBg px-2.5 py-1 text-micro font-semibold text-band-high">
                Does not meet your tolerance
              </span>
            )}
          </div>
        </div>
      </Card>

      {showNoQualifyingMessage && (
        <div className="mt-4">
          <NoQualifyingRouteMessage tolerance={session.tolerance} />
        </div>
      )}

      {showToleranceWarning && (
        <div className="mt-4">
          <ToleranceWarning
            route={route}
            tolerance={session.tolerance}
            alternative={alternative}
            onSwitch={handleSwitch}
          />
        </div>
      )}

      <div className="mt-4">
        <CrowdWarning
          sections={route.congestedSections}
          latestReadingAt={route.exposure.latestReadingAt}
        />
      </div>

      <Section title="Route map">
        <p className="mb-3 flex items-start gap-2 text-caption text-ink/60">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          Busier sections are thicker and dotted, not just a different colour - also listed as text
          below.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,minmax(220px,auto)]">
          <RouteMap
            sections={route.routeSections}
            origin={session.origin}
            destination={session.destination}
          />
          <MapLegend items={MAP_LEGEND_ITEMS} />
        </div>
      </Section>

      <Section title="Crowd sections">
        <Card>
          <ul className="space-y-3">
            {stretches.map((stretch, index) => {
              const label = stretchLabel(stretch);
              return (
                <li
                  key={stretch.key}
                  className="flex flex-wrap items-start justify-between gap-2 border-t border-ink/5 pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-micro font-semibold uppercase tracking-wide text-ink/50">
                      Stretch {index + 1} of {stretches.length} ·{' '}
                      {formatDistance(stretch.distanceMeters)}
                    </p>
                    {typeof label === 'string' ? (
                      <p className="mt-0.5 break-words text-caption text-ink/70">{label}</p>
                    ) : (
                      <ul className="mt-0.5">
                        {label.shown.map((sensor) => (
                          <li key={sensor.locationId} className="break-words font-medium text-ink">
                            {sensor.name}
                          </li>
                        ))}
                        {label.remaining > 0 && (
                          <li className="text-caption text-ink/60">+{label.remaining} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <SensoryIndicator
                    band={stretch.sensoryBand}
                    countPerMinute={null}
                    showCount={false}
                  />
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-micro text-ink/50">
            {route.exposure.dataSource ?? FALLBACK_SOURCE}, CC BY 4.0
          </p>
        </Card>
      </Section>

      {directionSteps.length > 0 && (
        <Section title="Walking directions">
          <p className="mb-3 text-caption text-ink/60">
            Directions come from the routing service and are measured separately from the crowd
            sections above, so no crowd band is shown here.
          </p>
          <div>
            <button
              type="button"
              onClick={() => setShowDirections((prev) => !prev)}
              aria-expanded={showDirections}
              aria-controls="walking-directions-panel"
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink/15 bg-white px-3.5 py-3 text-left text-caption font-medium text-ink"
            >
              {showDirections
                ? 'Hide walking directions'
                : `Show ${directionSteps.length} walking steps`}
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 transition-transform ${showDirections ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {showDirections && (
              <Card as="div" id="walking-directions-panel" padding="sm" className="mt-2">
                <ol className="space-y-2">
                  {directionSteps.map((step, index) => (
                    <li key={index} className="text-caption text-ink">
                      {step.instruction}
                      {step.name && step.name !== '-' ? ` (${step.name})` : ''} ·{' '}
                      <span className="text-ink/60">{formatDistance(step.distance)}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
