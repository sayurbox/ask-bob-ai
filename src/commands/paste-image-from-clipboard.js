const vscode = require('vscode');
const { saveClipboardImageToTemp, getImageMetadata } = require('../utils/clipboard-image-handler');
const { showImagePreview } = require('../views/image-preview');
const { sendToAITerminal } = require('../services/terminal-manager');
const { playSuccessSound } = require('../utils/sound');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Track recently shown images to prevent duplicates
// Map<imageHash, timestamp>
const recentlyShownImages = new Map();
const DEDUP_WINDOW_MS = 60 * 1000; // 60 seconds

/**
 * Get hash of image file for deduplication
 * @param {string} imagePath - Path to image file
 * @returns {string|null} Hash string or null if failed
 */
function getImageHash(imagePath) {
    try {
        const buffer = fs.readFileSync(imagePath);
        return crypto.createHash('md5').update(buffer).digest('hex');
    } catch (error) {
        return null;
    }
}

/**
 * Check if image was recently shown (within 60 seconds)
 * @param {string} imageHash - Hash of the image
 * @returns {boolean} True if image was shown recently
 */
function wasRecentlyShown(imageHash) {
    const now = Date.now();

    // Cleanup old entries
    for (const [hash, timestamp] of recentlyShownImages.entries()) {
        if (now - timestamp > DEDUP_WINDOW_MS) {
            recentlyShownImages.delete(hash);
        }
    }

    // Check if this image was shown recently
    return recentlyShownImages.has(imageHash);
}

/**
 * Mark image as shown
 * @param {string} imageHash - Hash of the image
 */
function markAsShown(imageHash) {
    recentlyShownImages.set(imageHash, Date.now());
}

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
            title: "📋 Saving clipboard image...",
            cancellable: true
        }, async (progress, token) => {
            // Check for cancellation
            if (token.isCancellationRequested) {
                return;
            }

            progress.report({ increment: 0, message: "Checking clipboard..." });

            // Try to save clipboard image to temp file
            let imagePath;
            try {
                imagePath = await saveClipboardImageToTemp();
            } catch (saveError) {
                console.error('[PasteImage] Save error:', saveError);
                vscode.window.showErrorMessage(
                    `❌ ${saveError.message}`
                );
                return;
            }

            if (!imagePath) {
                // No image in clipboard or failed to save
                vscode.window.showWarningMessage(
                    '📋 No image found in clipboard. Try:\n' +
                    '1. Take a screenshot (Cmd+Shift+4 / Win+Shift+S)\n' +
                    '2. Copy an image from browser or file\n' +
                    '3. Run this command again'
                );
                return;
            }

            progress.report({ increment: 30, message: "Image saved, loading preview..." });

            // Get image metadata
            const metadata = getImageMetadata(imagePath);

            if (!metadata) {
                console.error('[PasteImage] Failed to get image metadata');
                vscode.window.showErrorMessage('❌ Failed to read image metadata');
                return;
            }

            // Check for duplicate (same image within 60 seconds)
            const imageHash = getImageHash(imagePath);
            if (imageHash && wasRecentlyShown(imageHash)) {
                // Silently ignore - don't show preview again
                return;
            }

            progress.report({ increment: 50, message: "Opening preview..." });

            // Mark as shown before displaying preview
            if (imageHash) {
                markAsShown(imageHash);
            }

            // Show preview and wait for user confirmation
            let shouldSend;
            try {
                shouldSend = await showImagePreview(context, imagePath, metadata);
            } catch (previewError) {
                console.error('[PasteImage] Preview error:', previewError);
                vscode.window.showErrorMessage(`❌ Failed to show preview: ${previewError.message}`);
                return;
            }

            if (!shouldSend) {
                // User cancelled - silently keep image in temp directory
                return;
            }

            progress.report({ increment: 70, message: "Sending to terminal..." });

            // Build terminal text with image reference
            // Format: "Here's an image (filename): /absolute/path/to/image.png"
            const fileName = path.basename(imagePath);
            const terminalText = `Here's an image (${fileName}): ${imagePath}`;

            // Send to AI CLI terminal (text will populate input, user presses Enter)
            let success;
            try {
                success = await sendToAITerminal(terminalText);
            } catch (terminalError) {
                console.error('[PasteImage] Terminal error:', terminalError);
                vscode.window.showErrorMessage(`❌ Failed to send to terminal: ${terminalError.message}`);
                return;
            }

            if (success) {
                progress.report({ increment: 100, message: "Done!" });

                // Play success sound if enabled
                try {
                    await playSuccessSound();
                } catch (soundErr) {
                    // Ignore sound errors
                }
            } else {
                // No AI CLI found - show error
                vscode.window.showErrorMessage(
                    '❌ No AI CLI terminal found. Start Claude Code or AI CLI first.'
                );
            }
        });
    } catch (error) {
        console.error('[PasteImage] Unexpected error:', error);
        vscode.window.showErrorMessage(
            `❌ Failed to paste image: ${error.message}\n\n` +
            `Check Developer Console (Help > Toggle Developer Tools) for details.`
        );
    }
}

module.exports = {
    pasteImageFromClipboardCommand
};
