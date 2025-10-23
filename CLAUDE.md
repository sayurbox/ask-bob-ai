# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bob AI CLI is a Visual Studio Code extension that enhances productivity when working with AI CLIs like Claude Code and Gemini CLI. It provides quick code reference copying, terminal integration, and template-based prompt actions. The extension follows the format `@relative/path#LstartLine-endLine` for code references.

## Architecture

### Core Components

- **Eight Main Commands**:
  - `ask-ai-cli.copyCodeBlock` - Copy code reference to clipboard
  - `ask-ai-cli.sendToTerminal` - Send code reference to AI CLI terminal
  - `ask-ai-cli.quickActions` - Template-based prompt actions
  - `ask-ai-cli.customPrompt` - User-defined custom prompts
  - `ask-ai-cli.copyAndAskAI` - Copy text then prompt workflow
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
  - `customPrompt` - User input prompt
  - `copyAndAskAI` - Copy then ask workflow
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