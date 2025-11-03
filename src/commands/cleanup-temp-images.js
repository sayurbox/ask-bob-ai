const { getTempDirectory } = require('../utils/clipboard-image-handler');
const { showCleanupDialog } = require('../services/temp-file-manager');

/**
 * Command handler for cleaning up temp images
 * Shows dialog with cleanup options
 */
async function cleanupTempImagesCommand() {
    const tempDir = getTempDirectory();
    await showCleanupDialog(tempDir);
}

module.exports = {
    cleanupTempImagesCommand
};
