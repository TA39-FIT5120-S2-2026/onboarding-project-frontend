import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, useMap } from 'react-leaflet';
import BaseTileLayer from './map/BaseTileLayer.jsx';
import { BAND_COLORS } from '../utils/bandLabels.js';
import { ACCENT, INK } from '../theme/colors.js';

// Line pattern, not just colour, marks a band on the map - a screenshot in
// greyscale still has to tell HIGH apart from the rest. NO_DATA's grey is
// the one colour at risk of blending into the pale Positron basemap, so it
// gets the same weight as LOW/MEDIUM rather than a thinner line.
const BAND_LINE_STYLE = {
  LOW: { color: BAND_COLORS.LOW, weight: 4 },
  MEDIUM: { color: BAND_COLORS.MEDIUM, weight: 4, dashArray: '10 6' },
  HIGH: { color: BAND_COLORS.HIGH, weight: 6, dashArray: '2 8' },
  NO_DATA: { color: BAND_COLORS.NO_DATA, weight: 4, dashArray: '2 10' },
};

function toLatLngs(geometry) {
  return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

// Origin is a filled circle, destination a pin/flag shape - distinct by
// shape as well as colour, same rule as the band icons.
function startDivIcon() {
  return L.divIcon({
    className: 'route-start-icon',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${ACCENT};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function endDivIcon() {
  return L.divIcon({
    className: 'route-end-icon',
    html: `<span style="display:block;width:20px;height:20px;transform:rotate(45deg);background:${INK};border-radius:4px 4px 4px 0;box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  });
}

function FitBounds({ sections, origin, destination }) {
  const map = useMap();

  useEffect(() => {
    const allPoints = sections.flatMap((section) => toLatLngs(section.geometry));
    if (origin) allPoints.push([origin.lat, origin.lng]);
    if (destination) allPoints.push([destination.lat, destination.lng]);
    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [24, 24], animate: false });
    }
  }, [map, sections, origin, destination]);

  return null;
}

export default function RouteMap({ sections, origin, destination }) {
  const center = useMemo(() => {
    const points = sections.flatMap((section) => toLatLngs(section.geometry));
    return points[Math.floor(points.length / 2)] ?? [-37.8136, 144.9631];
  }, [sections]);

  return (
    <div className="h-72 overflow-hidden rounded-xl border border-ink/10 md:h-96">
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <BaseTileLayer />
        <FitBounds sections={sections} origin={origin} destination={destination} />
        {sections.map((section) => (
          <Polyline
            key={section.sectionId}
            positions={toLatLngs(section.geometry)}
            pathOptions={BAND_LINE_STYLE[section.sensoryBand] ?? BAND_LINE_STYLE.NO_DATA}
          />
        ))}
        {origin && (
          <Marker
            position={[origin.lat, origin.lng]}
            icon={startDivIcon()}
            eventHandlers={{
              add: (event) => {
                event.target.getElement?.()?.setAttribute('aria-label', `Start: ${origin.name}`);
              },
            }}
          />
        )}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={endDivIcon()}
            eventHandlers={{
              add: (event) => {
                event.target
                  .getElement?.()
                  ?.setAttribute('aria-label', `Destination: ${destination.name}`);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
