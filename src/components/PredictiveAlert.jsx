import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import Callout from './ui/Callout.jsx';

export default function PredictiveAlert({ locationName, peakWindow }) {
  return (
    <Callout
      role="alert"
      tone="alert"
      icon={TriangleAlert}
      title={`Busier than usual expected near ${locationName}`}
      actions={
        <Link to="/forecast" className="text-caption font-medium text-accent underline">
          View forecast
        </Link>
      }
    >
      High pedestrian levels are expected around {peakWindow}. This is an estimate based on
      historical patterns.
    </Callout>
  );
}
