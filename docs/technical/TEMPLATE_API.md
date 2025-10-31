# Template System API Reference

Quick reference for developers working with the template system.

## Table of Contents

- [Template Loader API](#template-loader-api)
- [Edit Templates API](#edit-templates-api)
- [Template Object Types](#template-object-types)
- [File Format](#file-format)
- [WebView Messages](#webview-messages)
- [Helper Functions](#helper-functions)

## Template Loader API

**Module:** `src/services/template-loader.js`

### `getTemplates()`

Get merged list of templates (cached).

**Returns:** `Template[]`

**Example:**
```javascript
const { getTemplates } = require('./services/template-loader');

const templates = getTemplates();
// [
//   { label: '🔍 Explain this code', prompt: '...', kind: 'quickfix' },
//   ...
// ]
```

### `getTemplatesWithMetadata()`

Get templates with source and path information.

**Returns:** `TemplateWithMetadata[]`

**Example:**
```javascript
const templates = getTemplatesWithMetadata();
// [
//   {
//     label: '🔍 Explain this code',
//     prompt: '...',
//     filename: 'explain-code.md',
//     path: '/path/to/.askbob/quick-actions/explain-code.md',
//     isCustom: true,
//     source: 'user'
//   },
//   ...
// ]
```

### `reloadTemplates()`

Clear cache and reload templates.

**Returns:** `Template[]`

**Example:**
```javascript
const freshTemplates = reloadTemplates();
vscode.window.showInformationMessage('Templates reloaded');
```

### `initializeFileWatcher(context)`

Setup file watcher for `.askbob/quick-actions/`.

**Parameters:**
- `context: vscode.ExtensionContext` - Extension context

**Returns:** `void`

**Example:**
```javascript
// In extension.js activate()
const { initializeFileWatcher } = require('./services/template-loader');

initializeFileWatcher(context);
```

### `dispose()`

Cleanup file watcher and cache.

**Returns:** `void`

**Example:**
```javascript
// In extension.js deactivate()
const { dispose } = require('./services/template-loader');

dispose();
```

## Edit Templates API

**Module:** `src/commands/edit-templates.js`

### `editTemplatesCommand()`

Main command entry point. Shows mode picker.

**Returns:** `Promise<void>`

**Example:**
```javascript
// In commands/index.js
const { editTemplatesCommand } = require('./edit-templates');

const editTemplates = vscode.commands.registerCommand(
    'ask-ai-cli.editTemplates',
    editTemplatesCommand
);
```

### `openVisualEditor()`

Open WebView-based visual editor.

**Returns:** `Promise<void>`

**Example:**
```javascript
await openVisualEditor();
// WebView panel opens with template list
```

### `editFilesDirectly()`

Show template picker and open file in editor.

**Returns:** `Promise<void>`

**Example:**
```javascript
await editFilesDirectly();
// Quick pick → File opens in editor
```

### `openTemplatesFolder()`

Open `.askbob/quick-actions/` in file explorer.

**Returns:** `Promise<void>`

**Example:**
```javascript
await openTemplatesFolder();
// Finder/Explorer opens
```

### `copyToUserSpace(template)`

Copy extension default to `.askbob/` (copy-on-write).

**Parameters:**
- `template: TemplateWithMetadata` - Template to copy

**Returns:** `Promise<string>` - Path to user copy

**Example:**
```javascript
const userPath = await copyToUserSpace(template);
// '/workspace/.askbob/quick-actions/explain-code.md'
```

### `saveTemplate(data)`

Save template to `.askbob/quick-actions/`.

**Parameters:**
- `data: TemplateData` - Template data

**Returns:** `Promise<void>`

**Example:**
```javascript
await saveTemplate({
    filename: 'my-action.md',
    label: '🎯 My Action',
    prompt: 'Do something cool',
    kind: 'quickfix',
    enabled: true
});
```

### `createNewTemplate(data)`

Create new template in `.askbob/`.

**Parameters:**
- `data: TemplateData` - Template data

**Returns:** `Promise<void>`

**Example:**
```javascript
await createNewTemplate({
    filename: 'new-action.md',
    label: '✨ New Action',
    prompt: 'Prompt text',
    kind: 'refactor',
    enabled: true
});
```

### `deleteTemplate(filename)`

Delete user template from `.askbob/`.

**Parameters:**
- `filename: string` - Template filename

**Returns:** `Promise<void>`

**Example:**
```javascript
await deleteTemplate('my-action.md');
// .askbob/quick-actions/my-action.md deleted
```

### `resetToDefault(filename)`

Delete user copy to revert to extension default.

**Parameters:**
- `filename: string` - Template filename

**Returns:** `Promise<void>`

**Example:**
```javascript
await resetToDefault('explain-code.md');
// User copy deleted, extension default takes over
```

## Template Object Types

### `Template`

Basic template object.

```typescript
interface Template {
    label: string;         // Display name (e.g., "🔍 Explain this code")
    prompt: string;        // Prompt text sent to AI
    kind?: string;         // 'quickfix' | 'refactor' (default: 'quickfix')
    enabled?: boolean;     // Show in menu? (default: true)
}
```

### `TemplateWithMetadata`

Template with source and path info.

```typescript
interface TemplateWithMetadata extends Template {
    filename: string;      // e.g., 'explain-code.md'
    path: string;          // Absolute file path
    isCustom: boolean;     // true if from .askbob/
    source: 'extension' | 'user';
}
```

### `TemplateData`

Data for creating/saving templates.

```typescript
interface TemplateData {
    filename: string;      // e.g., 'my-action.md'
    label: string;         // Display name
    prompt: string;        // Prompt text
    kind: string;          // 'quickfix' | 'refactor'
    enabled: boolean;      // Show in menu?
}
```

## File Format

### Markdown with YAML Frontmatter

```markdown
---
label: string (required)
kind: string (optional, default: 'quickfix')
enabled: boolean (optional, default: true)
---
[prompt text - everything after second ---]
```

### Example

```markdown
---
label: 🔍 Explain this code
kind: quickfix
enabled: true
---
Explain this code in detail, including:
1. What it does
2. How it works
3. Potential improvements
```

### Parsing

```javascript
function parseTemplate(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Match frontmatter
    const regex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(regex);

    if (!match) return null;

    const frontmatter = parseFrontmatter(match[1]);
    const prompt = match[2].trim();

    return {
        label: frontmatter.label,
        prompt: prompt,
        kind: frontmatter.kind || 'quickfix',
        enabled: frontmatter.enabled !== false
    };
}

function parseFrontmatter(yaml) {
    const metadata = {};
    yaml.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            metadata[key] = value;
        }
    });
    return metadata;
}
```

## WebView Messages

### Extension → WebView

#### `templates`

Send templates data to WebView.

```javascript
panel.webview.postMessage({
    command: 'templates',
    data: TemplateWithMetadata[]
});
```

#### `saved`

Confirm save operation.

```javascript
panel.webview.postMessage({
    command: 'saved',
    data: { filename: string }
});
```

#### `error`

Send error message.

```javascript
panel.webview.postMessage({
    command: 'error',
    data: { message: string }
});
```

### WebView → Extension

#### `load`

Request templates data.

```javascript
vscode.postMessage({ command: 'load' });
```

#### `save`

Save template changes.

```javascript
vscode.postMessage({
    command: 'save',
    data: TemplateData
});
```

#### `create`

Create new template.

```javascript
vscode.postMessage({
    command: 'create',
    data: TemplateData
});
```

#### `delete`

Delete template.

```javascript
vscode.postMessage({
    command: 'delete',
    data: { filename: string }
});
```

#### `reset`

Reset to default.

```javascript
vscode.postMessage({
    command: 'reset',
    data: { filename: string }
});
```

### Example Handler

```javascript
panel.webview.onDidReceiveMessage(async (message) => {
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
            panel.webview.postMessage({
                command: 'saved',
                data: { filename: message.data.filename }
            });
            break;

        case 'create':
            await createNewTemplate(message.data);
            break;

        case 'delete':
            await deleteTemplate(message.data.filename);
            break;

        case 'reset':
            await resetToDefault(message.data.filename);
            break;
    }
});
```

## Helper Functions

### `ensureAskbobFolder()`

Create `.askbob/quick-actions/` if doesn't exist.

**Returns:** `Promise<void>`

**Example:**
```javascript
await ensureAskbobFolder();
// .askbob/quick-actions/ now exists
```

**Implementation:**
```javascript
async function ensureAskbobFolder() {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const dir = path.join(workspaceRoot, '.askbob', 'quick-actions');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });

        // Create .gitignore
        const gitignore = path.join(workspaceRoot, '.askbob', '.gitignore');
        fs.writeFileSync(gitignore, '# Bob AI CLI\n*\n');
    }
}
```

### `validateTemplate(template)`

Validate template structure.

**Parameters:**
- `template: any` - Template to validate

**Returns:** `{ valid: boolean, errors: string[] }`

**Example:**
```javascript
const result = validateTemplate(template);
if (!result.valid) {
    console.error('Invalid template:', result.errors);
}
```

**Implementation:**
```javascript
function validateTemplate(template) {
    const errors = [];

    if (!template.label) {
        errors.push('Missing required field: label');
    }

    if (!template.prompt) {
        errors.push('Missing required field: prompt');
    }

    if (template.kind && !['quickfix', 'refactor'].includes(template.kind)) {
        errors.push('Invalid kind: must be quickfix or refactor');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
```

### `sanitizeFilename(filename)`

Sanitize filename for security.

**Parameters:**
- `filename: string` - Raw filename

**Returns:** `string` - Sanitized filename

**Example:**
```javascript
const safe = sanitizeFilename('my../../../hack.md');
// 'my______hack.md'
```

**Implementation:**
```javascript
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9-_.]/gi, '_');
}
```

### `loadFromDirectory(dir, metadata)`

Load all templates from a directory.

**Parameters:**
- `dir: string` - Directory path
- `metadata: object` - Metadata to add to each template

**Returns:** `TemplateWithMetadata[]`

**Example:**
```javascript
const templates = loadFromDirectory(
    '/path/to/templates',
    { isCustom: false, source: 'extension' }
);
```

**Implementation:**
```javascript
function loadFromDirectory(dir, metadata) {
    if (!fs.existsSync(dir)) return [];

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
}
```

## Usage Examples

### Example 1: Load and Display Templates

```javascript
const { getTemplates } = require('./services/template-loader');

async function showQuickActions() {
    const templates = getTemplates();

    const selected = await vscode.window.showQuickPick(
        templates.map(t => ({
            label: t.label,
            template: t
        })),
        { placeHolder: 'Select an action' }
    );

    if (selected) {
        console.log('User selected:', selected.template.prompt);
    }
}
```

### Example 2: Create Custom Template

```javascript
const { createNewTemplate } = require('./commands/edit-templates');

await createNewTemplate({
    filename: 'my-action.md',
    label: '🎯 My Custom Action',
    prompt: 'Do something amazing with this code',
    kind: 'quickfix',
    enabled: true
});

// Template now available in Quick Actions menu
```

### Example 3: Edit Existing Template

```javascript
const { getTemplatesWithMetadata, copyToUserSpace } = require('./services/template-loader');

const templates = getTemplatesWithMetadata();
const explain = templates.find(t => t.filename === 'explain-code.md');

// Copy to user space (if not already)
const userPath = await copyToUserSpace(explain);

// Open in editor
const doc = await vscode.workspace.openTextDocument(userPath);
await vscode.window.showTextDocument(doc);
```

### Example 4: Reset to Default

```javascript
const { resetToDefault } = require('./commands/edit-templates');

await resetToDefault('explain-code.md');
// User customizations deleted
// Extension default takes over
```

### Example 5: Watch for Changes

```javascript
const { initializeFileWatcher, reloadTemplates } = require('./services/template-loader');

// In extension activate()
initializeFileWatcher(context);

// File watcher automatically calls reloadTemplates() on changes
// Consumer code just calls getTemplates() to get fresh data
```

## Error Handling

### Template Loading Errors

```javascript
try {
    const templates = getTemplates();
} catch (error) {
    console.error('Failed to load templates:', error);
    vscode.window.showErrorMessage(
        'Failed to load Quick Action templates. Check console for details.'
    );
}
```

### File System Errors

```javascript
try {
    await saveTemplate(data);
} catch (error) {
    if (error.code === 'EACCES') {
        vscode.window.showErrorMessage('Permission denied');
    } else if (error.code === 'ENOSPC') {
        vscode.window.showErrorMessage('Disk full');
    } else {
        vscode.window.showErrorMessage(`Save failed: ${error.message}`);
    }
}
```

### Validation Errors

```javascript
const result = validateTemplate(template);
if (!result.valid) {
    vscode.window.showErrorMessage(
        `Invalid template: ${result.errors.join(', ')}`
    );
    return;
}
```

## Best Practices

1. **Always use getTemplates() for fresh data**
   - Don't cache templates in your code
   - Template loader handles caching

2. **Check workspace before editing**
   ```javascript
   if (!vscode.workspace.workspaceFolders?.length) {
       vscode.window.showErrorMessage('No workspace open');
       return;
   }
   ```

3. **Use copyToUserSpace() for safe editing**
   - Never modify extension defaults directly
   - Always copy to .askbob/ first

4. **Validate before saving**
   ```javascript
   const result = validateTemplate(data);
   if (!result.valid) return;
   await saveTemplate(data);
   ```

5. **Handle errors gracefully**
   - Show user-friendly error messages
   - Log details to console for debugging

6. **Reload after changes**
   ```javascript
   await saveTemplate(data);
   reloadTemplates(); // Clear cache
   ```

## Related Documentation

- [User Guide](./CUSTOMIZING_TEMPLATES.md)
- [Architecture](./TEMPLATE_ARCHITECTURE.md)
- [Main README](../README.md)
