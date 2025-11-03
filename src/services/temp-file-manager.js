const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

/**
 * Get all temp images from directory
 * @param {string} tempDir - Temp directory path
 * @returns {Array<Object>} Array of temp file info
 */
function getTempImages(tempDir) {
    try {
        if (!fs.existsSync(tempDir)) {
            return [];
        }

        const files = fs.readdirSync(tempDir);
        const images = files
            .filter(f => f.startsWith('bob-ai-') && f.endsWith('.png'))
            .map(f => {
                const filePath = path.join(tempDir, f);
                const stats = fs.statSync(filePath);
                return {
                    name: f,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    age: Date.now() - stats.birthtime.getTime()
                };
            })
            .sort((a, b) => b.created - a.created); // Newest first

        return images;
    } catch (error) {
        console.error('Failed to get temp images:', error);
        return [];
    }
}

/**
 * Delete old temp images based on age
 * @param {string} tempDir - Temp directory path
 * @param {number} maxAgeDays - Maximum age in days
 * @returns {number} Number of files deleted
 */
function cleanupOldImages(tempDir, maxAgeDays = 7) {
    const images = getTempImages(tempDir);
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    let deleted = 0;

    images.forEach(img => {
        if (img.age > maxAgeMs) {
            try {
                fs.unlinkSync(img.path);
                deleted++;
                console.log(`Deleted old temp image: ${img.name}`);
            } catch (error) {
                console.error(`Failed to delete ${img.name}:`, error.message);
            }
        }
    });

    return deleted;
}

/**
 * Delete all temp images
 * @param {string} tempDir - Temp directory path
 * @returns {number} Number of files deleted
 */
function cleanupAllImages(tempDir) {
    const images = getTempImages(tempDir);
    let deleted = 0;

    images.forEach(img => {
        try {
            fs.unlinkSync(img.path);
            deleted++;
            console.log(`Deleted temp image: ${img.name}`);
        } catch (error) {
            console.error(`Failed to delete ${img.name}:`, error.message);
        }
    });

    return deleted;
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }
}

/**
 * Show cleanup options dialog
 * @param {string} tempDir - Temp directory path
 * @returns {Promise<void>}
 */
async function showCleanupDialog(tempDir) {
    const images = getTempImages(tempDir);

    if (images.length === 0) {
        vscode.window.showInformationMessage('✅ No temp images to clean up');
        return;
    }

    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const totalSizeMB = formatSize(totalSize);

    // Calculate images by age
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const oldSevenDays = images.filter(img => img.age > sevenDaysMs).length;
    const oldThirtyDays = images.filter(img => img.age > thirtyDaysMs).length;

    const options = [
        {
            label: `🗑️ Delete All (${images.length} images, ${totalSizeMB})`,
            description: 'Remove all temporary images',
            action: 'all'
        },
        {
            label: `📅 Delete Older than 7 Days (${oldSevenDays} images)`,
            description: 'Keep recent images from the last week',
            action: '7days'
        },
        {
            label: `📅 Delete Older than 30 Days (${oldThirtyDays} images)`,
            description: 'Keep images from the last month',
            action: '30days'
        },
        {
            label: '📁 Open Temp Folder',
            description: 'Browse temporary images manually',
            action: 'open'
        }
    ];

    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: 'Choose cleanup option',
        title: '🧹 Clean Up Temp Images'
    });

    if (!selected) return;

    switch (selected.action) {
        case 'all':
            const confirmAll = await vscode.window.showWarningMessage(
                `Delete all ${images.length} temp images (${totalSizeMB})?`,
                { modal: true },
                'Delete All'
            );

            if (confirmAll === 'Delete All') {
                const deleted = cleanupAllImages(tempDir);
                vscode.window.showInformationMessage(`✅ Deleted ${deleted} temp images`);
            }
            break;

        case '7days':
            if (oldSevenDays === 0) {
                vscode.window.showInformationMessage('No images older than 7 days');
                return;
            }

            const confirm7 = await vscode.window.showWarningMessage(
                `Delete ${oldSevenDays} images older than 7 days?`,
                { modal: true },
                'Delete'
            );

            if (confirm7 === 'Delete') {
                const deleted7 = cleanupOldImages(tempDir, 7);
                vscode.window.showInformationMessage(`✅ Deleted ${deleted7} images older than 7 days`);
            }
            break;

        case '30days':
            if (oldThirtyDays === 0) {
                vscode.window.showInformationMessage('No images older than 30 days');
                return;
            }

            const confirm30 = await vscode.window.showWarningMessage(
                `Delete ${oldThirtyDays} images older than 30 days?`,
                { modal: true },
                'Delete'
            );

            if (confirm30 === 'Delete') {
                const deleted30 = cleanupOldImages(tempDir, 30);
                vscode.window.showInformationMessage(`✅ Deleted ${deleted30} images older than 30 days`);
            }
            break;

        case 'open':
            // Ensure directory exists before opening
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            vscode.env.openExternal(vscode.Uri.file(tempDir));
            break;
    }
}

module.exports = {
    getTempImages,
    cleanupOldImages,
    cleanupAllImages,
    showCleanupDialog,
    formatSize
};
