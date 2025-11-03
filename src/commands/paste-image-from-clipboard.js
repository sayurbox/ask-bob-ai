const vscode = require('vscode');
const { saveClipboardImageToTemp, getImageMetadata } = require('../utils/clipboard-image-handler');
const { showImagePreview } = require('../views/image-preview');
const { sendToAITerminal } = require('../services/terminal-manager');
const { playSuccessSound } = require('../utils/sound');
const path = require('path');

/**
 * Command handler for pasting image from clipboard
 * Shows preview before sending to terminal
 * @param {vscode.ExtensionContext} context - Extension context
 */
async function pasteImageFromClipboardCommand(context) {
    try {
        // Show progress indicator
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Saving clipboard image...",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });

            // Try to save clipboard image to temp file
            const imagePath = await saveClipboardImageToTemp();

            if (!imagePath) {
                // No image in clipboard or failed to save
                vscode.window.showErrorMessage(
                    'No image found in clipboard. Copy an image first (screenshot or copy from browser).'
                );
                return;
            }

            progress.report({ increment: 50, message: "Image saved" });

            // Get image metadata
            const metadata = getImageMetadata(imagePath);

            if (!metadata) {
                vscode.window.showErrorMessage('Failed to read image metadata');
                return;
            }

            progress.report({ increment: 100 });

            // Show preview and wait for user confirmation
            const shouldSend = await showImagePreview(context, imagePath, metadata);

            if (!shouldSend) {
                // User cancelled - image file remains in temp directory
                vscode.window.showInformationMessage(
                    `Image saved to temp folder: ${path.basename(imagePath)}`
                );
                return;
            }

            // User confirmed - send to terminal
            const fileName = path.basename(imagePath);
            const terminalText = `Here's an image (${fileName}): ${imagePath}`;

            // Send to AI CLI terminal
            const success = await sendToAITerminal(terminalText);

            if (success) {
                // Play success sound
                try {
                    await playSuccessSound();
                } catch (soundErr) {
                    console.warn('Failed to play success sound:', soundErr.message);
                }

                vscode.window.showInformationMessage(
                    `✅ Image sent to terminal (saved in: ~/.bob-ai/temp/)`
                );
            }
        });
    } catch (error) {
        console.error('Failed to paste image from clipboard:', error);
        vscode.window.showErrorMessage(
            `Failed to paste image: ${error.message}`
        );
    }
}

module.exports = {
    pasteImageFromClipboardCommand
};
