import * as vscode from "vscode";
import { getCodeTimeReport } from "../api/services/getCodeTimeReport";
import { generateHtmlError } from "../utils/generateHtmlError";
import { Disposable, ViewColumn, WebviewPanel, window } from "vscode";
export class CodeTimeReport implements Disposable {
  private _webview: WebviewPanel | undefined;
  public async createReportPanel() {
    // Create and show a webview panel
    if (this._webview) return;
    const viewColumn = window.activeTextEditor?.viewColumn ?? ViewColumn.One;

    this._webview = window.createWebviewPanel(
      "reportPanel",
      "Code Time Report",
      viewColumn, // Adjust the column as needed
      {
        enableScripts: true,
      },
    );
    this._webview.title = "Code Time Report";
    try {
      this._webview.webview.html = await getCodeTimeReport();
    } catch (error) {
      this._webview.webview.html = generateHtmlError();
      vscode.window.showErrorMessage(
        "Somhing went wrong please close time report and try again",
      );
    }
    this._webview.onDidDispose(() => (this._webview = undefined));
  }

  public dispose(): void {
    this._webview?.dispose();
  }
}
