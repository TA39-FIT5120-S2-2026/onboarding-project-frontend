// Backend errors are `{success:false, message}` with no machine-readable
// code (see docs/BACKEND_GAPS.md), so the frontend maps HTTP status instead
// of branching on an error code.
export function userMessageFor(error) {
  if (error?.status === 404) {
    return "We couldn't find a walking route between those two places.";
  }
  if (error?.status === 502) {
    return 'The routing service is unavailable right now. Please try again shortly.';
  }
  if (error?.status >= 500) {
    return 'Something went wrong on our end. Please try again.';
  }
  return error?.message ?? 'Something went wrong. Please try again.';
}
