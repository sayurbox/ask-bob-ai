const vscode = require('vscode');
const path = require('path');

/**
 * Supported image extensions
 */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];

/**
 * Check if file is an image based on extension
 * @param {vscode.Uri} fileUri - File URI to check
 * @returns {boolean} True if image file
 */
function isImageFile(fileUri) {
    if (!fileUri || !fileUri.fsPath) {
        return false;
    }

    const ext = path.extname(fileUri.fsPath).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Get supported image extensions as string for display
 * @returns {string} Comma-separated list of extensions
 */
function getSupportedExtensions() {
    return IMAGE_EXTENSIONS.join(', ');
}

/**
 * Validate if file path points to an image
 * @param {string} filePath - Absolute file path
 * @returns {boolean} True if valid image path
 */
function isValidImagePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        return false;
    }

    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Check if clipboard contains image data (VS Code limitation workaround)
 * @returns {Promise<boolean>} True if clipboard has image
 */
async function hasClipboardImage() {
    try {
        // VS Code API doesn't expose clipboard image detection directly
        // We check if clipboard text is an image file path
        const text = await vscode.env.clipboard.readText();

        if (text && text.trim()) {
            return isValidImagePath(text.trim());
        }

        return false;
    } catch (error) {
        console.error('Failed to check clipboard:', error);
        return false;
    }
}

/**
 * Get image file path from clipboard
 * @returns {Promise<string|null>} Image file path or null
 */
async function getClipboardImagePath() {
    try {
        const text = await vscode.env.clipboard.readText();

        if (text && text.trim() && isValidImagePath(text.trim())) {
            return text.trim();
        }

        return null;
    } catch (error) {
        console.error('Failed to read clipboard:', error);
        return null;
    }
}

module.exports = {
    isImageFile,
    isValidImagePath,
    hasClipboardImage,
    getClipboardImagePath,
    getSupportedExtensions,
    IMAGE_EXTENSIONS
};
