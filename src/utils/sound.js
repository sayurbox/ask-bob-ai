const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

/**
 * Play a sound file using system commands
 * @param {string} soundPath - Path to the sound file
 * @returns {Promise<void>}
 */
async function playSound(soundPath) {
    if (!fs.existsSync(soundPath)) {
        console.warn(`Sound file not found: ${soundPath}`);
        return;
    }

    return new Promise((resolve) => {
        const { exec } = require('child_process');

        // Platform-specific sound playback commands
        let command;
        const platform = process.platform;

        switch (platform) {
            case 'darwin': // macOS
                command = `afplay "${soundPath}"`;
                break;
            case 'win32': // Windows
                command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync();"`;
                break;
            case 'linux': // Linux
                // Try different Linux sound players
                command = `paplay "${soundPath}" || aplay "${soundPath}" || play "${soundPath}"`;
                break;
            default:
                console.warn(`Unsupported platform for sound playback: ${platform}`);
                resolve();
                return;
        }

        exec(command, (error) => {
            if (error) {
                console.warn(`Failed to play sound: ${error.message}`);
                resolve(); // Don't reject, just continue silently
            } else {
                resolve();
            }
        });
    });
}

/**
 * Play success sound after command completion
 * @returns {Promise<void>}
 */
async function playSuccessSound() {
    // Check if sound effects are enabled in settings
    const config = vscode.workspace.getConfiguration('bobAiCli');
    const soundEnabled = config.get('enableSoundEffects', true);

    if (!soundEnabled) {
        return; // Skip sound playback if disabled
    }

    const extensionPath = require('../extension').getExtensionPath();
    const soundPath = path.join(extensionPath, 'resources', 'feedback_sound.aiff');
    await playSound(soundPath);
}

module.exports = {
    playSound,
    playSuccessSound
};