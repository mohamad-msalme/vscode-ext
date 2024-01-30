export const formatDateToYYMMDD = (splitter = "-") => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2); // Get the last 2 digits of the year
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Get the month (0-based) and format to 2 digits
  const day = String(today.getDate()).padStart(2, "0"); // Get the day of the month and format to 2 digits

  const formattedDate = `${year}${splitter}${month}${splitter}${day}`;
  return formattedDate;
};
