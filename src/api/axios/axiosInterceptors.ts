import { axiosInstance } from "./axiosInstanse";
import { LocalStorageManager } from "../../managers";

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = LocalStorageManager.getAuthToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token.token}`;
        config.headers["Token-Type"] = token.type.toString();
        return config;
      } else {
        throw new Error(
          "Authentication token is required for this feature. Please log in or authenticate to access it.",
        );
      }
    } catch (error) {
      throw new Error(
        "An error occurred while processing your request. Please try again later.",
      );
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);
