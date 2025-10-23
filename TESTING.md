# Testing Copy Susu Extension

Since F5 debug mode isn't working on your Mac, here are several alternative ways to test the extension:

## Method 1: Install Extension from Folder

1. **Enable Extension Development**:
   - Open VS Code
   - Press `Cmd+Shift+P` to open Command Palette
   - Type "Developer: Reload Window" and press Enter
   - Close and reopen VS Code

2. **Install Extension**:
   - Press `Cmd+Shift+P` again
   - Type "Extensions: Install Extensions in Development Mode..." (if available)
   - Navigate to this folder: `/Users/andri/Data/Data-Project/personal2/copy-susu/copy-susu-extension`

## Method 2: Manual Installation (Recommended)

1. **Create VSIX Package** (when network is available):
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

2. **Install VSIX**:
   - Press `Cmd+Shift+X` to open Extensions
   - Click the `...` menu in the Extensions panel
   - Select "Install from VSIX..."
   - Choose the generated `.vsix` file

## Method 3: Test Using Command Palette

1. **Open Command Palette**:
   - Press `Cmd+Shift+P`
   - Type "Copy Susu: Copy Code Block Reference"
   - This should appear when you have text selected

## Method 4: Manual Testing Steps

1. **Open VS Code**
2. **Open any file** (use the `test.js` file I created)
3. **Select some text** (multiple lines work best)
4. **Right-click** on the selected text
5. **Look for "Copy this codes block"** in the context menu
6. **Click it** - the formatted reference should be copied to clipboard
7. **Paste anywhere** to verify the format

## Expected Output Format

When you select lines 1-3 in `src/main/java/com/example/Service.java`, you should get:
```
@src/main/java/com/example/Service.java#L1-3
```

When you select only line 10, you should get:
```
@src/main/java/com/example/Service.java#L10
```

## Troubleshooting

If the extension doesn't appear:

1. **Check VS Code version**: Make sure you have VS Code 1.74.0 or later
2. **Restart VS Code**: Sometimes a restart is needed
3. **Check Developer Console**:
   - Press `Cmd+Option+I` to open Developer Tools
   - Look for any error messages related to the extension
4. **Verify Extension Loaded**:
   - Press `Cmd+Shift+P`
   - Type "Developer: Show Running Extensions"
   - Look for "Copy Susu" in the list

## Files Overview

- `src/extension.js` - Main extension logic
- `package.json` - Extension configuration and commands
- `test.js` - Sample file for testing

The extension should work with any file type and will automatically detect the workspace root to create relative paths.