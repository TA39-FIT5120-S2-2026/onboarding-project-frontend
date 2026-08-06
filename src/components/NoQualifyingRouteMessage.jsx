import { bandLabel } from '../utils/bandLabels.js';

export default function NoQualifyingRouteMessage({ tolerance }) {
  return (
    <div role="alert" className="rounded-lg border border-band-high/30 bg-band-highBg p-4">
      <p className="font-semibold text-band-high">No route meets your tolerance</p>
      <p className="mt-1 text-sm text-ink">
        None of the available routes stay within your selected tolerance (
        {bandLabel(tolerance).text}). The lowest-exposure route available is shown below.
      </p>
    </div>
  );
}
