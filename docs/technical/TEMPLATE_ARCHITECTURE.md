# Template System Architecture

Technical documentation for the Bob AI CLI template system.

## Overview

The template system provides a flexible, user-customizable framework for Quick Action prompts. It follows a **copy-on-write** pattern with **layered loading** from multiple sources.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Action                          │
│              (Select Quick Action / Edit Template)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Template Loader                           │
│                                                             │
│  ┌──────────────┐         ┌──────────────────┐            │
│  │  Extension   │         │  User Workspace  │            │
│  │  Defaults    │         │   (.askbob/)     │            │
│  │              │         │                  │            │
│  │ templates/   │  merge  │ .askbob/         │            │
│  │ quick-actions│ ─────►  │ quick-actions/   │            │
│  │              │         │                  │            │
│  │ (read-only)  │         │ (read-write)     │            │
│  └──────────────┘         └──────────────────┘            │
│         │                          │                       │
│         └──────────┬───────────────┘                       │
│                    ▼                                       │
│         ┌──────────────────────┐                          │
│         │  Merged Template Map │                          │
│         │  (by filename key)   │                          │
│         └──────────────────────┘                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    File Watcher                             │
│  - Watches: .askbob/quick-actions/*.md                     │
│  - On change: Reload templates + notify components         │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Consumer Components                        │
│  - quick-actions.js (Command)                              │
│  - code-action-provider.js (Lightbulb)                     │
│  - edit-templates.js (Editor UI)                           │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Template Loader (`src/services/template-loader.js`)

**Responsibilities:**
- Load templates from multiple sources
- Merge with priority rules
- Parse frontmatter
- Cache for performance
- Watch for changes

**API:**
```javascript
// Get all templates (merged)
getTemplates(): Template[]

// Get templates with metadata (source, path, etc.)
getTemplatesWithMetadata(): TemplateWithMetadata[]

// Reload templates (clear cache)
reloadTemplates(): Template[]

// Initialize file watcher
initializeFileWatcher(context: ExtensionContext): void

// Cleanup
dispose(): void
```

**Template Object:**
```typescript
interface Template {
    label: string;         // Display name with emoji
    prompt: string;        // Prompt text
    kind?: string;         // 'quickfix' | 'refactor'
    enabled?: boolean;     // Default: true
}

interface TemplateWithMetadata extends Template {
    filename: string;      // e.g., 'explain-code.md'
    path: string;          // Absolute file path
    isCustom: boolean;     // true if from .askbob/
    source: 'extension' | 'user';
}
```

### 2. Edit Templates Command (`src/commands/edit-templates.js`)

**Responsibilities:**
- Provide edit UI (WebView + File Edit)
- Copy-on-write logic
- Create new templates
- Delete/reset templates

**API:**
```javascript
// Main command entry point
editTemplatesCommand(): Promise<void>

// Open visual editor WebView
openVisualEditor(): Promise<void>

// Open file picker for direct editing
editFilesDirectly(): Promise<void>

// Open .askbob folder in file explorer
openTemplatesFolder(): Promise<void>

// Copy default template to user space
copyToUserSpace(template: TemplateWithMetadata): Promise<string>

// Save template to .askbob/
saveTemplate(data: TemplateData): Promise<void>

// Create new template
createNewTemplate(data: TemplateData): Promise<void>

// Delete user template
deleteTemplate(filename: string): Promise<void>

// Reset to default (delete user copy)
resetToDefault(filename: string): Promise<void>
```

### 3. WebView Editor (`edit-templates.js`)

**Communication Protocol:**

**Extension → WebView:**
```javascript
// Send templates data
postMessage({
    command: 'templates',
    data: TemplateWithMetadata[]
})

// Confirm save
postMessage({
    command: 'saved',
    data: { filename: string }
})
```

**WebView → Extension:**
```javascript
// Request templates
postMessage({ command: 'load' })

// Save template
postMessage({
    command: 'save',
    data: TemplateData
})

// Create new template
postMessage({
    command: 'create',
    data: TemplateData
})

// Delete template
postMessage({
    command: 'delete',
    data: { filename: string }
})

// Reset to default
postMessage({
    command: 'reset',
    data: { filename: string }
})
```

## Data Flow

### Loading Templates

```
1. Extension Activation
   ↓
2. template-loader.js initialized
   ↓
3. Load extension defaults
   templates/quick-actions/*.md
   ↓
4. Load user customizations (if exists)
   .askbob/quick-actions/*.md
   ↓
5. Merge by filename
   User templates override defaults
   ↓
6. Cache result
   ↓
7. Return to consumers
```

### Editing Existing Template

```
1. User: "Edit Quick Action Prompts"
   ↓
2. Show mode picker (Visual / File / Folder)
   ↓
3. User selects template
   ↓
4. Check source:
   - If already in .askbob/ → Open directly
   - If extension default → Copy to .askbob/ first
   ↓
5. Open editor (WebView or file)
   ↓
6. User edits and saves
   ↓
7. File watcher detects change
   ↓
8. Reload templates (clear cache)
   ↓
9. Notify consumers (refresh UI)
```

### Creating New Template

```
1. User: "Create New Template"
   ↓
2. Prompt for filename
   ↓
3. Create in .askbob/quick-actions/
   ↓
4. Open in editor
   ↓
5. User edits and saves
   ↓
6. File watcher detects new file
   ↓
7. Reload templates
   ↓
8. Template appears in menu
```

## File Format Specification

### Markdown with YAML Frontmatter

```markdown
---
label: string (required)
kind: string (optional, default: 'quickfix')
enabled: boolean (optional, default: true)
---
[prompt text]
```

**Validation Rules:**

1. **Frontmatter:**
   - Must start with `---` on first line
   - Must end with `---` on its own line
   - Must be valid YAML
   - Must contain `label` field

2. **Label:**
   - Required
   - String type
   - Typically includes emoji
   - Used in Quick Pick menu

3. **Kind:**
   - Optional (default: `'quickfix'`)
   - Values: `'quickfix'` | `'refactor'`
   - Controls VS Code code action category

4. **Enabled:**
   - Optional (default: `true`)
   - Boolean type
   - If `false`, template hidden from menu

5. **Prompt Text:**
   - Everything after second `---`
   - Can be multi-line
   - Can include markdown formatting (for readability)
   - Sent as-is to AI CLI (with code reference appended)

### Example Files

**Extension Default:**
```
templates/quick-actions/explain-code.md
---
label: 🔍 Explain this code
kind: quickfix
enabled: true
---
Explain this code
```

**User Override:**
```
.askbob/quick-actions/explain-code.md
---
label: 🔍 Explain this code (detailed)
kind: quickfix
enabled: true
---
Explain this code in detail, including:
1. What it does
2. How it works
3. Why it's structured this way
4. Potential issues or improvements
```

**Custom Template:**
```
.askbob/quick-actions/convert-typescript.md
---
label: 📘 Convert to TypeScript
kind: refactor
enabled: true
---
Convert this JavaScript code to TypeScript with proper type annotations
```

**Disabled Template:**
```
.askbob/quick-actions/experimental.md
---
label: 🧪 Experimental
kind: quickfix
enabled: false
---
This won't appear in menu
```

## Directory Structure

```
workspace/
├── .askbob/
│   ├── quick-actions/          ← User templates
│   │   ├── explain-code.md     ← Override default
│   │   ├── my-custom.md        ← Custom template
│   │   └── ...
│   └── .gitignore              ← Auto-generated
│
└── [extension]/
    └── templates/              ← Extension defaults (read-only)
        └── quick-actions/
            ├── explain-code.md
            ├── find-bugs.md
            ├── refactor.md
            ├── write-tests.md
            ├── add-docs.md
            ├── optimize.md
            ├── security-review.md
            ├── simplify-logic.md
            └── README.md
```

## Loading Priority

Templates are merged with the following priority:

```
.askbob/quick-actions/explain-code.md  (highest priority)
    ↓ overrides
templates/quick-actions/explain-code.md (lowest priority)
```

**Merge Algorithm:**
```javascript
function mergeTemplates(defaults, customs) {
    const map = new Map();

    // 1. Add all defaults (keyed by filename)
    defaults.forEach(template => {
        map.set(template.filename, template);
    });

    // 2. Override with customs (same filename = replace)
    customs.forEach(template => {
        map.set(template.filename, template);
    });

    // 3. Filter disabled templates
    const enabled = Array.from(map.values())
        .filter(t => t.enabled !== false);

    // 4. Sort by label
    return enabled.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
}
```

## File Watching

### Watch Targets

1. **User Templates** (read-write)
   - Path: `{workspace}/.askbob/quick-actions/*.md`
   - Events: create, change, delete
   - Action: Reload templates

2. **Extension Templates** (read-only, no watch needed)
   - Path: `{extension}/templates/quick-actions/*.md`
   - Static during runtime

### Watch Implementation

```javascript
function initializeFileWatcher(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) return;

    const pattern = new vscode.RelativePattern(
        path.join(workspaceRoot, '.askbob', 'quick-actions'),
        '*.md'
    );

    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    const reloadOnChange = () => {
        console.log('Template changed, reloading...');
        reloadTemplates();
        vscode.window.showInformationMessage('Templates reloaded');
    };

    watcher.onDidCreate(reloadOnChange);
    watcher.onDidChange(reloadOnChange);
    watcher.onDidDelete(reloadOnChange);

    context.subscriptions.push(watcher);
}
```

## Copy-on-Write Pattern

When user edits an extension default:

```javascript
async function copyToUserSpace(template) {
    // Already custom? Just return path
    if (template.isCustom) {
        return template.path;
    }

    // Build user path
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const userPath = path.join(
        workspaceRoot,
        '.askbob',
        'quick-actions',
        template.filename
    );

    // Already copied? Return path
    if (fs.existsSync(userPath)) {
        return userPath;
    }

    // First edit: Copy to .askbob
    await ensureAskbobFolder();
    fs.copyFileSync(template.path, userPath);

    vscode.window.showInformationMessage(
        '📝 Copied to .askbob/ for editing. Original preserved.'
    );

    return userPath;
}
```

**Benefits:**
- Extension defaults never modified
- Clear separation of concerns
- Easy reset (delete user copy)
- Safe experimentation

## WebView Architecture

### HTML Structure

```html
<div class="container">
    <!-- Templates List -->
    <div class="templates-list">
        <div class="template-item" onclick="select(0)">
            🔍 Explain this code [📦 Default]
        </div>
        ...
    </div>

    <!-- Editor Section -->
    <div class="editor-section">
        <input id="label" />
        <textarea id="prompt"></textarea>
        <select id="kind"></select>
        <input type="checkbox" id="enabled" />

        <button onclick="save()">Save</button>
        <button onclick="reset()">Reset</button>
        <button onclick="delete()">Delete</button>
    </div>

    <!-- Create New -->
    <button onclick="createNew()">Create New</button>
</div>
```

### State Management

```javascript
// WebView state
let templates = [];        // All templates from extension
let selectedTemplate = null; // Currently editing

// Load on init
vscode.postMessage({ command: 'load' });

// Receive templates
window.addEventListener('message', event => {
    if (event.data.command === 'templates') {
        templates = event.data.data;
        renderTemplates();
    }
});

// Select template
function selectTemplate(index) {
    selectedTemplate = templates[index];
    populateEditor(selectedTemplate);
}

// Save changes
function save() {
    const data = {
        filename: selectedTemplate.filename,
        label: document.getElementById('label').value,
        prompt: document.getElementById('prompt').value,
        kind: document.getElementById('kind').value,
        enabled: document.getElementById('enabled').checked
    };

    vscode.postMessage({ command: 'save', data });
}
```

## Error Handling

### File System Errors

```javascript
try {
    fs.copyFileSync(src, dest);
} catch (error) {
    if (error.code === 'EACCES') {
        vscode.window.showErrorMessage(
            'Permission denied. Check file permissions.'
        );
    } else if (error.code === 'ENOSPC') {
        vscode.window.showErrorMessage(
            'Disk full. Free up space and try again.'
        );
    } else {
        vscode.window.showErrorMessage(
            `Failed to copy template: ${error.message}`
        );
    }
}
```

### Parse Errors

```javascript
function parseTemplate(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

        if (!match) {
            console.warn(`Invalid frontmatter: ${filePath}`);
            return null; // Skip this template
        }

        const frontmatter = parseFrontmatter(match[1]);
        const prompt = match[2].trim();

        if (!frontmatter.label) {
            console.warn(`Missing label: ${filePath}`);
            return null;
        }

        return { ...frontmatter, prompt };
    } catch (error) {
        console.error(`Failed to parse ${filePath}:`, error);
        return null;
    }
}
```

### Workspace Validation

```javascript
async function ensureWorkspace() {
    if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showErrorMessage(
            'No workspace open. Open a folder to customize templates.'
        );
        return false;
    }
    return true;
}
```

## Performance Considerations

### Caching

```javascript
// Cache templates after first load
let cachedTemplates = null;

function getTemplates() {
    if (cachedTemplates) {
        return cachedTemplates;
    }

    // Load and cache
    cachedTemplates = loadAndMergeTemplates();
    return cachedTemplates;
}

// Clear cache on changes
function reloadTemplates() {
    cachedTemplates = null;
    return getTemplates();
}
```

### Lazy Loading

```javascript
// Only load templates when needed
// Not on extension activation

// Quick Actions command → Load templates
// Edit Templates command → Load templates
// Code Action Provider → Load templates
```

### File Watcher Debouncing

```javascript
let reloadTimer = null;

function scheduleReload() {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
        reloadTemplates();
        vscode.window.showInformationMessage('Templates reloaded');
    }, 500); // Debounce 500ms
}
```

## Testing Strategy

### Unit Tests

```javascript
// Template loading
test('loads extension defaults', () => {
    const templates = loadExtensionTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('label');
});

// Merging
test('user template overrides default', () => {
    const defaults = [{ filename: 'test.md', label: 'Default' }];
    const customs = [{ filename: 'test.md', label: 'Custom' }];
    const merged = mergeTemplates(defaults, customs);
    expect(merged[0].label).toBe('Custom');
});

// Parsing
test('parses valid frontmatter', () => {
    const content = '---\nlabel: Test\n---\nPrompt';
    const parsed = parseTemplate(content);
    expect(parsed.label).toBe('Test');
    expect(parsed.prompt).toBe('Prompt');
});
```

### Integration Tests

```javascript
// Copy-on-write
test('copies default to .askbob on first edit', async () => {
    const template = {
        filename: 'test.md',
        isCustom: false,
        path: '/extension/templates/test.md'
    };

    const userPath = await copyToUserSpace(template);
    expect(userPath).toContain('.askbob');
    expect(fs.existsSync(userPath)).toBe(true);
});

// File watching
test('reloads templates on file change', async () => {
    const watcher = initializeFileWatcher(context);

    // Write file
    fs.writeFileSync('.askbob/quick-actions/test.md', content);

    // Wait for reload
    await sleep(1000);

    const templates = getTemplates();
    expect(templates.some(t => t.filename === 'test.md')).toBe(true);
});
```

## Security Considerations

1. **Path Traversal Prevention**
   ```javascript
   // Sanitize filenames
   function sanitizeFilename(filename) {
       return filename.replace(/[^a-z0-9-_.]/gi, '_');
   }
   ```

2. **File Size Limits**
   ```javascript
   const MAX_TEMPLATE_SIZE = 100 * 1024; // 100KB

   if (stats.size > MAX_TEMPLATE_SIZE) {
       throw new Error('Template file too large');
   }
   ```

3. **Restricted Paths**
   ```javascript
   // Only allow .askbob/quick-actions/
   function validatePath(filePath) {
       const normalized = path.normalize(filePath);
       const allowed = path.join(workspace, '.askbob', 'quick-actions');
       return normalized.startsWith(allowed);
   }
   ```

## Future Enhancements

1. **Template Variables**
   - `{{selection}}` - Selected code
   - `{{filename}}` - Current file
   - `{{language}}` - File language

2. **Template Import/Export**
   - Export as JSON
   - Import from marketplace

3. **Template Marketplace**
   - Share templates with community
   - Browse and install popular templates

4. **Template Analytics**
   - Track most-used templates
   - Suggest optimizations

5. **AI-Powered Template Generation**
   - Generate templates from examples
   - Optimize prompts automatically
