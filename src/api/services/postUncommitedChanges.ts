import * as vscode from "vscode";
import { postApi } from "../axios";
import { CodeChange } from "../../managers/UncommittedChangesTracker";
import { LocalStorageManager } from "../../managers";

/**
 * The function `postUncommitedChanges` posts uncommitted code changes to an API endpoint and updates
 * the local storage with the result.
 * @param document - The `document` parameter is of type `vscode.TextDocument` and represents the
 * currently saved document in the VS Code editor. It contains information about the document, such as
 * its URI (Uniform Resource Identifier) and file system path.
 * @returns a Promise that resolves to nothing (void).
 */
export const postUncommitedChanges = async (document: vscode.TextDocument) => {
  const codeChangesData = LocalStorageManager.getUncommittedCodeChangesData();

  if (!codeChangesData) return;
  // Extract the file system path of the saved document.
  const {
    uri: { fsPath },
  } = document;

  // Find the changes related to the document by matching file paths.
  const changesToPost = codeChangesData.codeChanges.find(
    ({ filePath }) => filePath === fsPath,
  );

  // If no changes are found for the document, return early.
  if (!changesToPost) return;

  let result: { id: string };
  changesToPost.end = new Date().getTime();
  try {
    result = await postApi<{ id: string }, { id: string }, CodeChange>(
      "users/current/codetime",
      changesToPost,
    );
    // Return the result of the API request.
  } catch (error) {
    // Handle errors if the API request fails.
    // You can add error handling logic here.
  } finally {
    codeChangesData.codeChanges = codeChangesData.codeChanges.map((item) =>
      item.filePath === fsPath
        ? { ...item, ...changesToPost, id: result?.id || undefined }
        : item,
    );
    LocalStorageManager.setUncommittedCodeChangesData(codeChangesData);
  }
};
