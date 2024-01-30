import { formatISO } from "../date-util";
import { OutputChannel, window } from "vscode";

type TLogKey = "error" | "log" | "info" | "warn";

export class Logger {
  /* The line `private outputChannel: vscode.OutputChannel | undefined;` declares a private property
   * named `outputChannel` of type `vscode.OutputChannel | undefined`.
   */
  private outputChannel: OutputChannel | undefined;
  private static instanse: Logger;

  private constructor() {
    this.outputChannel = window.createOutputChannel("DevBoost", "Log");
  }

  public static getInstance() {
    if (!Logger.instanse) {
      Logger.instanse = new Logger();
    }
    return Logger.instanse;
  }

  /**
   * The function logs a message to an output channel, shows the output channel if active is true, and
   * logs an error message if isError is true.
   * @param {string} message - A string representing the log message to be displayed.
   * @param {boolean} active - The `active` parameter is a boolean value that determines whether the
   * output channel should be shown or not. If `active` is `true`, the output channel will be shown. If
   * `active` is `false`, the output channel will not be shown.
   * @param [isError=false] - A boolean parameter that indicates whether the log message is an error or
   * not. If it is set to true, the log message will be printed to the console using the
   * console.error() method.
   */
  public static log(
    message: string,
    active: boolean,
    isError?: TLogKey | boolean,
  ): void {
    Logger.getInstance().outputChannel?.appendLine(
      `${formatISO(new Date())} Doppameen: ${message}`,
    );

    if (active) {
      Logger.getInstance().outputChannel?.show();
    }
    Logger.getInstance().logConsole(
      message,
      typeof isError !== "boolean" ? isError : isError ? "log" : undefined,
    );
  }

  private logConsole(msg: string, logKey?: TLogKey) {
    if (!logKey) return;
    switch (logKey) {
      case "error":
        console.error(msg);
        break;
      case "log":
        console.log(msg);
        break;
      case "info":
        console.info(msg);
        break;
      case "warn":
        console.warn(msg);
        break;
    }
  }

  /**
   * The `dispose` function disposes of the output channel if it exists.
   */
  dispose(): void {
    this.outputChannel?.dispose();
  }
}
