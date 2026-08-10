import { TriangleAlert } from 'lucide-react';
import Callout from './ui/Callout.jsx';
import { bandLabel } from '../utils/bandLabels.js';

export default function NoQualifyingRouteMessage({ tolerance }) {
  return (
    <Callout role="alert" tone="alert" icon={TriangleAlert} title="No route meets your tolerance">
      None of the available routes stay within your selected tolerance ({bandLabel(tolerance).text}
      ). The lowest-exposure route available is shown below.
    </Callout>
  );
}
