import { EventManager } from "./EventManager";
import { getCurrentTimeTrackingToday } from "../api/services/getCurrentTimeTrackingToday";
import { Disposable, StatusBarAlignment, StatusBarItem, window } from "vscode";
import { COMMAND_SHOW_CODE_TIME_REPORT } from "../constants";

export class TimeStatusBar implements Disposable {
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
    "KPM_EVENT",
    { codeTime: number; vscodeTime: number }
  >();

  /**
   * Initializes the `UncommittedChangesStatusBar` class. If the "Track Uncommitted Changes"
   * feature is not enabled, the class will not be instantiated.
   */
  constructor() {
    this.init();
  }

  /**
   * Initializes the status bar item, loads code change data, and sets up event handling.
   */
  private async init() {
    const { vscodeTime, codeTime } = await this.loadData();
    this.createStatusBar();
    this.updateStatusBarText(vscodeTime, codeTime);
    this.updateStatusBarVisibility();
    this.initEvent();
  }

  private async loadData() {
    const data = await getCurrentTimeTrackingToday();
    return {
      vscodeTime: data?.vscodeTime ?? 0,
      codeTime: data?.codeTime ?? 0,
    };
  }

  /**
   * Creates and configures the status bar item.
   */
  private createStatusBar() {
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 5);
    statusBar.command = COMMAND_SHOW_CODE_TIME_REPORT;
    this._statusBarItem = statusBar;
  }

  /**
   * Updates the status bar text with information about lines added, lines removed, and blank lines.
   * @param lineAdded - The number of lines added.
   * @param lineRemoved - The number of lines removed.
   * @param blankLine - The number of blank lines.
   */
  private updateStatusBarText(
    vscodeTimeMillSec: number,
    codeTimeMillSec: number,
  ): void {
    const vscodeTime = this.convertMillisecondsToTime(vscodeTimeMillSec);
    const codeTime = this.convertMillisecondsToTime(codeTimeMillSec);
    this._statusBarItem.text = `$(clock) VS: ${vscodeTime} | Code: ${codeTime}`;
  }

  /**
   * Updates the visibility of the status bar item based on whether the "Track Uncommitted Changes"
   * feature is enabled.
   */
  private updateStatusBarVisibility(hide = false): void {
    if (!hide) {
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
      const { eventName, payload } = event;
      if (eventName === "KPM_EVENT") {
        this.updateStatusBarText(
          payload?.vscodeTime ?? 0,
          payload?.codeTime ?? 0,
        );
      }
    });

    const subscriptions: Disposable[] = [this._statusBarItem];

    this._disposable = Disposable.from(...subscriptions);
  }

  /**
   * The function converts a given number of milliseconds into a formatted time string in the format
   * "hh:mmm".
   * @param {number} milliseconds - The `milliseconds` parameter is the number of milliseconds that you
   * want to convert to a time format.
   * @returns a string representing the time in the format "hh:mmm" or "mmm" depending on the value of
   * the input milliseconds.
   */
  convertMillisecondsToTime(milliseconds: number): string {
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    if (hours > 0) {
      return `${this.padWithZero(hours)}:${this.padWithZero(minutes)}m`;
    } else if (minutes > 9) {
      return `${minutes}m`;
    } else {
      return `${this.padWithZero(minutes)}m`;
    }
  }

  /**
   * The function pads a number with a leading zero if it is less than 10.
   * @param {number} value - The value parameter is a number that we want to pad with a zero if it is
   * less than 10.
   * @returns a string.
   */
  padWithZero(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  /**
   * Disposes of resources and subscriptions held by the `UncommittedChangesStatusBar` instance.
   */
  public dispose(): void {
    this._disposable.dispose();
  }
}
