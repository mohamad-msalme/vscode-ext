import axios from "axios";

import { getOffsetMinutes } from "../../utils/date-util";
import { getUserAgentPlugin } from "../../utils/extension-util";

export const TIME_OUT = 20000;
export const BACKEND_BASE_URL = "https://api.dev-boost.com";
export const axiosInstance = axios.create({
  timeout: TIME_OUT,
  baseURL: BACKEND_BASE_URL,
  timeoutErrorMessage: "The request took too long. Please try again",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": getUserAgentPlugin(),
    "cockepit-Plugin-Offset": getOffsetMinutes(),
    "cockepit-Plugin-TZ": Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
});
