import { execShellCommand } from "../shell-util";
import { getWorkspaceParamsByFile } from "../workspace-util";

/**
 * The function `getRepoIdentifierByFile` returns the remote origin URL of a Git repository based on
 * the file path.
 * @param {string} filePath - A string representing the file path of the file for which we want to get
 * the repository identifier.
 * @returns the identifier of the remote origin URL of a Git repository.
 */
export const getRepoIdentifierByFile = (filePath: string) => {
  const workSpaceParams = getWorkspaceParamsByFile(filePath);

  if (!workSpaceParams?.projectDirectory) {
    return null;
  }

  try {
    const identifier = execShellCommand("git config --get remote.origin.url", {
      cwd: workSpaceParams.projectDirectory,
    });
    return identifier;
  } catch (error) {
    return null;
  }
};
