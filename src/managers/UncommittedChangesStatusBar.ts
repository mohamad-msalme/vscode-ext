import { EventManager } from "./EventManager";
import { CodeChangeSummary } from "./UncommittedChangesTracker";
import { getUncommitedChangesToday } from "../api";
import { getWorkspaceConfigurationValue } from "../utils/extension-util";
import {
  CONFIG_STATUS_BAR,
  CONFIG_STATUS_BAR_WITH_SCOPE,
  COMMAND_SHOW_ADDED_REMOVED_LINE_REPORT,
} from "../constants";
import {
  ConfigurationChangeEvent,
  Disposable,
  StatusBarAlignment,
  StatusBarItem,
  window,
  workspace,
} from "vscode";

/**
 * The `UncommittedChangesStatusBar` class manages the status bar item in Visual Studio Code
 * that displays the summary of uncommitted code changes, including lines added, lines removed,
 * and blank lines.
 */
export class UncommittedChangesStatusBar implements Disposable {
  /**
   * A disposable object that keeps track of resources and subscriptions to be disposed of
   * when the extension is deactivated.
   */
  private _disposable!: Disposable;

  /**
   * The status bar item displayed in the Visual Studio Code status bar.
   */
  private _statusBarItem!: StatusBarItem;

  /**
   * An instance of the `EventManager` used to manage and handle events related to updating
   * the uncommitted changes status bar text.
   */
  private eventManager = EventManager.getInstance<
    "updateUncommittedChangesStatusBarText",
    CodeChangeSummary
  >();

  /**
   * Initializes the `UncommittedChangesStatusBar` class. If the "Track Uncommitted Changes"
   * feature is not enabled, the class will not be instantiated.
   */
  constructor() {
    if (!this.isTrackUncommitChangesFeatureEnabled()) {
      return;
    }
    this.init();
  }

  /**
   * Initializes the status bar item, loads code change data, and sets up event handling.
   */
  private async init() {
    const { linesAdded, linesDeleted, blankLine } = await this.loadData();
    this.createStatusBar();
    this.updateStatusBarText(linesAdded, linesDeleted, blankLine);
    this.updateStatusBarVisibility();
    this.initEvent();
  }

  /**
   * Loads and calculates code change summary data from the data provider.
   * @returns A `CodeChangeSummary` object representing the lines added, lines removed, and
   * blank lines.
   */
  private async loadData(): Promise<CodeChangeSummary> {
    let codeSummaryChanges: CodeChangeSummary = {
      linesAdded: 0,
      linesDeleted: 0,
      blankLine: 0,
    };

    const result = await getUncommitedChangesToday();
    codeSummaryChanges = result.reduce(
      (acc, item) => ({
        ...acc,
        blankLine: acc?.blankLine + item.blankLine,
        linesAdded: acc.linesAdded + item.linesAdded,
        linesDeleted: acc.linesDeleted + item.linesDeleted,
      }),
      codeSummaryChanges,
    );
    return codeSummaryChanges;
  }

  /**
   * Creates and configures the status bar item.
   */
  private createStatusBar() {
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 6);
    statusBar.tooltip = "Display the lines you added or removed";
    statusBar.command = COMMAND_SHOW_ADDED_REMOVED_LINE_REPORT;
    this._statusBarItem = statusBar;
  }

  /**
   * Updates the status bar text with information about lines added, lines removed, and blank lines.
   * @param lineAdded - The number of lines added.
   * @param lineRemoved - The number of lines removed.
   * @param blankLine - The number of blank lines.
   */
  private updateStatusBarText(
    lineAdded: number,
    lineRemoved: number,
    blankLine: number,
  ): void {
    this._statusBarItem.text = `$(rocket) L+: ${lineAdded} | L-: ${lineRemoved} | LB: ${blankLine}`;
  }

  /**
   * Updates the visibility of the status bar item based on whether the "Track Uncommitted Changes"
   * feature is enabled.
   */
  private updateStatusBarVisibility(): void {
    if (this.isTrackUncommitChangesFeatureEnabled()) {
      this._statusBarItem.show();
    } else {
      this._statusBarItem.hide();
    }
  }

  /**
   * Initializes event listeners for handling updates to the status bar item text and configuration changes.
   */
  private initEvent() {
    this.eventManager.listen((event) => {
      if (event.eventName === "updateUncommittedChangesStatusBarText") {
        this.updateStatusBarText(
          event.payload?.linesAdded ?? 0,
          event.payload?.linesDeleted ?? 0,
          event.payload?.blankLine ?? 0,
        );
      }
    });
    const subscriptions: Disposable[] = [
      this._statusBarItem,
      this.eventManager,
    ];
    workspace.onDidChangeConfiguration(
      this.onChangeConfigurationEvent.bind(this),
      this,
      subscriptions,
    );

    this._disposable = Disposable.from(...subscriptions);
  }

  /**
   * Handles configuration change events, such as changes to the "Track Uncommitted Changes" setting.
   * @param e - The `ConfigurationChangeEvent` object representing the configuration changes.
   */
  private async onChangeConfigurationEvent(e: ConfigurationChangeEvent) {
    if (e.affectsConfiguration(CONFIG_STATUS_BAR_WITH_SCOPE.status)) {
      if (getWorkspaceConfigurationValue(CONFIG_STATUS_BAR.status, true)) {
        await this.init();
      } else {
        this.updateStatusBarVisibility();
      }
    }
  }

  /**
   * Checks whether the "Track Uncommitted Changes" feature is enabled by querying the workspace configuration.
   * @returns `true` if the feature is enabled; otherwise, `false`.
   */
  private isTrackUncommitChangesFeatureEnabled() {
    return getWorkspaceConfigurationValue(CONFIG_STATUS_BAR.status, true);
  }

  /**
   * Disposes of resources and subscriptions held by the `UncommittedChangesStatusBar` instance.
   */
  public dispose(): void {
    this._disposable.dispose();
  }
}
