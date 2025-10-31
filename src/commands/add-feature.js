const vscode = require('vscode');
const path = require('path');
const { generateCodeReference } = require('../utils/code-reference');
const { sendToAITerminal } = require('../services/terminal-manager');
const { getRelativePath } = require('../utils/path-utils');
const { playSuccessSound } = require('../utils/sound');

/**
 * Command handler for guided feature addition with tech spec generation
 * Phase 1: Research and create tech spec in /research/research-{feature}.md
 * @param {vscode.Uri} [uri] - Optional folder URI from context menu
 */
async function addFeatureCommand(uri) {
    const editor = vscode.window.activeTextEditor;

    // Determine if we have folder context
    let folderContext = null;
    if (uri && uri.fsPath) {
        try {
            const stats = await vscode.workspace.fs.stat(uri);
            if (stats.type === vscode.FileType.Directory) {
                const relativePath = getRelativePath(uri.fsPath);
                folderContext = relativePath || path.basename(uri.fsPath);
            }
        } catch (error) {
            // Not a valid directory, ignore
        }
    }

    // Step 1: Ask what feature to add
    const featureName = await vscode.window.showInputBox({
        prompt: 'What feature do you want to add?',
        placeHolder: 'e.g., dark mode toggle, user authentication, export to PDF',
        validateInput: (text) => {
            return text.trim().length === 0 ? 'Feature name cannot be empty' : null;
        }
    });

    if (!featureName) {
        return; // User cancelled
    }

    // Step 2: Ask for context/problem
    const context = await vscode.window.showInputBox({
        prompt: 'What problem does this feature solve?',
        placeHolder: 'e.g., Users need to switch between light/dark themes',
    });

    if (context === undefined) {
        return; // User cancelled
    }

    // Step 3: Ask for requirements
    const requirements = await vscode.window.showInputBox({
        prompt: 'Any specific requirements or constraints? (Optional)',
        placeHolder: 'e.g., Must use CSS variables, Support system theme preference',
    });

    if (requirements === undefined) {
        return; // User cancelled
    }

    // Step 4: Check if user has code selected
    let codeReference = '';
    if (editor && !editor.selection.isEmpty) {
        const includeCode = await vscode.window.showQuickPick(
            ['Yes, include this code as context', 'No, skip code reference'],
            {
                placeHolder: 'You have code selected. Include it as context?'
            }
        );

        if (includeCode === undefined) {
            return; // User cancelled
        }

        if (includeCode.startsWith('Yes')) {
            codeReference = generateCodeReference(editor);
        }
    }

    // Create safe filename from feature name
    const safeFileName = featureName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Build comprehensive prompt for tech spec creation
    let fullPrompt = `Research and create a technical specification for the following feature:\n\n`;
    fullPrompt += `Feature: ${featureName}\n`;

    if (folderContext) {
        fullPrompt += `Target module: ${folderContext}/\n`;
    }

    if (context && context.trim().length > 0) {
        fullPrompt += `Problem: ${context}\n`;
    }

    if (requirements && requirements.trim().length > 0) {
        fullPrompt += `Requirements: ${requirements}\n`;
    }

    if (codeReference) {
        fullPrompt += `\nRelevant code context: ${codeReference}\n`;
    }

    fullPrompt += `\nPlease create a tech spec file at: /research/research-${safeFileName}.md\n\n`;
    fullPrompt += `The tech spec should include:\n`;
    fullPrompt += `1. Problem Statement\n`;
    fullPrompt += `2. Proposed Solution & Architecture\n`;
    fullPrompt += `3. Files to Create/Modify\n`;
    fullPrompt += `4. Implementation Steps\n`;
    fullPrompt += `5. Testing Strategy\n`;
    fullPrompt += `6. Potential Risks/Challenges\n\n`;
    fullPrompt += `Research the existing codebase structure and patterns before proposing the solution. \\`;

    // Send to terminal
    try {
        const success = await sendToAITerminal(fullPrompt);

        // Only play success sound if terminal send was successful
        if (success) {
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }

            vscode.window.showInformationMessage(
                `Tech spec research started! Bob AI will create: /research/research-${safeFileName}.md`
            );
        }
    } catch (err) {
        console.error('Failed to send to terminal:', err);
        vscode.window.showErrorMessage('Failed to start tech spec research');
    }
}

module.exports = {
    addFeatureCommand
};
