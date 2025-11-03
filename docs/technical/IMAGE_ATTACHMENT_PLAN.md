# Image Attachment Feature - Implementation Plan

## 📋 Overview

Add copy-paste compatibility for images to send visual context (screenshots, diagrams, mockups) to AI CLI terminals alongside code references.

**Target:** Claude Code CLI (supports images via file paths, Ctrl+V paste, and drag-drop)

---

## 🎯 Goals

1. **Send image files** from VS Code Explorer to AI CLI terminal
2. **Paste images from clipboard** directly into terminal context
3. **Combine code references + images** for rich context
4. **Maintain existing architecture patterns** (modular, sound feedback, etc.)
5. **Follow extension conventions** (ASDF shortcuts, clear UX)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Actions                         │
│  1. Right-click image file → Send to Terminal          │
│  2. Copy image → Paste to Terminal (Ctrl+V)            │
│  3. Select code + image → Send with Context            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              New Commands (src/commands/)               │
│                                                         │
│  send-image-to-terminal.js    ← Image file handler    │
│  send-with-context.js         ← Combined context      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│            New Utilities (src/utils/)                   │
│                                                         │
│  image-detector.js            ← Clipboard detection    │
│  context-builder.js           ← Combine code + images  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│       Enhanced Terminal Manager (existing)              │
│                                                         │
│  sendToAITerminal()           ← Handle image paths     │
│  sendImageReference()         ← NEW: Image-specific    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                Claude Code Terminal                     │
│  - File path: "/path/to/image.png"                     │
│  - Clipboard paste: Ctrl+V                             │
│  - Combined: "@file#L5 + /path/to/image.png"          │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Implementation Phases

### **Phase 1: Basic Image Support** (MVP)

**Goal:** Send image file paths to Claude Code terminal

**New Files:**
- `src/commands/send-image-to-terminal.js`
- `src/utils/image-detector.js`

**Changes:**
- `package.json` - Add command, context menu, keybinding
- `src/commands/index.js` - Register new command
- `src/services/terminal-manager.js` - Add image path formatting

**Features:**
- Right-click `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg` → "Bob AI: Send Image to Terminal"
- Sends: `Here's the image: /absolute/path/to/image.png`
- Works with Claude Code's file path support
- Includes sound feedback (chirping birds)

**User Flow:**
```
1. Take screenshot → Save to workspace
2. Right-click image in Explorer
3. Select "Bob AI: Send Image to Terminal"
4. Claude Code receives: "Analyze this: /path/to/screenshot.png"
```

---

### **Phase 2: Clipboard Image Detection with Preview** (Enhancement)

**Goal:** Detect images in clipboard, show preview, and offer to send with user confirmation

**New Files:**
- `src/utils/clipboard-image-handler.js`
- `src/views/image-preview.js` (WebView for image preview)
- `src/services/temp-file-manager.js`

**Changes:**
- `src/commands/send-image-to-terminal.js` - Add clipboard detection option
- Add command: `ask-ai-cli.pasteImageToTerminal`
- Add command: `ask-ai-cli.cleanupTempImages` (manual cleanup)
- Add setting: `bobAiCli.autoPromptClipboardImage` (default: true)

**Features:**
- **Auto-detect clipboard images** - When clipboard has image, show prompt
- **Image preview UI** - WebView showing image thumbnail before sending
- **User confirmation** - "Send to Terminal" button in preview
- **Persistent temp files** - No auto-deletion, kept for reference
- **Manual cleanup** - Command to delete old temp files
- **Disable auto-prompt** - Setting to turn off clipboard detection
- Keyboard shortcut: `Ctrl+K I` (I for Image) - works for both file and clipboard

**User Flow (Auto-Prompt Enabled):**
```
1. Take screenshot (Cmd+Shift+4 on Mac, Windows+Shift+S on Windows)
2. Screenshot copied to clipboard automatically
3. VS Code shows notification: "📋 Image detected in clipboard"
4. Click notification → Preview window opens
5. Preview shows:
   - Image thumbnail
   - File size (e.g., "245 KB")
   - Dimensions (e.g., "1920x1080")
   - [Send to Terminal] button
   - [Cancel] button
6. Click "Send to Terminal"
7. Extension saves to: ~/.bob-ai/temp/bob-ai-{timestamp}.png
8. Sends to terminal: "Here's an image: ~/.bob-ai/temp/bob-ai-{timestamp}.png"
9. Temp file kept for future reference
```

**User Flow (Manual Command):**
```
1. Copy image to clipboard
2. Press Ctrl+K I or Command Palette → "Bob AI: Paste Image from Clipboard"
3. Preview window opens immediately (same as above)
4. Choose to send or cancel
```

**Temp File Management:**
- **Location:** `~/.bob-ai/temp/` (user home directory)
- **Naming:** `bob-ai-{timestamp}.png` (e.g., `bob-ai-2024-11-03-143022.png`)
- **No auto-deletion** - Files persist for user reference
- **Manual cleanup:** Command "Bob AI: Clean Up Temp Images"
- **Cleanup options:**
  - Delete all temp images
  - Delete images older than X days
  - Open temp folder in Finder/Explorer

---

### **Phase 3: Send with Context** (Advanced)

**Goal:** Combine code references + images + custom prompt

**New Files:**
- `src/commands/send-with-context.js`
- `src/utils/context-builder.js`

**Changes:**
- `package.json` - Add command, menu entry
- Multi-step UI using VS Code Quick Pick

**Features:**
- Command: "Bob AI: Send with Context"
- Multi-step picker:
  1. **Select code blocks** (shows recent selections or file picker)
  2. **Add images** (file picker for `.png`, `.jpg`, etc.)
  3. **Custom prompt** (input box)
- Generates combined message:
  ```
  Review this implementation:
  @src/auth/login.js#L15-42
  @src/auth/utils.js#L8-12
  Screenshot: /path/to/ui-mockup.png
  Error log: /path/to/error-screenshot.png
  ```

**User Flow:**
```
1. Select code in multiple files → Copy references
2. Command Palette → "Bob AI: Send with Context"
3. Picker shows:
   ✅ @src/auth/login.js#L15-42
   ✅ @src/auth/utils.js#L8-12
   [Add Images...]
4. Select images:
   ✅ ui-mockup.png
   ✅ error-screenshot.png
5. Enter prompt: "Review this login flow and UI"
6. Sends combined context to terminal
```

---

## 🔧 Technical Details - Phase 2: Clipboard & Preview

### 1. Clipboard Image Handler

**File:** `src/utils/clipboard-image-handler.js`

```javascript
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Temp directory for clipboard images
 * Location: ~/.bob-ai/temp/
 */
function getTempDirectory() {
    const homeDir = os.homedir();
    const tempDir = path.join(homeDir, '.bob-ai', 'temp');

    // Create directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return tempDir;
}

/**
 * Generate temp filename with timestamp
 * @returns {string} Full path to temp file
 */
function generateTempFilePath() {
    const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '');
    const filename = `bob-ai-${timestamp}.png`;
    return path.join(getTempDirectory(), filename);
}

/**
 * Check if clipboard contains image data
 * Note: VS Code API limitation - we can only detect if clipboard has text
 * For actual image detection, we'll use a workaround with temporary clipboard monitoring
 *
 * @returns {Promise<boolean>} True if clipboard might have image
 */
async function hasClipboardImage() {
    // VS Code limitation: Cannot directly detect clipboard images
    // Workaround: Try to read as text, if empty or special format, might be image
    try {
        const text = await vscode.env.clipboard.readText();

        // If clipboard is empty, might have image
        if (!text || text.trim().length === 0) {
            return true; // Potential image
        }

        // Check if text looks like an image path
        if (text.match(/\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to check clipboard:', error);
        return false;
    }
}

/**
 * Save clipboard image to temp file
 * Uses VS Code's built-in clipboard paste functionality
 *
 * @returns {Promise<string|null>} Path to saved image or null if failed
 */
async function saveClipboardImageToTemp() {
    const tempPath = generateTempFilePath();

    try {
        // Method 1: Try to use built-in clipboard API (if supported in future)
        // Currently VS Code doesn't expose clipboard.readImage()

        // Method 2: Use shell commands as workaround
        const platform = os.platform();
        let command;

        if (platform === 'darwin') {
            // macOS: Use osascript to save clipboard image
            command = `osascript -e 'tell application "System Events" to ¬
                write (the clipboard as «class PNGf») to ¬
                (open for access POSIX file "${tempPath}" with write permission)'`;
        } else if (platform === 'win32') {
            // Windows: Use PowerShell to save clipboard image
            command = `powershell -command "Add-Type -AssemblyName System.Windows.Forms;
                $img = [System.Windows.Forms.Clipboard]::GetImage();
                if ($img) { $img.Save('${tempPath}', [System.Drawing.Imaging.ImageFormat]::Png) }"`;
        } else {
            // Linux: Use xclip
            command = `xclip -selection clipboard -t image/png -o > "${tempPath}"`;
        }

        // Execute command
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
            exec(command, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // Verify file was created
        if (fs.existsSync(tempPath)) {
            return tempPath;
        }

        return null;
    } catch (error) {
        console.error('Failed to save clipboard image:', error);
        return null;
    }
}

/**
 * Get image metadata (size, dimensions)
 * @param {string} imagePath - Path to image file
 * @returns {Object} Image metadata
 */
function getImageMetadata(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        const sizeKB = (stats.size / 1024).toFixed(2);

        // For dimensions, we'd need an image library
        // For now, just return file size
        return {
            size: `${sizeKB} KB`,
            path: imagePath,
            filename: path.basename(imagePath)
        };
    } catch (error) {
        console.error('Failed to get image metadata:', error);
        return null;
    }
}

module.exports = {
    getTempDirectory,
    generateTempFilePath,
    hasClipboardImage,
    saveClipboardImageToTemp,
    getImageMetadata
};
```

---

### 2. Image Preview WebView

**File:** `src/views/image-preview.js`

```javascript
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Show image preview with send button
 * @param {Object} context - Extension context
 * @param {string} imagePath - Path to image file
 * @param {Object} metadata - Image metadata (size, dimensions)
 * @returns {Promise<boolean>} True if user clicked send, false if cancelled
 */
async function showImagePreview(context, imagePath, metadata) {
    return new Promise((resolve) => {
        const panel = vscode.window.createWebviewPanel(
            'bobAiImagePreview',
            '🖼️ Image Preview - Bob AI',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.dirname(imagePath))
                ]
            }
        );

        // Convert image path to webview URI
        const imageUri = panel.webview.asWebviewUri(vscode.Uri.file(imagePath));

        panel.webview.html = getWebviewContent(imageUri, metadata);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'send':
                        panel.dispose();
                        resolve(true);
                        return;
                    case 'cancel':
                        panel.dispose();
                        resolve(false);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );

        // Handle panel close
        panel.onDidDispose(() => {
            resolve(false);
        });
    });
}

/**
 * Generate HTML content for preview webview
 * @param {vscode.Uri} imageUri - Webview URI for image
 * @param {Object} metadata - Image metadata
 * @returns {string} HTML content
 */
function getWebviewContent(imageUri, metadata) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Preview</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .preview-section {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .image-container {
            text-align: center;
            margin: 20px 0;
        }
        img {
            max-width: 100%;
            max-height: 500px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .metadata {
            display: flex;
            gap: 20px;
            margin: 15px 0;
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }
        .metadata-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .button-group {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        button {
            padding: 10px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        h2 {
            margin-top: 0;
            color: var(--vscode-editor-foreground);
        }
        .info-text {
            color: var(--vscode-descriptionForeground);
            font-size: 13px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="preview-section">
            <h2>📋 Image from Clipboard</h2>
            <p class="info-text">Preview your image before sending to Claude Code</p>

            <div class="image-container">
                <img src="${imageUri}" alt="Preview" />
            </div>

            <div class="metadata">
                <div class="metadata-item">
                    <span>📏</span>
                    <span>Size: ${metadata.size}</span>
                </div>
                <div class="metadata-item">
                    <span>📁</span>
                    <span>${metadata.filename}</span>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button class="btn-primary" onclick="sendToTerminal()">
                📤 Send to Terminal
            </button>
            <button class="btn-secondary" onclick="cancel()">
                ❌ Cancel
            </button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function sendToTerminal() {
            vscode.postMessage({ command: 'send' });
        }

        function cancel() {
            vscode.postMessage({ command: 'cancel' });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                sendToTerminal();
            } else if (e.key === 'Escape') {
                cancel();
            }
        });
    </script>
</body>
</html>`;
}

module.exports = {
    showImagePreview
};
```

---

### 3. Temp File Manager

**File:** `src/services/temp-file-manager.js`

```javascript
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

/**
 * Get all temp images
 * @param {string} tempDir - Temp directory path
 * @returns {Array<Object>} Array of temp file info
 */
function getTempImages(tempDir) {
    try {
        if (!fs.existsSync(tempDir)) {
            return [];
        }

        const files = fs.readdirSync(tempDir);
        const images = files
            .filter(f => f.startsWith('bob-ai-') && f.endsWith('.png'))
            .map(f => {
                const filePath = path.join(tempDir, f);
                const stats = fs.statSync(filePath);
                return {
                    name: f,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    age: Date.now() - stats.birthtime.getTime()
                };
            })
            .sort((a, b) => b.created - a.created); // Newest first

        return images;
    } catch (error) {
        console.error('Failed to get temp images:', error);
        return [];
    }
}

/**
 * Delete old temp images
 * @param {string} tempDir - Temp directory path
 * @param {number} maxAgeDays - Maximum age in days (default: 7)
 * @returns {number} Number of files deleted
 */
function cleanupOldImages(tempDir, maxAgeDays = 7) {
    const images = getTempImages(tempDir);
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    let deleted = 0;

    images.forEach(img => {
        if (img.age > maxAgeMs) {
            try {
                fs.unlinkSync(img.path);
                deleted++;
            } catch (error) {
                console.error(`Failed to delete ${img.name}:`, error);
            }
        }
    });

    return deleted;
}

/**
 * Delete all temp images
 * @param {string} tempDir - Temp directory path
 * @returns {number} Number of files deleted
 */
function cleanupAllImages(tempDir) {
    const images = getTempImages(tempDir);
    let deleted = 0;

    images.forEach(img => {
        try {
            fs.unlinkSync(img.path);
            deleted++;
        } catch (error) {
            console.error(`Failed to delete ${img.name}:`, error);
        }
    });

    return deleted;
}

/**
 * Show cleanup options dialog
 * @param {string} tempDir - Temp directory path
 */
async function showCleanupDialog(tempDir) {
    const images = getTempImages(tempDir);

    if (images.length === 0) {
        vscode.window.showInformationMessage('No temp images to clean up');
        return;
    }

    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

    const options = [
        {
            label: `🗑️ Delete All (${images.length} images, ${totalSizeMB} MB)`,
            action: 'all'
        },
        {
            label: '📅 Delete Older than 7 Days',
            action: '7days'
        },
        {
            label: '📅 Delete Older than 30 Days',
            action: '30days'
        },
        {
            label: '📁 Open Temp Folder',
            action: 'open'
        }
    ];

    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: 'Choose cleanup option',
        title: 'Clean Up Temp Images'
    });

    if (!selected) return;

    switch (selected.action) {
        case 'all':
            const deleted = cleanupAllImages(tempDir);
            vscode.window.showInformationMessage(`Deleted ${deleted} temp images`);
            break;

        case '7days':
            const deleted7 = cleanupOldImages(tempDir, 7);
            vscode.window.showInformationMessage(`Deleted ${deleted7} images older than 7 days`);
            break;

        case '30days':
            const deleted30 = cleanupOldImages(tempDir, 30);
            vscode.window.showInformationMessage(`Deleted ${deleted30} images older than 30 days`);
            break;

        case 'open':
            vscode.env.openExternal(vscode.Uri.file(tempDir));
            break;
    }
}

module.exports = {
    getTempImages,
    cleanupOldImages,
    cleanupAllImages,
    showCleanupDialog
};
```

---

### 4. Settings Configuration

**File:** `package.json` (additions)

```json
{
  "contributes": {
    "configuration": {
      "title": "Bob AI CLI",
      "properties": {
        "bobAiCli.enableSoundEffects": {
          "type": "boolean",
          "default": true,
          "description": "Enable or disable sound feedback when executing commands"
        },
        "bobAiCli.autoPromptClipboardImage": {
          "type": "boolean",
          "default": true,
          "description": "Automatically show preview when clipboard contains an image"
        },
        "bobAiCli.clipboardCheckInterval": {
          "type": "number",
          "default": 2000,
          "description": "How often to check clipboard for images (milliseconds). Set to 0 to disable."
        },
        "bobAiCli.tempImageLocation": {
          "type": "string",
          "default": "~/.bob-ai/temp",
          "description": "Directory to store temporary clipboard images"
        }
      }
    }
  }
}
```

---

## 🔧 Technical Details - Phase 1

### 1. Image Detection Utility

**File:** `src/utils/image-detector.js`

```javascript
const vscode = require('vscode');
const path = require('path');

/**
 * Supported image extensions
 */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];

/**
 * Check if file is an image
 * @param {vscode.Uri} fileUri - File URI to check
 * @returns {boolean} True if image file
 */
function isImageFile(fileUri) {
    const ext = path.extname(fileUri.fsPath).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Check if clipboard contains image data
 * @returns {Promise<boolean>} True if clipboard has image
 */
async function hasClipboardImage() {
    // VS Code API doesn't expose clipboard image detection
    // We'll use file path detection or temp file approach
    const text = await vscode.env.clipboard.readText();

    // Check if clipboard text is an image file path
    if (text && isImageFile(vscode.Uri.file(text))) {
        return true;
    }

    return false;
}

/**
 * Get image file path from clipboard
 * @returns {Promise<string|null>} Image file path or null
 */
async function getClipboardImagePath() {
    const text = await vscode.env.clipboard.readText();

    if (text && isImageFile(vscode.Uri.file(text))) {
        return text;
    }

    return null;
}

module.exports = {
    isImageFile,
    hasClipboardImage,
    getClipboardImagePath,
    IMAGE_EXTENSIONS
};
```

---

### 2. Send Image Command

**File:** `src/commands/send-image-to-terminal.js`

```javascript
const vscode = require('vscode');
const path = require('path');
const { sendToAITerminal } = require('../services/terminal-manager');
const { isImageFile } = require('../utils/image-detector');
const { playSuccessSound } = require('../utils/sound');

/**
 * Command handler for sending image to terminal
 * @param {vscode.Uri} resourceUri - Image file URI
 */
async function sendImageToTerminalCommand(resourceUri) {
    // Get file path (from context menu or active file)
    let imageUri = resourceUri;

    if (!imageUri) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            imageUri = editor.document.uri;
        }
    }

    if (!imageUri) {
        vscode.window.showErrorMessage('No image file selected');
        return;
    }

    // Validate it's an image
    if (!isImageFile(imageUri)) {
        vscode.window.showErrorMessage(
            'Selected file is not an image. Supported: .png, .jpg, .jpeg, .gif, .svg, .webp, .bmp'
        );
        return;
    }

    // Get absolute path (Claude Code needs absolute paths)
    const imagePath = imageUri.fsPath;
    const fileName = path.basename(imagePath);

    // Build prompt with image reference
    const terminalText = `Here's an image (${fileName}): ${imagePath}`;

    // Send to AI CLI terminal
    try {
        const success = await sendToAITerminal(terminalText);

        if (success) {
            try {
                await playSuccessSound();
            } catch (soundErr) {
                console.warn('Failed to play success sound:', soundErr.message);
            }
        }
    } catch (err) {
        console.error('Failed to send image to terminal:', err);
    }
}

module.exports = {
    sendImageToTerminalCommand
};
```

---

### 3. Context Builder Utility

**File:** `src/utils/context-builder.js`

```javascript
const vscode = require('vscode');
const path = require('path');

/**
 * Build combined context from code references and images
 * @param {Object} options
 * @param {string[]} options.codeReferences - Array of @path#L1-5 references
 * @param {string[]} options.imagePaths - Array of image file paths
 * @param {string} options.customPrompt - User's custom prompt
 * @returns {string} Formatted context message
 */
function buildContext({ codeReferences = [], imagePaths = [], customPrompt = '' }) {
    const parts = [];

    // Add custom prompt first if provided
    if (customPrompt.trim()) {
        parts.push(customPrompt.trim());
        parts.push(''); // Empty line for separation
    }

    // Add code references
    if (codeReferences.length > 0) {
        parts.push('Code to review:');
        codeReferences.forEach(ref => {
            parts.push(ref);
        });
        parts.push(''); // Empty line
    }

    // Add image references
    if (imagePaths.length > 0) {
        parts.push('Related images:');
        imagePaths.forEach(imgPath => {
            const fileName = path.basename(imgPath);
            parts.push(`${fileName}: ${imgPath}`);
        });
    }

    return parts.join('\n');
}

/**
 * Show multi-step context builder UI
 * @returns {Promise<string|null>} Built context or null if cancelled
 */
async function showContextBuilderUI() {
    // Step 1: Get custom prompt
    const customPrompt = await vscode.window.showInputBox({
        prompt: 'Enter your prompt (optional)',
        placeHolder: 'e.g., Review this authentication flow',
        ignoreFocusOut: true
    });

    if (customPrompt === undefined) {
        return null; // User cancelled
    }

    // Step 2: Select images
    const imageUris = await vscode.window.showOpenDialog({
        canSelectMany: true,
        canSelectFiles: true,
        canSelectFolders: false,
        filters: {
            'Images': ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp']
        },
        title: 'Select images to include (optional)'
    });

    const imagePaths = imageUris ? imageUris.map(uri => uri.fsPath) : [];

    // Build context
    const context = buildContext({
        codeReferences: [], // We'll add code reference support later
        imagePaths,
        customPrompt
    });

    return context;
}

module.exports = {
    buildContext,
    showContextBuilderUI
};
```

---

### 4. Terminal Manager Updates

**File:** `src/services/terminal-manager.js` (enhancement)

Add image-specific formatting:

```javascript
/**
 * Send image reference to AI CLI terminal
 * @param {string} imagePath - Absolute path to image file
 * @param {string} prompt - Optional custom prompt
 * @returns {Promise<boolean>} True if sent successfully
 */
async function sendImageReference(imagePath, prompt = '') {
    const fileName = path.basename(imagePath);
    const message = prompt
        ? `${prompt}\n\nImage: ${imagePath}`
        : `Analyze this image (${fileName}): ${imagePath}`;

    return await sendToAITerminal(message);
}

module.exports = {
    // ... existing exports
    sendImageReference
};
```

---

### 5. Package.json Updates

**Commands:**
```json
{
  "command": "ask-ai-cli.sendImageToTerminal",
  "title": "Bob AI: Send Image to Terminal"
},
{
  "command": "ask-ai-cli.pasteImageFromClipboard",
  "title": "Bob AI: Paste Image from Clipboard"
},
{
  "command": "ask-ai-cli.sendWithContext",
  "title": "Bob AI: Send with Context"
}
```

**Context Menus:**
```json
"explorer/context": [
  {
    "when": "resourceExtname =~ /\\.(png|jpg|jpeg|gif|svg|webp|bmp)$/",
    "command": "ask-ai-cli.sendImageToTerminal",
    "group": "askAiCli@5"
  }
]
```

**Keybindings:**
```json
{
  "command": "ask-ai-cli.sendImageToTerminal",
  "key": "ctrl+k i",
  "mac": "cmd+k i",
  "when": "resourceExtname =~ /\\.(png|jpg|jpeg|gif|svg|webp|bmp)$/"
},
{
  "command": "ask-ai-cli.sendWithContext",
  "key": "ctrl+k shift+d",
  "mac": "cmd+k shift+d"
}
```

---

## 🎨 User Experience

### Context Menus

**Explorer Context Menu (Image Files):**
```
📁 src/
  📁 assets/
    🖼️ logo.png
      Right-click →
        📤 Bob AI: Send Image to Terminal  [Ctrl+K I]
        📋 Bob AI: Copy Reference
        🚀 Bob AI: Start AI CLI
```

**Editor Context Menu (With Selection + Image):**
```
Select code →
  Right-click →
    📤 Bob AI: Send to Terminal         [Ctrl+K D]
    🎯 Bob AI: Quick Actions            [Ctrl+K A]
    📦 Bob AI: Send with Context        [Ctrl+K Shift+D]  ← NEW
    📋 Bob AI: Copy Code Reference      [Ctrl+K F]
```

---

## 📖 Documentation Plan

### New Docs to Create

1. **User Guide: Working with Images**
   - `docs/user-guide/WORKING_WITH_IMAGES.md`
   - How to send images to Claude Code
   - Combining code + images for context
   - Clipboard workflow
   - Troubleshooting

2. **Technical: Image Architecture**
   - `docs/technical/IMAGE_ARCHITECTURE.md`
   - How image detection works
   - Terminal integration approach
   - Clipboard handling limitations
   - File path vs paste trade-offs

3. **Dev: Testing Images Feature**
   - `docs/dev/TESTING_IMAGES.md`
   - Test cases for image sending
   - Manual testing checklist
   - Edge cases (large images, unsupported formats)

### Updates to Existing Docs

1. **README.md**
   - Add "Working with Images" section
   - Update shortcuts table (Ctrl+K I, Ctrl+K Shift+D)
   - Add image examples to Pro Tips

2. **CLAUDE.md**
   - Document image command architecture
   - Add development guidelines for image features

3. **docs/README.md**
   - Link to new image documentation

---

## ✅ Success Criteria

### Phase 1 (MVP)
- [ ] Can right-click image file → Send to Claude Code terminal
- [ ] Claude Code receives correct file path
- [ ] Works with all supported image formats
- [ ] Sound feedback plays on success
- [ ] Error messages for unsupported files

### Phase 2 (Clipboard)
- [ ] Can paste image from clipboard
- [ ] Handles temporary file creation
- [ ] Cleans up temp files after use
- [ ] Works with system screenshots

### Phase 3 (Context Builder)
- [ ] Can combine multiple code references
- [ ] Can add multiple images
- [ ] Custom prompt appears first
- [ ] Output is formatted clearly
- [ ] All context sent in single message

---

## 🚧 Limitations & Considerations

### VS Code API Limitations
1. **No native clipboard image detection**
   - Workaround: Use file path detection or temp files
   - Alternative: Rely on file-based workflow

2. **Terminal sendText() is text-only**
   - Solution: Send file paths (Claude Code supports this)
   - Alternative: Use clipboard paste commands

### Claude Code CLI Constraints
1. **File path support confirmed** ✅
   - Format: `"Analyze this: /path/to/image.png"`
   - Works with absolute paths

2. **Clipboard paste supported** ✅
   - Use `workbench.action.terminal.paste`
   - Requires image to be in clipboard

3. **Drag-drop not accessible** ❌
   - VS Code extension can't simulate drag-drop to terminals

### File System Considerations
1. **Temp file cleanup**
   - Create temp files in OS-specific temp directory
   - Clean up after terminal receives reference
   - Handle orphaned files on extension deactivation

2. **Path format**
   - Always use absolute paths
   - Normalize path separators (cross-platform)
   - Handle paths with spaces (quote if needed)

---

## 🔄 Alternative Approaches

### Approach A: File Path Only (Recommended)
**Pros:**
- Simple, reliable
- No clipboard interference
- Works with saved files

**Cons:**
- Requires saving screenshots first
- Extra step for quick sharing

### Approach B: Clipboard + Temp Files
**Pros:**
- Works with unsaved screenshots
- Faster workflow

**Cons:**
- Clipboard management complexity
- Temp file cleanup required
- More failure points

### Approach C: Hybrid (Best)
**Pros:**
- Supports both workflows
- User chooses preferred method
- Maximum flexibility

**Cons:**
- More code to maintain
- Two UX paths to document

**Decision:** Implement Approach C (Hybrid) across three phases

---

## 📊 Testing Strategy

### Unit Tests
- `image-detector.js` - File extension validation
- `context-builder.js` - Message formatting

### Integration Tests
- Send image file → Verify terminal receives path
- Multiple images → Check formatting
- Unsupported format → Verify error message

### Manual Testing Checklist
1. [ ] Right-click `.png` → Send to terminal → Claude Code receives
2. [ ] Right-click `.jpg` → Send to terminal → Works
3. [ ] Right-click `.txt` → Error message appears
4. [ ] No AI CLI running → Blocked with helpful message
5. [ ] Sound feedback plays on success
6. [ ] Keyboard shortcut works (Ctrl+K I)
7. [ ] Works with spaces in file names
8. [ ] Works with absolute and workspace paths

### Edge Cases
- [ ] Very large images (>10MB)
- [ ] Image outside workspace
- [ ] Network drives / remote paths
- [ ] Permission denied errors
- [ ] File deleted after selection

---

## 🛠️ Implementation Order

1. **Setup** (Day 1)
   - Create new files structure
   - Update package.json with commands
   - Register commands in index.js

2. **Core Image Feature** (Day 1-2)
   - Implement image-detector.js
   - Implement send-image-to-terminal.js
   - Add context menu integration
   - Test with Claude Code

3. **Clipboard Support** (Day 2-3)
   - Add clipboard detection
   - Implement temp file handling
   - Add cleanup logic
   - Test with screenshots

4. **Context Builder** (Day 3-4)
   - Implement context-builder.js
   - Create send-with-context.js command
   - Add multi-step UI
   - Test combined workflow

5. **Documentation** (Day 4-5)
   - Write user guide
   - Update README.md
   - Create technical docs
   - Write testing guide

6. **Polish & Testing** (Day 5)
   - Test all workflows
   - Fix bugs
   - Improve error messages
   - Update CHANGELOG

---

## 📝 Open Questions

1. **Image file size limits?**
   - Should we warn about large images?
   - Max size: 10MB? 50MB?

2. **Supported formats priority?**
   - Focus on `.png`, `.jpg` first?
   - Add `.gif`, `.svg` later?

3. **Clipboard image naming?**
   - Use timestamp: `bob-ai-1234567890.png`?
   - User-friendly: `bob-ai-screenshot-2024-10-30.png`?

4. **Context builder scope?**
   - Include code references from history?
   - Support folder references?
   - Multi-workspace support?

---

## 🎯 Success Metrics

- [ ] Users can send images in <5 seconds
- [ ] 90%+ success rate with Claude Code CLI
- [ ] Zero crashes or hangs
- [ ] Clear error messages for all failures
- [ ] Positive feedback from beta users

---

**Status:** Planning Complete ✅
**Next Step:** Begin Phase 1 Implementation
**Owner:** Claude + Andy
**Timeline:** 5 days
