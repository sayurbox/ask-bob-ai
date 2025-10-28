const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;

/**
 * Ensures Claude Code skills are deployed to workspace
 * @param {vscode.ExtensionContext} context - Extension context
 * @returns {Promise<boolean>} True if skills are available
 */
async function ensureSkillsDeployed(context) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return false;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    const skillsDir = path.join(workspacePath, '.claude', 'skills');
    const targetSkillFile = path.join(skillsDir, 'deep-review.md');

    try {
        // Check if skill already exists
        try {
            await fs.access(targetSkillFile);
            return true; // Skill already deployed
        } catch {
            // Skill doesn't exist, deploy it
        }

        // Create .claude/skills directory if needed
        await fs.mkdir(skillsDir, { recursive: true });

        // Copy skill from extension templates to workspace
        const extensionPath = context.extensionPath;
        const sourceSkillFile = path.join(extensionPath, 'templates', 'skills', 'deep-review.md');

        const skillContent = await fs.readFile(sourceSkillFile, 'utf8');
        await fs.writeFile(targetSkillFile, skillContent, 'utf8');

        return true;
    } catch (error) {
        console.error('Failed to deploy skills:', error);
        return false;
    }
}

/**
 * Check if we're in a Claude Code terminal
 * @returns {boolean}
 */
function isClaudeCodeTerminal() {
    const { findAITerminal } = require('./terminal-manager');
    const terminal = findAITerminal();
    return terminal && terminal.name.toLowerCase().includes('claude');
}

/**
 * Check if a skill was already deployed (before this session)
 * @param {string} skillName - Name of the skill
 * @returns {Promise<boolean>}
 */
async function wasSkillAlreadyDeployed(skillName) {
    const vscode = require('vscode');
    const path = require('path');

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return false;

    const skillFile = path.join(workspaceFolder.uri.fsPath, '.claude', 'skills', `${skillName}.md`);

    try {
        await fs.access(skillFile);
        return true;
    } catch {
        return false;
    }
}

/**
 * Invoke a skill or fallback to inline prompt
 * @param {vscode.ExtensionContext} context - Extension context
 * @param {string} skillName - Name of the skill to invoke
 * @param {string} args - Arguments to pass to the skill
 * @param {string} fallbackPrompt - Inline prompt if skill not available
 * @returns {Promise<string>} The message to send to terminal
 */
async function invokeSkillOrFallback(context, skillName, args, fallbackPrompt) {
    const vscode = require('vscode');

    // Check if Claude Code is running
    if (!isClaudeCodeTerminal()) {
        // Not Claude Code (e.g., Gemini CLI) - use fallback
        return fallbackPrompt;
    }

    // Claude Code is running - check if skill was already deployed
    const path = require('path');
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return fallbackPrompt;
    }

    const skillFile = path.join(workspaceFolder.uri.fsPath, '.claude', 'skills', `${skillName}.md`);

    try {
        // Check if skill file exists
        await fs.access(skillFile);

        // Skill exists! Claude Code should have it loaded (if started after deployment)
        return `/${skillName} ${args}`;
    } catch {
        // Skill doesn't exist yet - deploy it and notify user
        const deployed = await ensureSkillsDeployed(context);

        if (deployed) {
            vscode.window.showInformationMessage(
                `🔬 Claude Code skill "${skillName}" deployed! Restart your Claude Code terminal to use /deep-review command directly.`,
                'Restart Terminal'
            ).then(selection => {
                if (selection === 'Restart Terminal') {
                    const { findAITerminal } = require('./terminal-manager');
                    const terminal = findAITerminal();
                    if (terminal) {
                        terminal.dispose();
                        vscode.window.showInformationMessage('Please start a new Claude Code terminal.');
                    }
                }
            });
        }

        // Use fallback for this execution since skill isn't loaded yet
        return fallbackPrompt;
    }
}

module.exports = {
    ensureSkillsDeployed,
    isClaudeCodeTerminal,
    invokeSkillOrFallback
};
