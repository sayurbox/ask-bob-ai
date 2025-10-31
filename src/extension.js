const vscode = require('vscode');
const { registerCommands } = require('./commands');
const { AICodeActionProvider } = require('./providers/code-action-provider');
const { setupTerminalListeners } = require('./services/terminal-manager');
const { initializeFileWatcher, dispose: disposeTemplateLoader } = require('./services/template-loader');

// Store extension path for use by utilities
let extensionPath = '';

/**
 * Get the extension path
 * @returns {string} Extension path
 */
function getExtensionPath() {
    return extensionPath;
}

/**
 * Activate the extension
 * @param {vscode.ExtensionContext} context - Extension context
 */
function activate(context) {
    console.log('Bob AI CLI extension is now active!');

    // Store extension path
    extensionPath = context.extensionPath;

    // Setup terminal lifecycle listeners (auto-detect when AI CLI is closed/killed)
    setupTerminalListeners(context);
    console.log('Terminal listeners registered');

    // Register Code Action Provider for inline suggestions (lightbulb)
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        '*', // All languages
        new AICodeActionProvider(),
        {
            providedCodeActionKinds: [
                vscode.CodeActionKind.QuickFix
            ]
        }
    );
    context.subscriptions.push(codeActionProvider);
    console.log('Code Action Provider registered');

    // Initialize template file watcher for quick actions
    initializeFileWatcher(context);
    console.log('Template file watcher initialized');

    // Register all commands
    registerCommands(context);
}

/**
 * Deactivate the extension
 */
function deactivate() {
    // Dispose template loader resources
    disposeTemplateLoader();
}

module.exports = {
    activate,
    deactivate,
    getExtensionPath
};
