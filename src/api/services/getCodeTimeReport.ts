import { getApi } from "../axios";

export const getCodeTimeReport = async () => {
  const result = await getApi<string, string>(
    "/users/current/timetracking/report",
  );
  return result;
};
