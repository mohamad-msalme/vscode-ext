import { getWorkspaceFolders } from "./getWorkspaceFolders";

/**
 * Retrieve a workspace folder by its index.
 *
 * @param index - The index of the desired workspace folder.
 * @returns The workspace folder at the specified index or `undefined` if the index is out of bounds.
 */
export const getWorkspaceFolderByIndex = (index: number) => {
  // Get the list of available workspace folders.
  const workspaceFolders = getWorkspaceFolders();

  // Check if the index is within the valid range.
  if (index >= 0 && index < workspaceFolders.length) {
    return workspaceFolders[index];
  }

  // Return `undefined` for out-of-bounds indices.
  return undefined;
};
