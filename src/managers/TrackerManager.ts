import { EventManager } from "./EventManager";
import { GitIgnoreManager } from "./GitIgnoreManager";
import { CONFIG_STATUS_BAR } from "../constants";
import { getRepoIdentifierByFile } from "../utils/git-util";
import { getWorkspaceConfigurationValue } from "../utils/extension-util";
import {
  getCurrentTimeTrackingToday,
  postTimeTracking,
  postUncommitedChanges,
} from "../api";

import {
  Disposable,
  FileRenameEvent,
  Terminal,
  TextDocument,
  TextDocumentChangeEvent,
  WindowState,
  window,
  workspace,
} from "vscode";

/* The `TrackerManager` class is responsible for tracking code changes and project events in the VS
Code editor. */
export class TrackerManager extends GitIgnoreManager implements Disposable {
  repos: string[] = [];
  kpmRepos: Record<string, number> = {};
  /* The line `private startTimeTrackingSessionPoint = 0;` is declaring and initializing a private
  class property `startTimeTrackingSessionPoint` with a value of 0. This property is used to store
  the starting time of a time tracking session in milliseconds. */
  private startTimeTrackingSessionPoint = 0;

  /* The line `private DEFAULT_DURATION_SEC = 60;` is declaring and initializing a private class
  property `DEFAULT_DURATION_SEC` with a value of 60. This property represents the default duration
  of a time tracking session in seconds. */
  private DEFAULT_DURATION_SEC = 60;

  /* The line `private DEFAULT_DURATION_MILLIS = this.DEFAULT_DURATION_SEC * 1000;` is declaring and
  initializing a private class property `DEFAULT_DURATION_MILLIS` with a value that is calculated by
  multiplying the value of `DEFAULT_DURATION_SEC` by 1000. */
  private DEFAULT_DURATION_MILLIS = this.DEFAULT_DURATION_SEC * 1000;

  /* The line `private debounceTimer: NodeJS.Timer | undefined;` is declaring a private class property
  `debounceTimer` with a type of `NodeJS.Timer | undefined`. This property is used to store a timer
  that is used for debouncing events. The `NodeJS.Timer` type represents a timer object returned by
  the `setTimeout` function in Node.js. By setting the type to `NodeJS.Timer | undefined`, it allows
  the property to hold a reference to a timer object or be undefined if no timer is currently
  active. */
  private debounceTimer: NodeJS.Timer | undefined;

  /* The line `private readonly debounceDelay: number = 50; // Adjust this value as needed` is
  declaring and initializing a private class property `debounceDelay` with a value of 50. This
  property represents the delay in milliseconds for debouncing events. Debouncing is a technique
  used to limit the rate at which a function is called. In this case, it is used to delay the
  execution of the `onTextDocumentChange` function when a text document is changed. By adjusting the
  value of `debounceDelay`, you can control the delay between consecutive calls to the
  `onTextDocumentChange` function. */
  private readonly debounceDelay: number = 50; // Adjust this value as needed

  private isTimeTrackingSession: NodeJS.Timer | undefined;

  private _disposable!: Disposable;

  private kpm = 0;

  eventManager = EventManager.getInstance();

  constructor() {
    super();
    this.initEvents();
  }

  /**
   * The `initEvents` function initializes event listeners for various actions in the TypeScript code.
   */
  private initEvents() {
    const subscriptions: Disposable[] = [];

    window.onDidChangeWindowState(
      this.onWindowStateChange.bind(this),
      this,
      subscriptions,
    );

    window.onDidChangeActiveTerminal(
      this.startTimeTrackingSession.bind(this, undefined),
      this,
      subscriptions,
    );

    window.onDidChangeTerminalState(
      this.onTerminalStateChange.bind(this),
      this,
      subscriptions,
    );

    workspace.onDidOpenTextDocument(
      this.onOpenTextDocument.bind(this),
      this,
      subscriptions,
    );

    workspace.onDidCloseTextDocument(
      this.onOpenTextDocument.bind(this),
      this,
      subscriptions,
    );

    workspace.onDidSaveTextDocument(
      this.onSaveTextDocument.bind(this),
      this,
      subscriptions,
    );

    workspace.onDidChangeTextDocument(
      this.onTextDocumentChange.bind(this),
      this,
      subscriptions,
    );

    workspace.onDidRenameFiles(
      (e: FileRenameEvent) => {
        this.startTimeTrackingSession(e.files[0].newUri.fsPath);
        this.eventManager.fire("document_rename", e);
      },
      this,
      subscriptions,
    );

    workspace.onDidDeleteFiles(
      (e) => {
        //
        e.files.forEach((file) => {
          this.startTimeTrackingSession(file.fsPath);
        });
        this.eventManager.fire("document_delete", e);
      },
      this,
      subscriptions,
    );

    this._disposable = Disposable.from(...[...subscriptions]);
  }

  /**
   * The function checks if the VS Code window state is available, if the file event should be tracked
   * for the given document, and then starts tracking the session.
   * @param {TextDocument} document - The document parameter is of type TextDocument and represents the
   * text document that was opened in the editor.
   * @returns In the given code snippet, if the condition `!this.getVscodeWindowState()` or
   * `!this.shouldTrackFileEvent(document)` is true, then the function will return and no value will be
   * returned.
   */
  private onOpenTextDocument(document: TextDocument) {
    if (!this.getVscodeWindowState()) {
      return;
    }
    if (!this.shouldTrackFileEvent(document)) {
      return;
    }
    this.startTimeTrackingSession(document.uri.fsPath);
  }

  /**
   * The function checks if the window state is not focused and ends the tracking session if it is not.
   * @param {WindowState} windowState - The parameter `windowState` is of type `WindowState`.
   */
  private onWindowStateChange(windowState: WindowState) {
    if (!windowState.focused) {
      this.endTimeTrackingSession();
    }
  }

  /**
   * The function checks if the terminal has been interacted with and starts a time tracking session if
   * it has.
   * @param {Terminal} [terminal] - The terminal parameter is an optional parameter of type Terminal.
   */
  private onTerminalStateChange(terminal?: Terminal) {
    if (terminal?.state.isInteractedWith) {
      this.startTimeTrackingSession();
    }
  }

  /**
   * The function saves a text document, posts uncommitted changes if a certain feature is enabled, and
   * starts a time tracking session.
   * @param {TextDocument} document - The document parameter is of type TextDocument and represents the
   * text document that is being saved.
   */
  private async onSaveTextDocument(document: TextDocument) {
    if (this.isTrackUncommitChangesFeatureEnabled()) {
      await postUncommitedChanges(document);
    }
    this.startTimeTrackingSession(document.uri.fsPath);
  }

  /**
   * The function handles changes to a text document, updates gitignore data if the document is a
   * gitignore file, and triggers an event if the document should be tracked.
   * @param {TextDocumentChangeEvent} e - The parameter `e` is of type `TextDocumentChangeEvent` and
   * represents the event that occurred when the text document was changed. It contains information
   * about the document and the changes made to it.
   * @returns If there are no content changes in the document, the function will return and not execute
   * any further code.
   */
  private onTextDocumentChange(e: TextDocumentChangeEvent) {
    const { document, contentChanges } = e;

    if (!contentChanges.length) {
      return;
    }

    if (document.fileName.endsWith(".gitignore")) {
      this.updateGitIgnoreData(document.uri);
    }

    if (!this.shouldTrackFileEvent(document)) {
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(
      () => this.eventManager.fire("document_change", e),
      this.debounceDelay,
    );
    const repoIdntifier = getRepoIdentifierByFile(document.uri.fsPath);
    if (repoIdntifier) {
      this.kpmRepos[repoIdntifier] = (this.kpmRepos[repoIdntifier] || 0) + 1;
    }
    this.kpm = this.kpm + 1;
    this.startTimeTrackingSession(document.uri.fsPath);
  }

  /**
   * The function starts a time tracking session if project changes are not being watched.
   */
  private startTimeTrackingSession(filePath?: string) {
    if (!this.isTimeTrackingSession) {
      this.startTimeTrackingSessionPoint = new Date().getTime();
      this.isTimeTrackingSession = setTimeout(() => {
        this.endTimeTrackingSession();
      }, this.DEFAULT_DURATION_MILLIS);
    }
    if (filePath) {
      const repoIdntifier = getRepoIdentifierByFile(filePath);
      if (repoIdntifier && !this.repos.includes(repoIdntifier)) {
        this.repos.push(repoIdntifier);
      }
    }
  }

  /**
   * The function `endTimeTrackingSession` calculates the time session, resets the time tracking
   * session, and posts the time tracking data.
   * @returns The function does not explicitly return anything.
   */
  private async endTimeTrackingSession() {
    if (!this.isTimeTrackingSession) return;

    const dataToSave = this.calculateTimeSession();
    this.resetTimeTrackingSession();
    try {
      await postTimeTracking(dataToSave);
      const data = await getCurrentTimeTrackingToday();
      this.eventManager.fire("KPM_EVENT", {
        codeTime: data?.codeTime ?? 0,
        vscodeTime: data?.vscodeTime ?? 0,
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * The function calculates the time spent on code and VSCode, updates the KPM (keystrokes per minute)
   * value, and fires an event with the updated code time and VSCode time.
   */
  private calculateTimeSession() {
    const oneMinuteAgo =
      new Date().getTime() - this.startTimeTrackingSessionPoint;
    return {
      id: null,
      KPM: this.kpm,
      vscodeTime: oneMinuteAgo,
      codeTime: this.kpm > 0 ? oneMinuteAgo : 0,
      repos: this.repos.map((repo) => ({
        [repo]: {
          vscodeTime: oneMinuteAgo,
          codeTime: this.kpmRepos[repo] ? oneMinuteAgo : 0,
          kpm: this.kpmRepos[repo] || 0,
        },
      })),
    };
  }

  /**
   * The function resets the time tracking session by setting the kpm (keystrokes per minute) to 0 and
   * clearing the timeout for watching project changes.
   */
  private resetTimeTrackingSession() {
    this.kpm = 0;
    this.kpmRepos = {};
    this.repos = [];
    clearTimeout(this.isTimeTrackingSession);
    this.isTimeTrackingSession = undefined;
  }

  /**
   * The function determines whether a file event should be tracked based on the document's scheme and
   * file name.
   * @param document - The `document` parameter is of type `vscode.TextDocument` and represents the
   * currently opened document in the VS Code editor.
   * @returns a boolean value. It returns true if the document should be tracked for file events, and
   * false otherwise.
   */
  private shouldTrackFileEvent(document: TextDocument) {
    const { uri, fileName } = document;

    if (!fileName) {
      return false;
    }

    const scheme = uri.scheme ?? "";

    const isOpenableDocumentScheme = scheme === "file" || scheme === "untitled";

    const isLiveshareTmpFile = fileName.match(
      /.*\.code-workspace.*vsliveshare.*tmp-.*/,
    );

    if (!isOpenableDocumentScheme || isLiveshareTmpFile) {
      return false;
    }

    return true;
  }

  /**
   * The function checks if the "Track Uncommitted Changes" feature is enabled in the workspace
   * configuration.
   * @returns the value of the workspace configuration for the "status" property in the
   * CONFIG_STATUS_BAR object. If the value is not found, it will default to true.
   */
  private isTrackUncommitChangesFeatureEnabled() {
    return getWorkspaceConfigurationValue(CONFIG_STATUS_BAR.status, true);
  }

  /**
   * The function returns the focused state of the VS Code window.
   * @returns The focused state of the VS Code window.
   */
  private getVscodeWindowState() {
    return window.state.focused;
  }

  /**
   * The dispose function is used to dispose of a disposable object.
   */
  dispose() {
    this._disposable.dispose();
  }
}
