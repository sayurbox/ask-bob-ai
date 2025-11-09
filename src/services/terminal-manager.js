const vscode = require('vscode');
const { AI_CLIS } = require('../config/ai-clis');
const { detectInstalledCLIs } = require('./cli-detector');

// Track AI CLI terminals we've started
const trackedAITerminals = new Set();

/**
 * Setup terminal lifecycle listeners
 * @param {vscode.ExtensionContext} context - Extension context
 */
function setupTerminalListeners(context) {
    // Listen for terminal close events
    const closeListener = vscode.window.onDidCloseTerminal(terminal => {
        if (trackedAITerminals.has(terminal)) {
            console.log(`AI CLI terminal closed: ${terminal.name}`);
            trackedAITerminals.delete(terminal);
        }
    });

    context.subscriptions.push(closeListener);
}

/**
 * Find AI CLI terminal (Claude Code, Gemini, etc.)
 * @returns {vscode.Terminal|null} Found terminal or null
 */
function findAITerminal() {
    const terminals = vscode.window.terminals;

    // First, check tracked terminals (ones we started)
    for (const terminal of trackedAITerminals) {
        // Verify terminal still exists in VS Code
        if (terminals.includes(terminal)) {
            return terminal;
        } else {
            // Clean up dead reference
            trackedAITerminals.delete(terminal);
        }
    }

    // First, look for terminals with known AI CLI identifiers
    let aiTerminal = terminals.find(terminal => {
        const name = terminal.name.toLowerCase();
        const shellPath = terminal.creationOptions.shellPath?.toLowerCase() || '';

        return name.includes('claude') ||
               shellPath.includes('claude') ||
               name.includes('anthropic') ||
               shellPath.includes('anthropic') ||
               name.includes('gemini') ||
               shellPath.includes('gemini') ||
               name.includes('droid') ||
               shellPath.includes('droid') ||
               name.includes('chatgpt') ||
               shellPath.includes('chatgpt') ||
               name.includes('gpt') ||
               shellPath.includes('gpt') ||
               name.includes('aider') ||
               shellPath.includes('aider');
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

    // Track this terminal
    trackedAITerminals.add(terminal);

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
    const quickPickItems = AI_CLIS.map(cli => {
        const supportStatus = cli.supported ? '' : '🚧 Coming Soon';
        return {
            label: `${cli.icon} ${cli.name}`,
            description: supportStatus || `Command: ${cli.command}`,
            detail: cli.supported ? undefined : 'This AI CLI is not yet supported',
            cli: cli,
            picked: false
        };
    });

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
                if (item.cli.supported) {
                    item.description = `✅ Detected (${item.cli.command})`;
                    item.picked = true;
                } else {
                    item.description = `✅ Detected - 🚧 Coming Soon`;
                    item.detail = 'Detected but not yet supported by Bob AI CLI';
                }
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

    // Check if CLI is supported before starting
    if (!selected.cli.supported) {
        vscode.window.showWarningMessage(
            `${selected.cli.name} is not yet supported by Bob AI CLI. Support coming soon!`,
            'Got it'
        );
        return null;
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
           shellPath.includes('gemini') ||
           name.includes('droid') ||
           shellPath.includes('droid') ||
           name.includes('chatgpt') ||
           shellPath.includes('chatgpt') ||
           name.includes('gpt') ||
           shellPath.includes('gpt') ||
           name.includes('aider') ||
           shellPath.includes('aider');
}

/**
 * Detect which CLI type is running in the terminal
 * @param {vscode.Terminal} terminal - Terminal to check
 * @returns {string} CLI type: 'claude', 'gemini', 'droid', 'chatgpt', 'aider', or 'unknown'
 */
function detectCLIType(terminal) {
    if (!terminal) {
        return 'unknown';
    }

    const name = terminal.name.toLowerCase();
    const shellPath = terminal.creationOptions.shellPath?.toLowerCase() || '';

    if (name.includes('gemini') || shellPath.includes('gemini')) {
        return 'gemini';
    }

    if (name.includes('droid') || shellPath.includes('droid')) {
        return 'droid';
    }

    if (name.includes('claude') || shellPath.includes('claude') ||
        name.includes('anthropic') || shellPath.includes('anthropic')) {
        return 'claude';
    }

    if (name.includes('chatgpt') || shellPath.includes('chatgpt') ||
        name.includes('gpt') || shellPath.includes('gpt')) {
        return 'chatgpt';
    }

    if (name.includes('aider') || shellPath.includes('aider')) {
        return 'aider';
    }

    return 'unknown';
}

/**
 * Send text to AI CLI terminal, blocks if no AI CLI is running
 * @param {string} text - Text to send to terminal
 * @returns {Promise<boolean>} True if sent successfully, false otherwise
 */
async function sendToAITerminal(text) {
    // Find active AI CLI terminal (Claude Code, Gemini, etc.)
    let aiTerminal = findAITerminal();

    // Validate terminal still exists in VS Code terminal list
    if (aiTerminal) {
        const allTerminals = vscode.window.terminals;
        if (!allTerminals.includes(aiTerminal)) {
            // Terminal was closed, clean up tracking
            trackedAITerminals.delete(aiTerminal);
            aiTerminal = null;
        }
    }

    // Check if terminal is an obvious AI CLI (not just any terminal)
    const isObviousAI = isObviousAITerminal(aiTerminal);

    // Block action if no obvious AI CLI terminal found
    if (!isObviousAI) {
        const answer = await vscode.window.showErrorMessage(
            'No AI CLI detected. Please start Claude Code or Gemini CLI first.',
            'Start AI CLI Now'
        );

        if (answer === 'Start AI CLI Now') {
            // Open AI CLI picker command
            vscode.commands.executeCommand('ask-ai-cli.startAICLI');
        }

        return false; // Block the action
    }

    try {
        // Show terminal to make it visible and focused
        aiTerminal.show();

        // Detect CLI type for proper formatting (claude, gemini, droid, etc.)
        const cliType = detectCLIType(aiTerminal);

        // Verify CLI is supported before sending
        if (cliType !== 'claude' && cliType !== 'gemini' && cliType !== 'droid') {
            const cliName = aiTerminal.name;
            vscode.window.showWarningMessage(
                `Support for "${cliName}" is coming soon! Currently only Claude Code, Gemini CLI, and Droid AI CLI are supported.`,
                'Got it'
            );
            return false;
        }

        // Strip trailing backslash and whitespace
        let formattedText = text.replace(/\s*\\+\s*$/, '').trim();

        // Gemini CLI: Use clipboard method (sendText may not work reliably)
        if (cliType === 'gemini') {
            // Copy to clipboard first
            await vscode.env.clipboard.writeText(formattedText);

            // Focus terminal
            aiTerminal.show();

            // Small delay to ensure terminal has focus
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try to auto-paste using VS Code command
            try {
                await vscode.commands.executeCommand('workbench.action.terminal.paste');
                vscode.window.showInformationMessage('Text pasted into Gemini CLI terminal');
            } catch (pasteError) {
                // Fallback: show manual paste instruction
                vscode.window.showInformationMessage(
                    'Text copied to clipboard! Paste it into Gemini CLI terminal (Cmd+V or Ctrl+V)',
                    'Got it'
                );
            }

            return true;
        }

        // Claude Code and Droid AI: Send text WITHOUT auto-enter
        // User can review the prompt before pressing Enter manually
        aiTerminal.sendText(formattedText, false);

        return true;
    } catch (error) {
        // If sending fails, terminal might be dead - clean up
        trackedAITerminals.delete(aiTerminal);

        console.error(`Terminal send error:`, error);
        vscode.window.showErrorMessage(
            `Failed to send to terminal: ${error.message}. The AI CLI may have been closed.`
        );
        return false;
    }
}

module.exports = {
    setupTerminalListeners,
    findAITerminal,
    findClaudeCodeTerminal: findAITerminal, // Backward compatibility alias
    startAICLI,
    showAICLIPicker,
    sendToAITerminal,
    sendToClaudeTerminal: sendToAITerminal, // Backward compatibility alias
    isObviousAITerminal,
    isObviousClaudeTerminal: isObviousAITerminal, // Backward compatibility alias
    detectCLIType
};
