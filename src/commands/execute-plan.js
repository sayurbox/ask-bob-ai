const vscode = require('vscode');
const path = require('path');
const { sendToAITerminal } = require('../services/terminal-manager');
const { getWorkspaceRelativePath } = require('../utils/path-utils');
const { generateCodeReference } = require('../utils/code-reference');
const { playSuccessSound } = require('../utils/sound');

/**
 * Command handler for executing implementation plan
 * Smart behavior:
 * - If .md file (editor or explorer) → Execute file as plan
 * - If code selected in any file → Treat selection as inline plan
 * - If neither → Show error
 *
 * @param {vscode.Uri} uri - File URI from explorer context (optional)
 */
async function executePlanCommand(uri) {
    const editor = vscode.window.activeTextEditor;

    // Case 1: Right-click from explorer (uri provided)
    if (uri && uri.fsPath) {
        const filePath = uri.fsPath;
        const fileName = path.basename(filePath);

        // Only accept .md files from explorer
        if (!fileName.endsWith('.md')) {
            vscode.window.showErrorMessage('Execute Plan only works with .md files from explorer');
            return;
        }

        // Get workspace-relative path
        const relativePath = getWorkspaceRelativePath(filePath);

        // Confirm execution
        const confirmation = await vscode.window.showQuickPick(
            [
                'Yes, implement this plan',
                'No, let me review more'
            ],
            {
                placeHolder: `Execute implementation plan from: ${relativePath}?`
            }
        );

        if (!confirmation || confirmation.startsWith('No')) {
            return; // User cancelled or chose no
        }

        // Build prompt to execute the plan from file
        let fullPrompt = `Implement the feature based on the tech spec in: @${relativePath}\n\n`;
        fullPrompt += `Please:\n`;
        fullPrompt += `1. Read and understand the complete tech spec\n`;
        fullPrompt += `2. Follow the architecture and implementation steps exactly\n`;
        fullPrompt += `3. Create/modify all files mentioned in the spec\n`;
        fullPrompt += `4. Implement the testing strategy\n`;
        fullPrompt += `5. Keep the tech spec file updated with progress\n\n`;
        fullPrompt += `Follow existing codebase patterns and conventions. \\`;

        // Send to terminal
        try {
            await sendToAITerminal(fullPrompt);

            // Play success sound after command completion
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }

            vscode.window.showInformationMessage(
                `Implementation started! Bob AI is following: ${relativePath}`
            );
        } catch (err) {
            console.error('Failed to send to terminal:', err);
            vscode.window.showErrorMessage('Failed to start implementation');
        }
        return;
    }

    // Case 2: Right-click in editor (no uri)
    if (!editor) {
        vscode.window.showErrorMessage('Please open a file or select code first');
        return;
    }

    const filePath = editor.document.uri.fsPath;
    const fileName = path.basename(filePath);
    const selection = editor.selection;

    // Case 2a: .md file in editor → Execute file as plan
    if (fileName.endsWith('.md')) {
        const relativePath = getWorkspaceRelativePath(filePath);

        // Confirm execution
        const confirmation = await vscode.window.showQuickPick(
            [
                'Yes, implement this plan',
                'No, let me review more'
            ],
            {
                placeHolder: `Execute implementation plan from: ${relativePath}?`
            }
        );

        if (!confirmation || confirmation.startsWith('No')) {
            return; // User cancelled or chose no
        }

        // Build prompt to execute the plan from file
        let fullPrompt = `Implement the feature based on the tech spec in: @${relativePath}\n\n`;
        fullPrompt += `Please:\n`;
        fullPrompt += `1. Read and understand the complete tech spec\n`;
        fullPrompt += `2. Follow the architecture and implementation steps exactly\n`;
        fullPrompt += `3. Create/modify all files mentioned in the spec\n`;
        fullPrompt += `4. Implement the testing strategy\n`;
        fullPrompt += `5. Keep the tech spec file updated with progress\n\n`;
        fullPrompt += `Follow existing codebase patterns and conventions. \\`;

        // Send to terminal
        try {
            await sendToAITerminal(fullPrompt);

            // Play success sound after command completion
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }

            vscode.window.showInformationMessage(
                `Implementation started! Bob AI is following: ${relativePath}`
            );
        } catch (err) {
            console.error('Failed to send to terminal:', err);
            vscode.window.showErrorMessage('Failed to start implementation');
        }
        return;
    }

    // Case 2b: Code selected in any file → Treat as inline plan
    if (!selection.isEmpty) {
        const selectedText = editor.document.getText(selection);
        const codeReference = generateCodeReference(editor);

        // Confirm execution
        const confirmation = await vscode.window.showQuickPick(
            [
                'Yes, implement this inline plan',
                'No, cancel'
            ],
            {
                placeHolder: `Execute implementation plan from selected code?`
            }
        );

        if (!confirmation || confirmation.startsWith('No')) {
            return; // User cancelled or chose no
        }

        // Build prompt to execute inline plan
        let fullPrompt = `Implement the following plan:\n\n`;
        fullPrompt += `${selectedText}\n\n`;
        fullPrompt += `Code reference: ${codeReference}\n\n`;
        fullPrompt += `Follow existing codebase patterns and conventions. \\`;

        // Send to terminal
        try {
            await sendToAITerminal(fullPrompt);

            // Play success sound after command completion
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }

            vscode.window.showInformationMessage('Implementation started from inline plan!');
        } catch (err) {
            console.error('Failed to send to terminal:', err);
            vscode.window.showErrorMessage('Failed to start inline implementation');
        }
        return;
    }

    // Case 3: No valid context
    vscode.window.showErrorMessage(
        'Please either:\n' +
        '1. Right-click a .md file in explorer, or\n' +
        '2. Open a .md file, or\n' +
        '3. Select code to use as inline plan'
    );
}

module.exports = {
    executePlanCommand
};
