import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import RefugeMarker from './RefugeMarker.jsx';

function createLocationDivIcon() {
  return L.divIcon({
    className: 'search-location-icon',
    html: '<span style="display:block;width:20px;height:20px;transform:rotate(45deg);background:#3F5A3D;border-radius:4px 4px 4px 0;box-shadow:0 1px 3px rgba(0,0,0,.35)"></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  });
}

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [32, 32], animate: false, maxZoom: 16 });
    }
  }, [map, points]);

  return null;
}

export default function RefugeMap({ location, refuges, onSelectRefuge }) {
  const points = useMemo(
    () => [[location.lat, location.lng], ...refuges.map((refuge) => [refuge.lat, refuge.lng])],
    [location, refuges],
  );

  return (
    <div className="h-72 overflow-hidden rounded-xl border border-ink/10 md:h-96">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <Marker
          position={[location.lat, location.lng]}
          icon={createLocationDivIcon()}
          eventHandlers={{
            add: (event) => {
              const element = event.target.getElement?.();
              element?.setAttribute('aria-label', `Search location: ${location.name}`);
            },
          }}
        />
        {refuges.map((refuge) => (
          <RefugeMarker key={refuge.id} refuge={refuge} onSelect={onSelectRefuge} />
        ))}
      </MapContainer>
    </div>
  );
}
