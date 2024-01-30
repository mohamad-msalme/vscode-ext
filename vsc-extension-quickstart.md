# Building and Running a VS Code vscode-DevBoost Extension Locally

## Running the Extension Locally

1. Run the following command to install the necessary dependencies for your extension: `npm install`

2. Press `F5` to run the extension locally. This will launch a new VS Code instance with your extension for testing and debugging.

## Generating the Extension Locally as a VSIX File

To create a VSIX file for your extension, follow these steps:

1. Make sure you have `vsce` (VS Code Extension Manager) installed globally. If you haven't already, you can install it globally with the following command:
   `npm install -g @vscode/vsce`

2. Run the following command to generate the VSIX file: `npm run vscode:package`

3. During the packaging process, you may encounter some questions that you need to answer. Make sure to respond to them appropriately. These questions may relate to the extension's details, like the publisher name, extension name, and version.

4. After the packaging process is complete, you will have a VSIX extension file generated. This file will typically have a `.vsix` extension.

5. To install the extension locally in VS Code, open VS Code, navigate to the Extensions, then click on the three dot icon then select k"Install from VSIX." Then, browse for and select the generated `.vsix` file.

6. Confirm the installation, and your extension will be installed locally in your VS Code instance for testing.

To regenerate the VSIX file, you can repeat the command: `npm run vscode:package`

This set of instructions should help you build and run your VS Code extension locally for development and testing. If you encounter any issues or have specific questions about any part of the process, feel free to ask for further assistance.
