const vscode = require('vscode');
const path = require('path');
const { sendToAITerminal } = require('../services/terminal-manager');
const { getRelativePath } = require('../utils/path-utils');

/**
 * Get file or folder path and determine type
 * @param {vscode.Uri} uri - File/Folder URI from context menu
 * @returns {Promise<{resourcePath: string, displayPath: string, isDirectory: boolean}|null>}
 */
async function getResourceInfo(uri) {
    // Get the resource path
    let resourcePath;

    if (uri && uri.fsPath) {
        // Called from context menu with URI
        resourcePath = uri.fsPath;
    } else {
        // Called from command palette - need to pick a resource
        vscode.window.showErrorMessage('Please right-click on a file or folder in the Explorer to use this command');
        return null;
    }

    // Check if it's a directory or file
    const stats = await vscode.workspace.fs.stat(uri);
    const isDirectory = stats.type === vscode.FileType.Directory;

    // Get relative path for display
    const relativePath = getRelativePath(resourcePath);
    const displayPath = relativePath || path.basename(resourcePath);

    return { resourcePath, displayPath, isDirectory };
}

/**
 * Command: Explain module/file
 */
async function folderExplainCommand(uri) {
    const info = await getResourceInfo(uri);
    if (!info) return;

    const suffix = info.isDirectory ? '/' : '';
    const type = info.isDirectory ? 'module' : 'file';
    const message = `Explain the purpose and structure of this ${type}: ${info.displayPath}${suffix}`;
    await sendToAITerminal(message);
}

/**
 * Command: Review code
 */
async function folderReviewCommand(uri) {
    const info = await getResourceInfo(uri);
    if (!info) return;

    const suffix = info.isDirectory ? '/' : '';
    const type = info.isDirectory ? 'module' : 'file';
    const message = `Review the code in this ${type} and provide feedback: ${info.displayPath}${suffix}`;
    await sendToAITerminal(message);
}

/**
 * Command: Find bugs
 */
async function folderFindBugsCommand(uri) {
    const info = await getResourceInfo(uri);
    if (!info) return;

    const suffix = info.isDirectory ? '/' : '';
    const type = info.isDirectory ? 'module' : 'file';
    const message = `Analyze this ${type} for potential bugs and issues: ${info.displayPath}${suffix}`;
    await sendToAITerminal(message);
}

/**
 * Command: Generate tests
 */
async function folderGenerateTestsCommand(uri) {
    const info = await getResourceInfo(uri);
    if (!info) return;

    const suffix = info.isDirectory ? '/' : '';
    const type = info.isDirectory ? 'module' : 'file';
    const message = `Generate test files for this ${type}: ${info.displayPath}${suffix}`;
    await sendToAITerminal(message);
}

/**
 * Command: Document
 */
async function folderDocumentCommand(uri) {
    const info = await getResourceInfo(uri);
    if (!info) return;

    const suffix = info.isDirectory ? '/' : '';
    const type = info.isDirectory ? 'module' : 'file';
    const message = `Add documentation for this ${type}: ${info.displayPath}${suffix}`;
    await sendToAITerminal(message);
}

/**
 * Command: Refactor
 */
async function folderRefactorCommand(uri) {
    const info = await getResourceInfo(uri);
    if (!info) return;

    const suffix = info.isDirectory ? '/' : '';
    const type = info.isDirectory ? 'module' : 'file';
    const message = `Suggest refactoring improvements for this ${type}: ${info.displayPath}${suffix}`;
    await sendToAITerminal(message);
}

/**
 * Command: File/Folder Operations
 */
async function folderOperationsCommand(uri) {
    const commands = [
        { label: '📖 Explain This', command: 'ask-ai-cli.folderExplain' },
        { label: '🔍 Review Code', command: 'ask-ai-cli.folderReview' },
        { label: '🐛 Find Bugs', command: 'ask-ai-cli.folderFindBugs' },
        { label: '✅ Generate Tests', command: 'ask-ai-cli.folderGenerateTests' },
        { label: '📝 Add Documentation', command: 'ask-ai-cli.folderDocument' },
        { label: '♻️ Refactor', command: 'ask-ai-cli.folderRefactor' },
        { label: '📂 Show Structure', command: 'ask-ai-cli.folderListFiles' },
    ];

    const selected = await vscode.window.showQuickPick(commands, {
        placeHolder: 'Select an action',
    });

    if (selected) {
        await vscode.commands.executeCommand(selected.command, uri);
    }
}

/**
 * Command: Show structure (for folders) or file info (for files)
 */
async function folderListFilesCommand(uri) {
    const info = await getResourceInfo(uri);
    if (!info) return;

    try {
        if (!info.isDirectory) {
            // For files, show file reference and let AI read it
            const message = `Show me the structure and key components of: ${info.displayPath}`;
            await sendToAITerminal(message);
            return;
        }

        // For folders, show directory structure
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);

        let fileList;

        try {
            // Try tree command first (more readable)
            const { stdout } = await execAsync(`tree -L 3 -I 'node_modules|.git|dist|build' "${info.resourcePath}"`);
            fileList = stdout;
        } catch (treeError) {
            // Fallback to find command (available on most systems)
            try {
                const { stdout } = await execAsync(
                    `find "${info.resourcePath}" -maxdepth 3 -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" | head -100`
                );

                // Format find output to be more readable
                const files = stdout.split('\n')
                    .filter(f => f.trim())
                    .map(f => f.replace(info.resourcePath, info.displayPath))
                    .join('\n');

                fileList = `File structure for ${info.displayPath}:\n${files}`;
            } catch (findError) {
                // Last fallback: basic directory listing
                const files = await listDirectoryRecursive(info.resourcePath, info.displayPath, 3);
                fileList = `File structure for ${info.displayPath}:\n${files.join('\n')}`;
            }
        }

        // Show preview in a new document
        const doc = await vscode.workspace.openTextDocument({
            content: fileList,
            language: 'plaintext'
        });
        await vscode.window.showTextDocument(doc, { preview: true });

        // Send to AI terminal with the file list
        const message = `Here's the file structure for ${info.displayPath}/:\n\n${fileList}`;
        await sendToAITerminal(message);

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to show structure: ${error.message}`);
    }
}

/**
 * Recursively list directory contents (fallback method)
 * @param {string} dirPath - Directory path
 * @param {string} displayPath - Display path for output
 * @param {number} maxDepth - Maximum depth to traverse
 * @param {number} currentDepth - Current depth (internal)
 * @returns {Promise<string[]>} Array of file paths
 */
async function listDirectoryRecursive(dirPath, displayPath, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
        return [];
    }

    const results = [];
    const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));

    // Filter out common ignore patterns
    const ignorePatterns = ['node_modules', '.git', 'dist', 'build', '.next', '.cache'];

    for (const [name, type] of entries) {
        if (ignorePatterns.includes(name)) {
            continue;
        }

        const indent = '  '.repeat(currentDepth);
        const prefix = type === vscode.FileType.Directory ? '📁' : '📄';
        results.push(`${indent}${prefix} ${name}`);

        if (type === vscode.FileType.Directory) {
            const subPath = path.join(dirPath, name);
            const subDisplay = path.join(displayPath, name);
            const subResults = await listDirectoryRecursive(subPath, subDisplay, maxDepth, currentDepth + 1);
            results.push(...subResults);
        }
    }

    return results;
}

module.exports = {
    folderExplainCommand,
    folderReviewCommand,
    folderFindBugsCommand,
    folderGenerateTestsCommand,
    folderDocumentCommand,
    folderRefactorCommand,
    folderListFilesCommand,
    folderOperationsCommand
};
