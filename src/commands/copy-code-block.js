const vscode = require('vscode');
const { generateCodeReference } = require('../utils/code-reference');
const { playSuccessSound } = require('../utils/sound');

/**
 * Command handler for copying code block reference to clipboard
 */
async function copyCodeBlockCommand() {
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

    // Copy to clipboard
    try {
        await vscode.env.clipboard.writeText(output);
        vscode.window.showInformationMessage(`Copied to clipboard: ${output}`);

        // Play success sound after successful copy
        try {
            await playSuccessSound();
        } catch (soundErr) {
            console.warn('Failed to play success sound:', soundErr.message);
        }
    } catch (err) {
        vscode.window.showErrorMessage(`Failed to copy to clipboard: ${err}`);
    }
}

module.exports = {
    copyCodeBlockCommand
};
