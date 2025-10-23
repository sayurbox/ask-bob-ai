const vscode = require('vscode');
const { AI_CLIS } = require('../config/ai-clis');
const { detectInstalledCLIs } = require('./cli-detector');

/**
 * Find AI CLI terminal (Claude Code, Gemini, etc.)
 * @returns {vscode.Terminal|null} Found terminal or null
 */
function findAITerminal() {
    const terminals = vscode.window.terminals;

    // First, look for terminals with known AI CLI identifiers
    let aiTerminal = terminals.find(terminal => {
        const name = terminal.name.toLowerCase();
        const shellPath = terminal.creationOptions.shellPath?.toLowerCase() || '';

        return name.includes('claude') ||
               shellPath.includes('claude') ||
               name.includes('anthropic') ||
               shellPath.includes('anthropic') ||
               name.includes('gemini') ||
               shellPath.includes('gemini');
    });

    // If no obvious AI terminal found, try to find the most recently active terminal
    // as a fallback - user might be running AI CLI in any terminal
    if (!aiTerminal && terminals.length > 0) {
        // Get the active terminal or the most recently created one
        aiTerminal = vscode.window.activeTerminal ||
                     terminals[terminals.length - 1]; // Last created terminal
    }

    return aiTerminal;
}

/**
 * Start an AI CLI in a new terminal
 * @param {Object} cliConfig - CLI configuration object
 * @returns {Promise<vscode.Terminal>} Created terminal
 */
async function startAICLI(cliConfig) {
    // Create a new terminal
    const terminal = vscode.window.createTerminal({
        name: cliConfig.terminalName,
        hideFromUser: false
    });

    // Show the terminal
    terminal.show();

    // Send the command to start AI CLI
    terminal.sendText(cliConfig.command);

    // Show helpful message
    vscode.window.showInformationMessage(
        `Starting ${cliConfig.name}... If it doesn't start, you may need to install it first.`
    );

    // Give it a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    return terminal;
}

/**
 * Show picker to select and start AI CLI
 * @returns {Promise<vscode.Terminal|null>} Started terminal or null if cancelled
 */
async function showAICLIPicker() {
    // Detect installed CLIs in background (non-blocking)
    const detectionPromise = detectInstalledCLIs();

    // Show all CLIs immediately, mark detected ones later
    const quickPickItems = AI_CLIS.map(cli => ({
        label: `${cli.icon} ${cli.name}`,
        description: `Command: ${cli.command}`,
        cli: cli,
        picked: false
    }));

    // Add option for custom command
    quickPickItems.push({
        label: '🔧 Custom command...',
        description: 'Enter a custom AI CLI command',
        cli: null
    });

    // Wait for detection to complete (fast, runs in parallel)
    const installedCLIs = await detectionPromise;

    // Update descriptions for detected CLIs
    quickPickItems.forEach(item => {
        if (item.cli) {
            const isInstalled = installedCLIs.some(installed =>
                installed.command === item.cli.command
            );
            if (isInstalled) {
                item.description = `✅ Detected (${item.cli.command})`;
                item.picked = true;
            }
        }
    });

    // Show quick pick
    const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: 'Select AI CLI to start (will try to run even if not detected)',
        title: 'Start AI CLI'
    });

    if (!selected) {
        return null;
    }

    // Handle custom command
    if (!selected.cli) {
        const customCommand = await vscode.window.showInputBox({
            prompt: 'Enter custom AI CLI command',
            placeHolder: 'e.g., my-ai-cli, /path/to/ai-cli',
            validateInput: (text) => {
                return text.trim().length === 0 ? 'Command cannot be empty' : null;
            }
        });

        if (!customCommand) {
            return null;
        }

        const customCli = {
            name: customCommand,
            command: customCommand,
            terminalName: customCommand,
            icon: '🤖'
        };

        return await startAICLI(customCli);
    }

    // Start the selected AI CLI (will try even if not detected)
    return await startAICLI(selected.cli);
}

/**
 * Check if terminal is an obvious AI CLI terminal
 * @param {vscode.Terminal} terminal - Terminal to check
 * @returns {boolean} True if obvious AI CLI terminal
 */
function isObviousAITerminal(terminal) {
    if (!terminal) {
        return false;
    }

    const name = terminal.name.toLowerCase();
    const shellPath = terminal.creationOptions.shellPath?.toLowerCase() || '';

    return name.includes('claude') ||
           shellPath.includes('claude') ||
           name.includes('anthropic') ||
           shellPath.includes('anthropic') ||
           name.includes('gemini') ||
           shellPath.includes('gemini');
}

/**
 * Send text to AI CLI terminal, with option to start if not found
 * @param {string} text - Text to send to terminal
 * @returns {Promise<boolean>} True if sent successfully, false otherwise
 */
async function sendToAITerminal(text) {
    let aiTerminal = findAITerminal();

    // Check if we're using a fallback terminal (not an obvious AI terminal)
    const isObviousAI = isObviousAITerminal(aiTerminal);

    // If no obvious AI terminal found, ask to start AI CLI
    if (!isObviousAI) {
        const message = aiTerminal
            ? 'No AI CLI terminal detected. Start an AI CLI in a new terminal?'
            : 'No terminal found. Start an AI CLI?';

        const answer = await vscode.window.showInformationMessage(
            message,
            'Yes, start AI CLI',
            'Use current terminal',
            'Cancel'
        );

        if (answer === 'Yes, start AI CLI') {
            aiTerminal = await showAICLIPicker();
            if (!aiTerminal) {
                return false;
            }
        } else if (answer === 'Use current terminal') {
            // Use the existing terminal (fallback for other AI CLIs)
            if (!aiTerminal) {
                vscode.window.showErrorMessage('No terminal available');
                return false;
            }
        } else {
            return false;
        }
    }

    // Show the terminal first to make it visible
    aiTerminal.show();

    // Send the text
    aiTerminal.sendText(text);

    // Update the flag after potentially starting AI CLI
    const isFinalAITerminal = isObviousAITerminal(aiTerminal);

    if (isFinalAITerminal) {
        vscode.window.showInformationMessage('Sent to AI CLI terminal');
    } else {
        vscode.window.showInformationMessage('Sent to active terminal');
    }
    return true;
}

module.exports = {
    findAITerminal,
    findClaudeCodeTerminal: findAITerminal, // Backward compatibility alias
    startAICLI,
    showAICLIPicker,
    sendToAITerminal,
    sendToClaudeTerminal: sendToAITerminal, // Backward compatibility alias
    isObviousAITerminal,
    isObviousClaudeTerminal: isObviousAITerminal // Backward compatibility alias
};
