const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

// Default fallback templates (same as original QUICK_ACTIONS)
const DEFAULT_TEMPLATES = [
    { label: '🔍 Explain this code', prompt: 'Explain this code', kind: 'quickfix' },
    { label: '🐛 Find and fix bugs', prompt: 'Find and fix bugs in this code', kind: 'quickfix' },
    { label: '♻️ Refactor this code', prompt: 'Refactor this code for better readability and maintainability', kind: 'refactor' },
    { label: '✅ Write unit tests', prompt: 'Write unit tests for this code', kind: 'quickfix' },
    { label: '📝 Add documentation', prompt: 'Add detailed comments and documentation to this code', kind: 'quickfix' },
    { label: '⚡ Optimize performance', prompt: 'Optimize this code for better performance', kind: 'refactor' },
    { label: '🔒 Security review', prompt: 'Review this code for security vulnerabilities', kind: 'quickfix' },
    { label: '🎯 Simplify logic', prompt: 'Simplify this code logic', kind: 'refactor' },
    { label: '─────────────────────', prompt: null }, // Separator
    { label: '✏️ Custom prompt...', prompt: 'CUSTOM', kind: 'quickfix' }
];

// Cache for loaded templates
let cachedTemplates = null;
let fileWatcher = null;

/**
 * Parse markdown file with frontmatter
 * Format:
 * ---
 * label: 🔍 Explain
 * kind: quickfix
 * enabled: true
 * ---
 * Prompt content here
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
            kind: metadata.kind || 'quickfix'
        };
    } catch (err) {
        console.error(`Failed to parse template ${filePath}:`, err);
        return null;
    }
}

/**
 * Load templates from workspace templates/quick-actions/ directory
 */
function loadWorkspaceTemplates() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return null;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const templatesDir = path.join(workspaceRoot, 'templates', 'quick-actions');

    // Check if templates directory exists
    if (!fs.existsSync(templatesDir)) {
        return null;
    }

    try {
        const files = fs.readdirSync(templatesDir);
        const templates = [];

        // Load all .md files
        files.forEach(file => {
            if (path.extname(file) === '.md' && file !== 'README.md') {
                const filePath = path.join(templatesDir, file);
                const template = parseTemplate(filePath);
                if (template) {
                    templates.push(template);
                }
            }
        });

        if (templates.length === 0) {
            return null;
        }

        // Add separator and custom prompt option
        templates.push({ label: '─────────────────────', prompt: null });
        templates.push({ label: '✏️ Custom prompt...', prompt: 'CUSTOM', kind: 'quickfix' });

        return templates;
    } catch (err) {
        console.error('Failed to load workspace templates:', err);
        return null;
    }
}

/**
 * Get quick action templates
 * Priority: workspace templates > default templates
 */
function getTemplates() {
    // Return cached templates if available
    if (cachedTemplates) {
        return cachedTemplates;
    }

    // Try loading workspace templates
    const workspaceTemplates = loadWorkspaceTemplates();

    if (workspaceTemplates) {
        cachedTemplates = workspaceTemplates;
        console.log(`Loaded ${workspaceTemplates.length - 2} custom quick action templates`);
        return workspaceTemplates;
    }

    // Fall back to defaults
    cachedTemplates = DEFAULT_TEMPLATES;
    return DEFAULT_TEMPLATES;
}

/**
 * Reload templates (clear cache)
 */
function reloadTemplates() {
    cachedTemplates = null;
    return getTemplates();
}

/**
 * Initialize template file watcher
 * Watches templates/quick-actions/ directory for changes
 */
function initializeFileWatcher(context) {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const templatesDir = path.join(workspaceRoot, 'templates', 'quick-actions');

    if (!fs.existsSync(templatesDir)) {
        return;
    }

    // Create file system watcher for .md files
    const pattern = new vscode.RelativePattern(templatesDir, '*.md');
    fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    // Reload on any change
    const reloadOnChange = () => {
        console.log('Quick action templates changed, reloading...');
        reloadTemplates();
        vscode.window.showInformationMessage('Quick action templates reloaded');
    };

    fileWatcher.onDidCreate(reloadOnChange);
    fileWatcher.onDidChange(reloadOnChange);
    fileWatcher.onDidDelete(reloadOnChange);

    // Register disposable
    context.subscriptions.push(fileWatcher);

    console.log('Template file watcher initialized');
}

/**
 * Dispose file watcher
 */
function dispose() {
    if (fileWatcher) {
        fileWatcher.dispose();
        fileWatcher = null;
    }
    cachedTemplates = null;
}

module.exports = {
    getTemplates,
    reloadTemplates,
    initializeFileWatcher,
    dispose
};
