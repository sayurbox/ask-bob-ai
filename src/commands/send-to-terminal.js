const vscode = require('vscode');
const { generateCodeReference } = require('../utils/code-reference');
const { sendToAITerminal } = require('../services/terminal-manager');
const { playSuccessSound } = require('../utils/sound');

/**
 * Command handler for sending code reference to terminal
 */
async function sendToTerminalCommand() {
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

    const output = generateCodeReference(editor);

    if (!output) {
        vscode.window.showErrorMessage('Failed to generate code reference');
        return;
    }

    // Add trailing backslash for multi-line input in terminal
    const terminalText = `${output} \\`;

    // Send to AI CLI terminal
    try {
        await sendToAITerminal(terminalText);

        // Play success sound after command completion
        try {
            await playSuccessSound();
        } catch (soundErr) {
            console.warn('Failed to play success sound:', soundErr.message);
        }
    } catch (err) {
        console.error('Failed to send to terminal:', err);
    }
}

module.exports = {
    sendToTerminalCommand
};
