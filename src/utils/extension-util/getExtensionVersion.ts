/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { extensions } from "vscode";

/**
 * The function `getExtensionVersion` returns the version of the "Cockepit.vscode-cockepit" extension
 * installed in Visual Studio Code.
 * @returns The function `getExtensionVersion` returns a string value. The string value is either the
 * version number of the "Cockepit.vscode-cockepit" extension if it is installed and its packageJSON is
 * available, or it returns the string "0.0.1" if the extension is not installed or its packageJSON is
 * not available.
 */
export const getExtensionVersion = (): string => {
  const extension = extensions.getExtension("DevBoost-Team.DevBoost");
  return extension?.packageJSON ? extension.packageJSON.version : "0.0.1";
};
