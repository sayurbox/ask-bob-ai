# Quick Action Templates

This directory contains customizable prompt templates for Bob AI CLI's Quick Actions feature.

## How It Works

Bob AI CLI automatically loads templates from this folder and displays them in the Quick Actions menu. You can:

- ✏️ **Edit existing templates** - Modify prompt text to fit your workflow
- ➕ **Add new templates** - Create new `.md` files with frontmatter
- ❌ **Disable templates** - Set `enabled: false` in frontmatter
- 🔄 **Share templates** - Commit custom templates to your team repo

## Template File Format

Each template is a Markdown file with YAML frontmatter:

```markdown
---
label: 🔍 Explain this code
kind: quickfix
enabled: true
---
Explain this code in detail with examples
```

### Frontmatter Fields

- **label** (required): Display text shown in the Quick Actions menu
- **kind** (optional): Code action kind (`quickfix`, `refactor`, etc.)
- **enabled** (optional): Set to `false` to hide template (default: `true`)

### Prompt Content

The content after the frontmatter is the prompt that will be sent to your AI CLI along with the code reference.

## Creating Custom Templates

1. Create a new `.md` file in this directory
2. Add frontmatter with label and settings
3. Write your prompt below the frontmatter
4. Reload VS Code window or restart extension

**Example:** `convert-typescript.md`
```markdown
---
label: 📘 Convert to TypeScript
kind: refactor
---
Convert this JavaScript code to TypeScript with proper type annotations
```

## Default Templates

The extension includes these built-in templates:
- 🔍 Explain this code
- 🐛 Find and fix bugs
- ♻️ Refactor this code
- ✅ Write unit tests
- 📝 Add documentation
- ⚡ Optimize performance
- 🔒 Security review
- 🎯 Simplify logic

You can override any default by creating a file with the same name.

## Priority

1. **Workspace templates** (this folder) - highest priority
2. **Extension defaults** - fallback if no workspace templates found

## Tips

- Use emojis in labels for better visual recognition
- Keep prompts concise and specific
- Test prompts with different code selections
- Share useful templates with your team via git
