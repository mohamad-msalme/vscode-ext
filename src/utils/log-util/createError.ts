/**
 * Create a custom or rethrow an existing error with an optional message.
 *
 * @param error - An error object, or any value with a 'message' property.
 * @param message - An optional custom error message to assign to the error.
 * @returns An Error object with the provided message or the original error's message.
 */
export const createError = (error: unknown, message?: string): Error => {
  if (error instanceof Error) {
    // If 'error' is already an instance of Error, optionally update its message.
    if (message) {
      error.message = message;
    }
    return error;
  }

  // If 'error' is not an instance of Error, construct a new Error with the provided message or a default message.
  const errorMessage =
    message ?? (error as { message: string })?.message ?? "An error occurred";
  return new Error(errorMessage);
};
