const vscode = require('vscode');
const { QUICK_ACTIONS } = require('../config/ai-clis');
const { generateCodeReference } = require('../utils/code-reference');
const { sendToAITerminal } = require('../services/terminal-manager');

/**
 * Command handler for Copy & Ask AI workflow
 * Copies the selected text to clipboard first, then asks what to do with it
 */
async function copyAndAskAICommand() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const selection = editor.selection;

    if (selection.isEmpty) {
        vscode.window.showErrorMessage('Please select a code block first');
        return;
    }

    // Get the selected text
    const selectedText = editor.document.getText(selection);

    // Copy to clipboard first
    await vscode.env.clipboard.writeText(selectedText);
    vscode.window.showInformationMessage('Copied to clipboard! Now choose an action...');

    // Show quick pick menu with template options
    const selected = await vscode.window.showQuickPick(QUICK_ACTIONS, {
        placeHolder: 'What would you like to ask Bob AI about the copied text?',
        matchOnDescription: true
    });

    // User cancelled
    if (!selected || !selected.prompt) {
        return;
    }

    let finalPrompt;

    // If user chose custom, show input box
    if (selected.prompt === 'CUSTOM') {
        finalPrompt = await vscode.window.showInputBox({
            prompt: 'Enter your custom prompt',
            placeHolder: 'e.g., Convert this to TypeScript, Add error handling...',
            validateInput: (text) => {
                return text.trim().length === 0 ? 'Prompt cannot be empty' : null;
            }
        });

        // User cancelled custom input
        if (!finalPrompt) {
            return;
        }
    } else {
        finalPrompt = selected.prompt;
    }

    const codeReference = generateCodeReference(editor);

    if (!codeReference) {
        vscode.window.showErrorMessage('Failed to generate code reference');
        return;
    }

    // Combine prompt with code reference
    const fullMessage = `${finalPrompt} ${codeReference} \\`;

    // Send to terminal
    await sendToAITerminal(fullMessage);
}

module.exports = {
    copyAndAskAICommand
};
