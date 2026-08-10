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
import { BAND_COLORS } from '../utils/bandLabels.js';
import { formatDistance, formatDuration } from '../utils/format.js';

const ATTRIBUTION = 'City of Melbourne, CC BY 4.0';

const MAP_LEGEND_ITEMS = [
  { label: 'Low', lineStyle: { color: BAND_COLORS.LOW } },
  { label: 'Medium', lineStyle: { color: BAND_COLORS.MEDIUM, pattern: 'dashed' } },
  { label: 'High (busier than usual)', lineStyle: { color: BAND_COLORS.HIGH, pattern: 'dotted' } },
  { label: 'No sensor data', lineStyle: { color: BAND_COLORS.NO_DATA, pattern: 'dashed' } },
];

export default function RouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { session, setSelectedRouteId } = useSession();
  const route = session.routes.find((r) => String(r.routeId) === routeId);

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

  const showNoQualifyingMessage = !session.hasAcceptableRoute;
  const showToleranceWarning = !route.withinTolerance && !showNoQualifyingMessage;
  const alternative = showToleranceWarning
    ? (session.routes.find((r) => r.routeId !== route.routeId && r.withinTolerance) ?? null)
    : null;

  const directionSteps = route.segments.flatMap((segment) => segment.steps ?? []);

  function handleSwitch(altRoute) {
    setSelectedRouteId(altRoute.routeId);
    navigate(`/routes/${altRoute.routeId}`);
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
        <CrowdWarning sections={route.congestedSections} latestReadingAt={route.exposure.latestReadingAt} />
      </div>

      <Section title="Route map">
        <p className="mb-3 flex items-start gap-2 text-caption text-ink/60">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          Busier sections are thicker and dotted, not just a different colour - also listed as text
          below.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,220px]">
          <RouteMap sections={route.routeSections} />
          <MapLegend items={MAP_LEGEND_ITEMS} />
        </div>
      </Section>

      <Section title="Crowd sections">
        <Card>
          <ul className="space-y-3">
            {route.routeSections.map((section) => (
              <li
                key={section.sectionId}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/5 pt-3 first:border-t-0 first:pt-0"
              >
                <span className="font-medium text-ink">
                  {section.sensors.length > 0
                    ? section.sensors.map((sensor) => sensor.name).join(', ')
                    : `Section ${section.sectionId}`}
                </span>
                <SensoryIndicator
                  band={section.sensoryBand}
                  countPerMinute={section.averagePedestrianCount}
                  showCount={false}
                />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-micro text-ink/50">{route.exposure.dataSource ?? ATTRIBUTION}</p>
        </Card>
      </Section>

      {directionSteps.length > 0 && (
        <Section title="Walking directions">
          <p className="mb-3 text-caption text-ink/60">
            Directions come from the routing service and are measured separately from the crowd
            sections above, so no crowd band is shown here.
          </p>
          <Card>
            <ol className="space-y-2">
              {directionSteps.map((step, index) => (
                <li key={index} className="text-caption text-ink">
                  {step.instruction}
                  {step.name && step.name !== '-' ? ` (${step.name})` : ''}
                </li>
              ))}
            </ol>
          </Card>
        </Section>
      )}
    </div>
  );
}
