import { version } from "vscode";
import { getExtensionVersion } from "./getExtensionVersion";

/**
 * The function `getUserAgentPlugin` returns a string that represents the user agent plugin.
 */
export const getUserAgentPlugin = () =>
  `vscode/${version} vscode-cockepit/${getExtensionVersion()}`;
