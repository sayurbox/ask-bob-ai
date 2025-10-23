const { exec } = require('child_process');
const { promisify } = require('util');
const { AI_CLIS } = require('../config/ai-clis');

const execAsync = promisify(exec);

/**
 * Auto-detect installed AI CLIs on the system
 * @returns {Promise<Array>} Array of installed CLI configurations
 */
async function detectInstalledCLIs() {
    const installedCLIs = [];

    for (const cli of AI_CLIS) {
        try {
            await execAsync(cli.checkCommand);
            installedCLIs.push(cli);
        } catch (error) {
            // CLI not installed, try fallback commands if available
            if (cli.fallbackCommands) {
                for (const fallbackCmd of cli.fallbackCommands) {
                    try {
                        await execAsync(`which ${fallbackCmd}`);
                        installedCLIs.push({
                            ...cli,
                            command: fallbackCmd
                        });
                        break;
                    } catch (e) {
                        // Fallback also not found
                    }
                }
            }
        }
    }

    return installedCLIs;
}

module.exports = {
    detectInstalledCLIs
};
