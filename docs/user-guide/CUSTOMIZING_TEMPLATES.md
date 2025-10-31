# Customizing Quick Action Templates

Bob AI CLI uses a template-based system for Quick Actions, allowing you to customize prompts to fit your workflow.

## Overview

Quick Action templates control what prompts are sent to your AI CLI when you use commands like "Explain this code" or "Find bugs". You can customize these prompts or create entirely new actions.

### Template Storage Locations

```
Extension Defaults (Read-only):
├── templates/quick-actions/
    ├── explain-code.md
    ├── find-bugs.md
    └── ...

Your Customizations (Editable):
├── .askbob/quick-actions/
    ├── explain-code.md      ← Overrides default
    ├── my-custom-action.md  ← New custom action
    └── ...
```

**Priority:** `.askbob/` templates override extension defaults with the same filename.

## Quick Start

### Method 1: Visual Editor (Recommended)

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Run: `Bob AI: Edit Quick Action Prompts`
3. Choose: `🎨 Open Visual Editor`
4. Select a template to edit
5. Modify the prompt text
6. Click `💾 Save`

**Done!** Your changes take effect immediately.

### Method 2: Direct File Editing (Advanced)

1. Open Command Palette
2. Run: `Bob AI: Edit Quick Action Prompts`
3. Choose: `📄 Edit Files Directly`
4. Select a template
5. Edit the markdown file
6. Save (`Cmd/Ctrl + S`)

**Done!** File watcher reloads templates automatically.

## Template File Format

Templates are markdown files with YAML frontmatter:

```markdown
---
label: 🔍 Explain this code
kind: quickfix
enabled: true
---
Explain this code in detail, including:
- What it does
- How it works
- Any potential issues
```

### Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Display name in Quick Actions menu (with emoji) |
| `kind` | string | No | Code action kind: `quickfix` or `refactor` (default: `quickfix`) |
| `enabled` | boolean | No | Whether template is active (default: `true`) |

### Prompt Text

Everything after the frontmatter (`---`) is the prompt text sent to your AI CLI.

**Variables available:**
- Code reference is automatically appended: `@path/to/file#L10-20`
- You don't need to include it in your prompt

## Editing Existing Templates

### Using Visual Editor

**Step-by-step:**

1. **Open Editor**
   ```
   Command Palette → "Bob AI: Edit Quick Action Prompts"
   → "🎨 Open Visual Editor"
   ```

2. **Select Template**
   - Templates list shows all available actions
   - Badge indicates: `📦 Default` or `✏️ Custom`

3. **Edit Fields**
   - **Label:** Display text with emoji
   - **Prompt:** The text sent to AI CLI
   - **Kind:** Code action category
   - **Enabled:** Toggle on/off

4. **Save Changes**
   - Click `💾 Save`
   - Template copied to `.askbob/quick-actions/` (first edit only)
   - Changes apply immediately

**Copy-on-Write:**
- First edit of a default template → Copies to `.askbob/`
- Subsequent edits → Updates your copy in `.askbob/`
- Original defaults never modified

### Using Direct File Edit

**Step-by-step:**

1. **Open File Selector**
   ```
   Command Palette → "Bob AI: Edit Quick Action Prompts"
   → "📄 Edit Files Directly"
   ```

2. **Select Template**
   - Choose from list
   - Default templates auto-copy to `.askbob/` on first edit

3. **Edit in VS Code**
   - File opens in editor
   - Edit frontmatter and prompt text
   - Save file (`Cmd/Ctrl + S`)

4. **Changes Auto-Reload**
   - File watcher detects changes
   - Templates reload automatically
   - No restart needed

## Creating New Templates

### Using Visual Editor

1. Open Visual Editor
2. Click `➕ Create New Template`
3. Enter filename (e.g., `convert-typescript`)
4. Edit fields:
   - Label: `📘 Convert to TypeScript`
   - Prompt: `Convert this JavaScript code to TypeScript with proper type annotations`
   - Kind: `refactor`
   - Enabled: ✓
5. Click `💾 Save`

**File created:** `.askbob/quick-actions/convert-typescript.md`

### Using Direct File Creation

1. Create file in `.askbob/quick-actions/`
   ```bash
   mkdir -p .askbob/quick-actions
   touch .askbob/quick-actions/my-action.md
   ```

2. Add frontmatter and prompt:
   ```markdown
   ---
   label: 🎯 My Custom Action
   kind: quickfix
   enabled: true
   ---
   Your custom prompt here
   ```

3. Save file
   - Auto-detected by file watcher
   - Appears in Quick Actions menu immediately

## Examples

### Example 1: Custom Explain with Context

**File:** `.askbob/quick-actions/explain-code.md`

```markdown
---
label: 🔍 Explain this code
kind: quickfix
enabled: true
---
Explain this code in detail. Include:
1. What the code does
2. How it works (step by step)
3. Why it's structured this way
4. Any potential issues or improvements

Use simple language suitable for junior developers.
```

### Example 2: Convert to TypeScript

**File:** `.askbob/quick-actions/convert-typescript.md`

```markdown
---
label: 📘 Convert to TypeScript
kind: refactor
enabled: true
---
Convert this JavaScript code to TypeScript:
- Add proper type annotations
- Use interfaces for complex types
- Follow TypeScript best practices
- Ensure type safety
```

### Example 3: Add Error Handling

**File:** `.askbob/quick-actions/add-error-handling.md`

```markdown
---
label: 🛡️ Add Error Handling
kind: refactor
enabled: true
---
Add comprehensive error handling to this code:
- Identify potential error points
- Add try-catch blocks where appropriate
- Include meaningful error messages
- Follow error handling best practices
```

### Example 4: Performance Optimization

**File:** `.askbob/quick-actions/optimize-performance.md`

```markdown
---
label: ⚡ Optimize Performance
kind: refactor
enabled: true
---
Analyze and optimize this code for performance:
- Identify bottlenecks
- Suggest algorithmic improvements
- Recommend caching strategies
- Optimize loops and data structures
- Provide benchmarking suggestions
```

### Example 5: Disabled Template

**File:** `.askbob/quick-actions/experimental.md`

```markdown
---
label: 🧪 Experimental Feature
kind: quickfix
enabled: false
---
This template is disabled and won't appear in the menu.
Set enabled: true to activate it.
```

## Managing Templates

### Viewing All Templates

**Option 1: Visual Editor**
- Shows all templates in one list
- Color-coded by source (Default/Custom)

**Option 2: Open Folder**
```
Command Palette → "Bob AI: Edit Quick Action Prompts"
→ "📁 Open .askbob Folder"
```

**Option 3: File Explorer**
- Navigate to `.askbob/quick-actions/` in your workspace

### Resetting to Defaults

**Option 1: Using Visual Editor**
1. Select template
2. Click `🔄 Reset to Default`
3. Confirm

**Result:** Deletes your custom copy, reverts to extension default.

**Option 2: Manual Delete**
```bash
# Delete custom template
rm .askbob/quick-actions/explain-code.md

# Extension default takes over automatically
```

### Deleting Custom Templates

**Using Visual Editor:**
1. Select template
2. Click `🗑️ Delete`
3. Confirm

**Manual:**
```bash
rm .askbob/quick-actions/my-custom-action.md
```

**Note:** You cannot delete extension defaults, only your customizations.

### Disabling Templates

Don't want to delete but don't want it in the menu?

**Edit template:**
```markdown
---
label: 🔍 Explain this code
kind: quickfix
enabled: false    ← Set to false
---
Prompt text...
```

**Result:** Template hidden from Quick Actions menu but preserved for later.

## Sharing Templates with Team

### Option 1: Commit to Git (Recommended)

1. **Remove `.askbob` from `.gitignore`:**
   ```bash
   # Edit .gitignore, remove or comment out:
   # .askbob/
   ```

2. **Commit templates:**
   ```bash
   git add .askbob/quick-actions/
   git commit -m "Add custom Quick Action templates"
   git push
   ```

3. **Team members pull:**
   ```bash
   git pull
   # Templates automatically loaded from .askbob/
   ```

### Option 2: Copy Templates

**Export:**
```bash
# Zip templates
zip -r templates.zip .askbob/quick-actions/

# Share zip file with team
```

**Import:**
```bash
# Unzip in workspace root
unzip templates.zip

# Templates automatically detected
```

### Option 3: Documentation

**Share your prompt recipes:**
```markdown
# Our Team's Quick Actions

## Explain Code (Modified)
We use detailed explanations for junior devs:
- Include background context
- Explain design patterns used
- Mention related code locations

## Custom Actions
1. Convert to TypeScript - TS-first approach
2. Add E2E Tests - Playwright format
3. Security Audit - OWASP checklist
```

## Advanced Usage

### Template Variables (Future)

Currently planned:
- `{{selection}}` - Selected code text
- `{{filename}}` - Current file name
- `{{language}}` - File language
- `{{workspace}}` - Workspace path

**Not yet implemented.**

### Multi-line Prompts

Use YAML multi-line syntax:

```markdown
---
label: 📝 Complex Prompt
kind: quickfix
enabled: true
---
First paragraph of prompt.

Second paragraph with more detail.

- Bullet point 1
- Bullet point 2

Final instructions.
```

### Prompt Engineering Tips

**Be Specific:**
```markdown
❌ "Explain this code"
✅ "Explain this code in detail, including purpose, how it works, and potential issues"
```

**Structure Output:**
```markdown
Analyze this code and provide:
1. Purpose summary
2. Step-by-step explanation
3. Dependencies identified
4. Potential improvements
```

**Set Context:**
```markdown
Review this code as a senior developer would.
Focus on maintainability, performance, and best practices.
```

**Define Format:**
```markdown
Explain this code.
Format your response as:
- Overview: [brief summary]
- Details: [step by step]
- Issues: [problems found]
- Suggestions: [improvements]
```

## Troubleshooting

### Templates Not Loading

**Check workspace:**
- `.askbob/quick-actions/` must be in workspace root
- File extension must be `.md`
- Frontmatter must be valid YAML

**Reload templates:**
```
Command Palette → "Developer: Reload Window"
```

### Changes Not Appearing

**Auto-reload should work, but if not:**

1. **Check file watcher:**
   - Save file explicitly (`Cmd/Ctrl + S`)
   - Wait 1-2 seconds

2. **Manual reload:**
   ```
   Command Palette → "Developer: Reload Window"
   ```

3. **Check console:**
   ```
   Command Palette → "Developer: Toggle Developer Tools"
   → Check Console tab for errors
   ```

### Invalid Frontmatter

**Symptoms:**
- Template not appearing
- Console errors

**Fix:**
```markdown
---
label: 🔍 Explain this code    ← No trailing spaces
kind: quickfix                 ← Lowercase, no quotes
enabled: true                  ← Boolean, not string
---
Prompt text starts here        ← Blank line after ---
```

### Templates Folder Missing

**Create manually:**
```bash
mkdir -p .askbob/quick-actions
```

**Or use Visual Editor:**
- Opens editor → Auto-creates folder
- Creates `.gitignore` automatically

## FAQ

**Q: Do I need to restart VS Code after editing templates?**
A: No, file watcher reloads templates automatically.

**Q: Can I use the same template filename as a default?**
A: Yes! Your `.askbob/` version overrides the extension default.

**Q: What happens if I delete .askbob?**
A: Extension defaults take over. No data loss, defaults still work.

**Q: Can I sync templates across machines?**
A: Yes, commit `.askbob/` to git or use cloud sync (Dropbox, iCloud, etc.)

**Q: How many custom templates can I create?**
A: Unlimited. Performance is optimized for 50+ templates.

**Q: Can I organize templates in subfolders?**
A: Not yet. Currently flat structure only in `.askbob/quick-actions/`

**Q: Do templates work with Gemini CLI?**
A: Yes! Templates work with all AI CLIs (Claude Code, Gemini, etc.)

**Q: Can I export/import templates?**
A: Yes, just copy `.askbob/quick-actions/` folder.

## Best Practices

1. **Start with defaults** - Edit instead of creating from scratch
2. **Use descriptive filenames** - `convert-typescript.md` not `temp.md`
3. **Include emojis in labels** - Makes menu scanning easier
4. **Be specific in prompts** - More detail = better AI responses
5. **Test incrementally** - Edit, test, refine
6. **Document team templates** - Add comments explaining customizations
7. **Version control** - Commit useful templates to share with team
8. **Disable, don't delete** - Keep templates for future use

## Related Documentation

- [Quick Actions Guide](./QUICK_ACTIONS.md) - Using Quick Actions
- [Template File Format](./TEMPLATE_FORMAT.md) - Technical specification
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

## Support

Having issues? Check:
- [GitHub Issues](https://github.com/sayurbox/ask-bob-ai/issues)
- [Discussions](https://github.com/sayurbox/ask-bob-ai/discussions)

Found a bug? Please report it!
