import { getUncommitedChangesToday } from "../api";
import { Disposable, ViewColumn, WebviewPanel, window } from "vscode";
import { CodeChange } from "../managers";

export class UncommittedChangesWebview implements Disposable {
  private _webview: WebviewPanel | undefined;
  totalLineChanges = 0;

  /**
   * The function creates a webview panel in Visual Studio Code and sets its HTML content to a
   * table generated from data retrieved from local storage.
   */
  public async createReportPanel() {
    // Create and show a webview panel
    if (this._webview) return;
    const viewColumn = window.activeTextEditor?.viewColumn ?? ViewColumn.One;

    this._webview = window.createWebviewPanel(
      "reportPanel",
      "Added/Removed Lines Report",
      viewColumn, // Adjust the column as needed
      {
        enableScripts: true,
      },
    );
    this._webview.title = "Code Changes Report";
    const codeChanges = await getUncommitedChangesToday();
    this.totalLineChanges = codeChanges.reduce(
      (acc, val) => val.linesAdded + val.linesDeleted + acc,
      0,
    );
    const lineStatistics = this.calculateLineStatistics(codeChanges);
    this._webview.webview.html = this.generateTableHtml(
      codeChanges,
      lineStatistics,
    );
    this._webview.onDidDispose(() => (this._webview = undefined));
  }

  /**
   * The function calculates line statistics based on the data provided and returns an array of
   * LineStatistics objects.
   * @param {TDataChanges[]} dataToShow - An array of objects representing the changes made to
   * lines of code. Each object has the following properties:
   * @returns The function `calculateLineStatistics` returns an array of `LineStatistics`
   * objects.
   */
  private calculateLineStatistics(dataToShow: CodeChange[]): LineStatistics[] {
    const languageStatisticsMap = new Map<string, LineStatistics>();

    for (const row of dataToShow) {
      const { lang, linesAdded, linesDeleted, blankLine } = row;

      // Initialize or update statistics based on language
      if (!languageStatisticsMap.has(lang)) {
        languageStatisticsMap.set(lang, {
          lang: lang,
          linesAdded: 0,
          linesDeleted: 0,
          blankLines: 0,
        });
      }

      const languageStatistics = languageStatisticsMap.get(lang)!;
      languageStatistics.linesAdded += linesAdded;
      languageStatistics.linesDeleted += linesDeleted;
      languageStatistics.blankLines += blankLine;
    }

    // Convert the map to an array of LineStatistics objects
    const lineStatistics = Array.from(languageStatisticsMap.values());
    return lineStatistics;
  }

  /**
   * The function generates an HTML table with data related to changes in code lines.
   * @param {TDataChanges[]} dataToShow - The `dataToShow` parameter is an array of
   * `TDataChanges` objects. Each `TDataChanges` object represents a change in code and contains
   * information such as the file name, number of added lines, number of removed lines, and
   * number of blank lines.
   * @param {LineStatistics[]} lineStatistics - The `lineStatistics` parameter is an array of
   * objects representing the statistics for each programming language in terms of lines of code.
   * Each object in the array has the following properties:
   * @returns an HTML string that includes the generated tables for total lines, language
   * statistics, and added/removed/blank lines.
   */
  private generateTableHtml(
    dataToShow: CodeChange[],
    lineStatistics: LineStatistics[],
  ) {
    const totalLinesTable = this.generateTotalLinesTable(dataToShow);
    const languageStatisticsTable =
      this.generateLanguageStatisticsTable(lineStatistics);
    const generateAddedRemovedBlankLinesTable =
      this.generateAddedRemovedBlankLinesTable(dataToShow);
    return `
                    <html>
                        <head>
                            ${styleCode}
                        </head>
                        <body>
                        ${generateAddedRemovedBlankLinesTable}
                        ${totalLinesTable}
                        ${languageStatisticsTable}
                        </body>
                    </html>
                `;
  }

  /**
   * The function generates an HTML table displaying added, removed, and blank lines for each
   * file in a given data set.
   * @param {TDataChanges[]} dataToShow - An array of objects representing the data to be
   * displayed in the table. Each object should have the following properties:
   * @returns a string that represents an HTML table.
   */
  private generateAddedRemovedBlankLinesTable(
    dataToShow: CodeChange[],
  ): string {
    const dataTableTitle = "Added/Removed/Blank Lines by File";
    const generateTableRowHtml = (row: CodeChange) => `
                <tr>
                        <td>${row.filePath}</td>
                        <td>${row.fileName}</td>
                        <td>${row.lang}</td>
                        <td>${row.linesAdded}</td>
                        <td>${row.linesDeleted}</td>
                        <td>${row.blankLine}</td>
                        <td>${this.formatTimeStamp(
                          row.updatedDate ?? row.createdAt,
                        )}</td>
                </tr>`;

    return `
                  <p class="headerTitle">${dataTableTitle}</p>
                  <table>
                    <tr>
                        <th>File Path</th>
                        <th>File Name</th>
                        <th>Language</th>
                        <th>Added Lines</th>
                        <th>Removed Lines</th>
                        <th>Blank Lines</th>
                        <th>Date</th>
                    </tr>
                    <tr>${dataToShow.map(generateTableRowHtml).join("")}</tr>
                  </table>
                `;
  }

  /**
   * The function generates a table displaying the total lines, physical total lines, and blank
   * lines based on the provided data.
   * @param {TDataChanges[]} dataToShow - An array of objects representing data changes. Each
   * object should have the following properties:
   * @returns a string that represents an HTML table with the total lines, physical total lines,
   * and blank lines.
   */
  private generateTotalLinesTable(dataToShow: CodeChange[]): string {
    const totalLinesTableTitle = "Total Lines and Physical Total Lines";
    const totalLines = dataToShow.reduce(
      (sum, row) => sum + row.linesAdded + row.linesDeleted,
      0,
    );
    const blankLines = dataToShow.reduce((sum, row) => sum + row.blankLine, 0);
    const totalPhysicalLines = totalLines - blankLines;
    return `
                  <p class="headerTitle">${totalLinesTableTitle}</p>
                  <table>
                    <tr>
                      <th>Total Lines</th>
                      <th>Physical Total Lines</th>
                      <th>Blank Lines</th>
                    </tr>
                    <tr>
                        <td>${totalLines}</td>
                        <td>${totalPhysicalLines}</td>
                        <td>${blankLines}</td>
                    </tr>
                  </table>
                `;
  }

  /**
   * The function generates a table displaying line statistics by language.
   * @param {LineStatistics[]} lineStatistics - An array of objects representing line statistics
   * for different programming languages. Each object should have the following properties:
   * @returns a string that represents an HTML table displaying line statistics by language. The
   * table includes columns for language, added lines, removed lines, blank lines, and
   * percentage. Each row in the table represents a language and its corresponding line
   * statistics.
   */
  private generateLanguageStatisticsTable(
    lineStatistics: LineStatistics[],
  ): string {
    const languageStatisticsTableTitle = "Line Statistics by Language";
    const languageStatisticsRows = lineStatistics.map(
      (stat) => `
                  <tr>
                    <td>${stat.lang}</td>
                    <td>${stat.linesAdded}</td>
                    <td>${stat.linesDeleted}</td>
                    <td>${stat.blankLines}</td>
                    <td>${(
                      ((stat.linesAdded + stat.linesDeleted) /
                        this.totalLineChanges) *
                      100
                    ).toFixed(2)}%</td>
                  </tr>
                `,
    );

    return `
                  <p class="headerTitle">${languageStatisticsTableTitle}</p>
                  <table>
                    <tr>
                      <th>Language</th>
                      <th>Added Lines</th>
                      <th>Removed Lines</th>
                      <th>Blank Lines</th>
                      <th>Percentage</th>
                    </tr>
                    ${languageStatisticsRows.join("")}
                  </table>
                `;
  }

  /**
   * The function `formatTimeStamp` takes a timestamp as input and returns a formatted string
   * representing the date and time in the format "YYYY/MM/DD HH:MM AM/PM".
   * @param {number} timestamp - The timestamp parameter is a number representing a specific
   * point in time. It is typically in milliseconds since January 1, 1970, 00:00:00 UTC.
   * @returns a formatted timestamp in the format "YYYY/MM/DD HH:MM AM/PM".
   */
  private formatTimeStamp(timestamp: string | number) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    hours = hours || 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    return `${year}/${month}/${day} ${formattedTime}`;
  }

  public dispose(): void {
    this._webview?.dispose();
  }
}

const styleCode = `
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            width: 80%; /* Reduce table width to 80% of the parent container */
                            margin: 0 auto; /* Center the table horizontally */
                        }
                        table {
                            border-collapse: collapse;
                            margin-bottom: 50px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f2f2f2;
                            color: #666;
                        }
                        .headerTitle {
                                text-align: left;
                                font-size: 15px;
                                margin-bottom: 10px;
                        }
                    </style>
                `;

export interface LineStatistics {
  lang: string;
  linesAdded: number;
  linesDeleted: number;
  blankLines: number;
}
