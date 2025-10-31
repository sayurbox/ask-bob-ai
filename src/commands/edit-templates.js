const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getTemplatesWithMetadata, reloadTemplates } = require('../services/template-loader');

/**
 * Main command: Edit Quick Action Prompts
 */
async function editTemplatesCommand() {
    // Show mode selection
    const mode = await vscode.window.showQuickPick([
        {
            label: '🎨 Open Visual Editor',
            description: 'Recommended - Edit with GUI',
            value: 'webview'
        },
        {
            label: '📄 Edit Files Directly',
            description: 'Advanced - Edit markdown files',
            value: 'files'
        },
        {
            label: '📁 Open .askbob Folder',
            description: 'Browse all templates',
            value: 'folder'
        }
    ], {
        placeHolder: 'How do you want to edit templates?'
    });

    if (!mode) return;

    switch (mode.value) {
        case 'webview':
            await openVisualEditor();
            break;
        case 'files':
            await editFilesDirectly();
            break;
        case 'folder':
            await openTemplatesFolder();
            break;
    }
}

/**
 * Open visual editor (WebView)
 */
async function openVisualEditor() {
    if (!await ensureWorkspace()) return;

    const panel = vscode.window.createWebviewPanel(
        'editQuickActions',
        '🎨 Bob AI - Quick Action Prompt Editor',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getWebviewHTML();

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(async (message) => {
        try {
            switch (message.command) {
                case 'load':
                    const templates = getTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: templates
                    });
                    break;

                case 'save':
                    await saveTemplate(message.data);
                    vscode.window.showInformationMessage('✅ Template saved');
                    reloadTemplates();
                    // Send updated templates back
                    const updatedTemplates = getTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: updatedTemplates
                    });
                    break;

                case 'create':
                    await createNewTemplate(message.data);
                    vscode.window.showInformationMessage('✅ Template created');
                    reloadTemplates();
                    const newTemplates = getTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: newTemplates
                    });
                    break;

                case 'delete':
                    await deleteTemplate(message.data.filename);
                    vscode.window.showInformationMessage('✅ Template deleted');
                    reloadTemplates();
                    const remainingTemplates = getTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: remainingTemplates
                    });
                    break;

                case 'reset':
                    await resetToDefault(message.data.filename);
                    vscode.window.showInformationMessage('✅ Reset to default');
                    reloadTemplates();
                    const resetTemplates = getTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: resetTemplates
                    });
                    break;
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
            console.error('WebView message handler error:', error);
        }
    });
}

/**
 * Edit files directly in editor
 */
async function editFilesDirectly() {
    if (!await ensureWorkspace()) return;

    const templates = getTemplatesWithMetadata();

    if (templates.length === 0) {
        vscode.window.showInformationMessage('No templates found. Extension defaults will be used.');
        return;
    }

    const selected = await vscode.window.showQuickPick(
        templates.map(t => ({
            label: t.label,
            description: t.isCustom ? '✏️ Custom' : '📦 Default',
            detail: t.prompt.substring(0, 100) + (t.prompt.length > 100 ? '...' : ''),
            template: t
        })),
        { placeHolder: 'Select template to edit' }
    );

    if (!selected) return;

    // Copy to .askbob if editing default
    const filePath = await copyToUserSpace(selected.template);

    // Open in editor
    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);
}

/**
 * Open .askbob folder
 */
async function openTemplatesFolder() {
    if (!await ensureWorkspace()) return;

    await ensureAskbobFolder();

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const folder = path.join(workspaceRoot, '.askbob', 'quick-actions');

    await vscode.commands.executeCommand(
        'revealFileInOS',
        vscode.Uri.file(folder)
    );
}

/**
 * Copy template to user space (.askbob/) if not already there
 */
async function copyToUserSpace(template) {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const userPath = path.join(workspaceRoot, '.askbob', 'quick-actions', template.filename);

    if (fs.existsSync(userPath)) {
        return userPath; // Already copied
    }

    // Copy from extension to .askbob
    await ensureAskbobFolder();
    fs.copyFileSync(template.path, userPath);

    vscode.window.showInformationMessage(
        `📝 Copied to .askbob/ for editing. Original preserved.`
    );

    return userPath;
}

/**
 * Ensure .askbob/quick-actions/ folder exists
 */
async function ensureAskbobFolder() {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const askbobDir = path.join(workspaceRoot, '.askbob', 'quick-actions');

    if (!fs.existsSync(askbobDir)) {
        fs.mkdirSync(askbobDir, { recursive: true });

        // Create .gitignore
        const gitignore = path.join(workspaceRoot, '.askbob', '.gitignore');
        if (!fs.existsSync(gitignore)) {
            fs.writeFileSync(gitignore, '# Bob AI CLI - User customizations\n# Remove this file to commit your templates\n*\n');
        }

        console.log('Created .askbob/quick-actions/ directory');
    }
}

/**
 * Ensure workspace is open
 */
async function ensureWorkspace() {
    if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showErrorMessage(
            'No workspace open. Open a folder to customize templates.'
        );
        return false;
    }
    return true;
}

/**
 * Save template to .askbob/
 */
async function saveTemplate(data) {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspaceRoot, '.askbob', 'quick-actions', data.filename);

    await ensureAskbobFolder();

    const content = `---
label: ${data.label}
kind: ${data.kind}
enabled: ${data.enabled}
---
${data.prompt}`;

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Saved template: ${data.filename}`);
}

/**
 * Create new template
 */
async function createNewTemplate(data) {
    await saveTemplate(data);
}

/**
 * Delete user template
 */
async function deleteTemplate(filename) {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspaceRoot, '.askbob', 'quick-actions', filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted template: ${filename}`);
    }
}

/**
 * Reset to default (delete user copy)
 */
async function resetToDefault(filename) {
    await deleteTemplate(filename);
}

/**
 * Get WebView HTML
 */
function getWebviewHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Quick Actions</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        h1 {
            margin-top: 0;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }

        h2 {
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .templates-list {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 20px;
        }

        .template-item {
            padding: 12px 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.1s;
        }

        .template-item:last-child {
            border-bottom: none;
        }

        .template-item:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .template-item.selected {
            background: var(--vscode-list-activeSelectionBackground);
        }

        .template-info {
            flex: 1;
        }

        .template-label {
            font-weight: 600;
            margin-bottom: 4px;
        }

        .template-preview {
            font-size: 12px;
            opacity: 0.7;
        }

        .badge {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 10px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }

        .editor-section {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .editor-section.hidden {
            display: none;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }

        input, textarea, select {
            width: 100%;
            padding: 8px 12px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-family: var(--vscode-font-family);
            margin-bottom: 16px;
            box-sizing: border-box;
        }

        textarea {
            min-height: 120px;
            resize: vertical;
            font-family: var(--vscode-editor-font-family);
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            font-weight: normal;
        }

        .checkbox-label input {
            width: auto;
            margin-right: 8px;
            margin-bottom: 0;
        }

        .buttons {
            display: flex;
            gap: 10px;
        }

        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .btn-primary:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }

        .btn-danger {
            background: #f44336;
            color: white;
        }

        .btn-danger:hover {
            background: #da190b;
        }

        .info {
            padding: 12px;
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textLink-foreground);
            margin-top: 20px;
            font-size: 13px;
        }

        .info code {
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Quick Action Prompt Editor</h1>

        <h2>Templates</h2>
        <div class="templates-list" id="templatesList">
            <div class="empty-state">Loading templates...</div>
        </div>

        <div id="editorSection" class="editor-section hidden">
            <h2>Edit Template</h2>

            <label for="label">Label (with emoji)</label>
            <input type="text" id="label" placeholder="🔍 Explain this code">

            <label for="prompt">Prompt Text</label>
            <textarea id="prompt" placeholder="Enter your prompt..."></textarea>

            <label for="kind">Kind</label>
            <select id="kind">
                <option value="quickfix">Quick Fix</option>
                <option value="refactor">Refactor</option>
            </select>

            <label class="checkbox-label">
                <input type="checkbox" id="enabled" checked>
                <span>Enabled</span>
            </label>

            <div class="buttons">
                <button class="btn-primary" onclick="saveTemplate()">💾 Save</button>
                <button class="btn-secondary" onclick="resetTemplate()">🔄 Reset to Default</button>
                <button class="btn-danger" onclick="deleteTemplate()">🗑️ Delete</button>
            </div>
        </div>

        <button class="btn-primary" onclick="createNew()">➕ Create New Template</button>

        <div class="info">
            💡 Changes are saved to <code>.askbob/quick-actions/</code> in your workspace.
            Original defaults remain unchanged.
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let templates = [];
        let selectedTemplate = null;

        // Request templates on load
        vscode.postMessage({ command: 'load' });

        // Receive messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            if (message.command === 'templates') {
                templates = message.data;
                renderTemplates();
            }
        });

        function renderTemplates() {
            const list = document.getElementById('templatesList');

            if (templates.length === 0) {
                list.innerHTML = '<div class="empty-state">No templates found. Extension defaults will be used.</div>';
                return;
            }

            list.innerHTML = templates.map((t, i) => \`
                <div class="template-item" onclick="selectTemplate(\${i})" data-index="\${i}">
                    <div class="template-info">
                        <div class="template-label">\${escapeHtml(t.label)}</div>
                        <div class="template-preview">\${escapeHtml(t.prompt.substring(0, 60))}\${t.prompt.length > 60 ? '...' : ''}</div>
                    </div>
                    <span class="badge">\${t.isCustom ? '✏️ Custom' : '📦 Default'}</span>
                </div>
            \`).join('');
        }

        function selectTemplate(index) {
            selectedTemplate = templates[index];

            // Update UI
            document.querySelectorAll('.template-item').forEach((el, i) => {
                el.classList.toggle('selected', i === index);
            });

            // Show editor
            document.getElementById('editorSection').classList.remove('hidden');

            // Populate fields
            document.getElementById('label').value = selectedTemplate.label;
            document.getElementById('prompt').value = selectedTemplate.prompt;
            document.getElementById('kind').value = selectedTemplate.kind || 'quickfix';
            document.getElementById('enabled').checked = selectedTemplate.enabled !== false;
        }

        function saveTemplate() {
            if (!selectedTemplate) {
                alert('Please select a template first');
                return;
            }

            const data = {
                filename: selectedTemplate.filename,
                label: document.getElementById('label').value.trim(),
                prompt: document.getElementById('prompt').value.trim(),
                kind: document.getElementById('kind').value,
                enabled: document.getElementById('enabled').checked
            };

            if (!data.label) {
                alert('Label is required');
                return;
            }

            if (!data.prompt) {
                alert('Prompt is required');
                return;
            }

            vscode.postMessage({ command: 'save', data });
        }

        function resetTemplate() {
            if (!selectedTemplate) {
                alert('Please select a template first');
                return;
            }

            if (!selectedTemplate.isCustom) {
                alert('Cannot reset default templates');
                return;
            }

            if (!confirm(\`Reset "\${selectedTemplate.label}" to default? Your changes will be lost.\`)) {
                return;
            }

            vscode.postMessage({
                command: 'reset',
                data: { filename: selectedTemplate.filename }
            });

            // Hide editor after reset
            document.getElementById('editorSection').classList.add('hidden');
            selectedTemplate = null;
        }

        function deleteTemplate() {
            if (!selectedTemplate) {
                alert('Please select a template first');
                return;
            }

            if (!selectedTemplate.isCustom) {
                alert('Cannot delete default templates. They can only be overridden.');
                return;
            }

            if (!confirm(\`Delete "\${selectedTemplate.label}"?\`)) {
                return;
            }

            vscode.postMessage({
                command: 'delete',
                data: { filename: selectedTemplate.filename }
            });

            // Hide editor after delete
            document.getElementById('editorSection').classList.add('hidden');
            selectedTemplate = null;
        }

        function createNew() {
            const name = prompt('Template filename (e.g., my-action):');
            if (!name) return;

            const filename = name.endsWith('.md') ? name : name + '.md';

            // Check if filename already exists
            if (templates.some(t => t.filename === filename)) {
                alert('Template with this filename already exists');
                return;
            }

            const label = prompt('Label (with emoji, e.g., 🎯 My Action):');
            if (!label) return;

            vscode.postMessage({
                command: 'create',
                data: {
                    filename: filename,
                    label: label,
                    prompt: 'Your prompt here',
                    kind: 'quickfix',
                    enabled: true
                }
            });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>`;
}

module.exports = {
    editTemplatesCommand
};
