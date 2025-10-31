# 🎬 Demo Content Capture Guide

Complete guide for creating screenshots and videos for Bob AI CLI README.

---

## 📋 Overview

You need to create **3 demo assets**:

1. ✅ **Quick Actions Demo** (GIF/Video)
2. ✅ **Visual Template Editor Demo** (GIF/Video)
3. ✅ **Folder Operations Demo** (Screenshot)

---

## 🛠️ Recommended Tools

### For Screen Recording (GIF/Video)

**macOS:**
- **[Kap](https://getkap.co/)** (FREE, best for GIFs)
  - Lightweight, easy to use
  - Direct GIF export
  - Keyboard shortcut overlay
- **[CleanShot X](https://cleanshot.com/)** (PAID, professional)
  - High-quality recordings
  - Built-in annotations
  - GIF + MP4 export

**All Platforms:**
- **[LICEcap](https://www.cockos.com/licecap/)** (FREE)
  - Simple GIF recorder
  - Cross-platform
- **[ScreenToGif](https://www.screentogif.com/)** (FREE, Windows/macOS)
  - Record, edit, and save as GIF

### For Screenshots

**macOS:**
- **Native:** `Cmd+Shift+4` (built-in, retina quality)
- **[CleanShot X](https://cleanshot.com/)** (PAID, professional)

**All Platforms:**
- **[Flameshot](https://flameshot.org/)** (FREE, cross-platform)
- **[ShareX](https://getsharex.com/)** (FREE, Windows)

---

## 📹 Demo 1: Quick Actions Workflow

### Goal
Show how easy it is to use Quick Actions with keyboard shortcuts.

### Recording Settings
- **Resolution:** 1600x900 or 1920x1080
- **FPS:** 30 fps
- **Duration:** 10-15 seconds
- **Format:** GIF (preferred) or MP4
- **File size:** < 5 MB for GIF, < 10 MB for MP4

### Step-by-Step Recording

**Setup:**
1. Open a code file with a simple function (e.g., `src/example.js`)
2. Make sure Claude Code or Gemini CLI is running in terminal
3. Enable keyboard shortcut overlay (if using Kap or CleanShot)
4. Clear terminal output for clean look

**Recording Steps:**
1. **Start recording**
2. Select 5-10 lines of code (click and drag)
3. Press `Cmd+K A` (show keyboard shortcut on screen)
4. Wait for Quick Actions menu to appear
5. Hover over a few options (to show variety)
6. Click "🔍 Explain this code"
7. Show terminal receiving the prompt + code reference
8. Wait 2-3 seconds for AI to start responding
9. **Stop recording**

**Post-Processing:**
- Trim any dead time at start/end
- Ensure text is readable (not too small)
- Add 1-second pause at end before loop
- Optimize file size (compress if > 5 MB)

**File Naming:**
```
quick-actions-demo.gif
```

**Save Location:**
```
docs/demos/quick-actions-demo.gif
```

---

## 📹 Demo 2: Visual Template Editor

### Goal
Show the new template customization feature in action.

### Recording Settings
- **Resolution:** 1600x900 or 1920x1080
- **FPS:** 30 fps
- **Duration:** 20-30 seconds
- **Format:** GIF (preferred) or MP4
- **File size:** < 8 MB for GIF, < 15 MB for MP4

### Step-by-Step Recording

**Setup:**
1. Delete `.askbob` folder (for clean demo)
2. Have a code file open in background
3. Clear any previous notifications

**Recording Steps:**
1. **Start recording**
2. Press `Cmd+Shift+P` to open Command Palette
3. Type "Bob AI: Edit" (show autocomplete)
4. Select "Bob AI: Edit Quick Action Prompts"
5. Quick Pick appears with 3 options
6. Select "🎨 Open Visual Editor"
7. Wait for WebView panel to load
8. Scroll through template list (show variety)
9. Click "🔍 Explain this code" template
10. Editor form appears below
11. Change prompt text to: "Explain this code in EXTREME detail"
12. Click "💾 Save" button
13. Wait for success messages:
    - "📝 Copied to .askbob/ for editing"
    - "✅ Template saved"
14. Notice badge changes from "📦 Default" to "✏️ Custom"
15. **Stop recording**

**Post-Processing:**
- Trim dead time
- Ensure UI elements are clearly visible
- Add 1-second pause at end
- Optimize file size

**File Naming:**
```
template-editor-demo.gif
```

**Save Location:**
```
docs/demos/template-editor-demo.gif
```

---

## 📸 Demo 3: Folder Operations Menu

### Goal
Show the folder context menu with all Bob AI actions.

### Screenshot Settings
- **Resolution:** Retina/HiDPI (2x or higher)
- **Format:** PNG (lossless)
- **File size:** < 500 KB
- **Dimensions:** Approximately 400x600 pixels (crop to menu)

### Step-by-Step Screenshot

**Setup:**
1. Open VS Code with a project that has folders
2. Make sure Explorer sidebar is visible
3. Choose a folder with a meaningful name (e.g., `src/components`)

**Capture Steps:**
1. Right-click on a folder in Explorer
2. Hover over "Bob AI: Actions" to expand submenu
3. Ensure all folder operations are visible:
   - 📖 Explain This
   - 🔍 Review Code
   - 🔬 Deep Code Review
   - 🐛 Find Bugs
   - ✅ Generate Tests
   - 📝 Add Documentation
   - ♻️ Refactor
   - 📂 Show Structure
4. **Take screenshot** (`Cmd+Shift+4` on Mac)
5. Drag to select the entire context menu area
6. Make sure folder name is visible for context

**Post-Processing:**
- Crop to show just the menu + folder name
- Ensure high DPI (retina quality)
- Save as PNG (not JPEG)
- Optimize file size with tools like [TinyPNG](https://tinypng.com/)

**File Naming:**
```
folder-operations-menu.png
```

**Save Location:**
```
docs/demos/folder-operations-menu.png
```

---

## 🎨 Style Guidelines

### Visual Consistency
- Use **VS Code Dark+ theme** (default dark theme)
- Font size: **14-16px** for code editor
- Terminal font size: **13-15px**
- Show file names/paths for context

### Color Scheme
- Keep VS Code default colors
- Don't use custom themes (for consistency)

### Content Guidelines
- Use **meaningful example code** (not Lorem Ipsum)
- Keep code simple and readable
- Use realistic folder/file names
- Show actual AI CLI responses (Claude Code or Gemini)

### Animation Guidelines (for GIFs)
- Smooth transitions (30 fps minimum)
- Natural cursor movement (not too fast)
- Brief pauses to show results
- Loop seamlessly with 1-second end pause

---

## 📦 Optimizing File Sizes

### GIF Optimization
```bash
# Using gifsicle (install via Homebrew)
brew install gifsicle

# Optimize GIF
gifsicle -O3 --colors 256 input.gif -o output.gif

# Further compression
gifsicle -O3 --lossy=80 --colors 128 input.gif -o output.gif
```

### PNG Optimization
```bash
# Using pngquant (install via Homebrew)
brew install pngquant

# Optimize PNG
pngquant --quality=80-95 input.png -o output.png

# Or use online: https://tinypng.com/
```

### Alternative: Video to GIF Conversion
```bash
# Using ffmpeg (install via Homebrew)
brew install ffmpeg

# Convert MP4 to optimized GIF
ffmpeg -i input.mp4 -vf "fps=30,scale=1600:-1:flags=lanczos" -c:v gif output.gif
```

---

## 📁 Final File Structure

After creating all demos, your structure should be:

```
docs/
├── demos/
│   ├── quick-actions-demo.gif          (< 5 MB)
│   ├── template-editor-demo.gif        (< 8 MB)
│   └── folder-operations-menu.png      (< 500 KB)
├── CUSTOMIZING_TEMPLATES.md
├── TEMPLATE_ARCHITECTURE.md
└── TESTING_TEMPLATES.md

README.md
DEMO_CAPTURE_GUIDE.md
```

---

## ✅ Updating README After Capture

Once you have all 3 demos captured, update README.md:

### 1. Replace Placeholder Images

**Quick Actions Demo:**
```markdown
<!-- Replace this line -->
![Quick Actions Demo Placeholder](https://via.placeholder.com/...)

<!-- With this -->
![Quick Actions Demo](./docs/demos/quick-actions-demo.gif)
```

**Template Editor Demo:**
```markdown
<!-- Replace this line -->
![Template Editor Demo Placeholder](https://via.placeholder.com/...)

<!-- With this -->
![Visual Template Editor Demo](./docs/demos/template-editor-demo.gif)
```

**Folder Operations Menu:**
```markdown
<!-- Replace this line -->
![Folder Operations Placeholder](https://via.placeholder.com/...)

<!-- With this -->
<img src="./docs/demos/folder-operations-menu.png" alt="Folder Operations Menu" width="400">
```

### 2. Remove TODO Comments

Delete these lines from README.md:
```markdown
<!-- TODO: Add GIF/video showing Quick Actions workflow -->
<!-- TODO: Add GIF/video showing template customization -->
<!-- TODO: Add screenshot of folder context menu -->
```

### 3. Remove Instruction Blockquotes

Remove the instruction blocks:
```markdown
> **📹 VIDEO NEEDED:** Record screen showing:
> 1. Select code in editor
> ...
```

---

## 🎯 Quality Checklist

Before finalizing, ensure:

### Quick Actions Demo
- [ ] Shows keyboard shortcut (`Cmd+K A`)
- [ ] Quick Actions menu is clearly visible
- [ ] Code selection is obvious
- [ ] Terminal shows prompt + code reference
- [ ] Duration: 10-15 seconds
- [ ] File size: < 5 MB
- [ ] Loops smoothly

### Template Editor Demo
- [ ] Command Palette workflow is clear
- [ ] WebView UI is fully visible
- [ ] Edit process is obvious
- [ ] Badge change is visible (Default → Custom)
- [ ] Success messages appear
- [ ] Duration: 20-30 seconds
- [ ] File size: < 8 MB
- [ ] Loops smoothly

### Folder Operations Screenshot
- [ ] Context menu is fully visible
- [ ] All 8 folder operations are shown
- [ ] Folder name is visible for context
- [ ] High DPI/retina quality
- [ ] File size: < 500 KB
- [ ] PNG format (lossless)

---

## 🚀 Publishing

After updating README.md:

1. **Create docs/demos/ directory:**
   ```bash
   mkdir -p docs/demos
   ```

2. **Copy demo files:**
   ```bash
   cp quick-actions-demo.gif docs/demos/
   cp template-editor-demo.gif docs/demos/
   cp folder-operations-menu.png docs/demos/
   ```

3. **Commit changes:**
   ```bash
   git add README.md docs/demos/
   git commit -m "docs: Add demo screenshots and videos"
   git push
   ```

4. **Verify on GitHub:**
   - Check README renders correctly
   - GIFs play automatically
   - Images load properly
   - File sizes are reasonable

---

## 🆘 Troubleshooting

### GIF Not Loading on GitHub
- Ensure file size < 10 MB (GitHub limit)
- Use relative paths: `./docs/demos/file.gif`
- Try converting to MP4 if too large

### Image Quality Too Low
- Capture at 2x resolution, then scale down
- Use PNG for screenshots (not JPEG)
- Ensure retina/HiDPI capture

### File Size Too Large
- Reduce FPS: 30 fps is usually enough
- Reduce colors: 128-256 colors for GIFs
- Reduce dimensions: 1600x900 instead of 1920x1080
- Use lossy compression for GIFs

### GIF Doesn't Loop Smoothly
- Add 1-second pause at end
- Ensure first and last frames match
- Use tools like ScreenToGif to edit loop

---

## 📚 Additional Resources

- [Kap Documentation](https://github.com/wulkano/kap)
- [CleanShot X Guide](https://cleanshot.com/features)
- [GIF Optimization Guide](https://developers.google.com/speed/docs/insights/OptimizeImages)
- [GitHub Markdown Image Guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#images)

---

## ✨ Tips for Great Demos

1. **Practice First:** Record 2-3 takes before the final one
2. **Slow Down:** Move cursor deliberately, not too fast
3. **Clean Setup:** Close unnecessary windows/notifications
4. **Good Lighting:** Use high contrast for readability
5. **Add Context:** Show file names, folder structure
6. **Real Examples:** Use actual code, not placeholders
7. **Test Playback:** Watch the GIF before publishing

---

Need help? Open an issue at https://github.com/sayurbox/ask-bob-ai/issues
