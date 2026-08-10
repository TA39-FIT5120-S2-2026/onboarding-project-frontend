import { useEffect, useState } from 'react';
import { CloudOff, Clock } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import PlaceCombobox from '../components/PlaceCombobox.jsx';
import ForecastTimeline from '../components/ForecastTimeline.jsx';
import SensoryIndicator from '../components/SensoryIndicator.jsx';
import EstimateDisclaimer from '../components/EstimateDisclaimer.jsx';
import Callout from '../components/ui/Callout.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Stat from '../components/ui/Stat.jsx';
import Section from '../components/ui/Section.jsx';
import { getForecast } from '../api/forecast.js';
import { userMessageFor } from '../api/errors.js';
import { findPlaceByName } from '../data/cbdPlaces.js';

export default function Forecast({ forecastLoader = getForecast }) {
  const { session } = useSession();
  const [location, setLocation] = useState(session.destination ? { ...session.destination } : null);
  const [locationInput, setLocationInput] = useState('');
  const [locationError, setLocationError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setIsLoading(true);
    setRequestError(null);
    setForecast(null);

    async function loadForecast() {
      try {
        const result = await forecastLoader({ lat: location.lat, lng: location.lng });
        if (!cancelled) setForecast(result);
      } catch (error) {
        if (!cancelled) setRequestError(userMessageFor(error));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadForecast();
    return () => {
      cancelled = true;
    };
  }, [forecastLoader, location]);

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
          title="Forecast"
          description="Choose an area or sensor location to see the next-hour forecast."
        />
        <Card>
          <form onSubmit={handleLocationSubmit} className="space-y-4" noValidate>
            <PlaceCombobox
              id="forecast-location"
              label="Area or sensor location"
              value={locationInput}
              onChange={setLocationInput}
              error={locationError}
            />
            <Button type="submit" fullWidth>
              Show Forecast
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Forecast" eyebrow={forecast?.sensorName ?? location.name} />

      <div className="mb-5">
        <EstimateDisclaimer />
      </div>

      {requestError && (
        <div className="mb-5">
          <Callout tone="alert" role="alert">
            {requestError}
          </Callout>
        </div>
      )}

      {isLoading && (
        <div aria-busy="true">
          <p role="status" className="sr-only">
            Loading forecast…
          </p>
          <Card className="h-40 animate-pulse bg-ink/5" aria-hidden="true" />
        </div>
      )}

      {!isLoading && forecast && !forecast.sufficientHistory && (
        <Card className="text-center">
          <CloudOff className="mx-auto h-8 w-8 text-ink/30" aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">
            Not enough historical data for this location.
          </p>
          <p className="mt-1 text-caption text-ink/60">
            Try a busier area nearby, like Flinders Street Station or Melbourne Central.
          </p>
        </Card>
      )}

      {!isLoading && forecast?.sufficientHistory && (
        <>
          {forecast.peakBand && forecast.peakWindow && (
            <Card className="mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Stat
                  icon={Clock}
                  value={forecast.peakWindow}
                  label="Busiest window in the next hour"
                  size="lg"
                />
                <SensoryIndicator band={forecast.peakBand} countPerMinute={null} />
              </div>
            </Card>
          )}

          <Section title="Next 60 minutes">
            <ForecastTimeline
              timeline={forecast.timeline}
              liveCount={forecast.current?.pedestrianCount ?? null}
            />
          </Section>
        </>
      )}
    </div>
  );
}
