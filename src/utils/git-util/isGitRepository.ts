import { join } from "path";
import { existsSync } from "fs";

/**
 * Check if a directory is the root of a Git repository by inspecting the existence of Git references.
 *
 * @param cwd - The directory path to check for being the root of a Git repository.
 * @returns `true` if the directory is the root of a Git repository, `false` otherwise.
 */
export const isGitRepository = (cwd: string): boolean => {
  try {
    // Construct the path to the `.git/refs/remotes` directory within the given directory.
    const gitRefsPath = join(cwd, ".git");

    // Check if the `.git/refs/remotes` directory exists within the given directory.
    return existsSync(gitRefsPath);
  } catch (_error: unknown) {
    return false;
  }
};