import { ShieldCheck } from 'lucide-react';

// Shared between the desktop rail and the mobile page footer - the privacy
// promise this app is built around must be visible regardless of viewport,
// not just to desktop users who happen to see the rail.
export default function PrivacyNote({ className = '' }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg bg-accent/5 p-3 text-micro text-ink/70 ${className}`}>
      <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
      <span>Session only. Nothing is saved after you close this tab.</span>
    </div>
  );
}
