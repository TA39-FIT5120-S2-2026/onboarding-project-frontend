import { useEffect, useState } from 'react';
import { SearchX } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import PlaceCombobox from '../components/PlaceCombobox.jsx';
import RefugeMap from '../components/RefugeMap.jsx';
import MapLegend from '../components/MapLegend.jsx';
import RefugeIcon from '../components/RefugeIcon.jsx';
import RefugeDetail from '../components/RefugeDetail.jsx';
import RefugeFilter from '../components/RefugeFilter.jsx';
import LocationPinIcon from '../components/LocationPinIcon.jsx';
import SampleDataNotice from '../components/SampleDataNotice.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
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
  const [categoryCounts, setCategoryCounts] = useState({});
  const [searchRadiusMetres, setSearchRadiusMetres] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRefugeId, setSelectedRefugeId] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Filtered list shown on the page and the map.
  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setIsLoading(true);
    getRefuges({ types: selectedTypes }).then((result) => {
      if (cancelled) return;
      setRefuges(result.refuges);
      setSearchRadiusMetres(result.searchRadiusMetres);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [location, selectedTypes]);

  // Unfiltered count per category for the filter chips - independent of
  // the current filter, so a chip's count reflects what's nearby, not
  // what's currently shown.
  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    getRefuges().then((result) => {
      if (cancelled) return;
      const counts = result.refuges.reduce((acc, refuge) => {
        acc[refuge.category] = (acc[refuge.category] ?? 0) + 1;
        return acc;
      }, {});
      setCategoryCounts(counts);
    });
    return () => {
      cancelled = true;
    };
  }, [location]);

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
        <PageHeader
          title="Sensory Refuges"
          description="Choose a location to find nearby parks, libraries and quiet spaces."
        />
        <div className="mb-4">
          <SampleDataNotice />
        </div>
        <Card>
          <form onSubmit={handleLocationSubmit} className="space-y-4" noValidate>
            <PlaceCombobox
              id="refuge-location"
              label="Location"
              value={locationInput}
              onChange={setLocationInput}
              error={locationError}
            />
            <Button type="submit" fullWidth>
              Find Refuges
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Sensory Refuges" eyebrow={`Near ${location.name}`} />

      <div className="mb-4">
        <SampleDataNotice id="refuges-sample-notice" />
      </div>

      <RefugeFilter selected={selectedTypes} onChange={setSelectedTypes} counts={categoryCounts} />

      {isLoading && <p className="mt-5 text-caption text-ink/60">Finding nearby refuges…</p>}

      {!isLoading && refuges.length === 0 && (
        <Card className="mt-5 text-center" aria-describedby="refuges-sample-notice">
          <SearchX className="mx-auto h-8 w-8 text-ink/30" aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">
            No refuges of the selected types were found nearby.
          </p>
          <p className="mt-1 text-caption text-ink/60">
            Try a different type, or widen your search from the filter above.
          </p>
        </Card>
      )}

      {!isLoading && refuges.length > 0 && (
        <>
          <Section title="Map">
            {searchRadiusMetres != null && (
              <p className="mb-3 text-caption text-ink/60">
                Showing refuges within {searchRadiusMetres} m of {location.name}.
              </p>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,220px]">
              <RefugeMap
                location={location}
                refuges={refuges}
                onSelectRefuge={handleSelectRefuge}
              />
              <MapLegend items={LEGEND_ITEMS} />
            </div>
          </Section>

          <Section title="Nearby">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {refuges.map((refuge) => {
                const isOpen = selectedRefugeId === refuge.id;
                return (
                  <li key={refuge.id}>
                    <Card>
                      <button
                        type="button"
                        onClick={() => handleSelectRefuge(refuge)}
                        aria-expanded={isOpen}
                        aria-controls={`refuge-detail-${refuge.id}`}
                        className="flex w-full items-center gap-2 text-left"
                      >
                        <RefugeIcon
                          category={refuge.category}
                          className="h-5 w-5 flex-shrink-0 text-accent"
                        />
                        <span className="font-semibold text-ink">{refuge.name}</span>
                      </button>
                      <p className="mt-1 text-caption text-ink/70">
                        {refugeCategoryLabel(refuge.category)} ·{' '}
                        {formatDistance(refuge.walkingDistanceMetres)} away
                      </p>
                      {isOpen && (
                        <div id={`refuge-detail-${refuge.id}`}>
                          <RefugeDetail refuge={refuge} />
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          </Section>
        </>
      )}
    </div>
  );
}
