const vscode = require('vscode');
const { getTemplates } = require('../services/template-loader');

/**
 * Code Action Provider for inline AI suggestions (lightbulb icon)
 */
class AICodeActionProvider {
    provideCodeActions(document, range, context, token) {
        // Show for any non-empty range (selection or current line)
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            return [];
        }

        console.log('AICodeActionProvider: Providing code actions');

        const codeActions = [];

        // Get templates (from workspace or defaults)
        const templates = getTemplates();

        // Add each quick action as a code action
        templates.forEach(action => {
            if (!action.prompt || action.prompt === 'CUSTOM') {
                return; // Skip separator and custom
            }

            // Use QuickFix kind for lightbulb icon
            const codeAction = new vscode.CodeAction(
                action.label,
                vscode.CodeActionKind.QuickFix
            );

            codeAction.isPreferred = false;

            // Store the action info for later
            codeAction.command = {
                command: 'ask-ai-cli.executeQuickAction',
                title: action.label,
                arguments: [document, range, action]
            };

            codeActions.push(codeAction);
        });

        // Add "Custom prompt..." as a code action
        const customAction = new vscode.CodeAction(
            '✏️ Ask Bob AI (Custom prompt)...',
            vscode.CodeActionKind.QuickFix
        );
        customAction.command = {
            command: 'ask-ai-cli.executeQuickAction',
            title: 'Custom prompt',
            arguments: [document, range, { label: 'Custom', prompt: 'CUSTOM' }]
        };
        codeActions.push(customAction);

        console.log(`AICodeActionProvider: Returning ${codeActions.length} actions`);
        return codeActions;
    }
}

module.exports = {
    AICodeActionProvider
};
