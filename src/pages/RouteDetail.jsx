import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext.jsx';
import SensoryIndicator from '../components/SensoryIndicator.jsx';
import ToleranceWarning from '../components/ToleranceWarning.jsx';
import NoQualifyingRouteMessage from '../components/NoQualifyingRouteMessage.jsx';
import CrowdWarning from '../components/CrowdWarning.jsx';
import RouteMap from '../components/RouteMap.jsx';
import MapLegend from '../components/MapLegend.jsx';
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

  if (!route) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Route Detail</h1>
        <p className="mt-3 text-ink/70">
          We couldn&apos;t find that route.{' '}
          <Link to="/" className="font-medium text-accent underline">
            Plan a new route
          </Link>
          .
        </p>
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
    <div className="mx-auto max-w-md md:max-w-3xl">
      <h1 className="text-2xl font-semibold">Route Detail</h1>

      <div className="mt-4 rounded-xl border border-ink/10 bg-white p-4">
        <p className="text-lg font-semibold text-ink">
          {formatDuration(route.walkingTimeMinutes)} · {formatDistance(route.distanceMetres)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <SensoryIndicator band={route.band} countPerMinute={route.averageCountPerMinute} />
          {showNoQualifyingMessage && (
            <span className="inline-flex items-center rounded-full bg-band-highBg px-2.5 py-1 text-xs font-semibold text-band-high">
              Does not meet your tolerance
            </span>
          )}
        </div>
      </div>

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

      {isLoadingDetail && <p className="mt-4 text-sm text-ink/60">Loading route map…</p>}

      {detail && (
        <>
          <div className="mt-4">
            <CrowdWarning segments={detail.segments} dataLastUpdated={detail.dataLastUpdated} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr,220px]">
            <RouteMap segments={detail.segments} />
            <MapLegend items={MAP_LEGEND_ITEMS} />
          </div>

          <div className="mt-4 rounded-lg border border-ink/10 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/60">
              Route sections
            </p>
            <ul className="mt-2 space-y-3">
              {detail.segments.map((segment, index) => (
                <li
                  key={`${segment.streetName}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/5 pt-2 first:border-t-0 first:pt-0"
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
            <p className="mt-3 text-xs text-ink/50">
              {detail.attribution} · Last updated {formatTime(detail.dataLastUpdated)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
