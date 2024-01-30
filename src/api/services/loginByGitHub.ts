import * as polka from "polka";
import * as vscode from "vscode";
import { TokenType } from "../../models";
import { BACKEND_BASE_URL } from "../axios";
import { LocalStorageManager } from "../../managers";

let app: polka.Polka;

export const loginByGitHub = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    // If the server is already running, close it
    if (app?.server) {
      app.server.close(() => {
        startServer(resolve, reject);
      });
    } else {
      startServer(resolve, reject);
    }
  });
};

const startServer = (
  resolve: () => void,
  reject: (reason?: unknown) => void,
) => {
  app = polka();
  app.get("/auth/:token", (req, res) => {
    const { token } = req.params;
    if (!token) {
      res.end("Error, not authenticated!");
      app.server?.close();
      reject(new Error("Authentication failed"));
    } else {
      LocalStorageManager.setAuthToken({ token, type: TokenType.GITHUB });
      res.end("Authenticate successfully! You can close the window.");
      app.server?.close();
      resolve();
    }
  });
  app.listen(3008, (err: Error | undefined) => {
    if (err) {
      vscode.window.showErrorMessage(err.message);
      reject(err);
    } else {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(`${BACKEND_BASE_URL}/auth/github`),
      );
    }
  });
};
