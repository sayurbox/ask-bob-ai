// AI CLI Configuration
const AI_CLIS = [
    {
        name: 'Claude Code',
        command: 'claude',
        checkCommand: 'which claude',
        icon: '🤖',
        terminalName: 'Claude Code'
    },
    {
        name: 'Gemini CLI',
        command: 'gemini-cli',
        checkCommand: 'which gemini-cli',
        icon: '✨',
        terminalName: 'Gemini CLI',
        fallbackCommands: ['gemini']
    },
    {
        name: 'ChatGPT CLI',
        command: 'chatgpt',
        checkCommand: 'which chatgpt',
        icon: '💬',
        terminalName: 'ChatGPT'
    },
    {
        name: 'Aider',
        command: 'aider',
        checkCommand: 'which aider',
        icon: '🔧',
        terminalName: 'Aider'
    }
];

// Quick action templates
const QUICK_ACTIONS = [
    { label: '🔍 Explain this code', prompt: 'Explain this code', kind: 'quickfix' },
    { label: '🐛 Find and fix bugs', prompt: 'Find and fix bugs in this code', kind: 'quickfix' },
    { label: '♻️ Refactor this code', prompt: 'Refactor this code for better readability and maintainability', kind: 'refactor' },
    { label: '✅ Write unit tests', prompt: 'Write unit tests for this code', kind: 'quickfix' },
    { label: '📝 Add documentation', prompt: 'Add detailed comments and documentation to this code', kind: 'quickfix' },
    { label: '⚡ Optimize performance', prompt: 'Optimize this code for better performance', kind: 'refactor' },
    { label: '🔒 Security review', prompt: 'Review this code for security vulnerabilities', kind: 'quickfix' },
    { label: '🎯 Simplify logic', prompt: 'Simplify this code logic', kind: 'refactor' },
    { label: '─────────────────────', prompt: null }, // Separator
    { label: '✏️ Custom prompt...', prompt: 'CUSTOM', kind: 'quickfix' }
];

module.exports = {
    AI_CLIS,
    QUICK_ACTIONS
};
