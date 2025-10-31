const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

// Default fallback templates for folder operations
const DEFAULT_FOLDER_TEMPLATES = [
    { label: '📖 Explain This', prompt: 'Explain the purpose and structure of this {{type}}: {{path}}', kind: 'info' },
    { label: '🔍 Review Code', prompt: 'Review the code in this {{type}} and provide feedback: {{path}}', kind: 'review' },
    { label: '🐛 Find Bugs', prompt: 'Analyze this {{type}} for potential bugs and issues: {{path}}', kind: 'review' },
    { label: '✅ Generate Tests', prompt: 'Generate test files for this {{type}}: {{path}}', kind: 'refactor' },
    { label: '📝 Add Documentation', prompt: 'Add documentation for this {{type}}: {{path}}', kind: 'refactor' },
    { label: '♻️ Refactor', prompt: 'Suggest refactoring improvements for this {{type}}: {{path}}', kind: 'refactor' }
];

// Cache for loaded templates
let cachedFolderTemplates = null;

/**
 * Parse markdown file with frontmatter
 * Format:
 * ---
 * label: 📖 Explain
 * kind: info
 * enabled: true
 * ---
 * Prompt content here with {{variables}}
 */
function parseTemplate(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for frontmatter
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            console.warn(`Template ${filePath} missing frontmatter, skipping`);
            return null;
        }

        const frontmatter = match[1];
        const prompt = match[2].trim();

        // Parse frontmatter (simple YAML parsing)
        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                metadata[key] = value;
            }
        });

        // Check if enabled (default: true)
        const enabled = metadata.enabled !== 'false';
        if (!enabled) {
            return null;
        }

        return {
            label: metadata.label || path.basename(filePath, '.md'),
            prompt: prompt,
            kind: metadata.kind || 'info'
        };
    } catch (err) {
        console.error(`Failed to parse template ${filePath}:`, err);
        return null;
    }
}

/**
 * Load templates from a directory
 * @param {string} dir - Directory path
 * @param {object} metadata - Metadata to attach to each template
 * @returns {Array} Array of templates with metadata
 */
function loadFromDirectory(dir, metadata = {}) {
    if (!fs.existsSync(dir)) {
        return [];
    }

    try {
        const files = fs.readdirSync(dir);
        const templates = [];

        files.forEach(file => {
            if (path.extname(file) === '.md' && file !== 'README.md') {
                const filePath = path.join(dir, file);
                const template = parseTemplate(filePath);
                if (template) {
                    templates.push({
                        ...template,
                        filename: file,
                        path: filePath,
                        ...metadata
                    });
                }
            }
        });

        return templates;
    } catch (err) {
        console.error(`Failed to load templates from ${dir}:`, err);
        return [];
    }
}

/**
 * Load extension default templates
 */
function loadExtensionDefaults() {
    const extensionPath = require('../extension').getExtensionPath();
    const templatesDir = path.join(extensionPath, 'templates', 'folder-actions');

    return loadFromDirectory(templatesDir, {
        isCustom: false,
        source: 'extension'
    });
}

/**
 * Load user custom templates from .askbob/
 */
function loadUserCustoms() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return [];
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const userTemplatesDir = path.join(workspaceRoot, '.askbob', 'folder-actions');

    return loadFromDirectory(userTemplatesDir, {
        isCustom: true,
        source: 'user'
    });
}

/**
 * Merge templates with priority: user customs > extension defaults
 */
function mergeTemplates(defaults, customs) {
    const map = new Map();

    // Add all defaults (keyed by filename)
    defaults.forEach(template => {
        map.set(template.filename, template);
    });

    // Override with customs (same filename = replace)
    customs.forEach(template => {
        map.set(template.filename, template);
    });

    // Convert to array and sort by label
    return Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
    );
}

/**
 * Get folder action templates with full metadata (for editing UI)
 * Priority: .askbob/ > templates/
 */
function getFolderTemplatesWithMetadata() {
    const extensionDefaults = loadExtensionDefaults();
    const userCustoms = loadUserCustoms();

    // Merge with user overrides
    const merged = mergeTemplates(extensionDefaults, userCustoms);

    console.log(`Loaded ${merged.length} folder templates (${userCustoms.length} custom, ${extensionDefaults.length} defaults)`);

    return merged;
}

/**
 * Get folder action templates (simple format for Quick Pick)
 * Priority: .askbob/ > templates/ > hardcoded defaults
 */
function getFolderTemplates() {
    // Return cached templates if available
    if (cachedFolderTemplates) {
        return cachedFolderTemplates;
    }

    // Load with metadata
    const templatesWithMetadata = getFolderTemplatesWithMetadata();

    // If we have templates from files, use them
    if (templatesWithMetadata.length > 0) {
        // Convert to simple format (without metadata)
        const templates = templatesWithMetadata.map(t => ({
            label: t.label,
            prompt: t.prompt,
            kind: t.kind
        }));

        cachedFolderTemplates = templates;
        return templates;
    }

    // Fall back to hardcoded defaults
    console.log('No folder template files found, using hardcoded defaults');
    cachedFolderTemplates = DEFAULT_FOLDER_TEMPLATES;
    return DEFAULT_FOLDER_TEMPLATES;
}

/**
 * Reload templates (clear cache)
 */
function reloadFolderTemplates() {
    cachedFolderTemplates = null;
    return getFolderTemplates();
}

/**
 * Replace template variables with actual values
 * @param {string} prompt - Template prompt with {{variables}}
 * @param {object} context - Context data (path, type, etc.)
 * @returns {string} Prompt with variables replaced
 */
function replaceVariables(prompt, context) {
    let result = prompt;

    // Replace {{type}} with "module" or "file"
    result = result.replace(/\{\{type\}\}/g, context.type || 'module');

    // Replace {{path}} with display path
    result = result.replace(/\{\{path\}\}/g, context.path || '');

    // Add trailing slash for directories
    if (context.isDirectory && context.path) {
        result = result.replace(context.path, context.path + '/');
    }

    return result;
}

/**
 * Initialize template file watcher
 * Watches .askbob/folder-actions/ directory
 */
function initializeFolderFileWatcher(context) {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    // Reload on any change
    const reloadOnChange = () => {
        console.log('Folder action templates changed, reloading...');
        reloadFolderTemplates();
        vscode.window.showInformationMessage('Folder action templates reloaded');
    };

    // Watch .askbob/folder-actions/ (if exists)
    const askbobDir = path.join(workspaceRoot, '.askbob', 'folder-actions');
    if (fs.existsSync(askbobDir)) {
        const askbobPattern = new vscode.RelativePattern(askbobDir, '*.md');
        const askbobWatcher = vscode.workspace.createFileSystemWatcher(askbobPattern);

        askbobWatcher.onDidCreate(reloadOnChange);
        askbobWatcher.onDidChange(reloadOnChange);
        askbobWatcher.onDidDelete(reloadOnChange);

        context.subscriptions.push(askbobWatcher);
        console.log('Watching .askbob/folder-actions/');
    }

    console.log('Folder template file watchers initialized');
}

/**
 * Dispose resources
 */
function dispose() {
    cachedFolderTemplates = null;
}

module.exports = {
    getFolderTemplates,
    getFolderTemplatesWithMetadata,
    reloadFolderTemplates,
    replaceVariables,
    initializeFolderFileWatcher,
    dispose
};
