const TONES = {
  alert: {
    container: 'border-band-high/30 bg-band-highBg',
    title: 'text-band-high',
    icon: 'text-band-high',
  },
  info: {
    container: 'border-accent/20 bg-accent/5',
    title: 'text-ink',
    icon: 'text-accent',
  },
};

// Shared shape for every warning/info box in the app (CrowdWarning,
// ToleranceWarning, NoQualifyingRouteMessage, PredictiveAlert, form
// errors). `role` is left to the caller - callers that must announce to
// assistive tech pass role="alert" themselves; this component only
// standardises the look.
export default function Callout({ tone = 'info', icon: Icon, title, children, role, actions, id }) {
  const t = TONES[tone] ?? TONES.info;

  return (
    <div id={id} role={role} className={`rounded-lg border p-4 ${t.container}`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${t.icon}`} aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          {title && <p className={`font-semibold ${t.title}`}>{title}</p>}
          <div className="mt-1 text-caption text-ink">{children}</div>
          {actions && <div className="mt-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
