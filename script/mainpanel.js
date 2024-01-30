// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
function increaseCounter() {
    console.log('test');
}

(function () {
    const vscode = acquireVsCodeApi();
    console.log('Call function');
}());