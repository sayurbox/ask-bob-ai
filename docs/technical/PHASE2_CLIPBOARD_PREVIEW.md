# Phase 2: Clipboard Image Preview - Implementation Plan

## 📋 Summary

Phase 2 adds **clipboard image detection with visual preview** before sending to Claude Code.

**Key Features:**
- 🖼️ **Image Preview UI** - See image before sending
- 📋 **Clipboard Detection** - Auto-detects copied images
- 💾 **Persistent Temp Files** - No auto-deletion
- ⚙️ **Configurable** - Enable/disable auto-prompt
- 🧹 **Manual Cleanup** - Command to delete old temp files

---

## 🆕 What's Different from Original Plan?

### Original Phase 2 (NOT Implemented)
```
❌ Auto-delete temp files after 60 seconds
❌ Direct paste without preview
❌ User has no control
❌ Temp files lost immediately
```

### New Phase 2 (Andy's Requirements)
```
✅ Show preview BEFORE sending
✅ Keep temp files (no auto-delete)
✅ User confirms with button
✅ Setting to disable auto-prompt
✅ Manual cleanup command
```

---

## 🎯 User Experience

### Scenario 1: Auto-Prompt Enabled (Default)

```
1. User takes screenshot (Cmd+Shift+4)
   ↓
2. Screenshot automatically copies to clipboard
   ↓
3. VS Code detects image and shows notification:
   "📋 Image detected in clipboard [Preview]"
   ↓
4. User clicks "Preview" button
   ↓
5. Preview window opens showing:
   ┌─────────────────────────────────┐
   │  📋 Image from Clipboard        │
   │                                 │
   │  [Image Preview]                │
   │                                 │
   │  📏 Size: 245 KB                │
   │  📁 bob-ai-2024-11-03.png       │
   │                                 │
   │  [📤 Send to Terminal] [❌ Cancel]│
   └─────────────────────────────────┘
   ↓
6. User clicks "Send to Terminal"
   ↓
7. Image saved to: ~/.bob-ai/temp/bob-ai-2024-11-03-143022.png
   ↓
8. Sent to Claude Code terminal
   ↓
9. File kept for future reference (no auto-delete)
```

### Scenario 2: Manual Command

```
1. User has image in clipboard
   ↓
2. Press Ctrl+K I (or use Command Palette)
   ↓
3. Preview opens immediately (skip notification)
   ↓
4. User confirms or cancels
```

### Scenario 3: Auto-Prompt Disabled

```
1. User takes screenshot
   ↓
2. No automatic notification
   ↓
3. User must manually press Ctrl+K I
   ↓
4. Preview opens
```

---

## 🗂️ File Structure

### New Files to Create

```
src/
├── utils/
│   └── clipboard-image-handler.js    ← Clipboard detection & temp file saving
├── views/
│   └── image-preview.js              ← WebView for image preview UI
└── services/
    └── temp-file-manager.js          ← Temp file cleanup management
```

### Modified Files

```
src/
├── commands/
│   └── send-image-to-terminal.js     ← Add clipboard detection
└── extension.js                       ← Add clipboard monitoring (optional)

package.json                           ← New settings & commands
```

---

## ⚙️ New Settings

Users can configure in VS Code Settings:

### 1. Auto-Prompt Setting
```json
{
  "bobAiCli.autoPromptClipboardImage": true
}
```
- **Default:** `true` (show notification when clipboard has image)
- **Disable:** Set to `false` to turn off auto-detection

### 2. Clipboard Check Interval
```json
{
  "bobAiCli.clipboardCheckInterval": 2000
}
```
- **Default:** `2000` ms (check every 2 seconds)
- **Disable:** Set to `0` to completely disable clipboard monitoring
- **Faster:** Set to `1000` ms for more responsive detection
- **Slower:** Set to `5000` ms to reduce CPU usage

### 3. Temp Image Location
```json
{
  "bobAiCli.tempImageLocation": "~/.bob-ai/temp"
}
```
- **Default:** `~/.bob-ai/temp` (user home directory)
- **Custom:** Set any directory path

---

## 🎨 Preview UI Design

### Preview Window Features

1. **Image Display**
   - Centered image with max-height: 500px
   - Scales to fit window
   - High-quality rendering

2. **Metadata**
   - File size (e.g., "245 KB")
   - Filename (e.g., "bob-ai-2024-11-03.png")
   - *(Future: dimensions, format)*

3. **Action Buttons**
   - **Send to Terminal** (primary button)
   - **Cancel** (secondary button)

4. **Keyboard Shortcuts**
   - `Cmd+Enter` / `Ctrl+Enter` - Send
   - `Escape` - Cancel

5. **VS Code Theme Support**
   - Matches user's color theme
   - Dark/light mode support
   - Uses VS Code CSS variables

---

## 🗄️ Temp File Management

### Location
```bash
# macOS / Linux
~/.bob-ai/temp/

# Windows
C:\Users\YourName\.bob-ai\temp\
```

### Naming Convention
```
bob-ai-{ISO-timestamp}.png

Examples:
bob-ai-2024-11-03T14-30-22.png
bob-ai-2024-11-03T14-31-45.png
bob-ai-2024-11-03T14-35-12.png
```

### Storage Strategy

**NO Auto-Deletion:**
- Files persist indefinitely
- User has full control
- Can reference old images

**Manual Cleanup Options:**
```
Command: "Bob AI: Clean Up Temp Images"

Options:
1. 🗑️ Delete All (15 images, 3.2 MB)
2. 📅 Delete Older than 7 Days
3. 📅 Delete Older than 30 Days
4. 📁 Open Temp Folder
```

---

## 🎪 New Commands

### 1. Paste Image from Clipboard
```
Command: "Bob AI: Paste Image from Clipboard"
ID: ask-ai-cli.pasteImageFromClipboard
Shortcut: Ctrl+K I (enhanced - detects clipboard or file)
```

**Behavior:**
- Checks clipboard for image
- Shows preview if image found
- Works alongside existing file-based sending

### 2. Clean Up Temp Images
```
Command: "Bob AI: Clean Up Temp Images"
ID: ask-ai-cli.cleanupTempImages
Shortcut: None (use Command Palette)
```

**Behavior:**
- Shows cleanup options dialog
- User chooses what to delete
- Confirmation for destructive actions

---

## 🔧 Technical Implementation

### Clipboard Monitoring (Optional)

**Option A: Continuous Monitoring**
```javascript
// extension.js
let clipboardMonitor;

function activate(context) {
    const autoPrompt = vscode.workspace.getConfiguration('bobAiCli')
        .get('autoPromptClipboardImage');

    if (autoPrompt) {
        startClipboardMonitoring(context);
    }
}

function startClipboardMonitoring(context) {
    const interval = vscode.workspace.getConfiguration('bobAiCli')
        .get('clipboardCheckInterval', 2000);

    if (interval === 0) return; // Disabled

    clipboardMonitor = setInterval(async () => {
        const hasImage = await checkForClipboardImage();
        if (hasImage) {
            showClipboardImageNotification();
        }
    }, interval);

    context.subscriptions.push({
        dispose: () => clearInterval(clipboardMonitor)
    });
}
```

**Option B: On-Demand Only (Simpler)**
```javascript
// Only check when user presses Ctrl+K I
// No background monitoring
// Less CPU usage
```

**Recommended:** Option B (on-demand) for Phase 2 MVP

### Platform-Specific Clipboard Handling

**macOS:**
```bash
osascript -e 'tell application "System Events" to write (the clipboard as «class PNGf») to (open for access POSIX file "path" with write permission)'
```

**Windows:**
```powershell
Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) { $img.Save('path', [System.Drawing.Imaging.ImageFormat]::Png) }
```

**Linux:**
```bash
xclip -selection clipboard -t image/png -o > path
```

---

## 📊 Implementation Checklist

### Step 1: Core Utilities (Day 1)
- [ ] Create `clipboard-image-handler.js`
  - [ ] `getTempDirectory()`
  - [ ] `generateTempFilePath()`
  - [ ] `saveClipboardImageToTemp()` for each platform
  - [ ] `getImageMetadata()`
- [ ] Test on macOS, Windows, Linux

### Step 2: Preview UI (Day 1-2)
- [ ] Create `image-preview.js`
  - [ ] WebView panel creation
  - [ ] HTML/CSS for preview
  - [ ] Button handlers (send/cancel)
  - [ ] Keyboard shortcuts
- [ ] Test with sample images

### Step 3: Temp File Manager (Day 2)
- [ ] Create `temp-file-manager.js`
  - [ ] `getTempImages()`
  - [ ] `cleanupOldImages(maxAgeDays)`
  - [ ] `cleanupAllImages()`
  - [ ] `showCleanupDialog()`
- [ ] Test cleanup operations

### Step 4: Command Integration (Day 2-3)
- [ ] Update `send-image-to-terminal.js`
  - [ ] Add clipboard detection branch
  - [ ] Call preview UI
  - [ ] Handle user confirmation
- [ ] Register cleanup command
- [ ] Update keyboard shortcut behavior

### Step 5: Settings & Config (Day 3)
- [ ] Add settings to `package.json`
  - [ ] `autoPromptClipboardImage`
  - [ ] `clipboardCheckInterval`
  - [ ] `tempImageLocation`
- [ ] Add cleanup command to package.json
- [ ] Test setting changes

### Step 6: Documentation (Day 3-4)
- [ ] Update user guide with clipboard workflow
- [ ] Document settings in README
- [ ] Add cleanup command instructions
- [ ] Create troubleshooting section

### Step 7: Testing (Day 4)
- [ ] Test on all platforms (macOS, Windows, Linux)
- [ ] Test with different image formats
- [ ] Test cleanup operations
- [ ] Test settings toggling
- [ ] Test keyboard shortcuts

---

## 🚨 Edge Cases & Considerations

### 1. Clipboard Contains Non-Image
- Show error: "Clipboard doesn't contain an image"
- Offer to select file instead

### 2. Temp Directory Permission Error
- Fallback to OS temp directory
- Show warning message

### 3. Large Images (>10MB)
- Show warning in preview
- Offer to compress before sending

### 4. Disk Space Full
- Catch and show friendly error
- Suggest cleanup command

### 5. Multiple Images in Quick Succession
- Each gets unique timestamp filename
- Preview queue (one at a time)

---

## 📏 Performance Considerations

### Memory Usage
- WebView: ~20-30 MB per preview
- Auto-close preview after send/cancel
- Don't keep image data in memory

### CPU Usage
- Clipboard monitoring: Minimal (<1% CPU)
- Option to disable or adjust interval
- Only monitor when setting enabled

### Disk Space
- Monitor temp directory size
- Warn if >100 MB
- Suggest cleanup proactively

---

## 🎯 Success Metrics

- [ ] Preview opens in <1 second
- [ ] Works on macOS, Windows, Linux
- [ ] No crashes or hangs
- [ ] Temp files persist correctly
- [ ] Cleanup removes only selected files
- [ ] Settings work as expected
- [ ] User feedback positive

---

## 📚 Related Documentation

- [Full Implementation Plan](./IMAGE_ATTACHMENT_PLAN.md) - Complete technical spec
- [User Guide](../user-guide/WORKING_WITH_IMAGES.md) - How to use images
- [Main README](../../README.md) - Extension overview

---

## 💡 Future Enhancements (Phase 3+)

1. **Drag & Drop** - Drag images into VS Code
2. **Multiple Images** - Send multiple at once
3. **Image Editing** - Crop/annotate before sending
4. **OCR Support** - Extract text from screenshots
5. **Cloud Storage** - Upload large images to cloud

---

**Status:** Ready for Implementation ✅

**Timeline:** 3-4 days

**Owner:** Claude + Andy

**Next Step:** Begin implementation of Phase 2
