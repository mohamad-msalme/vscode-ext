import { logShellError } from "../log-util";
import { execSync, ExecSyncOptionsWithStringEncoding } from "child_process";

/**
 * Execute a shell command using execSync and log errors.
 *
 * @param cmd - The shell command to execute.
 * @param opts - Optional options for execSync.
 * @returns The result of executing the shell command or null if an error occurs.
 */
export const execShellCommand = (
  cmd: string,
  opts?: Partial<ExecSyncOptionsWithStringEncoding>,
) => {
  let cmdResult = ""; // Initialize cmdResult
  try {
    // Execute the shell command and store the result
    cmdResult = execSync(cmd, { ...opts, encoding: "utf8" });
  } catch (_err: unknown) {
    logShellError(cmd, _err);
    return "";
  }

  // Return the result of executing the shell command
  return cmdResult.trim();
};
