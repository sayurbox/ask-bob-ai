const vscode = require('vscode');
const path = require('path');

/**
 * Show image preview with send button
 * @param {vscode.ExtensionContext} context - Extension context
 * @param {string} imagePath - Path to image file
 * @param {Object} metadata - Image metadata (size, dimensions)
 * @returns {Promise<boolean>} True if user clicked send, false if cancelled
 */
async function showImagePreview(context, imagePath, metadata) {
    return new Promise((resolve) => {
        // Track if promise already resolved to prevent race conditions
        let resolved = false;

        // Create webview panel for image preview
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

        // Convert file path to webview-compatible URI
        const imageUri = panel.webview.asWebviewUri(vscode.Uri.file(imagePath));

        // Set HTML content with image preview and buttons
        panel.webview.html = getWebviewContent(imageUri, metadata);

        // Handle button clicks from webview (Send/Cancel)
        panel.webview.onDidReceiveMessage(
            message => {
                // Prevent duplicate handling if already resolved
                if (resolved) {
                    return;
                }

                switch (message.command) {
                    case 'send':
                        // User confirmed - resolve with true to send to terminal
                        resolved = true;
                        resolve(true);
                        panel.dispose();
                        return;
                    case 'cancel':
                        // User cancelled - resolve with false
                        resolved = true;
                        resolve(false);
                        panel.dispose();
                        return;
                }
            },
            undefined,
            context.subscriptions
        );

        // Handle panel close via X button (treat as cancel)
        panel.onDidDispose(() => {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
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
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            line-height: 1.5;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .preview-section {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 20px;
        }

        h2 {
            margin: 0 0 8px 0;
            color: var(--vscode-editor-foreground);
            font-size: 18px;
            font-weight: 600;
        }

        .info-text {
            color: var(--vscode-descriptionForeground);
            font-size: 13px;
            margin-bottom: 20px;
        }

        .image-container {
            text-align: center;
            margin: 20px 0;
            background-color: var(--vscode-editor-background);
            border-radius: 6px;
            padding: 20px;
        }

        img {
            max-width: 100%;
            max-height: 500px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .metadata {
            display: flex;
            gap: 24px;
            margin: 20px 0 0 0;
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            flex-wrap: wrap;
        }

        .metadata-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .metadata-icon {
            font-size: 16px;
        }

        .button-group {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 24px;
        }

        button {
            padding: 10px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            font-family: var(--vscode-font-family);
        }

        button:hover {
            transform: translateY(-1px);
        }

        button:active {
            transform: translateY(0);
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

        .keyboard-hint {
            text-align: center;
            margin-top: 16px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .keyboard-shortcut {
            display: inline-block;
            padding: 2px 6px;
            background-color: var(--vscode-keybindingLabel-background);
            color: var(--vscode-keybindingLabel-foreground);
            border: 1px solid var(--vscode-keybindingLabel-border);
            border-radius: 3px;
            font-family: monospace;
            font-size: 11px;
            margin: 0 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="preview-section">
            <h2>📋 Image from Clipboard</h2>
            <p class="info-text">Preview your image before sending to Claude Code</p>

            <div class="image-container">
                <img src="${imageUri}" alt="Preview" id="preview-image" />
            </div>

            <div class="metadata">
                <div class="metadata-item">
                    <span class="metadata-icon">📏</span>
                    <span>Size: ${metadata.size}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-icon">📁</span>
                    <span>${metadata.filename}</span>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button class="btn-primary" onclick="sendToTerminal()" id="send-btn">
                📤 Send to Terminal
            </button>
            <button class="btn-secondary" onclick="cancel()" id="cancel-btn">
                ❌ Cancel
            </button>
        </div>

        <div class="keyboard-hint">
            Press <span class="keyboard-shortcut">⌘/Ctrl + Enter</span> to send or <span class="keyboard-shortcut">Esc</span> to cancel
        </div>
    </div>

    <script>
        // Get VS Code API for messaging
        const vscode = acquireVsCodeApi();

        // Send button clicked - post 'send' message to extension
        function sendToTerminal() {
            vscode.postMessage({ command: 'send' });
        }

        // Cancel button clicked - post 'cancel' message to extension
        function cancel() {
            vscode.postMessage({ command: 'cancel' });
        }

        // Keyboard shortcuts for better UX
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl+Enter: Send to terminal
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sendToTerminal();
            }
            // Escape: Cancel and close preview
            else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
            }
        });

        // Auto-focus send button when preview loads
        window.addEventListener('load', () => {
            document.getElementById('send-btn').focus();
        });
    </script>
</body>
</html>`;
}

module.exports = {
    showImagePreview
};
