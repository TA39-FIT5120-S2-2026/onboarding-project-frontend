// One card look, reused everywhere - the direct fix for pages that each
// drifted to a slightly different border/radius/shadow combination.
export default function Card({
  as: As = 'div',
  highlighted = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'rounded-xl border bg-white p-4 sm:p-5',
    highlighted ? 'border-accent ring-1 ring-accent' : 'border-ink/10',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <As className={classes} {...props}>
      {children}
    </As>
  );
}
