const vscode = require('vscode');
const { getTemplates } = require('../services/template-loader');
const { generateCodeReference, generateCodeReferenceFromRange } = require('../utils/code-reference');
const { sendToAITerminal } = require('../services/terminal-manager');
const { playSuccessSound } = require('../utils/sound');

/**
 * Command handler for quick actions (template prompts)
 */
async function quickActionsCommand() {
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

    // Get templates (from workspace or defaults)
    const templates = getTemplates();

    // Show quick pick menu with template options
    const selected = await vscode.window.showQuickPick(templates, {
        placeHolder: 'Choose an action or select custom prompt',
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

    // Combine prompt with code reference (auto-execute, no backslash needed)
    const fullMessage = `${finalPrompt} ${codeReference}`;

    // Send to terminal
    try {
        const success = await sendToAITerminal(fullMessage);

        // Only play success sound if terminal send was successful
        if (success) {
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }
        }
    } catch (err) {
        console.error('Failed to send to terminal:', err);
    }
}

/**
 * Command handler for executing quick action from code action provider
 * This is called when user clicks on lightbulb suggestions
 */
async function executeQuickActionCommand(document, range, action) {
    const codeReference = generateCodeReferenceFromRange(document, range);

    let finalPrompt;

    // Handle custom prompt
    if (action.prompt === 'CUSTOM') {
        finalPrompt = await vscode.window.showInputBox({
            prompt: 'Enter your custom prompt',
            placeHolder: 'e.g., Explain this code, Convert to TypeScript...',
            validateInput: (text) => {
                return text.trim().length === 0 ? 'Prompt cannot be empty' : null;
            }
        });

        if (!finalPrompt) {
            return;
        }
    } else {
        finalPrompt = action.prompt;
    }

    // Combine prompt with code reference (auto-execute, no backslash needed)
    const fullMessage = `${finalPrompt} ${codeReference}`;

    // Send to terminal
    try {
        const success = await sendToAITerminal(fullMessage);

        // Only play success sound if terminal send was successful
        if (success) {
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }
        }
    } catch (err) {
        console.error('Failed to send to terminal:', err);
    }
}

module.exports = {
    quickActionsCommand,
    executeQuickActionCommand
};
