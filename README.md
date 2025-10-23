# Bob AI CLI Extension

<div align="center">

**The smartest way to interact with AI CLIs directly from VS Code**

![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/badge/version-0.0.1-orange.svg)

*Supercharge your coding workflow with intelligent AI assistance*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Commands](#-available-commands) • [Development](#-development)

</div>

---

## 🚀 What is Bob AI?

Bob AI is a powerful VS Code extension that bridges the gap between your code editor and AI command-line interfaces like Claude Code and Gemini CLI. It provides seamless integration with quick actions, custom prompts, and smart terminal detection to boost your productivity.

### Why Bob AI?

- **⚡ Lightning Fast** - Select code, right-click, get AI help instantly
- **🎯 Smart Detection** - Auto-detects running AI CLI sessions
- **🔧 Flexible** - Works with Claude Code, Gemini CLI, and any terminal-based AI
- **📦 Zero Configuration** - Works out of the box with sensible defaults
- **🎨 Template System** - 8 pre-built prompt templates for common tasks
- **✨ Pure JavaScript** - No build process, no dependencies

---

## ✨ Features

### 1. 📋 Copy Code Reference
Instantly copy code references in a clean, AI-friendly format:
```
@src/components/Button.tsx#L15-42
```
Perfect for sharing with your team or pasting into documentation.

### 2. 📤 Send to Terminal
Send code references directly to your AI CLI terminal with one click. Bob AI automatically:
- Detects active Claude Code or Gemini CLI terminals
- Offers to start an AI CLI if none is running
- Falls back to your active terminal for flexibility

### 3. ⚡ Quick Actions
Choose from 8 battle-tested prompt templates:

| Icon | Action | Description |
|------|--------|-------------|
| 🔍 | **Explain this code** | Get detailed, line-by-line explanations |
| 🐛 | **Find and fix bugs** | Detect potential issues and solutions |
| ♻️ | **Refactor this code** | Improve code quality and readability |
| ✅ | **Write unit tests** | Generate comprehensive test cases |
| 📝 | **Add documentation** | Create JSDoc, comments, and docs |
| ⚡ | **Optimize performance** | Identify and fix performance bottlenecks |
| 🔒 | **Security review** | Scan for security vulnerabilities |
| 🎯 | **Simplify logic** | Break down complex code into simpler parts |

### 4. ✏️ Custom Prompt
Type your own custom prompt for complete flexibility:
- Convert code to different languages
- Add specific features
- Apply your own coding standards
- Anything you can imagine!

### 5. 💡 Lightbulb Quick Fixes
Bob AI integrates with VS Code's Quick Fix system. Select code and click the lightbulb (💡) icon to see AI suggestions inline.

### 6. 🚀 AI CLI Launcher
Start any AI CLI directly from VS Code:
- Detects installed CLIs (Claude Code, Gemini)
- Provides a picker for easy selection
- Supports custom AI CLI commands

---

## 📦 Installation

### From VS Code Marketplace
*(Coming soon)*

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Bob AI CLI"
4. Click Install

### From VSIX File

1. Download the latest `.vsix` file from [Releases](../../releases)
2. Open VS Code
3. Go to Extensions panel (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the `...` menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

### From Source

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bob-ai-cli-extension.git
cd bob-ai-cli-extension

# Package the extension
npm install -g @vscode/vsce
vsce package

# Install the generated .vsix file in VS Code
```

---

## 🎯 Usage

### Basic Workflow

1. **Select code** in any file
2. **Right-click** to open context menu
3. **Choose a Bob AI command**:
   - `Bob AI: Quick Actions` - Template prompts
   - `Bob AI: Custom Prompt` - Your own prompt
   - `Bob AI: Send to Terminal` - Just send the reference
   - `Bob AI: Copy Code Reference` - Copy to clipboard

### Example: Explain Code

```typescript
// 1. Select this function
function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 2. Right-click → Bob AI: Quick Actions
// 3. Choose "🔍 Explain this code"
// 4. Bob AI sends to terminal: "Explain this code @src/math.ts#L1-5"
// 5. Your AI CLI responds with a detailed explanation!
```

### Example: Custom Prompt

```python
# Select this code
def calculate_total(items):
    return sum(item.price for item in items)

# Right-click → Bob AI: Custom Prompt
# Type: "Add type hints and error handling"
# Bob AI sends: "Add type hints and error handling @src/calculator.py#L2-3"
```

---

## 📚 Available Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `Bob AI: Quick Actions` | Show template prompt menu | *Not set* |
| `Bob AI: Custom Prompt` | Enter your own prompt | *Not set* |
| `Bob AI: Send to Terminal` | Send code reference only | *Not set* |
| `Bob AI: Copy Code Reference` | Copy to clipboard | *Not set* |
| `Bob AI: Start AI CLI` | Launch an AI CLI | *Not set* |
| `Bob AI: Copy & Ask AI` | Copy text + choose action | *Not set* |

**Tip:** Set custom keyboard shortcuts via `File > Preferences > Keyboard Shortcuts`

---

## 🎨 Code Reference Format

Bob AI uses a clean, standardized format for code references:

```
@relative/path/to/file.ext#LstartLine-endLine
```

### Examples

**Single line:**
```
@src/utils/helper.js#L42
```

**Multiple lines:**
```
@src/components/Header.tsx#L15-28
```

**Workspace relative:**
```
@backend/services/auth.py#L100-150
```

This format is:
- ✅ Human-readable
- ✅ AI-friendly
- ✅ Compatible with most AI CLIs
- ✅ Easy to parse and share

---

## 🤝 Compatible AI CLIs

Bob AI works seamlessly with:

| AI CLI | Detection | Auto-Start | Status |
|--------|-----------|------------|--------|
| **Claude Code** | ✅ Auto | ✅ Yes | Fully Supported |
| **Gemini CLI** | ✅ Auto | ✅ Yes | Fully Supported |
| **Custom AI CLI** | ⚙️ Manual | ✅ Yes | Supported |
| **Any Terminal** | ✅ Fallback | - | Supported |

**Note:** Bob AI can send prompts to any active terminal, making it compatible with virtually any text-based AI CLI.

---

## 🔧 Development

### Project Structure

```
bob-ai-cli-extension/
├── src/
│   ├── extension.js              # Entry point
│   ├── commands/                 # Command handlers
│   │   ├── index.js
│   │   ├── copy-code-block.js
│   │   ├── send-to-terminal.js
│   │   ├── quick-actions.js
│   │   ├── custom-prompt.js
│   │   └── copy-and-ask.js
│   ├── services/                 # Business logic
│   │   ├── terminal-manager.js
│   │   └── cli-detector.js
│   ├── utils/                    # Utilities
│   │   ├── code-reference.js
│   │   └── path-utils.js
│   ├── config/                   # Configuration
│   │   └── ai-clis.js
│   └── providers/                # VS Code providers
│       └── code-action-provider.js
├── package.json                  # Extension manifest
├── CLAUDE.md                     # AI assistant guidelines
├── README.md                     # This file
└── icon.png                      # Extension icon
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bob-ai-cli-extension.git
cd bob-ai-cli-extension

# Open in VS Code
code .

# Press F5 to launch Extension Development Host
# Or fn+F5 on macOS
```

### Testing

```bash
# Validate extension
npm run vscode:prepublish

# Create VSIX package for testing
npm install -g @vscode/vsce
vsce package

# Install in VS Code
# Extensions panel → ... → Install from VSIX
```

### Architecture Highlights

- **Pure JavaScript** - No TypeScript compilation needed
- **Modular Design** - Clean separation of concerns
- **Zero Dependencies** - Only VS Code API required
- **Lazy Activation** - Activates on demand, not on startup
- **Smart Caching** - Efficient terminal and CLI detection

---

## 🎯 Roadmap

- [ ] VS Code Marketplace publication
- [ ] Keyboard shortcut defaults
- [ ] Configuration settings UI
- [ ] Additional AI CLI integrations
- [ ] Custom template system
- [ ] Multi-file code references
- [ ] Code snippet history
- [ ] AI response preview in editor

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Keep code modular and focused
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? [Open an issue](../../issues/new)!

**Please include:**
- OS and VS Code version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 💡 Tips & Tricks

### Custom Keyboard Shortcuts

Set your own shortcuts for Bob AI commands:

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Preferences: Open Keyboard Shortcuts"
3. Search for "Bob AI"
4. Click the `+` icon to add a keybinding

**Recommended shortcuts:**
- `Bob AI: Quick Actions` → `Ctrl+Shift+B` (Cmd+Shift+B)
- `Bob AI: Custom Prompt` → `Ctrl+Alt+B` (Cmd+Alt+B)

### Multi-file Workflows

Working across multiple files? Use Bob AI to build context:

1. Select code in `file1.js` → Copy reference
2. Select code in `file2.js` → Copy reference
3. Paste both in terminal with your prompt
4. Your AI CLI now has full context!

### Template Customization

Want different templates? Edit `src/config/ai-clis.js`:

```javascript
QUICK_ACTIONS: [
    {
        label: '🎨 Your Custom Action',
        prompt: 'Your custom prompt text',
        description: 'What this action does'
    }
]
```

---

## 🙏 Acknowledgments

- Built for the [Claude Code](https://claude.ai/code) and [Gemini CLI](https://ai.google.dev) communities
- Inspired by the need for seamless AI integration in development workflows
- Thanks to all contributors and users!

---

<div align="center">

**Made with ❤️ for developers who love AI-assisted coding**

[⭐ Star this repo](../../stargazers) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

</div>
