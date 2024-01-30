import * as fs from "fs";
import * as path from "path";
import { Uri, WorkspaceFolder, workspace } from "vscode";

/* The `GitIgnoreManager` class is responsible for managing and checking the ignore patterns defined in
 * `.gitignore` files for different workspace folders.
 */
export class GitIgnoreManager {
  /* The line `private static instance: GitIgnoreManager | null = null;` is declaring a private static
   * property named `instance` in the `GitIgnoreManager` class. This property can hold an instance of
   * the `GitIgnoreManager` class or a null value. It is initialized with a value of `null`.
   */
  private static instance: GitIgnoreManager | null = null;

  /* The line `private gitIgnoreData: Map<string, string[]> = new Map();` is declaring a private
   * property named `gitIgnoreData` in the `GitIgnoreManager` class. This property is of type
   * `Map<string, string[]>` and is initialized with a new instance of the `Map` class.
   */
  private gitIgnoreData = new Map<string, string[]>();

  /* The line `private workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined;` is declaring a
   * private property named `workspaceFolders` in the `GitIgnoreManager` class. This property can hold
   * an array of `vscode.WorkspaceFolder` objects or a value of `undefined`. It is initialized with a
   * value of `undefined`.
   */
  private workspaceFolders: readonly WorkspaceFolder[] | undefined;

  /**
   * The function initializes a private constructor and sets the workspaceFolders property to the
   * workspace folders in the vscode workspace, and then loads git ignore data.
   */
  public constructor() {
    this.workspaceFolders = workspace.workspaceFolders;
    this.loadGitIgnoreData();
  }

  /**
   * The getInstance function returns a singleton instance of the GitIgnoreManager class.
   * @returns The instance of the GitIgnoreManager class.
   */
  static getInstance(): GitIgnoreManager {
    if (!GitIgnoreManager.instance) {
      GitIgnoreManager.instance = new GitIgnoreManager();
    }
    return GitIgnoreManager.instance;
  }

  /**
   * The function reads the contents of a .gitignore file in a specified folder path and returns an
   * array of non-empty, non-commented lines.
   * @param {string} folderPath - The `folderPath` parameter is a string that represents the path to
   * the folder where the `.gitignore` file is located.
   * @returns The function `readGitIgnoreFile` returns an array of strings representing the paths
   * specified in the `.gitignore` file.
   */
  private readGitIgnoreFile(folderPath: string): string[] {
    try {
      const fileContents = fs.readFileSync(
        path.join(folderPath, ".gitignore"),
        "utf-8",
      );
      const lines = fileContents.split(/\r?\n/);
      const paths: string[] = [];
      for (const line of lines) {
        const cleanedLine = line.trim();
        if (cleanedLine && !cleanedLine.startsWith("#")) {
          paths.push(cleanedLine);
        }
      }
      return paths;
    } catch (error) {
      console.error(`Error reading .gitignore in ${folderPath}:`, error);
      return [];
    }
  }

  /**
   * The function `loadGitIgnoreData` reads the `.gitignore` file in each workspace folder and stores
   * the data in a map.
   */
  private loadGitIgnoreData() {
    if (this.workspaceFolders) {
      for (const folder of this.workspaceFolders) {
        const folderPath = folder.uri.fsPath;
        const gitIgnorePaths = this.readGitIgnoreFile(folderPath);
        const workspaceName = path.basename(folderPath);
        this.gitIgnoreData.set(workspaceName, gitIgnorePaths);
      }
    }
  }

  /**
   * The function updates the git ignore data for a specific workspace.
   * @param uri - The `uri` parameter is of type `vscode.Uri` and represents the URI of the file being
   * updated.
   */
  public updateGitIgnoreData(uri: Uri) {
    const workspaceName = this.getWorkspaceName(uri);
    if (workspaceName) {
      const gitIgnorePaths = this.readGitIgnoreFile(workspaceName);
      this.gitIgnoreData.set(workspaceName, gitIgnorePaths);
    }
  }

  /**
   * The function `getWorkspaceName` returns the name of the workspace folder that contains a given
   * URI.
   * @param uri - The `uri` parameter is of type `vscode.Uri` and represents the URI of a file or
   * folder.
   * @returns a string value representing the name of the workspace that contains the given URI. If the
   * URI does not belong to any workspace, it returns undefined.
   */
  private getWorkspaceName(uri: Uri): string | undefined {
    for (const folder of this.workspaceFolders ?? []) {
      if (uri.path.startsWith(folder.uri.path)) {
        return path.basename(folder.uri.path);
      }
    }
    return undefined;
  }

  /**
   * The function checks if a given file URI is ignored based on the patterns defined in the gitignore
   * file.
   * @param uri - The `uri` parameter is of type `vscode.Uri` and represents the URI of the file to
   * check if it is ignored.
   * @returns a boolean value.
   */
  isFileIgnored(uri: Uri): boolean {
    const workspaceName = this.getWorkspaceName(uri);
    const gitIgnorePaths = this.gitIgnoreData.get(workspaceName ?? "");
    if (!workspaceName || !gitIgnorePaths) {
      return false;
    }
    for (const pattern of gitIgnorePaths) {
      const isNegated = pattern.startsWith("!");
      const patternToCheck = isNegated ? pattern.slice(1) : pattern;

      // Convert glob pattern to regex
      const regexPattern = patternToCheck
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^\\/]*")
        .replace(/\?/g, "[^\\/]?");

      // Add anchors to match from the beginning of the string and end with a slash
      const regex = new RegExp(regexPattern);

      if (regex.test(uri.path)) {
        return !isNegated;
      }
    }
    return false;
  }
}
