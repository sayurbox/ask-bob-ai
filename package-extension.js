const fs = require('fs');
const path = require('path');

// Create a simple vsix package for testing
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('Copy Susu Extension Package Summary:');
console.log('=====================================');
console.log('Name:', packageJson.displayName);
console.log('Version:', packageJson.version);
console.log('Description:', packageJson.description);
console.log('');
console.log('Files in this extension:');
console.log('- src/extension.js (main extension code)');
console.log('- package.json (extension manifest)');
console.log('');
console.log('To install this extension:');
console.log('1. In VS Code, go to Extensions (Cmd+Shift+X)');
console.log('2. Click the ... menu and select "Install from VSIX..."');
console.log('3. Or use Command Palette: "Extensions: Install from VSIX..."');
console.log('');
console.log('To test the extension:');
console.log('1. Install the extension');
console.log('2. Open any file');
console.log('3. Select some text');
console.log('4. Right-click and choose "Copy this codes block"');
console.log('5. Paste to see the formatted reference');