# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bob AI CLI is a Visual Studio Code extension that enhances productivity when working with AI CLIs like Claude Code and Gemini CLI. It provides quick code reference copying, terminal integration, and template-based prompt actions. The extension follows the format `@relative/path#LstartLine-endLine` for code references.

## Architecture

### Core Components

- **Six Main Commands**:
  - `ask-ai-cli.copyCodeBlock` - Copy code reference to clipboard
  - `ask-ai-cli.sendToTerminal` - Send code reference to AI CLI terminal
  - `ask-ai-cli.quickActions` - Template-based prompt actions
  - `ask-ai-cli.startAICLI` - Launch AI CLI picker
  - `ask-ai-cli.addFeature` - Guided tech spec creation workflow (NEW)
  - `ask-ai-cli.executePlan` - Smart plan execution from .md files or code selection (NEW)
- **Terminal Lifecycle Management**: Tracks AI CLI terminals and auto-detects when closed/killed
- **Required AI CLI**: All commands now enforce that an AI CLI must be running before execution
- **Pure JavaScript Implementation**: No build process required, modular architecture
- **Smart Terminal Detection**: Auto-detects Claude Code/AI CLI terminals, blocks if not running

### Key Files

- `src/extension.js` - Extension entry point with terminal listeners
- `src/commands/` - Modular command handlers (8 command files)
- `src/services/terminal-manager.js` - Terminal lifecycle tracking and validation
- `src/services/cli-detector.js` - AI CLI detection logic
- `src/utils/` - Code reference generation and path utilities
- `src/config/ai-clis.js` - AI CLI configurations and templates
- `package.json` - Extension manifest with command registration and menu integration
- `icon.png` - Extension icon

## Development Commands

### Testing
```bash
# Primary testing method (when F5 debug works)
# Press F5 in VS Code to launch Extension Development Host

# Alternative testing when F5 doesn't work (see TESTING.md for full details)
# 1. Create VSIX package and install manually
npm install -g @vscode/vsce
vsce package

# 2. Install from VSIX in VS Code Extensions panel
# 3. Test using Command Palette: "Copy Susu: Copy Code Block Reference"
```

### Build and Package
```bash
# Validate before publishing
npm run vscode:prepublish

# Create distributable package
vsce package
```

## Extension Behavior

### Command Registration
- **Command ID**: `copy-susu.copyCodeBlock`
- **Context Menu**: Appears when `editorHasSelection` is true
- **Command Palette**: Available when text is selected
- **Group**: Placed in "navigation" group of context menu

### Path Processing Logic
1. **Input Validation**: Checks for active editor and text selection
2. **Path Conversion**: Converts absolute paths to workspace-relative paths when possible
3. **Line Number Formatting**: Converts 0-indexed to 1-indexed line numbers
4. **Output Format**:
   - Single line: `@path#L5`
   - Multi-line: `@path#L5-8`
   - Always uses forward slashes for cross-platform compatibility

### Error Handling Pattern
```javascript
if (!condition) {
    vscode.window.showErrorMessage('User-friendly error message');
    return;
}
```

## Development Patterns

### Extension Activation
- Uses `activate(context)` function pattern
- Properly handles disposal with `context.subscriptions.push()`
- Single command registration for simplicity

### Asynchronous Operations
- Clipboard operations use promises with proper error handling
- User feedback via `vscode.window.showInformationMessage()` and `showErrorMessage()`

### Path Normalization
- Always uses forward slashes in output format
- Detects workspace root automatically for relative paths
- Falls back to absolute paths when no workspace is available

## Terminal Lifecycle Management

### Overview
The extension uses a sophisticated terminal tracking system to ensure commands only execute when a valid AI CLI (Claude Code, Gemini, etc.) is running. This prevents errors and provides clear user guidance.

### Core Concepts

#### 1. Terminal Tracking (`src/services/terminal-manager.js`)
- **Tracked Set**: Uses `trackedAITerminals` Set to track terminals we've started
- **Lifecycle Listeners**: `setupTerminalListeners()` listens for terminal close events and auto-cleans dead references
- **Validation Flow**: Always validates terminals exist in `vscode.window.terminals` before use

#### 2. Detection Strategy (Priority Order)
1. **First**: Check tracked terminals (ones we started via `startAICLI()`)
2. **Second**: Look for terminals with AI CLI identifiers (claude, gemini, anthropic, etc.) in `name` or `shellPath`
3. **Fallback**: Use active terminal or most recently created terminal
4. **Validation**: Only proceed if terminal is "obvious AI CLI" (`isObviousAITerminal()`)

#### 3. CLI-Specific Behavior
Different AI CLIs require different send methods:
- **Claude Code**: Use `terminal.sendText(text, false)` - sends WITHOUT auto-enter for user review
- **Gemini CLI**: Use clipboard + paste method - copy text, then auto-paste or show manual paste instruction
- **Unsupported CLIs**: Block with warning message (e.g., ChatGPT, Aider support coming soon)

### Critical Do's ✅

1. **Always Validate Terminal Exists**
   ```javascript
   const aiTerminal = findAITerminal();
   if (aiTerminal && !vscode.window.terminals.includes(aiTerminal)) {
       trackedAITerminals.delete(aiTerminal); // Clean up dead reference
       aiTerminal = null;
   }
   ```

2. **Block If No Obvious AI CLI**
   ```javascript
   if (!isObviousAITerminal(aiTerminal)) {
       vscode.window.showErrorMessage('No AI CLI detected. Please start Claude Code or Gemini CLI first.');
       return false; // Block the action
   }
   ```

3. **Clean Up Dead References**
   - Always remove dead terminals from `trackedAITerminals` when detected
   - Listen for `onDidCloseTerminal` events to clean up automatically

4. **Track Terminals You Start**
   ```javascript
   const terminal = vscode.window.createTerminal({...});
   trackedAITerminals.add(terminal); // Track it
   ```

5. **Offer to Start AI CLI When Missing**
   - Show "Start AI CLI Now" button in error messages
   - Execute `ask-ai-cli.startAICLI` command to open picker

### Critical Don'ts ❌

1. **Don't Assume Terminals Are Alive**
   - Terminal references can become stale if user closes terminal manually
   - Always validate against `vscode.window.terminals` list

2. **Don't Send to Any Terminal**
   - Must be an "obvious AI CLI" terminal (not just any active terminal)
   - Use `isObviousAITerminal()` to validate before sending

3. **Don't Keep Dead References**
   - Clean up `trackedAITerminals` Set when terminals are detected as closed
   - Prevents memory leaks and stale state

4. **Don't Skip CLI Type Detection**
   - Different CLIs need different send methods (Claude vs Gemini)
   - Use `detectCLIType()` to determine proper formatting

5. **Don't Proceed Without User Consent**
   - If no AI CLI found, block the action and offer to start one
   - Never silently fail or send to wrong terminal

### Common Patterns

#### Safe Terminal Send Pattern
```javascript
async function sendToAITerminal(text) {
    // 1. Find AI terminal
    let aiTerminal = findAITerminal();

    // 2. Validate terminal still exists
    if (aiTerminal && !vscode.window.terminals.includes(aiTerminal)) {
        trackedAITerminals.delete(aiTerminal);
        aiTerminal = null;
    }

    // 3. Block if no obvious AI CLI
    if (!isObviousAITerminal(aiTerminal)) {
        // Show error and offer to start AI CLI
        return false;
    }

    // 4. Detect CLI type and send appropriately
    const cliType = detectCLIType(aiTerminal);
    if (cliType === 'gemini') {
        // Use clipboard + paste method
    } else if (cliType === 'claude') {
        // Use sendText without auto-enter
    }

    return true;
}
```

#### Terminal Lifecycle Setup Pattern
```javascript
function activate(context) {
    // Setup terminal listeners ONCE during activation
    setupTerminalListeners(context);

    // Register commands...
}
```

### Key Files Reference
- `src/services/terminal-manager.js:5-6` - `trackedAITerminals` Set definition
- `src/services/terminal-manager.js:12-22` - Terminal lifecycle listeners
- `src/services/terminal-manager.js:28-70` - `findAITerminal()` detection logic
- `src/services/terminal-manager.js:204-224` - `isObviousAITerminal()` validation
- `src/services/terminal-manager.js:265-358` - `sendToAITerminal()` safe send pattern

## Quick Actions & Templates System

### Overview
The extension provides a powerful template system that allows users to create reusable prompt templates with variables. Templates are loaded from multiple sources with a clear priority system.

### Template Loading Priority
1. **User Custom Templates** (`.askbob/quick-actions/*.md`) - Highest priority, overrides defaults
2. **Extension Default Templates** (`templates/quick-actions/*.md`) - Built-in templates
3. **Hardcoded Fallback** (`DEFAULT_TEMPLATES` in `template-loader.js`) - Used if no files found

### Template File Format
Templates use Markdown with frontmatter metadata:

```markdown
---
label: 🔍 Explain this code
kind: quickfix
enabled: true
---
Explain this code in detail: {{code}}

Focus on:
- What the code does
- Key algorithms or patterns used
- Potential improvements
```

**Frontmatter Fields:**
- `label`: Display text in Quick Pick menu (supports emojis)
- `kind`: VS Code code action kind (`quickfix`, `refactor`, etc.)
- `enabled`: Boolean to enable/disable template (default: `true`)

### Template Variables
- **`{{code}}`**: Replaced with code reference (e.g., `@src/extension.js#L10-20`)
- **Backward Compatibility**: If no `{{code}}` variable found, appends code reference at end

### Template Lifecycle

#### 1. Loading (`src/services/template-loader.js`)
```javascript
getTemplates()
  ├─> getTemplatesWithMetadata()
  │   ├─> loadExtensionDefaults() // templates/quick-actions/
  │   ├─> loadUserCustoms()       // .askbob/quick-actions/
  │   └─> mergeTemplates()        // Merge with user overrides
  └─> Cache results (reload on file changes)
```

#### 2. Rendering (Quick Pick Menu)
- Templates sorted alphabetically by label
- Separator line added before "Custom prompt" option
- Custom prompt option always last

#### 3. Execution (`src/commands/quick-actions.js`)
```javascript
quickActionsCommand()
  ├─> Show template picker (Quick Pick)
  ├─> Handle custom prompt input (if selected)
  ├─> Generate code reference from selection
  ├─> Replace variables ({{code}} → @path#L5-8)
  ├─> Send to AI terminal
  └─> Play success sound (if enabled)
```

#### 4. File Watching (`initializeFileWatcher()`)
- Watches `templates/quick-actions/*.md` and `.askbob/quick-actions/*.md`
- Auto-reloads templates on create/change/delete
- Shows notification: "Quick action templates reloaded"

### Creating Custom Templates

**Step 1: Create directory**
```bash
mkdir -p .askbob/quick-actions
```

**Step 2: Create template file** (e.g., `.askbob/quick-actions/convert-typescript.md`)
```markdown
---
label: 🔷 Convert to TypeScript
kind: refactor
enabled: true
---
Convert this code to TypeScript with proper type annotations: {{code}}

Requirements:
- Add type definitions for all parameters
- Use interfaces for complex objects
- Add return type annotations
```

**Step 3: Use template**
- Select code → Right-click → "Quick Actions"
- Choose your custom template from the menu

### Template Best Practices

1. **Use Descriptive Labels**: Include emoji + clear action description
2. **Include {{code}} Variable**: Always use `{{code}}` in prompt for proper placement
3. **Provide Context**: Add requirements, constraints, or guidelines in template
4. **Test Variations**: Create multiple templates for different scenarios
5. **Disable Instead of Delete**: Set `enabled: false` to keep template but hide from menu

### Common Template Patterns

#### Simple Task Template
```markdown
---
label: 🎯 Task Name
kind: quickfix
---
Do something with this code: {{code}}
```

#### Detailed Instructions Template
```markdown
---
label: 🔧 Complex Task
kind: refactor
---
Perform this task on {{code}}:

1. First requirement
2. Second requirement
3. Third requirement

Constraints:
- Maintain backward compatibility
- Add unit tests
```

#### Context-Rich Template
```markdown
---
label: 🏗️ Architecture Review
kind: quickfix
---
Review the architecture of {{code}}:

Focus areas:
- Design patterns used
- SOLID principles adherence
- Potential code smells
- Scalability concerns
- Performance considerations
```

### Key Files Reference
- `src/config/ai-clis.js:38-50` - `QUICK_ACTIONS` default templates
- `src/services/template-loader.js:6-17` - `DEFAULT_TEMPLATES` fallback
- `src/services/template-loader.js:32-74` - Template file parsing with frontmatter
- `src/services/template-loader.js:187-217` - Template loading and caching
- `src/services/template-loader.js:284-298` - Variable replacement logic
- `src/commands/quick-actions.js:10-87` - Quick actions command handler

## Code Reference Format

### Overview
The extension uses a standardized format for code references: `@relative/path#LstartLine-endLine`. This format is compatible with Claude Code and other AI CLIs that support file+line references.

### Format Specification

**Single Line:**
```
@src/extension.js#L42
```

**Multiple Lines:**
```
@src/commands/copy-code-block.js#L15-28
```

**Components:**
- `@` - Prefix indicating code reference
- `relative/path` - Workspace-relative path with forward slashes
- `#L` - Line number delimiter
- `startLine` - Starting line (1-indexed)
- `-endLine` - Optional end line (1-indexed, only if different from start)

### Generation Process (`src/utils/code-reference.js`)

#### 1. Path Conversion (`getRelativePath`)
```javascript
// Converts absolute path to workspace-relative
Input:  /Users/name/project/src/extension.js
Output: src/extension.js
```

**Logic:**
- Detects workspace root from `vscode.workspace.workspaceFolders[0]`
- Checks if file path starts with workspace root
- Strips workspace root + separator to get relative path
- Falls back to absolute path if no workspace detected

#### 2. Path Normalization (`normalizePath`)
```javascript
// Normalizes path separators to forward slashes
Input:  src\commands\copy-code-block.js (Windows)
Output: src/commands/copy-code-block.js
```

**Purpose:** Cross-platform consistency (Windows uses `\`, Unix uses `/`)

#### 3. Line Number Conversion
```javascript
// VS Code uses 0-indexed lines, output uses 1-indexed
VS Code Selection: { start: { line: 14 }, end: { line: 27 } }
Output Format:     L15-28
```

**Algorithm:**
- Add 1 to both start and end line numbers
- Only include end line if different from start line

### Generation Functions

#### `generateCodeReference(editor)` - From Active Editor
Used by: Copy to clipboard, Send to terminal, Quick actions

```javascript
const editor = vscode.window.activeTextEditor;
const codeRef = generateCodeReference(editor);
// Returns: @src/extension.js#L15-28 or null
```

**Validation:**
- Requires active editor
- Requires non-empty selection
- Returns `null` if invalid

#### `generateCodeReferenceFromRange(document, range)` - From Document + Range
Used by: Code action provider (lightbulb suggestions)

```javascript
const codeRef = generateCodeReferenceFromRange(document, range);
// Returns: @src/extension.js#L15-28
```

**Usage Context:** When code actions are triggered from lightbulb UI

### Integration with Commands

#### Copy to Clipboard Flow
```javascript
copyCodeBlockCommand()
  ├─> generateCodeReference(editor)
  ├─> vscode.env.clipboard.writeText(codeRef)
  └─> Show success message
```

#### Send to Terminal Flow
```javascript
sendToTerminalCommand()
  ├─> generateCodeReference(editor)
  ├─> sendToAITerminal(codeRef)
  └─> Play success sound
```

#### Quick Actions Flow
```javascript
quickActionsCommand()
  ├─> generateCodeReference(editor)
  ├─> replaceVariables(template, { code: codeRef })
  ├─> sendToAITerminal(fullMessage)
  └─> Play success sound
```

### Edge Cases Handled

1. **No Workspace Open**
   - Falls back to absolute path
   - Format: `@/Users/name/file.js#L5`

2. **Empty Selection**
   - Returns `null` and shows error message
   - Prevents invalid references

3. **Cross-Platform Paths**
   - Always normalizes to forward slashes
   - Works consistently on Windows/Mac/Linux

4. **Multi-Line Selections**
   - Smart handling: `L5` (single) vs `L5-8` (multiple)
   - Avoids redundant `L5-5` format

### Key Files Reference
- `src/utils/code-reference.js:8-35` - `generateCodeReference()` main function
- `src/utils/code-reference.js:43-59` - `generateCodeReferenceFromRange()` variant
- `src/utils/path-utils.js:8-20` - `getRelativePath()` workspace detection
- `src/utils/path-utils.js:27-29` - `normalizePath()` cross-platform handling

## Command Architecture

### Overview
The extension uses a modular command architecture with clear separation of concerns. Commands are registered centrally but implemented in separate handler files.

### Command Registration Flow

#### 1. Extension Activation (`src/extension.js`)
```javascript
function activate(context) {
    // Setup terminal listeners FIRST
    setupTerminalListeners(context);

    // Register all commands
    registerCommands(context);

    // Setup providers (code actions, completions, etc.)
    registerProviders(context);
}
```

#### 2. Central Registration (`src/commands/index.js`)
```javascript
registerCommands(context)
  ├─> Register each command via vscode.commands.registerCommand()
  ├─> Link command ID to handler function
  ├─> Push disposable to context.subscriptions
  └─> Log registration success
```

**Pattern:**
```javascript
const commandName = vscode.commands.registerCommand(
    'ask-ai-cli.commandName',
    commandHandler
);
context.subscriptions.push(commandName);
```

### Command Naming Convention

**Format:** `ask-ai-cli.commandName`

**Examples:**
- `ask-ai-cli.copyCodeBlock` - Copy code reference
- `ask-ai-cli.sendToTerminal` - Send to AI CLI terminal
- `ask-ai-cli.quickActions` - Show template picker
- `ask-ai-cli.startAICLI` - Launch AI CLI picker
- `ask-ai-cli.addFeature` - Create tech spec (Phase 1)
- `ask-ai-cli.executePlan` - Execute plan (Phase 2)

**Rationale:** Namespace prevents conflicts with other extensions

### Command Structure (26 Commands Total)

#### Core Commands (6)
- `copyCodeBlock` - Copy code reference to clipboard
- `sendToTerminal` - Send code reference to terminal
- `quickActions` - Template-based prompts
- `executeQuickAction` - Execute from code action provider
- `startAICLI` - Launch AI CLI picker
- `toggleSound` - Enable/disable sound effects

#### Image Commands (3)
- `sendImageToTerminal` - Send image reference to terminal
- `pasteImageFromClipboard` - Paste and save clipboard image
- `cleanupTempImages` - Clean up temp image files

#### Feature Workflow Commands (2)
- `addFeature` - Guided tech spec creation (Phase 1)
- `executePlan` - Smart plan execution (Phase 2)

#### Folder Commands (10)
- `folderOperations` - Show folder operations menu
- `folderQuickActions` - Template-based folder actions
- `folderCopyReference` - Copy folder/file reference
- `folderExplain` - Explain folder/file contents
- `folderReview` - Quick code review
- `folderDeepReview` - Comprehensive review
- `folderFindBugs` - Find bugs in folder
- `folderGenerateTests` - Generate tests
- `folderDocument` - Add documentation
- `folderRefactor` - Refactor suggestions
- `folderListFiles` - List files in folder

#### Configuration Commands (3)
- `toggleAutoPrompt` - Toggle auto-prompt for clipboard images
- `editTemplates` - Edit quick action templates
- `editFolderTemplates` - Edit folder action templates

### Command Handler Pattern

All command handlers follow this consistent pattern:

```javascript
// src/commands/command-name.js
const vscode = require('vscode');
const { dependency1 } = require('../services/service-name');
const { dependency2 } = require('../utils/util-name');

/**
 * Command handler for [description]
 */
async function commandNameCommand(/* optional params */) {
    // 1. Validation
    if (!condition) {
        vscode.window.showErrorMessage('Error message');
        return;
    }

    // 2. Business logic
    const result = await doSomething();

    // 3. User feedback
    vscode.window.showInformationMessage('Success message');

    // 4. Optional: play success sound
    await playSuccessSound();
}

module.exports = {
    commandNameCommand
};
```

### Adding a New Command

**Step 1: Create handler file** (`src/commands/new-command.js`)
```javascript
const vscode = require('vscode');

async function newCommandHandler() {
    // Implementation
}

module.exports = {
    newCommandHandler
};
```

**Step 2: Register in `src/commands/index.js`**
```javascript
const { newCommandHandler } = require('./new-command');

function registerCommands(context) {
    // ... existing commands

    const newCommand = vscode.commands.registerCommand(
        'ask-ai-cli.newCommand',
        newCommandHandler
    );

    context.subscriptions.push(newCommand);
}
```

**Step 3: Add to `package.json`**
```json
{
  "contributes": {
    "commands": [
      {
        "command": "ask-ai-cli.newCommand",
        "title": "New Command",
        "category": "Bob AI CLI"
      }
    ]
  }
}
```

**Step 4: Optional - Add menu integration**
```json
{
  "contributes": {
    "menus": {
      "editor/context": [
        {
          "command": "ask-ai-cli.newCommand",
          "when": "editorHasSelection",
          "group": "navigation"
        }
      ]
    }
  }
}
```

### Command Error Handling

**User-Facing Errors:**
```javascript
vscode.window.showErrorMessage('User-friendly error message');
return; // Stop execution
```

**Internal Errors:**
```javascript
try {
    await riskyOperation();
} catch (error) {
    console.error('Detailed error for debugging:', error);
    vscode.window.showErrorMessage(`Operation failed: ${error.message}`);
}
```

### Command Context and Lifecycle

**Activation:**
- Commands registered during `activate()`
- Registered once per extension session

**Disposal:**
- Commands auto-disposed via `context.subscriptions`
- No manual cleanup needed

**Execution:**
- Commands can be triggered from:
  - Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
  - Context menu (right-click)
  - Keyboard shortcuts (if configured)
  - Code actions (lightbulb)
  - VS Code API (`vscode.commands.executeCommand()`)

### Key Files Reference
- `src/commands/index.js` - Central command registration (all 26 commands)
- `src/commands/copy-code-block.js` - Simple command example
- `src/commands/quick-actions.js` - Complex command with UI
- `src/commands/folder-operations.js` - Multiple related commands
- `package.json:contributes.commands` - Command declarations
- `package.json:contributes.menus` - Menu integrations

## Testing Strategy

Since F5 debug mode may not work on all systems, the extension includes comprehensive testing documentation in `TESTING.md` with multiple testing approaches:

1. **Manual Installation**: Install from folder or VSIX package
2. **Command Palette Testing**: Direct command execution
3. **Context Menu Testing**: Right-click functionality verification
4. **Output Verification**: Check clipboard format matches expected patterns

## Important Conventions

- **Namespace Format**: Uses `ask-ai-cli.commandName` pattern for command IDs
- **Command Names**:
  - `copyCodeBlock` - Copy to clipboard
  - `sendToTerminal` - Send reference only
  - `quickActions` - Template prompts
  - `startAICLI` - Launch AI CLI
  - `addFeature` - Tech spec creation workflow (NEW)
  - `executePlan` - Execute plan from .md or selection (NEW)
- **Terminal Management**: All commands that send to terminal require AI CLI to be running
- **Context Menu Integration**: Commands available in editor and explorer (for .md files)
- **Cross-Platform**: Path separators normalized to forward slashes
- **Minimal Dependencies**: Pure JavaScript implementation with no external runtime dependencies
- **VS Code Version**: Supports VS Code 1.74.0 and later
- **Template System**: Pre-built prompt templates in `QUICK_ACTIONS` constant
- **Modular Architecture**: Separated into commands/, services/, utils/, config/, providers/