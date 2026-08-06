export default function LocationPinIcon({ className = 'h-3 w-3' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block flex-shrink-0 rounded-sm rounded-bl-none bg-accent ${className}`}
      style={{ transform: 'rotate(45deg)' }}
    />
  );
}
