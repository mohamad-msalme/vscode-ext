export const convertToHoursMinutes = (timeInMs: number) => {
  if (timeInMs === 0) return "0";

  const timeInSeconds: number = Math.floor(timeInMs / 1000);
  // Calculate hours, minutes, and remaining seconds
  const hours: number = Math.floor(timeInSeconds / 3600);
  const minutes: number = Math.floor((timeInSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};
