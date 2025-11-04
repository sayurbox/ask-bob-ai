const vscode = require('vscode');
const { registerCommands } = require('./commands');
const { AICodeActionProvider } = require('./providers/code-action-provider');
const { setupTerminalListeners } = require('./services/terminal-manager');
const { initializeFileWatcher, dispose: disposeTemplateLoader } = require('./services/template-loader');
const { initializeFolderFileWatcher, dispose: disposeFolderTemplateLoader } = require('./services/folder-template-loader');
const { startMonitoring, stopMonitoring, restartMonitoring } = require('./services/clipboard-monitor');

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

    // Initialize folder template file watcher
    initializeFolderFileWatcher(context);
    console.log('Folder template file watcher initialized');

    // Start clipboard monitor if enabled
    startMonitoring(context);
    console.log('Clipboard monitor initialized');

    // Watch for configuration changes
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('bobAiCli.autoPromptClipboardImage')) {
            console.log('Auto-prompt setting changed, restarting monitor...');
            restartMonitoring(context);
        }
    });

    // Register all commands
    registerCommands(context);
}

/**
 * Deactivate the extension
 */
function deactivate() {
    // Stop clipboard monitor
    stopMonitoring();
    console.log('Clipboard monitor stopped');

    // Dispose template loader resources
    disposeTemplateLoader();
    disposeFolderTemplateLoader();
}

module.exports = {
    activate,
    deactivate,
    getExtensionPath
};
