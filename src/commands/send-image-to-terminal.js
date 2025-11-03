const vscode = require('vscode');
const path = require('path');
const { sendToAITerminal } = require('../services/terminal-manager');
const { isImageFile, getSupportedExtensions } = require('../utils/image-detector');
const { playSuccessSound } = require('../utils/sound');

/**
 * Command handler for sending image file to terminal
 * @param {vscode.Uri} resourceUri - Image file URI from context menu
 */
async function sendImageToTerminalCommand(resourceUri) {
    // Get file path (from context menu or active file)
    let imageUri = resourceUri;

    // Fallback to active editor if no URI provided
    if (!imageUri) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            imageUri = editor.document.uri;
        }
    }

    // Validate we have a file
    if (!imageUri) {
        vscode.window.showErrorMessage('No image file selected');
        return;
    }

    // Validate it's an image
    if (!isImageFile(imageUri)) {
        vscode.window.showErrorMessage(
            `Selected file is not an image. Supported formats: ${getSupportedExtensions()}`
        );
        return;
    }

    // Get absolute path (Claude Code needs absolute paths)
    const imagePath = imageUri.fsPath;
    const fileName = path.basename(imagePath);

    // Build prompt with image reference
    // Claude Code supports: "Analyze this: /path/to/image.png"
    const terminalText = `Here's an image (${fileName}): ${imagePath}`;

    // Send to AI CLI terminal
    try {
        const success = await sendToAITerminal(terminalText);

        // Only play success sound if terminal send was successful
        if (success) {
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }
        }
    } catch (err) {
        console.error('Failed to send image to terminal:', err);
        vscode.window.showErrorMessage(`Failed to send image: ${err.message}`);
    }
}

module.exports = {
    sendImageToTerminalCommand
};
