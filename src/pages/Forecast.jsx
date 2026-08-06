import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import PlaceCombobox from '../components/PlaceCombobox.jsx';
import ForecastTimeline from '../components/ForecastTimeline.jsx';
import EstimateDisclaimer from '../components/EstimateDisclaimer.jsx';
import { getForecast } from '../api/forecast.js';
import { findPlaceByName } from '../data/cbdPlaces.js';

export default function Forecast() {
  const { session } = useSession();
  const [location, setLocation] = useState(session.destination ? { ...session.destination } : null);
  const [locationInput, setLocationInput] = useState('');
  const [locationError, setLocationError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setIsLoading(true);
    getForecast({ lat: location.lat, lng: location.lng }).then((result) => {
      if (cancelled) return;
      setForecast(result);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [location]);

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
        <h1 className="text-2xl font-semibold">Forecast</h1>
        <p className="mt-2 text-ink/70">
          Choose an area or sensor location to see the next-hour forecast.
        </p>
        <form onSubmit={handleLocationSubmit} className="mt-4 space-y-3" noValidate>
          <PlaceCombobox
            id="forecast-location"
            label="Area or sensor location"
            value={locationInput}
            onChange={setLocationInput}
            error={locationError}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white hover:bg-accent-dark"
          >
            Show Forecast
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md md:max-w-2xl">
      <h1 className="text-2xl font-semibold">Forecast</h1>
      <p className="mt-1 text-sm text-ink/60">{forecast?.sensorName ?? location.name}</p>

      <div className="mt-3">
        <EstimateDisclaimer />
      </div>

      {isLoading && <p className="mt-4 text-sm text-ink/60">Loading forecast…</p>}

      {!isLoading && forecast && !forecast.sufficientHistory && (
        <p className="mt-4 text-ink/70">Not enough historical data for this location.</p>
      )}

      {!isLoading && forecast?.sufficientHistory && (
        <div className="mt-4">
          <ForecastTimeline
            timeline={forecast.timeline}
            liveCount={session.lastSelectedRoute?.averageCountPerMinute ?? null}
          />
        </div>
      )}
    </div>
  );
}
