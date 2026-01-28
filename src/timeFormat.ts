/**
 * Formats elapsed time in seconds to M:SS or MM:SS format.
 * @param seconds Total elapsed time in seconds
 * @returns Formatted time string (e.g., "0:05", "1:30", "12:45", "60:00")
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats elapsed time in centiseconds to M:SS.cc format.
 * @param centiseconds Total elapsed time in centiseconds (1/100 seconds)
 * @returns Formatted time string (e.g., "0:05.23", "1:30.00")
 */
export function formatTimeWithCentiseconds(centiseconds: number): string {
  const totalSeconds = Math.floor(centiseconds / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const cs = centiseconds % 100;
  return `${minutes}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}
