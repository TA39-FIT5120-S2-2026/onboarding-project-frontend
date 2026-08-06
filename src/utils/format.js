export function formatDistance(metres) {
  if (metres == null) return 'Unavailable';
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export function formatDuration(minutes) {
  if (minutes == null) return 'Unavailable';
  return `${minutes} min`;
}

export function formatCount(countPerMinute) {
  if (countPerMinute == null) return 'Unavailable';
  return `${countPerMinute} counts / min`;
}

export function formatTime(isoString) {
  if (!isoString) return 'Unavailable';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
}

export function orUnavailable(value) {
  return value === null || value === undefined || value === '' ? 'Unavailable' : value;
}
