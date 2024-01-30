import * as path from "path";
import {
  Disposable,
  FileDeleteEvent,
  FileRenameEvent,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
  TextEditor,
  Uri,
  window,
} from "vscode";

import { EventManager } from "./EventManager";
import { getRepoParams } from "../utils/git-util";
import { GitIgnoreManager } from "./GitIgnoreManager";
import { CONFIG_STATUS_BAR } from "../constants";
import { LocalStorageManager } from "./LocalStorageManager";
import { diffChars, diffLines } from "diff";
import {
  getVscodeParams,
  getWorkspaceConfigurationValue,
} from "../utils/extension-util";
import { removeApi } from "../api";

/**
 * The `UncommittedChangesTracker` class is responsible for tracking uncommitted code changes within
 * open files and providing granular insights into the modifications made to the code.
 */
export class UncommittedChangesTracker implements Disposable {
  /* The above code is declaring a private property `_disposable` of type `Disposable` in a
 /* TypeScript class. The property is being initialized with the value `undefined`. 
 */
  private _disposable!: Disposable;

  private gitIgnoreManager: GitIgnoreManager = GitIgnoreManager.getInstance();

  private eventManager = EventManager.getInstance();

  /**
   * The constructor function initializes the class and sets up event listeners.
   */
  constructor() {
    this.init();
    this.initEvent();
  }

  /**
   * The `init` function initializes the code changes data by setting default values if no data is
   * found in the local storage.
   */
  private init() {
    const value = LocalStorageManager.getUncommittedCodeChangesData();
    if (!value) {
      const codeChangesData: CodeChangesData = {
        lastModifiedTimestamp: Date.now(),
        totalLinesChanged: 0,
        codeChangeSummary: {
          linesAdded: 0,
          blankLine: 0,
          linesDeleted: 0,
        },
        codeChanges: [],
      };
      if (this.isTrackUncommitChangesFeatureEnabled())
        LocalStorageManager.deleteTempKeys();
      LocalStorageManager.setUncommittedCodeChangesData(codeChangesData);
    }
  }

  /**
   * The `initEvent` function initializes event listeners for various actions in the VS Code editor.
   */
  private initEvent() {
    const subscriptions: Disposable[] = [];
    this.eventManager.listen((e) => {
      if (e.eventName === "document_change") {
        const { document, contentChanges } =
          e.payload as TextDocumentChangeEvent;
        this.trakUncommitedChanges(document, contentChanges);
      }
      if (e.eventName === "document_rename") {
        this.onRenameFile(e.payload as FileRenameEvent);
      }
      if (e.eventName === "document_delete") {
        (e.payload as FileDeleteEvent).files.forEach((file) => {
          this.onDeleteFile(file);
        });
      }
    });

    window.onDidChangeVisibleTextEditors(
      this.onChangeVisibleTextEditorsEvent.bind(this),
      this,
      subscriptions,
    );

    this._disposable = Disposable.from(...[...subscriptions]);
  }

  /**
   * This function handles the deletion of a file and updates the code change data accordingly.
   * @param event - The `event` parameter is of type `FileDeleteEvent` and represents the event
   * that is triggered when a file is deleted. It contains information about the deleted file(s), such
   * as their paths and file system paths.
   * @returns nothing (undefined) if the conditions `!this.isTrackUncommitChangesFeatureEnabled() ||
   * !codeChangesData` are met.
   */
  private async onDeleteFile(file: Uri) {
    const { path, fsPath } = file;
    const codeChangesData = LocalStorageManager.getUncommittedCodeChangesData();
    if (!this.isTrackUncommitChangesFeatureEnabled() || !codeChangesData)
      return;

    const indexToDelete = codeChangesData.codeChanges.findIndex(
      (item) => item.filePath === fsPath,
    );

    if (indexToDelete < 0) return;

    try {
      if (codeChangesData.codeChanges[indexToDelete].id) {
        await removeApi(
          `users/current/codetime/${codeChangesData.codeChanges[indexToDelete].id}`,
        );
      }
    } catch (error) {
      //
    }

    codeChangesData.codeChanges = [
      ...codeChangesData.codeChanges.slice(0, indexToDelete),
      ...codeChangesData.codeChanges.slice(indexToDelete + 1),
    ];

    codeChangesData.codeChangeSummary = this.calculateCodeSummaryChanges(
      codeChangesData.codeChanges,
    );

    codeChangesData.totalLinesChanged = this.calculateTotalLineChanges(
      codeChangesData.codeChangeSummary,
    );

    codeChangesData.lastModifiedTimestamp = Date.now();
    LocalStorageManager.setUncommittedCodeChangesData(codeChangesData);
    LocalStorageManager.deleteValue(
      `${LocalStorageManager.TEMP_DATA_KEY}${path}`,
    );

    this.eventManager.fire(
      "updateUncommittedChangesStatusBarText",
      codeChangesData.codeChangeSummary,
    );
  }

  /**
   * The function tracks uncommitted changes in a given document and updates and stores the changes.
   * @param document - The document parameter is of type TextDocument, which represents a text
   * document in the Visual Studio Code editor. It contains information about the document's content,
   * such as the text, language, and file path.
   * @returns If the `isTrackUncommitChangesFeatureEnabled()` function returns `false`, then nothing is
   * being returned. If it returns `true`, then the `updateAndStoreDocumentChanges(changes)` function
   * is being called.
   */
  private trakUncommitedChanges(
    document: TextDocument,
    contentChanges: readonly TextDocumentContentChangeEvent[],
  ): void {
    if (!this.isTrackUncommitChangesFeatureEnabled()) return;
    const changes = this.calculateDocumentChanges(document, contentChanges);
    this.updateAndStoreDocumentChanges(changes);
  }

  /**
   * The function calculates the changes made to a document and returns an object containing
   * information about the changes.
   * @param document - The `document` parameter is of type `TextDocument` and represents the
   * text document that has been changed.
   * @param contentChanges - An array of `TextDocumentContentChangeEvent` objects that represent
   * the changes made to the document. Each `TextDocumentContentChangeEvent` object has the
   * following properties:
   * @returns an object of type `CodeChange`.
   */
  private calculateDocumentChanges(
    document: TextDocument,
    _contentChanges: readonly TextDocumentContentChangeEvent[],
  ): CodeChange {
    const newCode = document.getText();
    const { languageId, lineCount, uri } = document;

    const vscodeParams = getVscodeParams();
    const key = this.generateUniqueKey(uri);
    const oldCode = LocalStorageManager.getValue(key);
    const repoParams = getRepoParams(document.uri.fsPath);
    const lines = this.calculateDocumentDiffLines(oldCode, newCode);
    const characters = this.calculateDocumentDiffChars(oldCode, newCode);
    return {
      ...lines,
      ...characters,
      ...repoParams,
      ...vscodeParams,
      keystrokes: 1,
      lang: languageId,
      lineCount: lineCount,
      filePath: uri.fsPath,
      updatedDate: Date.now(),
      eventType: "UNCOMMITTED_CHANGES",
      fileName: path.basename(uri.path),
    };
  }

  /**
   * The function calculates the number of lines added, lines deleted, and blank lines in the
   * difference between two code documents.
   * @param {string} oldCode - The `oldCode` parameter is a string that represents the original code
   * before any changes were made.
   * @param {string} newCode - The `newCode` parameter is a string that represents the updated version
   * of a document or code.
   * @returns The function `calculateDocumentDiffLines` returns an object with three properties:
   * `linesAdded`, `linesDeleted`, and `blankLine`.
   */
  private calculateDocumentDiffLines(oldCode: string, newCode: string) {
    let [linesAdded, linesDeleted, blankLine] = [0, 0, 0];
    const lines = diffLines(oldCode, newCode);
    lines.forEach((part) => {
      if (part.added) {
        linesAdded += part.count!;
        if (part.value && part.value.trim() === "") {
          const matches = part.value.match(/\r?\n/g);
          blankLine += matches ? matches.length : blankLine;
        }
      } else if (part.removed) {
        linesDeleted += part.count!;
        if (part.value && part.value.trim() === "") {
          const matches = part.value.match(/\r?\n/g);
          blankLine += matches ? matches.length : blankLine;
        }
      }
    });
    return { linesAdded, linesDeleted, blankLine };
  }

  /**
   * The function calculates the number of characters added, deleted, and the total character count
   * between two versions of a document.
   * @param {string} oldCode - The `oldCode` parameter is a string that represents the original code
   * before any changes were made.
   * @param {string} newCode - The `newCode` parameter is a string that represents the updated version
   * of a document or code.
   * @returns an object with the following properties:
   * - charactersAdded: the number of characters that were added in the new code compared to the old
   * code.
   * - charactersDeleted: the number of characters that were deleted in the new code compared to the
   * old code.
   * - characterCount: the total number of characters in the new code.
   */
  private calculateDocumentDiffChars(oldCode: string, newCode: string) {
    let [charactersAdded, charactersDeleted] = [0, 0];

    const characters = diffChars(oldCode, newCode);
    characters.forEach((char) => {
      if (char.added && char.count) charactersAdded += char.count;
      if (char.removed && char?.count) charactersDeleted += char.count;
    });

    return {
      charactersAdded,
      charactersDeleted,
      characterCount: newCode.length,
    };
  }

  /**
   * The function updates and stores document changes in local storage.
   * @param {CodeChange} codeChange - The `codeChange` parameter is an object that represents a
   * specific change made to the code. It contains information such as the file path, line number, and
   * the actual code change (e.g., added, modified, or deleted).
   * @returns If `codeChangesData` is falsy (null, undefined, false, 0, etc.), then nothing is being
   * returned.
   */
  private updateAndStoreDocumentChanges(codeChange: CodeChange) {
    const codeChangesData = LocalStorageManager.getUncommittedCodeChangesData();
    if (!codeChangesData) return;
    const newData: CodeChangesData = {
      ...codeChangesData,
      lastModifiedTimestamp: Date.now(),
      codeChanges: this.calculateCodeChanges(
        codeChangesData.codeChanges,
        codeChange,
      ),
    };

    newData.codeChangeSummary = this.calculateCodeSummaryChanges(
      newData.codeChanges,
    );

    newData.totalLinesChanged = this.calculateTotalLineChanges(
      newData.codeChangeSummary,
    );

    LocalStorageManager.setUncommittedCodeChangesData(newData);
    this.eventManager.fire(
      "updateUncommittedChangesStatusBarText",
      newData.codeChangeSummary,
    );
  }

  /**
   * The function calculates code changes by checking if a code change already exists in a list, and
   * either adds it or updates it accordingly.
   * @param {CodeChange[]} codeChanges - An array of CodeChange objects representing the existing code
   * changes.
   * @param {CodeChange} codeChange - The `codeChange` parameter is an object that represents a single
   * code change. It contains the following properties:
   * @returns the updated array of code changes.
   */
  private calculateCodeChanges(
    codeChanges: CodeChange[],
    codeChange: CodeChange,
  ) {
    const temp = codeChanges.slice();
    const isExist = codeChanges.findIndex(
      ({ filePath }) => filePath === codeChange.filePath,
    );
    if (isExist < 0) temp.push({ start: new Date().getTime(), ...codeChange });
    else
      temp[isExist] = {
        ...temp.at(isExist),
        ...codeChange,
        keystrokes: temp.at(isExist)!.keystrokes + 1,
      };
    return temp;
  }

  /**
   * Calculates the total number of lines changed by adding the lines added and lines deleted.
   *
   * @param totalChanges - The code change summary representing the changes.
   * @returns The total number of lines changed.
   */
  private calculateTotalLineChanges(totalChanges: CodeChangeSummary): number {
    return totalChanges.linesAdded + totalChanges.linesDeleted;
  }

  /**
   * Calculates the code summary changes by aggregating code summary changes for the entire document.
   *
   * @param documentChanges - An array of `CodeChange` objects representing changes in the document.
   * @returns A `CodeChangeSummary` object representing the code summary changes.
   */
  private calculateCodeSummaryChanges(
    documentChanges: CodeChange[],
  ): CodeChangeSummary {
    return documentChanges.reduce(
      (acc, val) => ({
        ...acc,
        blankLine: acc.blankLine + val.blankLine,
        linesAdded: acc.linesAdded + val.linesAdded,
        linesDeleted: acc.linesDeleted + val.linesDeleted,
      }),
      {
        linesAdded: 0,
        linesDeleted: 0,
        blankLine: 0,
      },
    );
  }

  /**
   * Handles the event when there are changes in visible text editors and ensures that untracked files are
   * stored for further comparison.
   *
   * @param editors - An array of visible `TextEditor` instances.
   */
  private onChangeVisibleTextEditorsEvent(
    editors: readonly TextEditor[],
  ): void {
    if (!this.isTrackUncommitChangesFeatureEnabled()) return;
    editors
      .filter((editor) => editor.document.uri.scheme === "file")
      .forEach((editor) => {
        if (!this.gitIgnoreManager.isFileIgnored(editor.document.uri)) {
          const uniqueKey = this.generateUniqueKey(editor.document.uri);
          if (!LocalStorageManager.getValue(uniqueKey)) {
            LocalStorageManager.setValue(uniqueKey, editor.document.getText());
          }
        }
      });
  }

  /**
   * Handles the event when files are renamed, updates the code changes data to reflect the file's new name
   * and path.
   *
   * @param event - The `FileRenameEvent` containing information about the renamed files.
   */
  private onRenameFile(event: FileRenameEvent) {
    if (!this.isTrackUncommitChangesFeatureEnabled()) return;
    const { oldUri, newUri } = event.files[0];
    const codeChangesData = LocalStorageManager.getUncommittedCodeChangesData();
    if (!codeChangesData) return;

    const oldCode = LocalStorageManager.getValue(
      this.generateUniqueKey(oldUri),
    );
    codeChangesData.codeChanges = codeChangesData.codeChanges.map((change) =>
      change.filePath === oldUri.fsPath
        ? {
            ...change,
            fileName: path.basename(newUri.path),
            filePath: newUri.fsPath,
          }
        : change,
    );
    codeChangesData.lastModifiedTimestamp = Date.now();
    LocalStorageManager.setUncommittedCodeChangesData(codeChangesData);

    if (oldCode) {
      LocalStorageManager.deleteValue(this.generateUniqueKey(oldUri));
      LocalStorageManager.setValue(this.generateUniqueKey(newUri), oldCode);
    }
  }

  /**
   * Generates a unique key based on the file's path.
   *
   * @param uri - The `Uri` representing the file's URI.
   * @returns A unique key based on the file's path.
   */
  private generateUniqueKey(uri: Uri) {
    return `${LocalStorageManager.TEMP_DATA_KEY}${uri.path}`;
  }

  /**
   * Checks if the feature to track uncommitted changes is enabled.
   *
   * @returns `true` if the feature is enabled, `false` otherwise.
   */
  private isTrackUncommitChangesFeatureEnabled() {
    return getWorkspaceConfigurationValue(CONFIG_STATUS_BAR.status, true);
  }

  /**
   * Disposes of the resources and subscriptions associated with the `UncommittedChangesTracker`.
   */
  public dispose() {
    this._disposable.dispose();
    this.eventManager.dispose();
  }
}

export interface CodeChange {
  id?: string;
  updatedDate: number;
  linesAdded: number;
  linesDeleted: number;
  blankLine: number;
  fileName: string;
  filePath: string;
  lang: string;
  lineCount: number;
  projectName?: string;
  projectDirectory?: string;
  repoName?: string;
  editorName: string;
  editorVersion: string;
  charactersAdded: number;
  charactersDeleted: number;
  characterCount: number;
  keystrokes: number;
  createdAt?: string;
  gitBranch?: string;
  gitTag?: string;
  identifier?: string;
  eventType: string;
  authorName?: string;
  end?: number;
  start?: number;
}

export interface CodeChangesData {
  totalLinesChanged: number;
  codeChangeSummary: CodeChangeSummary;
  lastModifiedTimestamp: number; // Timestamp
  codeChanges: CodeChange[];
}

export interface CodeChangeSummary {
  blankLine: number;
  linesAdded: number;
  linesDeleted: number;
}
