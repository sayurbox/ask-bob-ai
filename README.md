# 🤖 Bob AI CLI Extension

<div align="center">

**Your AI coding buddy, right in VS Code** ⚡

![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/badge/version-0.0.2-orange.svg)
[![VS Marketplace](https://img.shields.io/badge/VS%20Marketplace-Install-brightgreen.svg)](https://marketplace.visualstudio.com/items?itemName=1031022.bob-ai-cli)

*Select code. Hit a key. Let AI do the heavy lifting.*

</div>

---

## 🎯 What's This?

Bob AI connects VS Code to AI CLIs like **Claude Code** and **Gemini CLI**. Select code, press a shortcut, and boom—AI suggestions, refactors, tests, you name it.

**Zero config. Pure speed. Maximum fun.** 🚀

*Includes delightful sound feedback (toggle on/off in settings)*

---

## ⚡ Keyboard Shortcuts (ASDF Home Row)

The fastest way to use Bob AI—your fingers never leave home row!

| Keys | Mac | What it does |
|------|-----|--------------|
| `Ctrl+K A` | `Cmd+K A` | 🎯 **Quick Actions** menu |
| `Ctrl+K D` | `Cmd+K D` | 📤 **Send** to terminal |
| `Ctrl+K F` | `Cmd+K F` | 📋 Copy **reference** |
| `Ctrl+K G` | `Cmd+K G` | 🚀 Start AI CLI |

**Pro tip:** Just select code and mash `Ctrl+K A` (or `Cmd+K A` on Mac). Choose your action. Done. ⚡

---

## 🎨 Quick Actions Menu

Hit `Ctrl+K A` and choose:

- 🔍 **Explain this code** - Get the breakdown
- 🐛 **Find and fix bugs** - Catch issues fast
- ♻️ **Refactor this code** - Clean it up
- ✅ **Write unit tests** - Auto-generate tests
- 📝 **Add documentation** - JSDoc magic
- ⚡ **Optimize performance** - Make it faster
- 🔒 **Security review** - Find vulnerabilities
- 🎯 **Simplify logic** - Untangle spaghetti code

---

## 📁 Folder Operations

Right-click any folder in Explorer → **"Bob AI: Folder Operations"** and choose:

- 📖 **Explain module** - Get AI explanation of folder structure & purpose
- 🔍 **Review code** - Comprehensive code review of all files
- 🔬 **Deep Code Review** - Expert review with confidence-based filtering (≥80 threshold)
- 🐛 **Find bugs** - Analyze entire module for potential issues
- ✅ **Generate tests** - Create test coverage for the module
- 📝 **Document** - Generate or improve module documentation
- ♻️ **Refactor** - Get refactoring suggestions for the whole module
- 📂 **List files** - Show file tree preview + send to AI CLI

Perfect for analyzing entire features, reviewing modules, or understanding unfamiliar code! 🚀

---

## 🚀 Quick Start

### 1. Install
```bash
vsce package
# Install the .vsix from Extensions panel
```

### 2. Select Some Code
```typescript
function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

### 3. Press `Ctrl+K A` (or `Cmd+K A`)

### 4. Pick "🔍 Explain this code"

### 5. Watch the magic ✨

Bob sends this to your AI CLI:
```
Explain this code @src/math.ts#L1-5 \
```

Your AI explains it line-by-line. Beautiful.

---

## 🎪 All Commands

### Main Commands

| Command | Shortcut | What it does |
|---------|----------|--------------|
| Quick Actions | `Ctrl+K A` | Template prompt menu |
| Send to Terminal | `Ctrl+K D` | Just the reference |
| Copy Reference | `Ctrl+K F` | Copy `@path#L1-5` |
| Start AI CLI | `Ctrl+K G` | Launch Claude/Gemini |
| Toggle Sound Effects | - | Enable/disable sound feedback |

### Advanced Features

- **💡 Lightbulb Quick Fixes** - Click 💡 icon for inline AI suggestions
- **📁 Folder Operations** - Right-click folders for module-level AI operations
- **📋 Add Feature** - Guided tech spec creation workflow
- **⚙️ Execute Plan** - Implement from `.md` tech specs
- **🔒 Terminal Management** - Auto-detects when AI CLI closes

---

## ⚙️ Settings & Customization

### 🔊 Sound Effects

Bob AI includes delightful birds chirping sound feedback when you execute commands! Control it your way:

**Toggle via Command Palette:**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Bob AI: Toggle Sound Effects"
3. Press Enter to enable/disable

**Configure in Settings:**
1. Open Settings: `Ctrl+,` (or `Cmd+,` on Mac)
2. Search for "Bob AI CLI"
3. Check/uncheck "Enable Sound Effects"

**Or edit settings.json directly:**
```json
{
  "bobAiCli.enableSoundEffects": true  // or false to disable
}
```

**Default:** Sound effects are **enabled** by default. Turn them off if you prefer silent operation!

---

## 📦 Installation

### Option 1: VS Code Marketplace (Recommended)

**[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=1031022.bob-ai-cli)**

Or search "Bob AI CLI" in VS Code Extensions panel.

### Option 2: From Source
```bash
git clone https://github.com/sayurbox/ask-bob-ai.git
cd ask-bob-ai
npm install -g @vscode/vsce
vsce package
# Install .vsix in VS Code Extensions panel
```

---

## 🎨 Code Reference Format

Bob uses clean references that AI loves:

```
@src/components/Button.tsx#L15-42
```

**Single line:** `@src/utils/helper.js#L42`
**Multi-line:** `@src/components/Header.tsx#L15-28`

Copy, paste, send. Works everywhere. ✅

---

## 🤝 Compatible With

| AI CLI | Status |
|--------|--------|
| **Claude Code** | ✅ Fully Supported |
| **Gemini CLI** | ✅ Fully Supported |
| **Custom CLIs** | ✅ Supported |
| **Any Terminal** | ✅ Fallback mode |

---

## 💡 Pro Tips

### Tip 1: Multi-file Context
```bash
# Build context across files
1. Select code in file1.js → Ctrl+K F (copy)
2. Select code in file2.js → Ctrl+K F (copy)
3. Paste both in terminal with your prompt
4. AI now sees the full picture!
```

### Tip 2: Custom Templates
Edit `src/config/ai-clis.js` to add your own quick actions:
```javascript
{ label: '🎨 Convert to TypeScript', prompt: 'Convert this to TypeScript' }
```

### Tip 3: Tech Spec Workflow
```bash
# Plan before you code
1. Right-click → "Bob AI: Add Feature"
2. Answer questions (feature name, requirements, etc.)
3. Get tech spec in /research/research-{feature}.md
4. Right-click .md → "Bob AI: Execute Plan"
5. Watch Bob implement it!
```

### Tip 4: Folder Operations for Quick Understanding
```bash
# Quickly understand unfamiliar modules
1. Right-click any folder → "Bob AI: Folder Operations"
2. Choose "📖 Explain module"
3. Get instant overview of architecture & purpose
4. Use "📂 List files" to see the file structure first
```

---

## 🔧 Development

```bash
# Clone & open
git clone https://github.com/sayurbox/ask-bob-ai.git
cd ask-bob-ai

# Test (press F5 in VS Code)
# Or package and install
vsce package
```

**Architecture:** Pure JavaScript • Zero dependencies • Modular design • Lightning fast

---

## 🎯 Roadmap

**✅ Done:**
- [x] ASDF keyboard shortcuts
- [x] Tech spec workflow
- [x] Terminal lifecycle tracking
- [x] Lightbulb quick fixes
- [x] Folder operations (module-level AI analysis)
- [x] Deep Code Review with confidence filtering
- [x] VS Code Marketplace
- [x] Streamlined command set (6 core commands)
- [x] Sound effects with customizable settings

**🚧 Coming Soon:**
- [ ] Custom template UI
- [ ] Multi-file references
- [ ] Response preview in editor
- [ ] Claude Code skills integration

---

## 🐛 Issues?

[Open an issue](https://github.com/sayurbox/ask-bob-ai/issues/new) with:
- Your OS & VS Code version
- Steps to reproduce
- What you expected vs what happened

We'll fix it! 💪

---

## 📜 License

MIT - Go wild! 🎉

---

<div align="center">

**Made with ❤️ for devs who love AI**

Press `Ctrl+K A` and let Bob do the work

[⭐ Star](https://github.com/sayurbox/ask-bob-ai/stargazers) • [🐛 Issues](https://github.com/sayurbox/ask-bob-ai/issues) • [💡 Ideas](https://github.com/sayurbox/ask-bob-ai/issues) • [📦 Marketplace](https://marketplace.visualstudio.com/items?itemName=1031022.bob-ai-cli)

</div>
