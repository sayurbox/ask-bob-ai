# Working with Images

Learn how to send images to Claude Code CLI for visual context analysis.

---

## 📖 Overview

Bob AI CLI now supports sending images to Claude Code, enabling you to get AI assistance with:

- 🖼️ **Screenshots** - Debug UI issues or explain error messages
- 🎨 **Design mockups** - Review UI designs or get implementation guidance
- 📊 **Diagrams** - Analyze architecture diagrams or flowcharts
- 🐛 **Error screens** - Get help understanding error messages
- 📸 **Code comparisons** - Show before/after screenshots

Claude Code can analyze images through file paths, making it easy to get visual context for your questions.

---

## 🚀 Quick Start

### Method 1: Auto-Detect Mode (NEW - Phase 2!) 🤖

**Recommended workflow - zero keyboard shortcuts needed!**

1. **Enable auto-detect:** `Ctrl+Shift+P` → "Bob AI: Toggle Auto-Detect Screenshots"
2. **Start AI CLI:** Claude Code must be running (Press `Ctrl+K G` if not)
3. **Take screenshot:** Cmd+Shift+4 (Mac) or Win+Shift+S (Windows)
4. **Notification appears:** "📷 Screenshot detected! [Preview & Send] [Ignore]"
5. **Click "Preview & Send"** → Preview window opens
6. **Click "Send to Terminal"** → Prompt populates in terminal
7. **Press Enter** to submit your question

**Benefits:**
- ✅ Zero keyboard shortcuts needed after enabling
- ✅ Only appears when AI CLI is running (smart & non-intrusive)
- ✅ 60-second deduplication (same screenshot won't trigger twice)
- ✅ Preview before sending
- ✅ Silent when dismissed (no clutter)
- ✅ Review prompt before submitting (no auto-execute)

### Method 2: Manual Paste from Clipboard ⚡

1. Take a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)
2. Press `Ctrl+Shift+K I` (or `Cmd+Shift+K I` on Mac)
3. **Preview window opens** showing your image
4. Click "📤 Send to Terminal" to confirm
5. Prompt populates in terminal → Press Enter to submit

**Benefits:**
- No need to save file first
- Works anytime (doesn't require AI CLI running first)
- Preview before sending
- Fast workflow (2-3 seconds)

### Method 3: Right-Click Image File 📁

1. Save your screenshot/image to your workspace
2. Right-click the image file in VS Code Explorer
3. Select **"Bob AI: Send Image to Terminal"**
4. Claude Code receives the image reference

### Method 4: Keyboard Shortcut (File)

1. Select an image file in Explorer
2. Press `Ctrl+K I` (or `Cmd+K I` on Mac)
3. Image sent to terminal instantly

### Method 5: Command Palette

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Bob AI: Paste Image from Clipboard" (NEW!) or "Send Image to Terminal"
3. Select the command
4. Preview and confirm (for clipboard) or send directly (for files)

---

## 📂 Supported Image Formats

Bob AI supports all common image formats:

- `.png` - PNG images (recommended for screenshots)
- `.jpg` / `.jpeg` - JPEG images
- `.gif` - GIF images (including animated)
- `.svg` - SVG vector graphics
- `.webp` - WebP images
- `.bmp` - Bitmap images

**Recommended:** Use `.png` for screenshots and UI mockups for best quality.

---

## 🎯 Use Cases & Examples

### 1. Debugging UI Issues

**Scenario:** Button alignment is off in your app

**Using Auto-Detect (Fastest):**
```
1. Enable auto-detect: Toggle Auto-Detect Screenshots
2. Start Claude Code
3. Take screenshot of the broken UI (Cmd+Shift+4)
4. Notification: "📷 Screenshot detected!" → Click "Preview & Send"
5. Preview opens → Click "Send to Terminal"
6. Terminal: "Here's an image (bob-ai-2024-01-15...).png: /path/to/temp/image.png"
7. Press Enter and ask: "Why is the button misaligned? How do I fix it?"
```

**Using Manual Paste:**
```
1. Take screenshot of the broken UI
2. Press Ctrl+Shift+K I
3. Preview → Click "Send to Terminal"
4. Press Enter and add your question
```

**Using File (Traditional):**
```
1. Save screenshot as workspace/screenshots/button-issue.png
2. Right-click → "Bob AI: Send Image to Terminal"
3. Ask: "Why is the button misaligned? How do I fix it?"
```

---

### 2. Implementing from Design Mockups

**Scenario:** Designer sends you a Figma export

```
1. Export design as mockup.png
2. Send to Claude Code
3. Ask: "Generate React components to match this design"
```

**Workflow:**
- Save design mockup to workspace
- `Ctrl+K I` to send image
- Claude analyzes colors, layout, spacing
- Generates matching code

---

### 3. Explaining Error Messages

**Scenario:** Complex error screen you don't understand

```
1. Screenshot the error (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)
2. Save to workspace
3. Send to Claude Code
4. Ask: "What does this error mean? How do I fix it?"
```

**Pro tip:** Combine with code references:
```
1. Select relevant code → Ctrl+K F (copy reference)
2. Send error screenshot → Ctrl+K I
3. Paste code reference + ask question
4. Claude sees both code and error
```

---

### 4. Architecture Diagram Analysis

**Scenario:** Need help understanding system architecture

```
1. Save architecture diagram to workspace
2. Send via right-click → "Send Image to Terminal"
3. Ask: "Explain this architecture" or "What's missing from this design?"
```

---

### 5. Code Review with Visual Context

**Scenario:** Reviewing a PR that includes UI changes

```
1. Take "before" and "after" screenshots
2. Save as before.png and after.png
3. Send both images:
   - Right-click before.png → Send to Terminal
   - Right-click after.png → Send to Terminal
4. Ask: "Compare these screenshots and suggest improvements"
```

---

## 🎨 Best Practices

### Image Organization

Create a dedicated screenshots folder:
```
workspace/
├── src/
├── screenshots/           ← Keep images here
│   ├── ui-issues/
│   ├── designs/
│   └── errors/
└── .gitignore            ← Add screenshots/ to ignore
```

Add to `.gitignore`:
```
screenshots/
*.png
*.jpg
```

---

### Image Quality Tips

1. **Use PNG for screenshots** - Better quality, no compression artifacts
2. **Crop to relevant area** - Don't send full-screen captures
3. **High resolution preferred** - Claude Code handles large images well
4. **Clear text** - Ensure error messages are readable
5. **Good lighting** - For photos of physical diagrams/whiteboards

---

### Naming Conventions

Use descriptive filenames:

**Good:**
- `login-button-misaligned.png`
- `error-404-homepage.png`
- `dashboard-design-mockup.png`

**Avoid:**
- `screenshot-1.png`
- `IMG_1234.png`
- `temp.png`

Descriptive names help you and Claude understand context.

---

## 🔧 Combining Images with Code

### Pattern 1: Code + Screenshot

Send code reference first, then image:

```bash
1. Select code → Ctrl+K D (send to terminal)
2. Right-click image → Send Image to Terminal
3. Terminal shows:
   @src/components/Button.tsx#L15-32 \
   Here's an image: /path/to/button-issue.png
4. Add your question
```

### Pattern 2: Multiple Images

Send multiple images for comparison:

```bash
1. Right-click image1.png → Send to Terminal
2. Right-click image2.png → Send to Terminal
3. Ask: "Compare these two approaches"
```

### Pattern 3: Full Context

Build complete context manually:

```bash
1. Copy code references (Ctrl+K F)
2. Send images (Ctrl+K I for each)
3. Type custom prompt in terminal:
   "Review this login flow:
   @src/auth/login.js#L20-45
   Design mockup: /path/to/mockup.png
   Current state: /path/to/current.png
   What improvements would you suggest?"
```

---

## 🎛️ Auto-Detect Settings

### How It Works

When enabled, auto-detect monitors your clipboard every 2 seconds for new images:

1. **Smart Detection** - Only shows notification when AI CLI is running
2. **60-Second Deduplication** - Same screenshot won't trigger notification twice within 60 seconds
3. **Lightweight** - Minimal CPU/memory usage (~0.1% CPU)
4. **Non-Intrusive** - Silent when no AI CLI running or when dismissed

### Toggle On/Off

**Via Command Palette:**
```
Ctrl+Shift+P → "Bob AI: Toggle Auto-Detect Screenshots"
```

**Via Settings:**
```json
{
  "bobAiCli.autoPromptClipboardImage": true  // or false
}
```

**Status Messages:**
- ✅ Enabled: "Auto-detect screenshots: ENABLED - Now when you take a screenshot, a notification will appear automatically!"
- ⏸️ Disabled: "Auto-detect screenshots: DISABLED - Use Command Palette or Cmd+Shift+K I to paste images manually."

### Deduplication Behavior

**Same screenshot within 60 seconds:**
```
1. Take screenshot → Notification appears ✅
2. Toggle sidebar (image still in clipboard)
3. No notification (duplicate detected) 🔇
4. Wait 60 seconds
5. Can trigger notification again ♻️
```

**Different screenshots:**
```
1. Take screenshot A → Notification appears ✅
2. Take screenshot B → Notification appears ✅ (different content)
3. Take screenshot A again (within 60s) → No notification 🔇 (duplicate)
```

### Manual Control

**No auto-execute** - When you send an image, the prompt populates in the terminal but **does NOT** automatically submit. You can:
- ✅ Review the prompt first
- ✅ Edit it if needed
- ✅ Press Enter when ready
- ✅ Press Ctrl+C to cancel

This gives you full control before Claude Code processes your request.

---

## ⚠️ Limitations & Troubleshooting

### Limitations

1. ~~**File-based only**~~ ✅ **FIXED in Phase 2** - Clipboard paste now supported!
2. **Absolute paths** - Claude Code needs full file paths
3. **AI CLI required** - Claude Code must be running (auto-detect won't show if not running)
4. **No drag-drop** - Must use right-click, keyboard shortcut, or auto-detect

### Troubleshooting

#### Error: "No image file selected"

**Cause:** No file was selected when command ran

**Solution:**
- Right-click the image file directly in Explorer
- Or use Command Palette and select file when prompted

---

#### Error: "Selected file is not an image"

**Cause:** File extension not recognized

**Solution:**
- Check file has valid extension (.png, .jpg, etc.)
- Rename file if needed: `screenshot.txt` → `screenshot.png`

---

#### Error: "No AI CLI detected"

**Cause:** Claude Code or AI CLI not running

**Solution:**
1. Press `Ctrl+K G` to start AI CLI
2. Select "Claude Code" from picker
3. Wait for it to start
4. Try sending image again

---

#### Image sent but Claude doesn't see it

**Cause:** Path issue or Claude Code not processing

**Solution:**
1. Check terminal shows full path: `/absolute/path/to/image.png`
2. Verify file exists at that path
3. Try pasting path directly in terminal
4. Check Claude Code terminal logs for errors

---

#### Large images slow or fail

**Cause:** Very large files (>50MB) may be slow

**Solution:**
- Compress images before sending
- Use PNG compression tools
- Crop to relevant area only
- Consider reducing resolution for non-critical images

---

## 🎯 Pro Tips

### Tip 1: Quick Screenshot Workflow

**Mac:**
```
Cmd+Shift+4 → Drag to capture
Saves to Desktop → Drag into workspace
Right-click → Send to Terminal
```

**Windows:**
```
Win+Shift+S → Drag to capture
Saves to clipboard → Paste into image editor
Save to workspace → Right-click → Send
```

---

### Tip 2: Batch Screenshot Analysis

Analyze multiple UI states:

```bash
# Take screenshots of each state
login-empty.png
login-filled.png
login-error.png

# Send all three
Right-click each → Send to Terminal

# Ask comprehensive question
"Review this login flow across these three states.
What UX improvements would you suggest?"
```

---

### Tip 3: Design System Documentation

Use images to build design systems:

```bash
# Collect component screenshots
button-primary.png
button-secondary.png
input-default.png
input-error.png

# Send to Claude
Ask: "Create a design system spec from these components"
```

---

### Tip 4: Error Documentation

Build error catalog with images:

```
errors/
├── 404-not-found.png
├── 500-server-error.png
└── auth-failed.png

Send each error screenshot
Ask: "Document these errors and suggest user-friendly messages"
```

---

## 📋 Phase 2: Clipboard Support (NEW!)

### Clipboard Image Preview

When you paste an image from clipboard, Bob AI now shows a **preview window** before sending:

```
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
```

**Features:**
- See image before sending
- Check file size
- Confirm or cancel
- Keyboard shortcuts: `Cmd/Ctrl+Enter` to send, `Esc` to cancel

### Temporary File Storage

Clipboard images are saved to: `~/.bob-ai/temp/`

**Important:**
- ✅ Files are **kept permanently** (no auto-delete)
- ✅ You can reference them later
- ✅ Manual cleanup when needed

**File naming:**
```
bob-ai-2024-11-03T14-30-22.png
bob-ai-2024-11-03T14-31-45.png
```

### Cleaning Up Temp Images

Use the cleanup command to manage temp images:

**Command:** "Bob AI: Clean Up Temp Images"

**Options:**
1. 🗑️ **Delete All** - Remove all temp images
2. 📅 **Delete Older than 7 Days** - Keep recent images
3. 📅 **Delete Older than 30 Days** - Keep last month
4. 📁 **Open Temp Folder** - Browse manually

**Example:**
```
1. Press Ctrl+Shift+P
2. Type "Bob AI: Clean Up Temp Images"
3. Choose cleanup option
4. Confirm deletion
```

---

## 🔜 Coming Soon (Phase 3)

Features planned for future releases:

### Phase 3: Context Builder
- Combined UI for code + images
- Multi-step picker workflow
- Custom prompts with visual context
- Send multiple images at once

**Stay tuned!** Check [GitHub releases](https://github.com/sayurbox/ask-bob-ai/releases) for updates.

---

## 📚 Related Documentation

- [Main README](../../README.md) - Extension overview
- [Quick Actions Guide](./CUSTOMIZING_TEMPLATES.md) - Customize prompts
- [Technical Plan](../technical/IMAGE_ATTACHMENT_PLAN.md) - Implementation details

---

## 💡 Share Your Workflow

Have a great image-based workflow? Share it!

- [Open an issue](https://github.com/sayurbox/ask-bob-ai/issues) with your use case
- Tag with `enhancement` or `documentation`
- Help other developers learn from your experience

---

**Happy coding with visual context!** 🖼️✨

*Made with ❤️ for developers who love AI-assisted development*
