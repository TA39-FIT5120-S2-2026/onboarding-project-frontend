import { Info } from 'lucide-react';
import Callout from './ui/Callout.jsx';

// No backend implements this page's data (see docs/BACKEND_GAPS.md). Text +
// icon, never colour alone, so a user can't mistake sample locations for
// live sensor readings.
export default function SampleDataNotice({ id }) {
  return (
    <Callout id={id} role="note" tone="info" icon={Info} title="Sample data">
      This page shows example locations for demonstration. It is not live information and no
      backend service supplies it yet.
    </Callout>
  );
}
