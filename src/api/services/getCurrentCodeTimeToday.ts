import { getApi } from "../axios";
import { CodeChange } from "../../managers/UncommittedChangesTracker";
export const getCurrentCodeTimeToday = async (eventType?: string) => {
  return getApi<CodeChange[], CodeChange[]>(
    "/users/current/codetime/today",
    undefined,
    {
      params: {
        eventType,
      },
    },
  );
};
