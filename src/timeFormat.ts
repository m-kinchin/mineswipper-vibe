/**
 * Formats elapsed time in seconds to M:SS or MM:SS format.
 * @param seconds Total elapsed time in seconds
 * @returns Formatted time string (e.g., "0:05", "1:30", "12:45", "60:00")
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
