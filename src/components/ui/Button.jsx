import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-dark',
  secondary: 'border border-ink/20 bg-white text-ink hover:border-accent hover:text-accent',
  ghost: 'text-accent hover:underline underline-offset-2',
};

const SIZES = {
  md: 'px-4 py-3 text-body min-h-[48px]',
  sm: 'px-3 py-2 text-caption min-h-[40px]',
};

// Polymorphic: pass `to` for a nav CTA (renders a react-router Link with
// the same look), omit it for an in-page action (renders a <button> -
// callers must still pass `type="button"` or `type="submit"` explicitly).
export default function Button({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
