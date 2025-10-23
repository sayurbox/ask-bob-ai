const vscode = require('vscode');

/**
 * Get relative path from workspace root if available, otherwise return absolute path
 * @param {string} fileName - Absolute file path
 * @returns {string} Relative or absolute path
 */
function getRelativePath(fileName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let relativePath = fileName;

    if (workspaceFolders && workspaceFolders.length > 0) {
        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        if (fileName.startsWith(workspaceRoot)) {
            relativePath = fileName.substring(workspaceRoot.length + 1);
        }
    }

    return relativePath;
}

/**
 * Normalize path separators to forward slashes for cross-platform consistency
 * @param {string} path - Path to normalize
 * @returns {string} Normalized path with forward slashes
 */
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}

module.exports = {
    getRelativePath,
    normalizePath
};
