# Testing Template Editing Feature

Step-by-step guide to test the new template customization system.

## Prerequisites

1. **Reload Extension**
   ```bash
   # In VS Code
   Press F5 to launch Extension Development Host

   # OR package and install
   vsce package
   # Then install the .vsix file
   ```

2. **Open a Workspace**
   - The feature requires a workspace folder
   - Open any project folder in VS Code

## Test Plan

### Test 1: Extension Defaults Load Correctly

**Goal:** Verify templates load from extension's `templates/quick-actions/`

**Steps:**
1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Run: `Bob AI: Quick Actions`
3. Select some code first if prompted

**Expected Result:**
- ✅ Quick Pick shows 8 default templates
- ✅ Each has proper emoji and label
- ✅ "Custom prompt..." appears at bottom

**Console Check:**
```
Loaded X templates (0 custom, 8 defaults)
```

---

### Test 2: Open Visual Editor

**Goal:** Verify WebView opens and loads templates

**Steps:**
1. Command Palette → `Bob AI: Edit Quick Action Prompts`
2. Select: `🎨 Open Visual Editor`

**Expected Result:**
- ✅ WebView panel opens
- ✅ Title: "🎨 Bob AI - Quick Action Prompt Editor"
- ✅ Templates list shows 8 items
- ✅ Each has badge: "📦 Default"
- ✅ Preview text visible

**Screenshot:**
```
┌────────────────────────────────────────┐
│ 🎨 Quick Action Prompt Editor         │
├────────────────────────────────────────┤
│ Templates                              │
│ ┌────────────────────────────────────┐ │
│ │ 🔍 Explain this code  [📦 Default] │ │
│ │ 🐛 Find bugs          [📦 Default] │ │
│ │ ...                                │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

### Test 3: Edit Template in Visual Editor

**Goal:** Verify editing and saving works

**Steps:**
1. In Visual Editor, click "🔍 Explain this code"
2. Editor section appears below
3. Change prompt text to: "Explain this code in extreme detail"
4. Click "💾 Save"

**Expected Result:**
- ✅ Shows: "📝 Copied to .askbob/ for editing. Original preserved."
- ✅ Shows: "✅ Template saved"
- ✅ Badge changes to: "✏️ Custom"
- ✅ File created: `.askbob/quick-actions/explain-code.md`

**Verify File:**
```bash
cat .askbob/quick-actions/explain-code.md
```

Expected content:
```markdown
---
label: 🔍 Explain this code
kind: quickfix
enabled: true
---
Explain this code in extreme detail
```

---

### Test 4: Verify Override Works

**Goal:** Verify user template overrides default

**Steps:**
1. Close Visual Editor
2. Command Palette → `Bob AI: Quick Actions`
3. Select code
4. Select "🔍 Explain this code"

**Expected Result:**
- ✅ Prompt sent should be: "Explain this code in extreme detail"
- ✅ NOT the original: "Explain this code"

**Console Check:**
```
Loaded 8 templates (1 custom, 8 defaults)
```

---

### Test 5: Create New Template

**Goal:** Verify creating custom templates

**Steps:**
1. Open Visual Editor
2. Click "➕ Create New Template"
3. Enter filename: `convert-typescript`
4. Enter label: `📘 Convert to TypeScript`
5. WebView should show new template

**Expected Result:**
- ✅ Shows: "✅ Template created"
- ✅ New item appears in list with "✏️ Custom" badge
- ✅ File created: `.askbob/quick-actions/convert-typescript.md`

**Verify:**
```bash
cat .askbob/quick-actions/convert-typescript.md
```

**Test in Quick Actions:**
1. Close editor
2. Run `Bob AI: Quick Actions`
3. New template should appear in list

---

### Test 6: Direct File Editing

**Goal:** Verify file editing mode works

**Steps:**
1. Command Palette → `Bob AI: Edit Quick Action Prompts`
2. Select: `📄 Edit Files Directly`
3. Select: "🔍 Explain this code"

**Expected Result:**
- ✅ File opens in editor: `.askbob/quick-actions/explain-code.md`
- ✅ Content shows frontmatter + prompt

**Edit and Save:**
1. Change prompt to: "Explain this code simply"
2. Save file (`Cmd/Ctrl+S`)
3. Wait 1-2 seconds

**Expected Result:**
- ✅ Shows: "Quick action templates reloaded"
- ✅ Run Quick Actions → prompt updated

---

### Test 7: File Watcher Auto-Reload

**Goal:** Verify file watcher detects changes

**Steps:**
1. Open `.askbob/quick-actions/explain-code.md` manually
2. Edit prompt text
3. Save file
4. Wait 1-2 seconds

**Expected Result:**
- ✅ Shows: "Quick action templates changed, reloading..."
- ✅ Shows: "Quick action templates reloaded"
- ✅ Changes reflected in Quick Actions

**Console Check:**
```
Watching .askbob/quick-actions/
Quick action templates changed, reloading...
Loaded 8 templates (2 custom, 8 defaults)
```

---

### Test 8: Reset to Default

**Goal:** Verify reset deletes custom copy

**Steps:**
1. Open Visual Editor
2. Select: "🔍 Explain this code" (with ✏️ Custom badge)
3. Click "🔄 Reset to Default"
4. Confirm

**Expected Result:**
- ✅ Shows: "✅ Reset to default"
- ✅ Badge changes to: "📦 Default"
- ✅ File deleted: `.askbob/quick-actions/explain-code.md`
- ✅ Editor section hides

**Verify:**
```bash
ls .askbob/quick-actions/
# explain-code.md should be gone
```

---

### Test 9: Delete Custom Template

**Goal:** Verify delete works

**Steps:**
1. Open Visual Editor
2. Select: "📘 Convert to TypeScript" (custom template)
3. Click "🗑️ Delete"
4. Confirm

**Expected Result:**
- ✅ Shows: "✅ Template deleted"
- ✅ Template disappears from list
- ✅ File deleted: `.askbob/quick-actions/convert-typescript.md`

**Verify:**
```bash
ls .askbob/quick-actions/
# convert-typescript.md should be gone
```

---

### Test 10: Open .askbob Folder

**Goal:** Verify folder opening works

**Steps:**
1. Command Palette → `Bob AI: Edit Quick Action Prompts`
2. Select: `📁 Open .askbob Folder`

**Expected Result:**
- ✅ Finder/Explorer opens
- ✅ Shows: `.askbob/quick-actions/` directory
- ✅ `.gitignore` file exists

**Check .gitignore:**
```bash
cat .askbob/.gitignore
```

Expected content:
```
# Bob AI CLI - User customizations
# Remove this file to commit your templates
*
```

---

### Test 11: Disable Template

**Goal:** Verify enabled/disabled toggle

**Steps:**
1. Open Visual Editor
2. Select any template
3. Uncheck "Enabled" checkbox
4. Click "💾 Save"
5. Close editor
6. Run `Bob AI: Quick Actions`

**Expected Result:**
- ✅ Template saved
- ✅ Template does NOT appear in Quick Actions list

**Re-enable:**
1. Open Visual Editor
2. Select same template
3. Check "Enabled" checkbox
4. Save
5. Template reappears in Quick Actions

---

### Test 12: No Workspace Handling

**Goal:** Verify error handling without workspace

**Steps:**
1. Close all folders in VS Code
2. Command Palette → `Bob AI: Edit Quick Action Prompts`

**Expected Result:**
- ✅ Shows error: "No workspace open. Open a folder to customize templates."
- ✅ Command exits gracefully

---

### Test 13: Multiple Templates

**Goal:** Verify merging works correctly

**Steps:**
1. Create multiple custom templates:
   - `.askbob/quick-actions/test1.md`
   - `.askbob/quick-actions/test2.md`
   - `.askbob/quick-actions/test3.md`

2. Override some defaults:
   - `.askbob/quick-actions/find-bugs.md`
   - `.askbob/quick-actions/refactor.md`

**Expected Result:**
- ✅ Visual Editor shows all templates
- ✅ Custom templates have "✏️ Custom" badge
- ✅ Overridden defaults have "✏️ Custom" badge
- ✅ Non-overridden defaults have "📦 Default" badge

**Console Check:**
```
Loaded 11 templates (5 custom, 8 defaults)
```

---

### Test 14: Invalid Template Format

**Goal:** Verify error handling for bad templates

**Steps:**
1. Create file: `.askbob/quick-actions/broken.md`
2. Content (missing frontmatter):
   ```
   This is just text without frontmatter
   ```
3. Save file

**Expected Result:**
- ✅ Console warning: "Template .../broken.md missing frontmatter, skipping"
- ✅ Template not loaded
- ✅ Other templates still work

---

### Test 15: Auto-Creation of .askbob/

**Goal:** Verify directory auto-creation

**Steps:**
1. Delete `.askbob/` folder if exists:
   ```bash
   rm -rf .askbob
   ```
2. Command Palette → `Bob AI: Edit Quick Action Prompts`
3. Select: `🎨 Open Visual Editor`
4. Edit any template and save

**Expected Result:**
- ✅ `.askbob/quick-actions/` created automatically
- ✅ `.askbob/.gitignore` created automatically
- ✅ Template saved successfully

---

### Test 16: Command Palette Availability

**Goal:** Verify command is registered

**Steps:**
1. Command Palette (`Cmd/Ctrl+Shift+P`)
2. Type: "Bob"

**Expected Result:**
- ✅ "Bob AI: Edit Quick Action Prompts" appears in list
- ✅ Other Bob AI commands still work

---

### Test 17: Template in Quick Actions

**Goal:** End-to-end test of custom template

**Steps:**
1. Create custom template via Visual Editor:
   - Label: "🎨 Make it Pretty"
   - Prompt: "Refactor this code to be more readable and well-formatted"
   - Kind: refactor
   - Enabled: true

2. Select some code
3. Run `Bob AI: Quick Actions`
4. Select "🎨 Make it Pretty"

**Expected Result:**
- ✅ Template appears in Quick Actions list
- ✅ Selecting it sends correct prompt to terminal
- ✅ Code reference appended correctly

---

## Debugging Tips

### Check Console Logs

Open VS Code Developer Tools:
```
Command Palette → "Developer: Toggle Developer Tools"
```

Look for:
```
Template file watchers initialized
Watching templates/quick-actions/
Watching .askbob/quick-actions/
Loaded X templates (Y custom, Z defaults)
```

### Check File Watcher

If auto-reload doesn't work:
1. Check console for watcher initialization
2. Manually reload: `Command Palette → "Developer: Reload Window"`

### Check Template Format

If template doesn't load:
```bash
cat .askbob/quick-actions/your-template.md
```

Verify:
- Starts with `---`
- Has `label:` field
- Ends frontmatter with `---`
- Has prompt text after frontmatter

### Check Permissions

If save fails:
```bash
ls -la .askbob/quick-actions/
# Check write permissions
```

### Reset Everything

If things get messy:
```bash
# Delete all custom templates
rm -rf .askbob

# Reload extension
Command Palette → "Developer: Reload Window"

# Extension defaults take over
```

---

## Expected Behavior Summary

| Action | Expected |
|--------|----------|
| Open Visual Editor | WebView opens with template list |
| Edit template | Creates copy in .askbob/, saves changes |
| Save template | File written, auto-reloads, badge updates |
| Reset template | Deletes .askbob copy, reverts to default |
| Delete template | Removes custom template completely |
| Create template | New file in .askbob/, appears in list |
| File watcher | Detects changes, reloads automatically |
| Override | .askbob copy takes priority over default |
| No workspace | Shows error, exits gracefully |

---

## Checklist

- [ ] Extension defaults load (8 templates)
- [ ] Visual Editor opens
- [ ] Can edit template
- [ ] Copy-on-write works (creates .askbob copy)
- [ ] Save updates badge to "Custom"
- [ ] Custom template appears in Quick Actions
- [ ] Custom prompt overrides default
- [ ] Direct file editing works
- [ ] File watcher detects changes
- [ ] Reset to default works
- [ ] Delete custom template works
- [ ] Create new template works
- [ ] Open folder works
- [ ] .askbob auto-created
- [ ] .gitignore created
- [ ] Disable template works
- [ ] No workspace shows error
- [ ] Command appears in palette

---

## Report Issues

If any test fails, check:
1. Console for errors
2. File permissions
3. Template file format
4. VS Code version (requires 1.74.0+)

Report bugs with:
- Test number that failed
- Expected vs actual behavior
- Console logs
- Template file content
