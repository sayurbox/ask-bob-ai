const vscode = require('vscode');

/**
 * Toggle auto-prompt clipboard image setting
 */
async function toggleAutoPromptCommand() {
    const config = vscode.workspace.getConfiguration('bobAiCli');
    const currentValue = config.get('autoPromptClipboardImage', false);
    const newValue = !currentValue;

    try {
        await config.update('autoPromptClipboardImage', newValue, vscode.ConfigurationTarget.Global);

        const status = newValue ? '✅ enabled' : '⏸️ disabled';
        const message = newValue
            ? '✅ Auto-detect screenshots: ENABLED\n\nNow when you take a screenshot, a notification will appear automatically!'
            : '⏸️ Auto-detect screenshots: DISABLED\n\nUse Command Palette or Cmd+Shift+K I to paste images manually.';

        vscode.window.showInformationMessage(message);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to update setting: ${error.message}`);
    }
}

module.exports = {
    toggleAutoPromptCommand
};
