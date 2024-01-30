import { getWorkspaceFolders } from "./getWorkspaceFolders";

/**
 * Retrieve a workspace folder by its name.
 *
 * @param name - The name of the desired workspace folder.
 * @returns The workspace folder with the specified name or `undefined` if not found.
 */
export const getWorkspaceFolderByName = (name: string) => {
  // Get the list of available workspace folders.
  const workspaceFolders = getWorkspaceFolders();

  // Find the workspace folder by matching its name.
  return workspaceFolders.find(
    (workspaceFolder) => workspaceFolder.name === name,
  );
};
