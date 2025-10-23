# 🤖 Bob AI CLI Extension

<div align="center">

**Your AI coding buddy, right in VS Code** ⚡

![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/badge/version-0.0.1-orange.svg)

*Select code. Hit a key. Let AI do the heavy lifting.*

</div>

---

## 🎯 What's This?

Bob AI connects VS Code to AI CLIs like **Claude Code** and **Gemini CLI**. Select code, press a shortcut, and boom—AI suggestions, refactors, tests, you name it.

**Zero config. Pure speed. Maximum fun.** 🚀

---

## ⚡ Keyboard Shortcuts (ASDF Home Row)

The fastest way to use Bob AI—your fingers never leave home row!

| Keys | Mac | What it does |
|------|-----|--------------|
| `Ctrl+K A` | `Cmd+K A` | 🎯 **Quick Actions** menu |
| `Ctrl+K S` | `Cmd+K S` | ✏️ **Custom** prompt |
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
| Custom Prompt | `Ctrl+K S` | Type your own |
| Send to Terminal | `Ctrl+K D` | Just the reference |
| Copy Reference | `Ctrl+K F` | Copy `@path#L1-5` |
| Start AI CLI | `Ctrl+K G` | Launch Claude/Gemini |

### Advanced Features

- **💡 Lightbulb Quick Fixes** - Click 💡 icon for inline AI suggestions
- **📋 Add Feature** - Guided tech spec creation workflow
- **⚙️ Execute Plan** - Implement from `.md` tech specs
- **🔒 Terminal Management** - Auto-detects when AI CLI closes

---

## 📦 Installation

### Option 1: From Source (Recommended)
```bash
git clone https://github.com/YOUR_USERNAME/bob-ai-cli-extension.git
cd bob-ai-cli-extension
npm install -g @vscode/vsce
vsce package
# Install .vsix in VS Code Extensions panel
```

### Option 2: VS Code Marketplace
*(Coming soon!)*

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

---

## 🔧 Development

```bash
# Clone & open
git clone https://github.com/YOUR_USERNAME/bob-ai-cli-extension.git
code bob-ai-cli-extension

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

**🚧 Coming Soon:**
- [ ] VS Code Marketplace
- [ ] Custom template UI
- [ ] Multi-file references
- [ ] Response preview in editor

---

## 🐛 Issues?

[Open an issue](../../issues/new) with:
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

[⭐ Star](../../stargazers) • [🐛 Issues](../../issues) • [💡 Ideas](../../issues)

</div>
