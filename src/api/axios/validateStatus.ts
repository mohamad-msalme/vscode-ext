import { Logger } from "../../utils/log-util";
import { Method } from "axios";
import * as vscode from "vscode";

export const validateStatus = (url: string, method: Method, status: number) => {
  const result = status >= 200 && status < 300;
  const isActive = Boolean(process.env.DEBUG_MODE);
  switch (status) {
    case 200:
      Logger.log(
        `Successful response (OK) ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "info",
      );
      break;
    case 201:
      Logger.log(
        `Resource created (Created) ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "info",
      );
      break;
    case 204:
      Logger.log(
        `No content (No Content) ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "info",
      );
      break;
    case 400:
      Logger.log(
        `Bad request (Bad Request) ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "error",
      );
      break;
    case 401:
      Logger.log(
        `Invalid DevBoost Authorization Token ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "error",
      );
      vscode.window.showInformationMessage(
        "Invalid DevBoost Authorization please click on Rocket icon",
      );
      break;
    case 403:
      Logger.log(
        `Forbidden (Forbidden) ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "error",
      );
      break;
    case 404:
      Logger.log(
        `Not found (Not Found) ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "error",
      );
      break;
    case 500:
      Logger.log(
        `Internal server error (Internal Server Error) ${method.toUpperCase()} ${url} ${status}`,
        isActive,
        "error",
      );
      break;
    default: {
      if (result)
        Logger.log(
          `Successful response ${method.toUpperCase()} ${url} ${status}`,
          isActive,
          "info",
        );
      else
        Logger.log(
          `Received status code ${method.toUpperCase()} ${url} ${status}`,
          isActive,
          "error",
        );
    }
  }
  return result;
};
