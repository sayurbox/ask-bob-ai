const vscode = require('vscode');
const { copyCodeBlockCommand } = require('./copy-code-block');
const { sendToTerminalCommand } = require('./send-to-terminal');
const { quickActionsCommand, executeQuickActionCommand } = require('./quick-actions');
const { addFeatureCommand } = require('./add-feature');
const { executePlanCommand } = require('./execute-plan');
const {
    folderExplainCommand,
    folderReviewCommand,
    folderDeepReviewCommand,
    folderFindBugsCommand,
    folderGenerateTestsCommand,
    folderDocumentCommand,
    folderRefactorCommand,
    folderListFilesCommand,
    folderOperationsCommand
} = require('./folder-operations');
const { toggleSoundCommand } = require('./toggle-sound');
const { editTemplatesCommand } = require('./edit-templates');
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

    // Add Feature (Phase 1: Create tech spec)
    const addFeature = vscode.commands.registerCommand(
        'ask-ai-cli.addFeature',
        addFeatureCommand
    );

    // Execute Plan (Phase 2: Implement from tech spec)
    const executePlan = vscode.commands.registerCommand(
        'ask-ai-cli.executePlan',
        executePlanCommand
    );

    // Folder Operations (individual commands for submenu)
    const folderExplain = vscode.commands.registerCommand(
        'ask-ai-cli.folderExplain',
        folderExplainCommand
    );

    const folderReview = vscode.commands.registerCommand(
        'ask-ai-cli.folderReview',
        folderReviewCommand
    );

    const folderDeepReview = vscode.commands.registerCommand(
        'ask-ai-cli.folderDeepReview',
        folderDeepReviewCommand
    );

    const folderFindBugs = vscode.commands.registerCommand(
        'ask-ai-cli.folderFindBugs',
        folderFindBugsCommand
    );

    const folderGenerateTests = vscode.commands.registerCommand(
        'ask-ai-cli.folderGenerateTests',
        folderGenerateTestsCommand
    );

    const folderDocument = vscode.commands.registerCommand(
        'ask-ai-cli.folderDocument',
        folderDocumentCommand
    );

    const folderRefactor = vscode.commands.registerCommand(
        'ask-ai-cli.folderRefactor',
        folderRefactorCommand
    );

    const folderListFiles = vscode.commands.registerCommand(
        'ask-ai-cli.folderListFiles',
        folderListFilesCommand
    );

    const folderOperations = vscode.commands.registerCommand(
        'ask-ai-cli.folderOperations',
        folderOperationsCommand
    );

    // Toggle sound effects
    const toggleSound = vscode.commands.registerCommand(
        'ask-ai-cli.toggleSound',
        toggleSoundCommand
    );

    // Edit templates
    const editTemplates = vscode.commands.registerCommand(
        'ask-ai-cli.editTemplates',
        editTemplatesCommand
    );

    // Add all commands to subscriptions
    context.subscriptions.push(
        copyCodeBlock,
        sendToTerminal,
        quickActions,
        executeQuickAction,
        startAICLI,
        addFeature,
        executePlan,
        folderExplain,
        folderReview,
        folderDeepReview,
        folderFindBugs,
        folderGenerateTests,
        folderDocument,
        folderRefactor,
        folderListFiles,
        folderOperations,
        toggleSound,
        editTemplates
    );
}

module.exports = {
    registerCommands
};
