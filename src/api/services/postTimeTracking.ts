/* eslint-disable @typescript-eslint/require-await */
import { postApi } from "../axios";
import { TimeTracking } from "../../models";

/**
 * The function `postTimeTracking` sends a POST request to the "/users/current/timetracking" endpoint
 * with the provided data, and if successful, updates the local storage with the returned data or the
 * original data if no response is received.
 * @param {TimeTracking} data - The `data` parameter is an object of type `TimeTracking`. It represents
 * the time tracking data that needs to be sent to the server.
 * @returns The function `postTimeTracking` returns either the `result` if it is defined, or the `data`
 * parameter if `result` is undefined.
 */
export const postTimeTracking = async (data: TimeTracking) => {
  try {
    await postApi<TimeTracking, TimeTracking, TimeTracking>(
      "/users/current/timetracking",
      data,
    );
  } catch (error) {
    //
  }
};
