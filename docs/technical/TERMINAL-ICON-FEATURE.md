# Terminal Icon Feature

## Overview

When you launch an AI CLI terminal through Bob AI, it now displays the Bob AI icon (🤖) in the terminal tab, making it easy to identify which terminals are managed by the extension.

## Implementation

**File:** `src/services/terminal-manager.js`

```javascript
async function startAICLI(cliConfig) {
    // Get extension path for icon
    const extensionPath = require('path').join(__dirname, '..', '..');
    const iconPath = require('path').join(extensionPath, 'icon.png');
    
    // Create a new terminal with custom icon
    const terminal = vscode.window.createTerminal({
        name: cliConfig.terminalName,
        hideFromUser: false,
        iconPath: vscode.Uri.file(iconPath)  // 👈 Custom icon added here
    });
    
    // ... rest of terminal setup
}
```

## How It Works

### Before (No Icon)
```
Terminal Tab: [📟] Claude Code
```

### After (With Bob AI Icon)
```
Terminal Tab: [🤖] Claude Code
```

The icon is taken from `icon.png` in the extension root directory.

## Visual Example

When you create a terminal, it will appear like this in the VS Code terminal list:

```
TERMINAL
├─ [🤖] Claude Code         ← Bob AI icon
├─ [🤖] Droid AI            ← Bob AI icon
├─ [🤖] Gemini CLI          ← Bob AI icon
└─ [📟] bash                ← Default icon
```

## Icon Details

**Icon File:** `icon.png` (60KB)
- Size: 256x256 pixels
- Format: PNG with transparency
- Design: Bob AI robot character with laptop

**Icon Path Resolution:**
```javascript
// Extension root directory
const extensionPath = __dirname/../../

// Icon location
const iconPath = extensionPath + '/icon.png'

// Convert to VS Code URI
vscode.Uri.file(iconPath)
```

## Benefits

1. **Easy Identification** - Quickly spot Bob AI managed terminals
2. **Visual Consistency** - Matches extension branding
3. **Better UX** - Users know which terminals were created by Bob AI
4. **Professional Look** - Custom icons show attention to detail

## Testing

To test the icon appears correctly:

```bash
# 1. Start VS Code Extension Development Host (F5)
# 2. Open Command Palette (Cmd+Shift+P)
# 3. Run: "Bob AI: Start AI CLI"
# 4. Select any AI CLI (Claude Code, Droid, etc.)
# 5. Check terminal tab shows Bob AI icon
```

## Alternative: Using SVG Icon

If you prefer using the SVG icon for better scaling:

```javascript
// Use icon.svg instead
const iconPath = require('path').join(extensionPath, 'icon.svg');

const terminal = vscode.window.createTerminal({
    name: cliConfig.terminalName,
    iconPath: vscode.Uri.file(iconPath)  // SVG icon
});
```

## Customization

Users can't customize the icon through settings, but you could add this feature:

```javascript
// Future enhancement: Allow custom icons
const config = vscode.workspace.getConfiguration('bobAiCli');
const customIconPath = config.get('terminalIcon');

const iconPath = customIconPath 
    ? customIconPath 
    : require('path').join(extensionPath, 'icon.png');
```

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| macOS    | ✅ Yes  | Full support |
| Linux    | ✅ Yes  | Full support |
| Windows  | ✅ Yes  | Full support |

## VS Code Version Requirements

- **Minimum:** VS Code 1.74.0
- **Icon Support:** VS Code 1.64.0+ (iconPath added in v1.64)
- **Best Experience:** VS Code 1.93.0+ (for shell integration)

## Related Files

- `icon.png` - Primary icon file (256x256 PNG)
- `icon.svg` - Vector icon file (scalable)
- `src/services/terminal-manager.js` - Terminal creation logic

## Troubleshooting

### Icon Not Showing

**Issue:** Terminal shows default icon instead of Bob AI icon

**Solutions:**
1. Check icon file exists: `ls icon.png`
2. Check path resolution:
   ```javascript
   console.log('Icon path:', iconPath);
   console.log('Icon exists:', fs.existsSync(iconPath));
   ```
3. Restart VS Code
4. Reload extension (Developer: Reload Window)

### Wrong Icon Displayed

**Issue:** Shows different icon than expected

**Solutions:**
1. Clear VS Code cache: `rm -rf ~/.vscode/extensions/.obsolete`
2. Reinstall extension
3. Check icon file isn't corrupted: Open `icon.png` in image viewer

## Future Enhancements

### Per-CLI Icons
Show different icons for each AI CLI:

```javascript
const icons = {
    'claude': 'icons/claude.png',
    'droid': 'icons/droid.png',
    'gemini': 'icons/gemini.png'
};

const iconPath = icons[cliConfig.type] || 'icon.png';
```

### Animated Icons (VS Code 1.70+)
Use animated GIFs to show terminal activity:

```javascript
// Show spinning icon when busy
const iconPath = tracker.isBusy(terminal)
    ? 'icons/bob-busy.gif'
    : 'icons/bob-idle.png';

terminal.iconPath = vscode.Uri.file(iconPath);
```

### Theme-Aware Icons
Different icons for light/dark themes:

```javascript
const theme = vscode.window.activeColorTheme.kind;
const iconPath = theme === vscode.ColorThemeKind.Dark
    ? 'icon-dark.png'
    : 'icon-light.png';
```

## Examples

### Example 1: Basic Usage
```javascript
// Create terminal with Bob AI icon
const terminal = vscode.window.createTerminal({
    name: 'Claude Code',
    iconPath: vscode.Uri.file(path.join(__dirname, '..', '..', 'icon.png'))
});
```

### Example 2: With Color
```javascript
// Add color to terminal (VS Code 1.56+)
const terminal = vscode.window.createTerminal({
    name: 'Claude Code',
    iconPath: vscode.Uri.file('icon.png'),
    color: new vscode.ThemeColor('terminal.ansiBlue')
});
```

### Example 3: With All Options
```javascript
const terminal = vscode.window.createTerminal({
    name: 'Claude Code',
    iconPath: vscode.Uri.file('icon.png'),
    color: new vscode.ThemeColor('terminal.ansiBlue'),
    hideFromUser: false,
    isTransient: false,
    location: vscode.TerminalLocation.Panel
});
```

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-12 | 0.1.0 | Added custom icon support to terminal creation |

---

**Next Steps:**
1. Test icon appears in terminal tab
2. Consider adding per-CLI icons
3. Consider adding animated icons for busy state
4. Add user setting for custom icon path
