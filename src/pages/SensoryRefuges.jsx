import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import PlaceCombobox from '../components/PlaceCombobox.jsx';
import RefugeMap from '../components/RefugeMap.jsx';
import MapLegend from '../components/MapLegend.jsx';
import RefugeIcon from '../components/RefugeIcon.jsx';
import RefugeDetail from '../components/RefugeDetail.jsx';
import RefugeFilter from '../components/RefugeFilter.jsx';
import LocationPinIcon from '../components/LocationPinIcon.jsx';
import { getRefuges } from '../api/refuges.js';
import { findPlaceByName } from '../data/cbdPlaces.js';
import { formatDistance } from '../utils/format.js';
import { refugeCategoryLabel } from '../utils/refugeCategories.js';

const LEGEND_ITEMS = [
  { label: 'Search location', icon: <LocationPinIcon /> },
  { label: 'Park', icon: <RefugeIcon category="park" /> },
  { label: 'Library', icon: <RefugeIcon category="library" /> },
  { label: 'Quiet space', icon: <RefugeIcon category="quiet_space" /> },
];

export default function SensoryRefuges() {
  const { session } = useSession();
  const [location, setLocation] = useState(
    session.destination
      ? {
          lat: session.destination.lat,
          lng: session.destination.lng,
          name: session.destination.name,
        }
      : null,
  );
  const [locationInput, setLocationInput] = useState('');
  const [locationError, setLocationError] = useState(null);
  const [refuges, setRefuges] = useState([]);
  const [searchRadiusMetres, setSearchRadiusMetres] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRefugeId, setSelectedRefugeId] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setIsLoading(true);
    getRefuges({ lat: location.lat, lng: location.lng, types: selectedTypes }).then((result) => {
      if (cancelled) return;
      setRefuges(result.refuges);
      setSearchRadiusMetres(result.searchRadiusMetres);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [location, selectedTypes]);

  function handleSelectRefuge(refuge) {
    setSelectedRefugeId((current) => (current === refuge.id ? null : refuge.id));
  }

  function handleLocationSubmit(event) {
    event.preventDefault();
    const place = findPlaceByName(locationInput);
    if (!place) {
      setLocationError('Enter a location from the suggestions, like Flinders Street Station.');
      return;
    }
    setLocationError(null);
    setLocation(place);
  }

  if (!location) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold">Sensory Refuges</h1>
        <p className="mt-2 text-ink/70">
          Choose a location to find nearby parks, libraries and quiet spaces.
        </p>
        <form onSubmit={handleLocationSubmit} className="mt-4 space-y-3" noValidate>
          <PlaceCombobox
            id="refuge-location"
            label="Location"
            value={locationInput}
            onChange={setLocationInput}
            error={locationError}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white hover:bg-accent-dark"
          >
            Find Refuges
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md md:max-w-3xl">
      <h1 className="text-2xl font-semibold">Sensory Refuges</h1>
      <p className="mt-1 text-sm text-ink/60">
        Near {location.name}
        {searchRadiusMetres != null ? ` · within ${searchRadiusMetres} m` : ''}
      </p>

      <div className="mt-4">
        <RefugeFilter selected={selectedTypes} onChange={setSelectedTypes} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-ink/60">Finding nearby refuges…</p>}

      {!isLoading && refuges.length === 0 && (
        <p className="mt-4 text-ink/70">No refuges of the selected types were found nearby.</p>
      )}

      {!isLoading && refuges.length > 0 && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr,220px]">
            <RefugeMap location={location} refuges={refuges} onSelectRefuge={handleSelectRefuge} />
            <MapLegend items={LEGEND_ITEMS} />
          </div>

          <ul className="mt-4 space-y-2">
            {refuges.map((refuge) => {
              const isOpen = selectedRefugeId === refuge.id;
              return (
                <li key={refuge.id} className="rounded-lg border border-ink/10 bg-white p-3">
                  <button
                    type="button"
                    onClick={() => handleSelectRefuge(refuge)}
                    aria-expanded={isOpen}
                    aria-controls={`refuge-detail-${refuge.id}`}
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <RefugeIcon category={refuge.category} className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-ink">{refuge.name}</span>
                  </button>
                  <p className="mt-1 text-sm text-ink/70">
                    {refugeCategoryLabel(refuge.category)} ·{' '}
                    {formatDistance(refuge.walkingDistanceMetres)} away
                  </p>
                  {isOpen && (
                    <div id={`refuge-detail-${refuge.id}`}>
                      <RefugeDetail refuge={refuge} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
