import { CodeChangesData } from "./UncommittedChangesTracker";
import { ExtensionContext } from "vscode";
import { formatDateToYYMMDD } from "../utils/date-util";
import { AuthToken, TimeTracking, User } from "../models";

/* The `LocalStorageManager` class is a TypeScript class that provides methods for managing data in the
 * global state of a VS Code extension.
 */
export class LocalStorageManager {
  /* The `private static instance: LocalStorageManager;` line is declaring a private static property
   * called `instance` of type `LocalStorageManager` in the `LocalStorageManager` class.
   */
  private static instance: LocalStorageManager;

  /* The line `private globalState: vscode.ExtensionContext['globalState'];` is declaring a private
   * property called `globalState` of type `vscode.ExtensionContext['globalState']` in the
   * `LocalStorageManager` class.
   */
  private static globalState: ExtensionContext["globalState"];

  public static TEMP_DATA_KEY = "TEMP_DATA_";
  private static TEMP_UNCOMMIT_CHANGE_DATA_KEY = "TEMP_DATA_UNCOMMIT_CHANGE_";
  private static TEMP_TIME_TRACKING_DATA_KEY = "TEMP_DATA_TIME_TRACKING_";

  /**
   * The function returns an instance of the LocalStorageManager class, creating it if it doesn't
   * already exist.
   * @param ctx - The `ctx` parameter is an instance of the `vscode.ExtensionContext` class. It
   * represents the context in which the extension is running and provides access to various
   * extension-related functionalities, such as the extension's global state and workspace
   * information.
   * @returns The instance of the LocalStorageManager class.
   */
  public static getInstance(ctx: ExtensionContext) {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
      LocalStorageManager.globalState = ctx.globalState;
    }
    return LocalStorageManager.instance;
  }

  /**
   * The function `getValue` retrieves a value from the global state based on a given key.
   * @param {string} key - A string representing the key used to retrieve a value from the global
   * state.
   * @returns the value associated with the given key from the global state. The value is of type T,
   * which is specified as a generic type parameter. If no value is found for the key, an empty
   * string is returned as the default value.
   */
  public static getValue(key: string, defaultValue?: string) {
    return LocalStorageManager.globalState.get(key, defaultValue ?? "");
  }

  /**
   * The `setValue` function updates the value associated with a given key in the global state.
   * @param {string} key - A string representing the key for the value being set in the global state.
   * @param {string} value - The value parameter is the value that you want to set for the given key.
   */
  public static setValue(key: string, value: string) {
    LocalStorageManager.globalState.update(key, value);
  }

  /**
   * The deleteValue function updates the global state by setting the value associated with the given
   * key to undefined.
   * @param {string} key - The key parameter is a string that represents the key of the value you
   * want to delete from the global state.
   */
  public static deleteValue(key: string) {
    LocalStorageManager.globalState.update(key, undefined);
  }

  /**
   * The function sets the keys for synchronization in the global state.
   * @param {string[]} keys - The `keys` parameter is an array of strings that represents the keys
   * that need to be synchronized.
   */
  public static setSyncKeys(keys: string[]) {
    LocalStorageManager.globalState.setKeysForSync(keys);
  }

  /**
   * The function "disableAllSyncKeys" clears all the keys for synchronization in the global state.
   */
  public static disableAllSyncKeys() {
    LocalStorageManager.globalState.setKeysForSync([]);
  }

  /**
   * The function sets the authentication token in the local storage.
   * @param {AuthToken | undefined} authToken - The `authToken` parameter is of type `AuthToken |
   * undefined`. It can either be an object of type `AuthToken` or `undefined`.
   */
  public static setAuthToken(authToken: AuthToken | undefined) {
    LocalStorageManager.setValue(
      "authToken",
      authToken ? JSON.stringify(authToken) : "",
    );
  }

  /**
   * The function `setUserInfo` stores user information in local storage.
   * @param {User} [userInfo] - The `userInfo` parameter is an optional parameter of type `User`. It
   * represents the user information that needs to be stored in the local storage. If a value is
   * provided for `userInfo`, it will be converted to a JSON string and stored in the local storage. If
   * no value is provided or if
   */
  public static setUserInfo(userInfo?: User) {
    LocalStorageManager.setValue(
      "user-info",
      userInfo ? JSON.stringify(userInfo) : "",
    );
  }

  /**
   * The function `getUserInfo` retrieves user information from local storage and returns it as a
   * parsed JSON object.
   * @returns the user information as an object of type User, if it can be successfully parsed from the
   * JSON stored in the "user-info" key in local storage. If there is an error during parsing, the
   * function will log the error and return undefined.
   */
  public static getUserInfo() {
    const userInfoJson = LocalStorageManager.getValue("user-info");
    try {
      const userInfo = JSON.parse(userInfoJson) as User;
      return userInfo;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * The function `getAuthToken` retrieves an authentication token from local storage and returns it as
   * an `AuthToken` object, or `undefined` if the token cannot be parsed.
   * @returns an AuthToken object or undefined.
   */
  public static getAuthToken(): AuthToken | undefined {
    const value = LocalStorageManager.getValue("authToken");
    try {
      return JSON.parse(value) as AuthToken;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * The function retrieves uncommitted code changes data from local storage.
   * @returns either a parsed JSON object of type CodeChangesData or undefined.
   */
  public static getUncommittedCodeChangesData() {
    const valueJson = LocalStorageManager.getValue(
      `${LocalStorageManager.TEMP_UNCOMMIT_CHANGE_DATA_KEY}${formatDateToYYMMDD(
        "_",
      )}`,
    );
    if (valueJson) return JSON.parse(valueJson) as CodeChangesData;
    else return undefined;
  }

  /**
   * The function sets uncommitted code changes data in local storage.
   * @param {CodeChangesData} codeChangesData - The codeChangesData parameter is an object that
   * contains data related to code changes.
   */
  public static setUncommittedCodeChangesData(
    codeChangesData: CodeChangesData,
  ) {
    LocalStorageManager.setValue(
      `${LocalStorageManager.TEMP_UNCOMMIT_CHANGE_DATA_KEY}${formatDateToYYMMDD(
        "_",
      )}`,
      JSON.stringify(codeChangesData),
    );
  }

  /**
   * The function `deleteTempKeys()` deletes all keys in the global state that start with 'TEMP_'.
   */
  public static deleteTempKeys() {
    LocalStorageManager.globalState
      .keys()
      .filter((key) => key.startsWith(LocalStorageManager.TEMP_DATA_KEY))
      .forEach((key) => {
        LocalStorageManager.deleteValue(key);
      });
  }

  public static getTimeTrackingData() {
    const result = LocalStorageManager.getValue(
      `${LocalStorageManager.TEMP_TIME_TRACKING_DATA_KEY}${formatDateToYYMMDD(
        "_",
      )}`,
    );
    if (result) {
      try {
        return JSON.parse(result) as TimeTracking;
      } catch (error) {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  public static setTimeTrackingData(data?: TimeTracking) {
    const jsonString = data ? JSON.stringify(data) : "";
    LocalStorageManager.setValue(
      `${LocalStorageManager.TEMP_TIME_TRACKING_DATA_KEY}${formatDateToYYMMDD(
        "_",
      )}`,
      jsonString,
    );
  }

  /**
   * Clear all the values stored in the global state.
   */
  public static clearAllValues() {
    LocalStorageManager.globalState.keys().forEach((key) => {
      LocalStorageManager.deleteValue(key);
    });
  }
}
