export default function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-caption font-medium text-band-high">
      {message}
    </p>
  );
}
