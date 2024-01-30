import { LocalStorageManager } from "../../managers";
import { getCurrentCodeTimeToday } from "./getCurrentCodeTimeToday";

export const getUncommitedChangesToday = async () => {
  try {
    const resultFromDB = await getCurrentCodeTimeToday("UNCOMMITTED_CHANGES");
    return resultFromDB;
  } catch (error) {
    const resultFromLocal = LocalStorageManager.getUncommittedCodeChangesData();
    return resultFromLocal?.codeChanges ?? [];
  }
};
