import { Info } from 'lucide-react';
import Callout from './ui/Callout.jsx';

// Persistent per AC 2.2.1: predictions must never be overstated as fact.
export default function EstimateDisclaimer() {
  return (
    <Callout tone="info" icon={Info}>
      Estimate based on historical patterns.
    </Callout>
  );
}
