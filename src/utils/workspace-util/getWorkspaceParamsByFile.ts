import { isGitRepository } from "../git-util";
import { getWorkspaceFolders } from "./getWorkspaceFolders";
import { getWorkspaceParams } from "./getWorkspaceParams";

/**
 * The function `getWorkspaceParamsByFile` returns the project directory and name based on the given
 * file path.
 * @param {string} filePath - The `filePath` parameter is a string that represents the path of a file.
 * @returns an object with the properties `projectDirectory` and `projectName`.
 */
export const getWorkspaceParamsByFile = (filePath: string) => {
  const workspaceFolder = getWorkspaceFolders().find((folder) =>
    filePath.includes(folder.name),
  );

  const { projectDir: projectDirectory, projectName } = workspaceFolder
    ? getWorkspaceParams(workspaceFolder)
    : { projectDir: "", projectName: "" };

  if (!projectName || !isGitRepository(projectDirectory)) {
    return null;
  }

  return {
    projectDirectory,
    projectName,
  };
};
