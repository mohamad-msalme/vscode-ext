/**
 * Log a shell command error and return the error object.
 *
 * @param cmd - The shell command that resulted in an error.
 * @param _error - The error object or any value with a 'message' property.
 * @returns The error object with the provided message.
 */
import { Logger } from "./Logger";
import { createError } from "./createError";

export const logShellError = (cmd: string, _error: unknown): Error => {
  // Create or modify an error object with the given error value.
  const error = createError(_error);

  // Construct the error message, including the executed shell command.
  const errorMessage = `Error executing shell command '${cmd}': ${error.message}`;

  // Log the error message with the Logger and return the error.
  Logger.log(errorMessage, false, true);
  return error;
};
