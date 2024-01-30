/* eslint-disable @typescript-eslint/require-await */
import * as vscode from "vscode";
import { UncommittedChangesStatusBar } from "./managers";
import {
  COMMAND_SHOW_ADDED_REMOVED_LINE_REPORT,
  COMMAND_SHOW_CODE_TIME_REPORT,
} from "./constants";
import { TimeStatusBar } from "./managers/TimeStatusBar";
import { TrackerManager } from "./managers/TrackerManager";
import { CodeTimeReport } from "./webView/CodeTimeReport";
import { UncommittedChangesTracker } from "./managers/UncommittedChangesTracker";
import { UncommittedChangesWebview } from "./webView/UncommittedChangesWebview";

export const createCommands = (): vscode.Disposable => {
  const commands: vscode.Disposable[] = [];
  const codeTimeReport = new CodeTimeReport();
  const codeTimeReportCommand = vscode.commands.registerCommand(
    COMMAND_SHOW_CODE_TIME_REPORT,
    codeTimeReport.createReportPanel.bind(codeTimeReport),
    this,
  );
  const uncommittedChangesWebview = new UncommittedChangesWebview();
  const reportCommand = vscode.commands.registerCommand(
    COMMAND_SHOW_ADDED_REMOVED_LINE_REPORT,
    uncommittedChangesWebview.createReportPanel.bind(uncommittedChangesWebview),
    this,
  );

  commands.push(
    codeTimeReportCommand,
    reportCommand,
    new TrackerManager(),
    new TimeStatusBar(),
    new UncommittedChangesTracker(),
    new UncommittedChangesStatusBar(),
  );

  return vscode.Disposable.from(...commands);
};
