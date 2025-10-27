# Skill Templates (Optional)

This directory contains optional prompt templates for Claude Code users who prefer slash commands.

## How Bob AI CLI Works

**Bob AI CLI uses inline prompts** - when you trigger a command, the full prompt is sent directly to your AI CLI terminal. This approach:

- ✅ Works with all AI CLIs (Claude Code, Gemini CLI, and others)
- ✅ Requires no setup or configuration
- ✅ Updates automatically with the extension
- ✅ No terminal restarts needed

## What Are These Templates For?

These are optional skill files that Claude Code users can manually install to use shorter slash commands instead of inline prompts.

**Example:**
- With inline: Full prompt sent automatically via Bob AI CLI command
- With skill: Type `/deep-review src/` manually in terminal

## When to Use These Templates

Consider using these if you:
- Prefer typing custom slash commands manually
- Want to modify prompts for your workflow
- Use Claude Code exclusively (skills don't work with other AI CLIs)

## Installation (Claude Code Only)

```bash
# Copy skill to your workspace
cp templates/skills/deep-review.md .claude/skills/

# Restart Claude Code terminal

# Use the slash command
/deep-review src/
```

## Available Templates

- **deep-review.md** - Expert code review with confidence-based filtering

## Contributing

When adding new functionality:
1. Implement command with inline prompt in `src/commands/`
2. Optionally create matching skill template here for Claude Code users
3. Update this README
