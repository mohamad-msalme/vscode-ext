import { getWorkspaceConfiguration } from "./getWorkspaceConfiguration";

/**
 * The function `getWorkspaceConfigurationValue` retrieves a value from the workspace configuration in
 * TypeScript.
 * @param {string} section - The `section` parameter is a string that represents the section of the
 * workspace configuration from which you want to retrieve a value. It could be a specific key or a
 * nested object path.
 * @param {T} defaultValue - The `defaultValue` parameter is the value that will be returned if the
 * configuration value for the specified section is not found or is not of the expected type.
 * @returns The function `getWorkspaceConfigurationValue` returns a value of type `T`.
 */
export const getWorkspaceConfigurationValue = <T>(
  section: string,
  defaultValue: T,
): T => {
  const config = getWorkspaceConfiguration();
  return config.get<T>(section, defaultValue);
};
