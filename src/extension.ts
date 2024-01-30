/* eslint-disable @typescript-eslint/require-await */
import * as vscode from "vscode";
import { Logger } from "./utils/log-util";
import { CockepitView } from "./sidebar/CockepitView";
import { createCommands } from "./createCommands";
import { ExtensionContext } from "vscode";
import { GitIgnoreManager } from "./managers/GitIgnoreManager";
import { LocalStorageManager } from "./managers";
import { WEB_VIEW_SIDE_BAR_ID } from "./constants/views";
import { getUser, loginByGitHub } from "./api";
import { COMMAND_AUTH_GITHUB, COMMAND_HELLO } from "./constants";

let extensionDisposables: vscode.Disposable;
const looger = Logger.getInstance();
const commands: vscode.Disposable[] = [looger];

export function activate(context: ExtensionContext) {
  // Initialize the cockepit
  GitIgnoreManager.getInstance();
  LocalStorageManager.getInstance(context);
  const sideBar = new CockepitView(context.extensionUri);

  commands.push(
    vscode.commands.registerCommand(COMMAND_HELLO, () => {
      vscode.window.showInformationMessage("Hello World from DevBoost!");
    }),
  );

  commands.push(
    vscode.commands.registerCommand(COMMAND_AUTH_GITHUB, async () => {
      if (LocalStorageManager.getAuthToken()) {
        vscode.window.showInformationMessage("You have already log in");
      }
      await loginByGitHub();
      await getUser();
    }),
  );

  commands.push(
    vscode.commands.registerCommand("startExt", (test: vscode.Disposable) => {
      extensionDisposables = test;
      context.subscriptions.push(test);
    }),
  );

  commands.push(
    vscode.window.registerWebviewViewProvider(WEB_VIEW_SIDE_BAR_ID, sideBar, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }),
  );

  commands.push(
    vscode.commands.registerCommand("logout", () => {
      LocalStorageManager.setAuthToken(undefined);
      LocalStorageManager.setUserInfo(undefined);
      extensionDisposables.dispose();
    }),
  );
  // Initialize cockepit
  context.subscriptions.push(vscode.Disposable.from(...commands));
  if (LocalStorageManager.getAuthToken()) {
    vscode.commands.executeCommand("startExt", createCommands());
  } else {
    vscode.window.showInformationMessage(
      "please login by git-hib account, click on rocket icon on left bar and login",
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  extensionDisposables.dispose();
  vscode.Disposable.from(...commands).dispose();
}
