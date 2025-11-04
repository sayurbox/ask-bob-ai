const vscode = require('vscode');
const { copyCodeBlockCommand } = require('./copy-code-block');
const { sendToTerminalCommand } = require('./send-to-terminal');
const { sendImageToTerminalCommand } = require('./send-image-to-terminal');
const { pasteImageFromClipboardCommand } = require('./paste-image-from-clipboard');
const { cleanupTempImagesCommand } = require('./cleanup-temp-images');
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
    folderOperationsCommand,
    folderQuickActionsCommand,
    folderCopyReferenceCommand
} = require('./folder-operations');
const { toggleSoundCommand } = require('./toggle-sound');
const { toggleAutoPromptCommand } = require('./toggle-auto-prompt');
const { editTemplatesCommand } = require('./edit-templates');
const { editFolderTemplatesCommand } = require('./edit-folder-templates');
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

    // Send image to terminal
    const sendImageToTerminal = vscode.commands.registerCommand(
        'ask-ai-cli.sendImageToTerminal',
        sendImageToTerminalCommand
    );

    // Paste image from clipboard
    const pasteImageFromClipboard = vscode.commands.registerCommand(
        'ask-ai-cli.pasteImageFromClipboard',
        async () => {
            await pasteImageFromClipboardCommand(context);
        }
    );

    // Clean up temp images
    const cleanupTempImages = vscode.commands.registerCommand(
        'ask-ai-cli.cleanupTempImages',
        cleanupTempImagesCommand
    );

    // Quick actions (template prompts)
    const quickActions = vscode.commands.registerCommand(
        'ask-ai-cli.quickActions',
        async (...args) => {
            try {
                console.log('🚀 Executing quickActions command');
                await quickActionsCommand(...args);
            } catch (error) {
                console.error('❌ Error in quickActions:', error);
                vscode.window.showErrorMessage(`Quick Actions error: ${error.message}`);
            }
        }
    );
    console.log('✅ Registered command: ask-ai-cli.quickActions');

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

    // Folder Quick Actions (template-based)
    const folderQuickActions = vscode.commands.registerCommand(
        'ask-ai-cli.folderQuickActions',
        folderQuickActionsCommand
    );

    // Copy folder/file reference
    const folderCopyReference = vscode.commands.registerCommand(
        'ask-ai-cli.folderCopyReference',
        folderCopyReferenceCommand
    );

    // Toggle sound effects
    const toggleSound = vscode.commands.registerCommand(
        'ask-ai-cli.toggleSound',
        toggleSoundCommand
    );

    // Toggle auto-prompt clipboard images
    const toggleAutoPrompt = vscode.commands.registerCommand(
        'ask-ai-cli.toggleAutoPrompt',
        toggleAutoPromptCommand
    );

    // Edit templates
    const editTemplates = vscode.commands.registerCommand(
        'ask-ai-cli.editTemplates',
        editTemplatesCommand
    );

    // Edit folder templates
    const editFolderTemplates = vscode.commands.registerCommand(
        'ask-ai-cli.editFolderTemplates',
        editFolderTemplatesCommand
    );

    // Add all commands to subscriptions
    context.subscriptions.push(
        copyCodeBlock,
        sendToTerminal,
        sendImageToTerminal,
        pasteImageFromClipboard,
        cleanupTempImages,
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
        folderQuickActions,
        folderCopyReference,
        toggleSound,
        toggleAutoPrompt,
        editTemplates,
        editFolderTemplates
    );

    console.log('✅ All commands registered successfully! Total:', context.subscriptions.length);
}

module.exports = {
    registerCommands
};
