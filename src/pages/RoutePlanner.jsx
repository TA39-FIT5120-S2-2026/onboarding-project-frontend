import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceCombobox from '../components/PlaceCombobox.jsx';
import PredictiveAlert from '../components/PredictiveAlert.jsx';
import { findPlaceByName, isWithinCbd } from '../data/cbdPlaces.js';
import { getRoutes } from '../api/routes.js';
import { getForecast } from '../api/forecast.js';
import { ApiError } from '../api/client.js';
import { useSession } from '../context/SessionContext.jsx';

const UNRECOGNISED_MESSAGE = 'Enter a location from the suggestions, like Flinders Street Station.';

export default function RoutePlanner() {
  const navigate = useNavigate();
  const { session, setRouteSearchResult } = useSession();
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [errors, setErrors] = useState({ origin: null, destination: null, general: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictiveAlert, setPredictiveAlert] = useState(null);

  useEffect(() => {
    const { lastSelectedRoute, destination } = session;
    if (!lastSelectedRoute || !destination) {
      setPredictiveAlert(null);
      return;
    }

    let cancelled = false;
    getForecast({ lat: destination.lat, lng: destination.lng }).then((result) => {
      if (cancelled) return;
      if (result.sufficientHistory && result.peakBand === 'HIGH') {
        setPredictiveAlert({ locationName: destination.name, peakWindow: result.peakWindow });
      } else {
        setPredictiveAlert(null);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.lastSelectedRoute, session.destination]);

  async function handleSubmit(event) {
    event.preventDefault();

    const origin = findPlaceByName(originText);
    const destination = findPlaceByName(destinationText);

    if (!origin || !destination) {
      setErrors({
        origin: origin ? null : UNRECOGNISED_MESSAGE,
        destination: destination ? null : UNRECOGNISED_MESSAGE,
        general: null,
      });
      return;
    }

    setErrors({ origin: null, destination: null, general: null });
    setIsSubmitting(true);

    try {
      const result = await getRoutes({ origin, destination, tolerance: session.tolerance });
      setRouteSearchResult({
        routes: result.routes,
        accessPoints: result.accessPoints,
        toleranceApplied: result.toleranceApplied,
        noRouteMeetsTolerance: result.noRouteMeetsTolerance,
        origin,
        destination,
      });
      navigate('/routes');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'OUT_OF_BOUNDS') {
        const originOutside = !isWithinCbd(origin.lat, origin.lng);
        setErrors({
          origin: originOutside ? error.message : null,
          destination: originOutside ? null : error.message,
          general: null,
        });
      } else if (error instanceof ApiError) {
        setErrors({ origin: null, destination: null, general: error.message });
      } else {
        setErrors({
          origin: null,
          destination: null,
          general: 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md md:max-w-lg">
      {predictiveAlert && (
        <PredictiveAlert
          locationName={predictiveAlert.locationName}
          peakWindow={predictiveAlert.peakWindow}
        />
      )}

      <h1 className="text-2xl font-semibold">Quiet Compass</h1>
      <p className="mt-1 text-ink/70">
        We&apos;ll find the quietest, least crowded walking path for your journey today.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {errors.general && (
          <p
            role="alert"
            className="rounded-lg bg-band-highBg px-3 py-2 text-sm font-medium text-band-high"
          >
            {errors.general}
          </p>
        )}

        <PlaceCombobox
          id="origin"
          label="Origin"
          value={originText}
          onChange={setOriginText}
          error={errors.origin}
          hint="Enter a location within Melbourne CBD"
        />

        <PlaceCombobox
          id="destination"
          label="Destination"
          value={destinationText}
          onChange={setDestinationText}
          error={errors.destination}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Finding route…' : 'Find Route'}
        </button>
      </form>

      <div className="mt-8 rounded-lg bg-accent/5 p-4 text-sm text-ink/80">
        <p className="font-medium text-ink">Low-Sensory Routing</p>
        <p className="mt-1">
          We&apos;ll find the quietest, least crowded path for your journey today.
        </p>
      </div>
    </div>
  );
}
