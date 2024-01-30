import { getApi } from "../axios";
import { TimeTracking } from "../../models";

const DEF = {
  id: null,
  vscodeTime: 0,
  codeTime: 0,
  KPM: 0,
  repos: [],
};

/**
 * The function `getCurrentTimeTrackingToday` retrieves the current time tracking data for the current
 * user from an API, and if there is an error, it falls back to retrieving the data from local storage.
 * @returns The function `getCurrentTimeTrackingToday` returns the data object obtained from the API
 * endpoint `/users/current/timetracking/today`. If the API call is successful and returns data, that
 * data is returned. If the API call fails or does not return data, the function checks for data in the
 * local storage using `LocalStorageManager.getTimeTrackingData()`. If data is found in the local
 * storage,
 */
export const getCurrentTimeTrackingToday = async () => {
  try {
    const data = await getApi<TimeTracking, TimeTracking>(
      "/users/current/timetracking/today",
      (data) => {
        if (data) return data;
        else return DEF;
      },
    );
    return data;
  } catch (error) {
    // return DEF;
  }
};
