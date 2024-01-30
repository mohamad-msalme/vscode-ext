import { execShellCommand } from "../shell-util";
import { LocalStorageManager } from "../../managers";
import { getRepoIdentifierInfo } from "./repoIdentifierHelpers";
import { getWorkspaceParamsByFile } from "../workspace-util";

const DEF_VAL = {
  projectName: "",
  projectDirectory: "",
  gitBranch: "",
  identifier: "",
  authorEmail: "",
  gitTag: "",
  repoName: "",
  authorName: "",
};

/**
 * The `getRepoParams` function retrieves various parameters related to a Git repository, such as the
 * project name, project directory, current branch, remote origin URL, author email and name, latest
 * tag, and repository name.
 * @param {string} filePath - The `filePath` parameter is a string that represents the path of a file.
 * @returns The function `getRepoParams` returns an object with the following properties:
 */
export const getRepoParams = (filePath: string) => {
  const user = LocalStorageManager.getUserInfo();

  const workspaceParams = getWorkspaceParamsByFile(filePath);

  if (!workspaceParams?.projectDirectory) {
    return DEF_VAL;
  }

  const { projectDirectory, projectName } = workspaceParams;

  const gitBranch = execShellCommand("git symbolic-ref --short HEAD", {
    cwd: projectDirectory,
  });

  const identifier = execShellCommand("git config --get remote.origin.url", {
    cwd: projectDirectory,
  });

  const authorEmail = user?.email
    ? user.email
    : execShellCommand("git config user.email", {
        cwd: projectDirectory,
      });

  const authorName = user?.displayName
    ? user.displayName
    : execShellCommand("git config user.name", {
        cwd: projectDirectory,
      });

  const gitTag = execShellCommand("git describe --all", {
    cwd: projectDirectory,
  });

  const { repoName } = getRepoIdentifierInfo(identifier);

  return {
    projectName,
    projectDirectory,
    gitBranch,
    identifier,
    authorEmail,
    authorName,
    gitTag,
    repoName,
  };
};
