const vscode = require('vscode');
const { generateCodeReference } = require('../utils/code-reference');
const { sendToAITerminal } = require('../services/terminal-manager');

/**
 * Command handler for custom prompt input
 */
async function customPromptCommand() {
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

    // Show input box for custom prompt
    const customPrompt = await vscode.window.showInputBox({
        prompt: 'Enter your prompt for AI',
        placeHolder: 'e.g., Explain this code, Refactor this, Write tests for this...',
        validateInput: (text) => {
            return text.trim().length === 0 ? 'Prompt cannot be empty' : null;
        }
    });

    // User cancelled the input
    if (!customPrompt) {
        return;
    }

    const codeReference = generateCodeReference(editor);

    if (!codeReference) {
        vscode.window.showErrorMessage('Failed to generate code reference');
        return;
    }

    // Combine prompt with code reference
    const fullMessage = `${customPrompt} ${codeReference} \\`;

    // Send to terminal
    await sendToAITerminal(fullMessage);
}

module.exports = {
    customPromptCommand
};
