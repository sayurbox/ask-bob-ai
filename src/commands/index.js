const vscode = require('vscode');
const { copyCodeBlockCommand } = require('./copy-code-block');
const { sendToTerminalCommand } = require('./send-to-terminal');
const { quickActionsCommand, executeQuickActionCommand } = require('./quick-actions');
const { customPromptCommand } = require('./custom-prompt');
const { copyAndAskAICommand } = require('./copy-and-ask');
const { showAICLIPicker } = require('../services/terminal-manager');

/**
 * Register all extension commands
 * @param {vscode.ExtensionContext} context - Extension context
 */
function registerCommands(context) {
    // Copy code block reference to clipboard
    const copyCodeBlock = vscode.commands.registerCommand(
        'ask-ai-cli.copyCodeBlock',
        copyCodeBlockCommand
    );

    // Send code reference to terminal
    const sendToTerminal = vscode.commands.registerCommand(
        'ask-ai-cli.sendToTerminal',
        sendToTerminalCommand
    );

    // Quick actions (template prompts)
    const quickActions = vscode.commands.registerCommand(
        'ask-ai-cli.quickActions',
        quickActionsCommand
    );

    // Custom prompt
    const customPrompt = vscode.commands.registerCommand(
        'ask-ai-cli.customPrompt',
        customPromptCommand
    );

    // Copy & Ask AI
    const copyAndAskAI = vscode.commands.registerCommand(
        'ask-ai-cli.copyAndAskAI',
        copyAndAskAICommand
    );

    // Execute quick action (from code action provider)
    const executeQuickAction = vscode.commands.registerCommand(
        'ask-ai-cli.executeQuickAction',
        executeQuickActionCommand
    );

    // Start AI CLI
    const startAICLI = vscode.commands.registerCommand(
        'ask-ai-cli.startAICLI',
        async () => {
            const terminal = await showAICLIPicker();
            if (terminal) {
                vscode.window.showInformationMessage(`AI CLI started in terminal: ${terminal.name}`);
            }
        }
    );

    // Add all commands to subscriptions
    context.subscriptions.push(
        copyCodeBlock,
        sendToTerminal,
        quickActions,
        customPrompt,
        copyAndAskAI,
        executeQuickAction,
        startAICLI
    );
}

module.exports = {
    registerCommands
};
