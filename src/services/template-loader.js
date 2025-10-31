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
    const templatesDir = path.join(extensionPath, 'templates', 'quick-actions');

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
    const userTemplatesDir = path.join(workspaceRoot, '.askbob', 'quick-actions');

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
 * Get templates with full metadata (for editing UI)
 * Priority: .askbob/ > templates/
 */
function getTemplatesWithMetadata() {
    const extensionDefaults = loadExtensionDefaults();
    const userCustoms = loadUserCustoms();

    // Merge with user overrides
    const merged = mergeTemplates(extensionDefaults, userCustoms);

    console.log(`Loaded ${merged.length} templates (${userCustoms.length} custom, ${extensionDefaults.length} defaults)`);

    return merged;
}

/**
 * Get quick action templates (simple format for Quick Pick)
 * Priority: .askbob/ > templates/ > hardcoded defaults
 */
function getTemplates() {
    // Return cached templates if available
    if (cachedTemplates) {
        return cachedTemplates;
    }

    // Load with metadata
    const templatesWithMetadata = getTemplatesWithMetadata();

    // If we have templates from files, use them
    if (templatesWithMetadata.length > 0) {
        // Convert to simple format (without metadata)
        const templates = templatesWithMetadata.map(t => ({
            label: t.label,
            prompt: t.prompt,
            kind: t.kind
        }));

        // Add separator and custom prompt option
        templates.push({ label: '─────────────────────', prompt: null });
        templates.push({ label: '✏️ Custom prompt...', prompt: 'CUSTOM', kind: 'quickfix' });

        cachedTemplates = templates;
        return templates;
    }

    // Fall back to hardcoded defaults
    console.log('No template files found, using hardcoded defaults');
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
 * Watches both templates/ and .askbob/quick-actions/ directories
 */
function initializeFileWatcher(context) {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    // Reload on any change
    const reloadOnChange = () => {
        console.log('Quick action templates changed, reloading...');
        reloadTemplates();
        vscode.window.showInformationMessage('Quick action templates reloaded');
    };

    // Watch templates/quick-actions/ (if exists)
    const templatesDir = path.join(workspaceRoot, 'templates', 'quick-actions');
    if (fs.existsSync(templatesDir)) {
        const templatesPattern = new vscode.RelativePattern(templatesDir, '*.md');
        const templatesWatcher = vscode.workspace.createFileSystemWatcher(templatesPattern);

        templatesWatcher.onDidCreate(reloadOnChange);
        templatesWatcher.onDidChange(reloadOnChange);
        templatesWatcher.onDidDelete(reloadOnChange);

        context.subscriptions.push(templatesWatcher);
        console.log('Watching templates/quick-actions/');
    }

    // Watch .askbob/quick-actions/ (if exists)
    const askbobDir = path.join(workspaceRoot, '.askbob', 'quick-actions');
    if (fs.existsSync(askbobDir)) {
        const askbobPattern = new vscode.RelativePattern(askbobDir, '*.md');
        const askbobWatcher = vscode.workspace.createFileSystemWatcher(askbobPattern);

        askbobWatcher.onDidCreate(reloadOnChange);
        askbobWatcher.onDidChange(reloadOnChange);
        askbobWatcher.onDidDelete(reloadOnChange);

        context.subscriptions.push(askbobWatcher);
        console.log('Watching .askbob/quick-actions/');
    }

    console.log('Template file watchers initialized');
}

/**
 * Dispose resources
 */
function dispose() {
    cachedTemplates = null;
}

module.exports = {
    getTemplates,
    getTemplatesWithMetadata,
    reloadTemplates,
    initializeFileWatcher,
    dispose
};
