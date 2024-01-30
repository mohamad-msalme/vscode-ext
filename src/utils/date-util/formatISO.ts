/**
 * The `formatISO` function takes a `Date` object and returns a formatted string in ISO 8601 format.
 * @param {Date} date - The `date` parameter is a `Date` object representing a specific point in time.
 * @returns The function `formatISO` returns a string in the ISO 8601 format representing the given
 * date.
 */
export const formatISO = (date: Date): string => {
  const year = date.getUTCFullYear();
  const day = date.getUTCDate().toString().padStart(2, "0");
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
};
