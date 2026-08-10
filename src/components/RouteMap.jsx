import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { BAND_COLORS } from '../utils/bandLabels.js';

// Line pattern, not just colour, marks a band on the map - a screenshot in
// greyscale still has to tell HIGH apart from the rest.
const BAND_LINE_STYLE = {
  LOW: { color: BAND_COLORS.LOW, weight: 4 },
  MEDIUM: { color: BAND_COLORS.MEDIUM, weight: 4, dashArray: '10 6' },
  HIGH: { color: BAND_COLORS.HIGH, weight: 6, dashArray: '2 8' },
  NO_DATA: { color: BAND_COLORS.NO_DATA, weight: 3, dashArray: '1 6' },
};

function toLatLngs(geometry) {
  return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

function FitBounds({ sections }) {
  const map = useMap();

  useEffect(() => {
    const allPoints = sections.flatMap((section) => toLatLngs(section.geometry));
    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [24, 24], animate: false });
    }
  }, [map, sections]);

  return null;
}

export default function RouteMap({ sections }) {
  const center = useMemo(() => {
    const points = sections.flatMap((section) => toLatLngs(section.geometry));
    return points[Math.floor(points.length / 2)] ?? [-37.8136, 144.9631];
  }, [sections]);

  return (
    <div className="h-72 overflow-hidden rounded-xl border border-ink/10 md:h-96">
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds sections={sections} />
        {sections.map((section) => (
          <Polyline
            key={section.sectionId}
            positions={toLatLngs(section.geometry)}
            pathOptions={BAND_LINE_STYLE[section.sensoryBand] ?? BAND_LINE_STYLE.NO_DATA}
          />
        ))}
      </MapContainer>
    </div>
  );
}
