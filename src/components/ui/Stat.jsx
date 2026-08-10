// One big legible number + a small label - the "attractive number"
// pattern reviewers responded to, reused instead of every page inventing
// its own way to show a time/count/distance.
export default function Stat({ icon: Icon, value, label, size = 'md' }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon className="mt-1 h-5 w-5 flex-shrink-0 text-ink/40" aria-hidden="true" />}
      <div>
        <p className={size === 'lg' ? 'text-display-sm text-ink' : 'text-heading text-ink'}>
          {value}
        </p>
        {label && <p className="text-caption text-ink/60">{label}</p>}
      </div>
    </div>
  );
}
