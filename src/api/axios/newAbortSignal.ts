import { TIME_OUT } from "./axiosInstanse";

/**
 * The function `newAbortSignal` creates a new AbortSignal object with an optional timeout.
 * @param timeoutMs - The `timeoutMs` parameter is the number of milliseconds after which the
 * `AbortSignal` should be aborted. If no value is provided for `timeoutMs`, it will default to the
 * value of `TIME_OUT`.
 * @returns the `signal` property of the `AbortController` object.
 */
export const newAbortSignal = (timeoutMs = TIME_OUT) => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs);
  return abortController.signal;
};
