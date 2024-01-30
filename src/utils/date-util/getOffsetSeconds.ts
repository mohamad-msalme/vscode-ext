/**
 * The function `getOffsetSeconds` returns the offset in seconds between the local time zone and UTC.
 * @returns The function `getOffsetSeconds` returns the offset in seconds between the local time zone
 * and UTC (Coordinated Universal Time).
 */
export const getOffsetMinutes = () => {
  const date = new Date();
  return date.getTimezoneOffset();
};
