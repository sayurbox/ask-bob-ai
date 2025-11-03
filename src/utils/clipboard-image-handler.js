const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Get temp directory for clipboard images
 * Location: ~/.bob-ai/temp/
 * @returns {string} Temp directory path
 */
function getTempDirectory() {
    const homeDir = os.homedir();
    const tempDir = path.join(homeDir, '.bob-ai', 'temp');

    // Create directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return tempDir;
}

/**
 * Generate temp filename with timestamp
 * Format: bob-ai-YYYY-MM-DDTHH-MM-SS.png
 * @returns {string} Full path to temp file
 */
function generateTempFilePath() {
    const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, ''); // Remove milliseconds
    const filename = `bob-ai-${timestamp}.png`;
    return path.join(getTempDirectory(), filename);
}

/**
 * Check if clipboard contains image data
 * Note: VS Code API limitation - we can only detect empty clipboard or text
 * This is a best-effort detection
 *
 * @returns {Promise<boolean>} True if clipboard might have image
 */
async function hasClipboardImage() {
    try {
        const text = await vscode.env.clipboard.readText();

        // If clipboard is empty, might have image
        if (!text || text.trim().length === 0) {
            return true; // Potential image
        }

        // Check if text looks like an image path
        if (text.match(/\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to check clipboard:', error);
        return false;
    }
}

/**
 * Save clipboard image to temp file using platform-specific commands
 * @returns {Promise<string|null>} Path to saved image or null if failed
 */
async function saveClipboardImageToTemp() {
    const tempPath = generateTempFilePath();
    const platform = os.platform();

    try {
        let command;

        if (platform === 'darwin') {
            // macOS: Use osascript to save clipboard image
            command = `osascript -e 'set theFile to (POSIX file "${tempPath}") as «class furl»' -e 'try' -e 'set imageData to the clipboard as «class PNGf»' -e 'set imageFile to open for access theFile with write permission' -e 'write imageData to imageFile' -e 'close access imageFile' -e 'on error' -e 'try' -e 'close access theFile' -e 'end try' -e 'return' -e 'end try'`;
        } else if (platform === 'win32') {
            // Windows: Use PowerShell to save clipboard image
            const psCommand = `Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $img = [System.Windows.Forms.Clipboard]::GetImage(); if ($img -ne $null) { $img.Save('${tempPath.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png); exit 0 } else { exit 1 }`;
            command = `powershell -command "${psCommand}"`;
        } else {
            // Linux: Use xclip (check if installed first)
            try {
                await execAsync('which xclip');
            } catch {
                throw new Error(
                    'xclip is not installed. Install it with:\n' +
                    '  Ubuntu/Debian: sudo apt-get install xclip\n' +
                    '  Fedora/RHEL: sudo yum install xclip\n' +
                    '  Arch: sudo pacman -S xclip'
                );
            }
            command = `xclip -selection clipboard -t image/png -o > "${tempPath}"`;
        }

        // Execute command
        await execAsync(command);

        // Verify file was created and has content
        if (fs.existsSync(tempPath)) {
            const stats = fs.statSync(tempPath);
            if (stats.size > 0) {
                console.log(`Clipboard image saved to: ${tempPath}`);
                return tempPath;
            } else {
                // Empty file, delete it
                fs.unlinkSync(tempPath);
                console.log('Clipboard image file is empty, deleted');
                return null;
            }
        }

        return null;
    } catch (error) {
        console.error('Failed to save clipboard image:', error.message);

        // Clean up temp file if it was created but is empty/corrupted
        if (fs.existsSync(tempPath)) {
            try {
                fs.unlinkSync(tempPath);
            } catch (unlinkError) {
                console.error('Failed to clean up temp file:', unlinkError);
            }
        }

        return null;
    }
}

/**
 * Get image metadata (size, dimensions)
 * @param {string} imagePath - Path to image file
 * @returns {Object|null} Image metadata or null if failed
 */
function getImageMetadata(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

        // Determine size display format
        const sizeDisplay = stats.size < 1024 * 1024
            ? `${sizeKB} KB`
            : `${sizeMB} MB`;

        return {
            size: sizeDisplay,
            sizeBytes: stats.size,
            path: imagePath,
            filename: path.basename(imagePath),
            created: stats.birthtime
        };
    } catch (error) {
        console.error('Failed to get image metadata:', error);
        return null;
    }
}

/**
 * Check if temp directory is writable
 * @returns {boolean} True if writable
 */
function isTempDirectoryWritable() {
    try {
        const tempDir = getTempDirectory();
        const testFile = path.join(tempDir, '.write-test');

        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);

        return true;
    } catch (error) {
        console.error('Temp directory not writable:', error);
        return false;
    }
}

module.exports = {
    getTempDirectory,
    generateTempFilePath,
    hasClipboardImage,
    saveClipboardImageToTemp,
    getImageMetadata,
    isTempDirectoryWritable
};
