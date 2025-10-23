const { getRelativePath, normalizePath } = require('./path-utils');

/**
 * Generate code reference from editor selection
 * @param {vscode.TextEditor} editor - Active text editor
 * @returns {string|null} Code reference in format @path#L5-8 or null if invalid
 */
function generateCodeReference(editor) {
    if (!editor) {
        return null;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
        return null;
    }

    const fileName = editor.document.fileName;
    const relativePath = getRelativePath(fileName);
    const normalizedPath = normalizePath(relativePath);

    // Get line numbers (convert from 0-indexed to 1-indexed)
    const startLine = selection.start.line + 1;
    const endLine = selection.end.line + 1;

    // Format the output string
    let output = `@${normalizedPath}#L${startLine}`;

    // Add end line if it's different from start line
    if (endLine !== startLine) {
        output += `-${endLine}`;
    }

    return output;
}

/**
 * Generate code reference from document and range (for code actions)
 * @param {vscode.TextDocument} document - Text document
 * @param {vscode.Range} range - Selection range
 * @returns {string} Code reference in format @path#L5-8
 */
function generateCodeReferenceFromRange(document, range) {
    const fileName = document.fileName;
    const relativePath = getRelativePath(fileName);
    const normalizedPath = normalizePath(relativePath);

    // Get line numbers (convert from 0-indexed to 1-indexed)
    const startLine = range.start.line + 1;
    const endLine = range.end.line + 1;

    // Format the code reference
    let codeReference = `@${normalizedPath}#L${startLine}`;
    if (endLine !== startLine) {
        codeReference += `-${endLine}`;
    }

    return codeReference;
}

module.exports = {
    generateCodeReference,
    generateCodeReferenceFromRange
};
