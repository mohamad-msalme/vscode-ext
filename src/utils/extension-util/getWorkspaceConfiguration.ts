import { WorkspaceConfiguration, workspace } from "vscode";
/**
 * The function `getWorkspaceConfiguration` returns the workspace configuration for the "cockepit"
 * extension in TypeScript.
 * @returns a `vscode.WorkspaceConfiguration` object.
 */
export const getWorkspaceConfiguration = (): WorkspaceConfiguration => {
  return workspace.getConfiguration("devboost");
};
