const vscode = require('vscode');
const { registerCommands } = require('./commands');
const { AICodeActionProvider } = require('./providers/code-action-provider');

/**
 * Activate the extension
 * @param {vscode.ExtensionContext} context - Extension context
 */
function activate(context) {
    console.log('Bob AI CLI extension is now active!');

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

    // Register all commands
    registerCommands(context);
}

/**
 * Deactivate the extension
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
