import { User } from "../../models";
import { getApi } from "../axios";
import { LocalStorageManager } from "../../managers";

export const getUser = async () => {
  let userInfo: User | undefined = undefined;
  try {
    userInfo = await getApi<User, User>("/user");
    LocalStorageManager.setUserInfo(userInfo);
  } catch (error) {
    LocalStorageManager.setUserInfo(userInfo);
  }
  return userInfo;
};
