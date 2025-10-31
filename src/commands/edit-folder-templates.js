const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getFolderTemplatesWithMetadata, reloadFolderTemplates } = require('../services/folder-template-loader');

/**
 * Main command: Edit Folder Action Templates
 */
async function editFolderTemplatesCommand() {
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
            description: 'Browse all folder templates',
            value: 'folder'
        }
    ], {
        placeHolder: 'How do you want to edit folder action templates?'
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
        'editFolderActions',
        '🎨 Bob AI - Folder Action Template Editor',
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
                    const templates = getFolderTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: templates
                    });
                    break;

                case 'save':
                    await saveTemplate(message.data);
                    vscode.window.showInformationMessage('✅ Folder template saved');
                    reloadFolderTemplates();
                    // Send updated templates back
                    const updatedTemplates = getFolderTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: updatedTemplates
                    });
                    break;

                case 'create':
                    console.log('Creating folder template:', message.data);
                    await createNewTemplate(message.data);
                    console.log('Folder template created successfully');
                    vscode.window.showInformationMessage('✅ Folder template created: ' + message.data.label);
                    reloadFolderTemplates();
                    const newTemplates = getFolderTemplatesWithMetadata();
                    console.log('Sending updated folder templates, count:', newTemplates.length);
                    panel.webview.postMessage({
                        command: 'templates',
                        data: newTemplates
                    });
                    break;

                case 'delete':
                    await deleteTemplate(message.data.filename);
                    vscode.window.showInformationMessage('✅ Folder template deleted');
                    reloadFolderTemplates();
                    const deletedTemplates = getFolderTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: deletedTemplates
                    });
                    break;

                case 'reset':
                    await resetToDefault(message.data.filename);
                    vscode.window.showInformationMessage('✅ Reset to default');
                    reloadFolderTemplates();
                    const resetTemplates = getFolderTemplatesWithMetadata();
                    panel.webview.postMessage({
                        command: 'templates',
                        data: resetTemplates
                    });
                    break;
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
            console.error(error);
        }
    });
}

/**
 * Edit files directly
 */
async function editFilesDirectly() {
    if (!await ensureWorkspace()) return;

    const templates = getFolderTemplatesWithMetadata();

    if (templates.length === 0) {
        vscode.window.showInformationMessage('No folder templates found. Creating defaults...');
        await ensureAskbobFolder();
        return;
    }

    // Show template picker
    const items = templates.map(t => ({
        label: t.label,
        description: t.isCustom ? '✏️ Custom' : '📦 Default',
        detail: t.path,
        template: t
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a folder template to edit'
    });

    if (!selected) return;

    let editPath = selected.template.path;

    // If default template, copy to user space first
    if (!selected.template.isCustom) {
        editPath = await copyToUserSpace(selected.template);
    }

    // Open in editor
    const doc = await vscode.workspace.openTextDocument(editPath);
    await vscode.window.showTextDocument(doc);
}

/**
 * Open templates folder
 */
async function openTemplatesFolder() {
    if (!await ensureWorkspace()) return;

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const templatesDir = path.join(workspaceRoot, '.askbob', 'folder-actions');

    await ensureAskbobFolder();

    // Open in file explorer
    const uri = vscode.Uri.file(templatesDir);
    await vscode.commands.executeCommand('revealFileInOS', uri);
}

/**
 * Copy extension default template to user space
 */
async function copyToUserSpace(template) {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const userPath = path.join(workspaceRoot, '.askbob', 'folder-actions', template.filename);

    // Already exists in user space?
    if (fs.existsSync(userPath)) {
        return userPath;
    }

    // First edit: Copy to .askbob
    await ensureAskbobFolder();
    fs.copyFileSync(template.path, userPath);

    vscode.window.showInformationMessage(
        '📝 Copied to .askbob/folder-actions/ for editing. Original preserved.'
    );

    return userPath;
}

/**
 * Save template to .askbob/folder-actions/
 */
async function saveTemplate(data) {
    await ensureAskbobFolder();

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspaceRoot, '.askbob', 'folder-actions', data.filename);

    // Build frontmatter
    const frontmatter = `---
label: ${data.label}
kind: ${data.kind}
enabled: ${data.enabled}
---
${data.prompt}`;

    fs.writeFileSync(filePath, frontmatter, 'utf8');
}

/**
 * Create new template
 */
async function createNewTemplate(data) {
    await ensureAskbobFolder();

    // Sanitize filename
    let filename = data.filename;
    if (!filename.endsWith('.md')) {
        filename += '.md';
    }
    filename = filename.replace(/[^a-z0-9-_.]/gi, '_');

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspaceRoot, '.askbob', 'folder-actions', filename);

    // Check if exists
    if (fs.existsSync(filePath)) {
        throw new Error(`Template "${filename}" already exists`);
    }

    // Build frontmatter
    const frontmatter = `---
label: ${data.label}
kind: ${data.kind}
enabled: ${data.enabled}
---
${data.prompt}`;

    fs.writeFileSync(filePath, frontmatter, 'utf8');
}

/**
 * Delete user template
 */
async function deleteTemplate(filename) {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspaceRoot, '.askbob', 'folder-actions', filename);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Template "${filename}" not found`);
    }

    // Confirm deletion
    const confirm = await vscode.window.showWarningMessage(
        `Delete template "${filename}"?`,
        { modal: true },
        'Delete'
    );

    if (confirm !== 'Delete') {
        throw new Error('Cancelled');
    }

    fs.unlinkSync(filePath);
}

/**
 * Reset to default (delete user copy)
 */
async function resetToDefault(filename) {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const userPath = path.join(workspaceRoot, '.askbob', 'folder-actions', filename);

    if (!fs.existsSync(userPath)) {
        throw new Error('No custom version to reset');
    }

    // Confirm reset
    const confirm = await vscode.window.showWarningMessage(
        `Reset "${filename}" to default?`,
        { modal: true },
        'Reset'
    );

    if (confirm !== 'Reset') {
        throw new Error('Cancelled');
    }

    fs.unlinkSync(userPath);
}

/**
 * Ensure .askbob/folder-actions/ exists
 */
async function ensureAskbobFolder() {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const askbobDir = path.join(workspaceRoot, '.askbob');
    const templatesDir = path.join(askbobDir, 'folder-actions');

    if (!fs.existsSync(askbobDir)) {
        fs.mkdirSync(askbobDir, { recursive: true });
    }

    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Create .gitignore
    const gitignorePath = path.join(askbobDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, '# Bob AI CLI customizations\n*\n', 'utf8');
    }
}

/**
 * Ensure workspace is open
 */
async function ensureWorkspace() {
    if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showErrorMessage(
            'No workspace open. Open a folder to customize folder templates.'
        );
        return false;
    }
    return true;
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
    <title>Folder Action Template Editor</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 20px;
            font-size: 13px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 20px;
        }
        .templates-list {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            overflow: hidden;
        }
        .template-item {
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 1px solid var(--vscode-panel-border);
            transition: background 0.2s;
        }
        .template-item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        .template-item.active {
            background: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }
        .template-item:last-child {
            border-bottom: none;
        }
        .template-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            margin-left: 8px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .editor-section {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 20px;
        }
        .editor-section h2 {
            margin-bottom: 20px;
            font-size: 18px;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            font-family: var(--vscode-font-family);
            font-size: 13px;
        }
        .form-group textarea {
            min-height: 300px;
            font-family: var(--vscode-editor-font-family);
            resize: vertical;
        }
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        .form-group .hint {
            margin-top: 4px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
        .checkbox-group {
            display: flex;
            align-items: center;
        }
        .checkbox-group input {
            width: auto;
            margin-right: 8px;
        }
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        button.danger {
            background: #c5372a;
            color: white;
        }
        button.danger:hover {
            background: #a82d23;
        }
        .create-new {
            margin-bottom: 20px;
        }
        .variables-hint {
            background: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 3px;
            margin-top: 8px;
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
        }
        .variables-hint strong {
            display: block;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div>
            <div class="create-new">
                <button onclick="createNew()" style="width: 100%">➕ Create New Template</button>
            </div>
            <div class="templates-list" id="templatesList">
                Loading...
            </div>
        </div>
        <div class="editor-section" id="editorSection">
            <h2>Select a template to edit</h2>
            <p style="color: var(--vscode-descriptionForeground);">Choose a template from the list on the left, or create a new one.</p>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let templates = [];
        let selectedTemplate = null;
        let pendingSelectFilename = null;

        // Load templates on startup
        vscode.postMessage({ command: 'load' });

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'templates') {
                templates = message.data;
                renderTemplates();

                // Auto-select newly created template
                if (pendingSelectFilename) {
                    const index = templates.findIndex(t => t.filename === pendingSelectFilename);
                    if (index !== -1) {
                        selectTemplate(index);
                    }
                    pendingSelectFilename = null;
                }
            }
        });

        function renderTemplates() {
            const list = document.getElementById('templatesList');
            if (templates.length === 0) {
                list.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--vscode-descriptionForeground);">No templates found</div>';
                return;
            }

            list.innerHTML = templates.map((t, index) => {
                const badge = t.isCustom ? '<span class="template-badge">✏️ Custom</span>' : '<span class="template-badge">📦 Default</span>';
                return \`<div class="template-item" onclick="selectTemplate(\${index})">
                    \${t.label} \${badge}
                </div>\`;
            }).join('');
        }

        function selectTemplate(index) {
            selectedTemplate = templates[index];

            // Update active state
            document.querySelectorAll('.template-item').forEach((el, i) => {
                el.classList.toggle('active', i === index);
            });

            // Render editor
            renderEditor();
        }

        function renderEditor() {
            const editor = document.getElementById('editorSection');
            const isCustom = selectedTemplate.isCustom;

            editor.innerHTML = \`
                <h2>Edit Template: \${selectedTemplate.label}</h2>
                <form onsubmit="save(event)">
                    <div class="form-group">
                        <label for="label">Label (with emoji)</label>
                        <input type="text" id="label" value="\${selectedTemplate.label}" required>
                        <div class="hint">Display name shown in menu</div>
                    </div>

                    <div class="form-group">
                        <label for="kind">Kind</label>
                        <select id="kind">
                            <option value="info" \${selectedTemplate.kind === 'info' ? 'selected' : ''}>Info</option>
                            <option value="review" \${selectedTemplate.kind === 'review' ? 'selected' : ''}>Review</option>
                            <option value="refactor" \${selectedTemplate.kind === 'refactor' ? 'selected' : ''}>Refactor</option>
                        </select>
                        <div class="hint">Template category</div>
                    </div>

                    <div class="form-group">
                        <label for="prompt">Prompt Template</label>
                        <textarea id="prompt" required>\${selectedTemplate.prompt}</textarea>
                        <div class="variables-hint">
                            <strong>Available Variables:</strong>
                            {{type}} - "module" for folders, "file" for files<br>
                            {{path}} - Relative path to the resource
                        </div>
                    </div>

                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="enabled" \${selectedTemplate.enabled !== false ? 'checked' : ''}>
                        <label for="enabled">Show in menu</label>
                    </div>

                    <div class="button-group">
                        <button type="submit">💾 Save Changes</button>
                        \${!isCustom ? '<button type="button" class="secondary" onclick="copyToCustom()">✏️ Edit (Copy to Custom)</button>' : ''}
                        \${isCustom ? '<button type="button" class="secondary" onclick="reset()">🔄 Reset to Default</button>' : ''}
                        \${isCustom ? '<button type="button" class="danger" onclick="deleteTemplate()">🗑️ Delete</button>' : ''}
                    </div>
                </form>
            \`;
        }

        function save(event) {
            event.preventDefault();

            const data = {
                filename: selectedTemplate.filename,
                label: document.getElementById('label').value,
                kind: document.getElementById('kind').value,
                prompt: document.getElementById('prompt').value,
                enabled: document.getElementById('enabled').checked
            };

            vscode.postMessage({ command: 'save', data });
        }

        function copyToCustom() {
            // Copy data and save as custom
            const data = {
                filename: selectedTemplate.filename,
                label: document.getElementById('label').value,
                kind: document.getElementById('kind').value,
                prompt: document.getElementById('prompt').value,
                enabled: document.getElementById('enabled').checked
            };

            vscode.postMessage({ command: 'save', data });
        }

        function reset() {
            if (!confirm('Reset this template to default? Your changes will be lost.')) {
                return;
            }

            vscode.postMessage({
                command: 'reset',
                data: { filename: selectedTemplate.filename }
            });
        }

        function deleteTemplate() {
            if (!confirm(\`Delete "\${selectedTemplate.label}"? This cannot be undone.\`)) {
                return;
            }

            vscode.postMessage({
                command: 'delete',
                data: { filename: selectedTemplate.filename }
            });

            selectedTemplate = null;
            document.getElementById('editorSection').innerHTML = '<h2>Template deleted</h2>';
        }

        function createNew() {
            selectedTemplate = null;
            const editor = document.getElementById('editorSection');

            editor.innerHTML = '<h2>Create New Folder Template</h2>' +
                '<form onsubmit="submitNewTemplate(event)">' +
                '<div class="form-group">' +
                '<label for="newFilename">Filename (without .md)</label>' +
                '<input type="text" id="newFilename" placeholder="my-custom-action" required pattern="[a-z0-9-]+" title="Use lowercase letters, numbers, and hyphens only">' +
                '<div class="hint">Only lowercase letters, numbers, and hyphens</div>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="newLabel">Label (with emoji)</label>' +
                '<input type="text" id="newLabel" placeholder="🎯 My Custom Action" required>' +
                '<div class="hint">Display name shown in menu</div>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="newKind">Kind</label>' +
                '<select id="newKind">' +
                '<option value="info">Info</option>' +
                '<option value="action">Action</option>' +
                '<option value="analysis">Analysis</option>' +
                '</select>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="newPrompt">Prompt Template</label>' +
                '<textarea id="newPrompt" required>Custom prompt for {{type}}: {{path}}\n\nDescribe what you want the AI to do here.</textarea>' +
                '<div class="variables-hint">' +
                '<strong>Available Variables:</strong>' +
                '<div>{{type}} - "module" (folders) or "file" (files)</div>' +
                '<div>{{path}} - Relative path to the resource</div>' +
                '</div>' +
                '</div>' +
                '<div class="button-group">' +
                '<button type="submit">✅ Create Template</button>' +
                '<button type="button" class="secondary" onclick="cancelCreate()">❌ Cancel</button>' +
                '</div>' +
                '</form>';

            // Focus on filename field
            setTimeout(function() { document.getElementById('newFilename').focus(); }, 100);
        }

        function submitNewTemplate(event) {
            event.preventDefault();

            var filename = document.getElementById('newFilename').value.trim().toLowerCase();
            var label = document.getElementById('newLabel').value.trim();
            var kind = document.getElementById('newKind').value;
            var prompt = document.getElementById('newPrompt').value.trim();

            if (!filename || !label || !prompt) return;

            var fullFilename = filename + '.md';
            var data = {
                filename: fullFilename,
                label: label,
                kind: kind,
                prompt: prompt,
                enabled: true
            };

            console.log('Creating new folder template:', data);
            pendingSelectFilename = fullFilename;
            vscode.postMessage({ command: 'create', data: data });
        }

        function cancelCreate() {
            var editor = document.getElementById('editorSection');
            editor.innerHTML = '<h2>Select a template to edit</h2>' +
                '<p style="color: var(--vscode-descriptionForeground);">Choose a template from the list on the left, or create a new one.</p>';
        }
    </script>
</body>
</html>`;
}

module.exports = {
    editFolderTemplatesCommand
};
