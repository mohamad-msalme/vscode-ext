import { TProjectParams } from "../../types";
import { WorkspaceFolder } from "vscode";

export const getWorkspaceParams = (
  workspace: WorkspaceFolder,
): TProjectParams => {
  return {
    projectDir: workspace.uri.fsPath,
    projectName: workspace.name,
  };
};
