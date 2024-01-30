import { version } from "vscode";
/**
 * The function `getVscodeParams` returns an object with the editor name as "vscode" and the editor
 * version as the current version of vscode.
 */
export const getVscodeParams = () => ({
  editorName: "vscode",
  editorVersion: version,
});
