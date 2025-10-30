const vscode = require('vscode');

/**
 * Toggle sound effects on/off
 */
async function toggleSoundCommand() {
    const config = vscode.workspace.getConfiguration('bobAiCli');
    const currentValue = config.get('enableSoundEffects', true);
    const newValue = !currentValue;

    try {
        // Update the configuration (global scope)
        await config.update('enableSoundEffects', newValue, vscode.ConfigurationTarget.Global);

        const status = newValue ? 'enabled' : 'disabled';
        vscode.window.showInformationMessage(`Sound effects ${status}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to toggle sound effects: ${error.message}`);
    }
}

module.exports = { toggleSoundCommand };
