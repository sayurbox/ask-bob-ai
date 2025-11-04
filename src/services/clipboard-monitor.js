const vscode = require('vscode');
const { saveClipboardImageToTemp, getImageMetadata } = require('../utils/clipboard-image-handler');
const { showImagePreview } = require('../views/image-preview');
const { sendToAITerminal, findAITerminal, isObviousAITerminal } = require('../services/terminal-manager');
const { playSuccessSound } = require('../utils/sound');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

/**
 * Clipboard Monitor Service
 * Automatically detects when screenshots or images are copied to clipboard
 * ALWAYS RUNS when auto-prompt is enabled - keeps checking every 2 seconds
 */

let monitorInterval = null;
let isProcessing = false;
let extensionContext = null;
let checkCount = 0;

// Deduplication - same as paste-image-from-clipboard.js
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
 * Try to get image from clipboard (aggressive approach)
 * Returns image path if found, null otherwise
 * @returns {Promise<string|null>}
 */
async function tryGetClipboardImage() {
    try {
        // Try to save clipboard image directly
        const imagePath = await saveClipboardImageToTemp();
        return imagePath || null;
    } catch (error) {
        // Silently return null - clipboard probably has text
        return null;
    }
}

/**
 * Handle detected clipboard image
 * Shows notification with Preview/Ignore buttons (only when AI CLI is running)
 * @param {string} imagePath - Path to detected image
 */
async function handleDetectedImage(imagePath) {
    if (isProcessing) {
        return;
    }

    // Check for duplicate (same image within 60 seconds)
    const imageHash = getImageHash(imagePath);
    if (imageHash && wasRecentlyShown(imageHash)) {
        // Silently ignore - already shown within last 60 seconds
        return;
    }

    // Check if AI CLI is running
    const aiTerminal = findAITerminal();
    const isObviousAI = isObviousAITerminal(aiTerminal);

    if (!isObviousAI) {
        // No AI CLI running - silently ignore (clean UX)
        return;
    }

    isProcessing = true;

    // Mark as shown before displaying notification
    if (imageHash) {
        markAsShown(imageHash);
    }

    try {
        // Show notification with action buttons
        const action = await vscode.window.showInformationMessage(
            '📷 Screenshot detected in clipboard!',
            { modal: false },
            'Preview & Send',
            'Ignore'
        );

        if (action === 'Preview & Send') {
            await openPreviewAndSend(imagePath);
        }
    } catch (error) {
        console.error('[ClipboardMonitor] Error handling detected image:', error);
    } finally {
        isProcessing = false;
    }
}

/**
 * Open preview and send image flow
 * @param {string} imagePath - Path to the image (already saved)
 */
async function openPreviewAndSend(imagePath) {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "📋 Opening preview...",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: "Loading image..." });

            // Verify image still exists
            if (!imagePath) {
                vscode.window.showErrorMessage('❌ No image to preview');
                return;
            }

            progress.report({ increment: 30, message: "Loading preview..." });

            // Get metadata
            const metadata = getImageMetadata(imagePath);
            if (!metadata) {
                vscode.window.showErrorMessage('❌ Failed to read image metadata');
                return;
            }

            progress.report({ increment: 50, message: "Opening preview..." });

            // Show preview
            const shouldSend = await showImagePreview(extensionContext, imagePath, metadata);

            if (!shouldSend) {
                // Silently cancel - clarity first
                return;
            }

            progress.report({ increment: 70, message: "Sending to terminal..." });

            // Send to terminal
            const fileName = path.basename(imagePath);
            const terminalText = `Here's an image (${fileName}): ${imagePath}`;

            const success = await sendToAITerminal(terminalText);

            if (success) {
                progress.report({ increment: 100, message: "Done!" });

                try {
                    await playSuccessSound();
                } catch (soundErr) {
                    // Silent sound error
                }

                vscode.window.showInformationMessage(
                    `✅ Image sent to terminal!\n` +
                    `📁 Saved in: ~/.bob-ai/temp/`
                );
            } else {
                vscode.window.showErrorMessage(
                    '❌ No AI CLI terminal found. Start Claude Code or AI CLI first.'
                );
            }
        });
    } catch (error) {
        console.error('[ClipboardMonitor] Error in openPreviewAndSend:', error);
        vscode.window.showErrorMessage(`❌ Failed to process image: ${error.message}`);
    }
}

/**
 * Check clipboard periodically for images
 * ALWAYS TRIES - no hash comparison (more reliable)
 */
async function checkClipboard() {
    if (isProcessing) {
        return;
    }

    checkCount++;

    try {
        // Try to get image from clipboard directly
        const imagePath = await tryGetClipboardImage();

        if (imagePath) {
            // Found an image! Show notification
            await handleDetectedImage(imagePath);
        }
    } catch (error) {
        console.error('[ClipboardMonitor] Error checking clipboard:', error);
        // DON'T STOP - keep monitoring even on error
    }
}

/**
 * Start monitoring clipboard
 * @param {vscode.ExtensionContext} context - Extension context
 * ALWAYS RUNS - keeps checking as long as VS Code is open
 */
function startMonitoring(context) {
    // Store context for later use
    extensionContext = context;

    // Check if auto-prompt is enabled
    const config = vscode.workspace.getConfiguration('bobAiCli');
    const autoPromptEnabled = config.get('autoPromptClipboardImage', false);

    if (!autoPromptEnabled) {
        return;
    }

    if (monitorInterval) {
        return;
    }

    // Reset state
    checkCount = 0;
    isProcessing = false;
    recentlyShownImages.clear();

    // Check clipboard every 2 seconds
    monitorInterval = setInterval(checkClipboard, 2000);

    // Clean up on extension deactivation
    context.subscriptions.push({
        dispose: () => {
            stopMonitoring();
        }
    });
}

/**
 * Stop monitoring clipboard
 */
function stopMonitoring() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
    }
}

/**
 * Restart monitoring (when settings change)
 * @param {vscode.ExtensionContext} context - Extension context
 */
function restartMonitoring(context) {
    stopMonitoring();
    startMonitoring(context);
}

module.exports = {
    startMonitoring,
    stopMonitoring,
    restartMonitoring
};
