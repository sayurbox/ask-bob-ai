# Testing Bob AI CLI Extension

Complete guide for testing all features of the Bob AI CLI extension.

## Installation Methods

### Method 1: Press F5 (Fastest - Development Mode)

1. Open this project in VS Code
2. Press `F5` → Extension Development Host opens
3. Start testing immediately

### Method 2: Package and Install (Recommended)

```bash
# Install VSCE if not already installed
npm install -g @vscode/vsce

# Package extension
vsce package

# Install the .vsix file
# In VS Code: Extensions panel → ... → Install from VSIX
```

### Method 3: Reload Window (If Already Installed)

```bash
# Command Palette → "Developer: Reload Window"
```

---

## Quick Test - Template Editing Feature (NEW!)

### Test 1: Open Visual Editor (2 minutes)

```bash
1. Open a workspace folder
2. Command Palette (Cmd/Ctrl+Shift+P)
3. Type: "Bob AI: Edit"
4. Select: "Bob AI: Edit Quick Action Prompts"
5. Choose: "🎨 Open Visual Editor"
```

**Expected:**
- ✅ WebView panel opens
- ✅ Shows 8 templates with "📦 Default" badges
- ✅ Template list is interactive

### Test 2: Edit a Template (3 minutes)

```bash
1. In Visual Editor, click "🔍 Explain this code"
2. Editor form appears below
3. Change prompt to: "Explain this code in EXTREME detail"
4. Click "💾 Save"
```

**Expected:**
- ✅ Shows: "📝 Copied to .askbob/ for editing"
- ✅ Shows: "✅ Template saved"
- ✅ Badge changes from "📦 Default" to "✏️ Custom"
- ✅ File created: `.askbob/quick-actions/explain-code.md`

**Verify the file:**
```bash
cat .askbob/quick-actions/explain-code.md
```

### Test 3: Verify Override Works (1 minute)

```bash
1. Select some code in any file
2. Command Palette → "Bob AI: Quick Actions"
3. Select "🔍 Explain this code"
```

**Expected:**
- ✅ Prompt sent is: "Explain this code in EXTREME detail"
- ✅ NOT the original: "Explain this code"

### Test 4: Create Custom Template (2 minutes)

```bash
1. Open Visual Editor
2. Click "➕ Create New Template"
3. Enter filename: "my-custom-action"
4. Enter label: "🎯 My Custom Action"
```

**Expected:**
- ✅ Shows: "✅ Template created"
- ✅ New template appears with "✏️ Custom" badge
- ✅ File created: `.askbob/quick-actions/my-custom-action.md`
- ✅ Appears in Quick Actions menu

### Test 5: File Watcher (1 minute)

```bash
1. Open .askbob/quick-actions/explain-code.md manually
2. Edit the prompt text
3. Save file
4. Wait 1-2 seconds
```

**Expected:**
- ✅ Notification: "Quick action templates reloaded"
- ✅ Changes immediately reflected in Quick Actions

---

## Core Features Testing

### Feature 1: Copy Code Reference

```bash
1. Select code (multiple lines)
2. Right-click → "Bob AI: Copy Code Reference"
   OR Command Palette → "Bob AI: Copy Code Reference"
```

**Expected Format:**
```
@src/path/to/file.js#L10-15
```

### Feature 2: Send to Terminal

```bash
1. Start Claude Code or Gemini CLI in terminal
2. Select code
3. Command Palette → "Bob AI: Send to Terminal"
```

**Expected:**
- ✅ Code reference sent to AI CLI terminal
- ✅ Sound plays (if enabled)

### Feature 3: Quick Actions

```bash
1. Select code
2. Command Palette → "Bob AI: Quick Actions"
3. Select an action (e.g., "🐛 Find and fix bugs")
```

**Expected:**
- ✅ Prompt + code reference sent to terminal
- ✅ Auto-executes (no manual Enter needed)
- ✅ Sound plays (if enabled)

### Feature 4: Start AI CLI

```bash
Command Palette → "Bob AI: Start AI CLI"
```

**Expected:**
- ✅ Quick Pick shows: Claude Code, Gemini CLI, etc.
- ✅ Selecting one launches it in new terminal

### Feature 5: Folder Operations

```bash
1. Right-click any file/folder in Explorer
2. Click "Bob AI: Start CLI" or "Bob AI: Actions"
```

**Expected:**
- ✅ Context menu appears
- ✅ Actions work with file/folder

### Feature 6: Sound Toggle

```bash
Command Palette → "Bob AI: Toggle Sound Effects"
```

**Expected:**
- ✅ Shows: "Sound effects enabled" or "disabled"
- ✅ Persists across restarts

---

## Detailed Template Testing

See [docs/TESTING_TEMPLATES.md](./docs/TESTING_TEMPLATES.md) for 17 comprehensive tests including:

- ✅ Visual editor operations
- ✅ Direct file editing
- ✅ Copy-on-write behavior
- ✅ File watcher functionality
- ✅ Reset/Delete operations
- ✅ Error handling
- ✅ Edge cases

---

## Debugging

### Open Developer Console

```bash
Command Palette → "Developer: Toggle Developer Tools"
→ Console tab
```

**Look for:**
```
Bob AI CLI extension is now active!
Template file watchers initialized
Watching .askbob/quick-actions/
Loaded X templates (Y custom, Z defaults)
```

### Common Issues

**1. Templates not loading?**
```bash
# Check console for errors
# Verify file format (frontmatter required)
cat .askbob/quick-actions/your-template.md
```

**2. File watcher not working?**
```bash
# Manually reload
Command Palette → "Developer: Reload Window"
```

**3. Sound not playing?**
```bash
# Check if enabled
Command Palette → "Bob AI: Toggle Sound Effects"

# Check file exists
ls resources/feedback_sound.aiff
```

**4. Command not appearing?**
```bash
# Check extension is running
Command Palette → "Developer: Show Running Extensions"
→ Look for "Bob AI CLI"
```

### Reset Everything

```bash
# Delete custom templates
rm -rf .askbob

# Reload VS Code
Command Palette → "Developer: Reload Window"
```

---

## Testing Checklist

### Basic Features
- [ ] Copy code reference works
- [ ] Send to terminal works
- [ ] Quick Actions appears
- [ ] Start AI CLI works
- [ ] Folder operations work
- [ ] Sound toggle works

### Template Editing (NEW!)
- [ ] Visual Editor opens
- [ ] Can edit template
- [ ] Save creates .askbob/ copy
- [ ] Badge changes to "Custom"
- [ ] Custom template works in Quick Actions
- [ ] Direct file editing works
- [ ] File watcher detects changes
- [ ] Create new template works
- [ ] Reset to default works
- [ ] Delete template works

### Edge Cases
- [ ] Works without workspace (shows error)
- [ ] Handles invalid template format
- [ ] Auto-creates .askbob/ folder
- [ ] Multiple templates merge correctly
- [ ] Disabled templates hidden

---

## Files to Check

After testing, verify these files exist:

```
.askbob/
├── quick-actions/
│   ├── explain-code.md       (if edited)
│   ├── my-custom-action.md   (if created)
│   └── ...
└── .gitignore                 (auto-generated)
```

**Check .gitignore:**
```bash
cat .askbob/.gitignore
# Should contain: *
```

---

## Performance Testing

### Load Time
- Extension should activate in < 500ms
- Template loading should be < 100ms

### Memory Usage
```bash
Command Palette → "Developer: Show Running Extensions"
→ Check memory usage (should be < 10MB)
```

---

## Need Help?

- **📚 All Documentation:** See [docs/](./docs/) folder
- **📘 Template Docs (User Guide):** [docs/user-guide/CUSTOMIZING_TEMPLATES.md](./docs/user-guide/CUSTOMIZING_TEMPLATES.md)
- **🏗️ Architecture (Technical):** [docs/technical/TEMPLATE_ARCHITECTURE.md](./docs/technical/TEMPLATE_ARCHITECTURE.md)
- **🏗️ API Reference (Technical):** [docs/technical/TEMPLATE_API.md](./docs/technical/TEMPLATE_API.md)
- **🛠️ Detailed Tests (Dev):** [docs/dev/TESTING_TEMPLATES.md](./docs/dev/TESTING_TEMPLATES.md)

Report issues at: https://github.com/sayurbox/ask-bob-ai/issues