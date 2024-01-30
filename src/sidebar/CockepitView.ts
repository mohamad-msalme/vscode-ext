/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as vscode from "vscode";
import { WebView } from "../utils/WebView";
import { createCommands } from "../createCommands";
import { LocalStorageManager } from "../managers";
import { getUser, loginByGitHub } from "../api";
import { COMMAND_SHOW_CODE_TIME_REPORT } from "../constants";

export class CockepitView
  implements vscode.Disposable, vscode.WebviewViewProvider
{
  /* The line `private _webview: vscode.WebviewView | undefined;` declares a private property
  /* `_webview` of type `vscode.WebviewView | undefined`. 
  */
  private _webview: vscode.WebviewView | undefined;
  /* The line `private _disposable: vscode.Disposable | undefined;` declares a private property
  /* `_disposable` of type `vscode.Disposable | undefined`. This property is used to store a disposable
  /* object that can be used to clean up resources when the view is disposed. The `vscode.Disposable`
  /* type represents an object that has a `dispose` method, which can be called to release any
  /* resources held by the object. By storing the disposable object in the `_disposable` property, it
  /* can be easily accessed and disposed of when needed. 
  */
  private _disposable: vscode.Disposable | undefined;

  constructor(private readonly _extensionUri: vscode.Uri) {
    //
  }

  /**
   * This function resolves a webview view by setting its options, handling disposal, and setting its
   * HTML content.
   * @param webviewView - The `webviewView` parameter is an instance of `vscode.WebviewView`, which
   * represents the webview view that needs to be resolved.
   * @param _context - The `_context` parameter is of type `vscode.WebviewViewResolveContext<unknown>`.
   * It provides information about the resolve context of the webview view. This can include
   * information such as the view column, the view title, and any state that was previously saved for
   * the view.
   * @param _token - A cancellation token that can be used to cancel the resolve operation.
   */
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext<unknown>,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    if (!this._webview) {
      this._webview = webviewView;
    }
    this._webview.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this._disposable = vscode.Disposable.from(
      this._webview.onDidDispose(() => ({})),
    );
    this._webview.webview.html = this.getHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((e) => {
      this._onDidReceiveMessage(e as TMessage, webviewView.webview);
    });
  }

  async _onDidReceiveMessage(event: TMessage, webview: vscode.Webview) {
    switch (event.type) {
      case "logout": {
        vscode.commands.executeCommand("logout");
        webview.postMessage({
          command: "authUser",
          value: null,
        });
        break;
      }
      case "loginByGitHub": {
        try {
          await loginByGitHub();
          const user = await getUser();
          webview.postMessage({
            command: "authUser",
            value: user?.displayName,
          });
          vscode.commands.executeCommand("startExt", createCommands());
        } catch (error) {
          //
        }
        break;
      }
      case "getAuthUser": {
        const isAuth = LocalStorageManager.getAuthToken();
        const userInfo = LocalStorageManager.getUserInfo();
        webview.postMessage({
          command: "authUser",
          value: isAuth && userInfo ? userInfo.displayName : undefined,
        });

        break;
      }
      case "onError": {
        if (!event.value) {
          return;
        }
        vscode.window.showErrorMessage(event.value);
        break;
      }
      case "timeReport": {
        vscode.commands.executeCommand(COMMAND_SHOW_CODE_TIME_REPORT);
      }
    }
  }

  getHtml(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "script", "sidebar.js"),
    );
    // Codicons
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css",
      ),
    );
    // Local path to css styles
    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"),
    );
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"),
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = WebView.getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
                <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
                  
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
                <link href="${codiconsUri}" rel="stylesheet" />

				<title>DevBoost</title>
			</head>
			<body>
			<h3 id="txtfieldUsername">Loading...</h3>
      <button id="btnTime" style="display: none;">View time report</button>
			<button id="btnSigninByGitHub" class='codicon codicon-github'" style="display: none;"> Login by GitHub</button>
			<button id="btnLogout" style="display: none;">Logout</button>
            <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  /**
   * The dispose function checks if the _disposable object exists and has a dispose method, and if so,
   * calls the dispose method.
   */
  dispose() {
    this._disposable?.dispose?.();
  }

  /**
   * The `isVisible` function returns a boolean value indicating whether the `_webview` is visible or
   * not.
   * @returns The function `isVisible()` returns a boolean value indicating whether the `_webview` is
   * visible or not.
   */
  isVisible() {
    return Boolean(this._webview?.visible);
  }
}

interface TMessage {
  type: "logout" | "loginByGitHub" | "getAuthUser" | "onError" | "timeReport";
  value: string;
}
