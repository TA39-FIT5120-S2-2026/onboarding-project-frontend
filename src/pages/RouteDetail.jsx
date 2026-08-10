import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Footprints, Info, MapPinOff } from 'lucide-react';
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
import { getRouteDetail } from '../api/routes.js';
import { BAND_COLORS } from '../utils/bandLabels.js';
import { formatDistance, formatDuration, formatTime } from '../utils/format.js';

const MAP_LEGEND_ITEMS = [
  { label: 'Low', lineStyle: { color: BAND_COLORS.LOW } },
  { label: 'Medium', lineStyle: { color: BAND_COLORS.MEDIUM, pattern: 'dashed' } },
  { label: 'High (busier than usual)', lineStyle: { color: BAND_COLORS.HIGH, pattern: 'dotted' } },
  { label: 'No sensor data', lineStyle: { color: BAND_COLORS.NO_DATA, pattern: 'dashed' } },
];

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, setLastSelectedRoute } = useSession();
  const route = session.routes.find((r) => r.id === id);
  const [detail, setDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!route) return;
    let cancelled = false;
    setDetail(null);
    setIsLoadingDetail(true);
    getRouteDetail(route.id)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [route]);

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

  const showNoQualifyingMessage = session.noRouteMeetsTolerance;
  const showToleranceWarning = !route.withinTolerance && !showNoQualifyingMessage;
  const alternative = showToleranceWarning
    ? session.routes.find((r) => r.id !== route.id && r.withinTolerance)
    : null;

  function handleSwitch(altRoute) {
    setLastSelectedRoute(altRoute);
    navigate(`/routes/${altRoute.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {backLink}
      <h1 className="text-display-sm text-ink">Route Detail</h1>
      {session.origin && session.destination && (
        <p className="mt-1 text-caption text-ink/60">
          {session.origin.name} → {session.destination.name}
        </p>
      )}

      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Stat
            icon={Footprints}
            value={formatDuration(route.walkingTimeMinutes)}
            label={formatDistance(route.distanceMetres)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SensoryIndicator band={route.band} countPerMinute={route.averageCountPerMinute} />
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

      {isLoadingDetail && <p className="mt-4 text-caption text-ink/60">Loading route map…</p>}

      {detail && (
        <>
          <div className="mt-4">
            <CrowdWarning segments={detail.segments} dataLastUpdated={detail.dataLastUpdated} />
          </div>

          <Section title="Route map">
            <p className="mb-3 flex items-start gap-2 text-caption text-ink/60">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              Busier sections are thicker and dotted, not just a different colour - also listed as
              text below.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,220px]">
              <RouteMap segments={detail.segments} />
              <MapLegend items={MAP_LEGEND_ITEMS} />
            </div>
          </Section>

          <Section title="Route sections">
            <Card>
              <ul className="space-y-3">
                {detail.segments.map((segment, index) => (
                  <li
                    key={`${segment.streetName}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/5 pt-3 first:border-t-0 first:pt-0"
                  >
                    <span className="font-medium text-ink">{segment.streetName}</span>
                    <SensoryIndicator
                      band={segment.band}
                      countPerMinute={segment.countPerMinute}
                      showCount={false}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-micro text-ink/50">
                {detail.attribution} · Last updated {formatTime(detail.dataLastUpdated)}
              </p>
            </Card>
          </Section>
        </>
      )}
    </div>
  );
}
