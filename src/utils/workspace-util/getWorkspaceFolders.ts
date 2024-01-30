import { WorkspaceFolder, workspace } from "vscode";

/**
 * Get a list of workspace folders available in the current workspace.
 *
 * @returns An array of workspace folders.
 */
export function getWorkspaceFolders(): WorkspaceFolder[] {
  return (
    workspace.workspaceFolders?.filter(
      (workspaceFolder) => workspaceFolder.uri.fsPath,
    ) ?? []
  );
}
