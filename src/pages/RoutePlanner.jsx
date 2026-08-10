import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import PlaceCombobox from '../components/PlaceCombobox.jsx';
import PredictiveAlert from '../components/PredictiveAlert.jsx';
import BandExplainer from '../components/BandExplainer.jsx';
import FeatureTeaserCards from '../components/FeatureTeaserCards.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import Callout from '../components/ui/Callout.jsx';
import { findPlaceByName } from '../data/cbdPlaces.js';
import { planRoute } from '../api/routes.js';
import { getForecast } from '../api/forecast.js';
import { ApiError } from '../api/client.js';
import { userMessageFor } from '../api/errors.js';
import { useSession } from '../context/SessionContext.jsx';

const UNRECOGNISED_MESSAGE = 'Enter a location from the suggestions, like Flinders Street Station.';

export default function RoutePlanner() {
  const navigate = useNavigate();
  const { session, setPlan } = useSession();
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [errors, setErrors] = useState({ origin: null, destination: null, general: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictiveAlert, setPredictiveAlert] = useState(null);

  const selectedRoute = session.routes.find((r) => r.routeId === session.selectedRouteId) ?? null;

  useEffect(() => {
    const { destination } = session;
    if (!selectedRoute || !destination) {
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
  }, [selectedRoute, session.destination]);

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
      const result = await planRoute({ origin, destination, crowdTolerance: session.tolerance });
      setPlan(result, { origin, destination });
      navigate('/routes');
    } catch (error) {
      if (error instanceof ApiError && error.data?.canPlanRoute === false) {
        setErrors({
          origin: error.data.originInsideCbd === false ? error.message : null,
          destination: error.data.destinationInsideCbd === false ? error.message : null,
          general: null,
        });
      } else if (error instanceof ApiError) {
        setErrors({ origin: null, destination: null, general: userMessageFor(error) });
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
    <div className="mx-auto max-w-3xl">
      {predictiveAlert && (
        <div className="mb-6">
          <PredictiveAlert
            locationName={predictiveAlert.locationName}
            peakWindow={predictiveAlert.peakWindow}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.1fr,1fr] md:items-start">
        <div>
          <h1 className="text-display-sm text-ink">Quiet Compass</h1>
          <p className="mt-2 max-w-prose text-body text-ink/70">
            Walk Melbourne&apos;s CBD by crowd level, not just distance. We compare your route
            options using real pedestrian counts and show how busy each one is.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {errors.general && (
              <Callout tone="alert" role="alert">
                {errors.general}
              </Callout>
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

            <Button type="submit" disabled={isSubmitting} fullWidth>
              <Navigation className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Finding route…' : 'Find Route'}
            </Button>
          </form>
        </div>

        <Card className="bg-accent/5">
          <p className="font-semibold text-ink">Why crowd level, not just speed?</p>
          <p className="mt-2 text-caption text-ink/70">
            Busy streets mean noise and close contact. We weigh that in, so our first suggestion is
            the easiest route to be in - even when it isn&apos;t the shortest.
          </p>
        </Card>
      </div>

      <Section title="How we rate crowd levels">
        <BandExplainer />
      </Section>

      <Section title="Explore more">
        <FeatureTeaserCards />
      </Section>
    </div>
  );
}
