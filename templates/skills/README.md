# Claude Code Skills (Optional)

This directory contains optional skill templates that can be manually installed for Claude Code users.

## About Skills

Skills are reusable prompts that Claude Code can invoke with slash commands (e.g., `/deep-review`).

## Why Are These Optional?

Bob AI CLI extension uses **inline prompts by default** for these reasons:
- ✅ Works with all AI CLIs (Claude Code, Gemini CLI, etc.)
- ✅ No restart required
- ✅ Always up-to-date with extension
- ✅ Simpler for users

## When to Use Skills

Use the skill files if you prefer:
- Shorter terminal commands (`/deep-review` vs full prompt)
- Manual invocation outside the extension
- Custom modifications to the prompts

## Available Skills

### deep-review.md
Expert code review with confidence-based filtering (≥80 threshold)

**Manual Installation:**
```bash
# Copy to your workspace
cp templates/skills/deep-review.md .claude/skills/

# Restart Claude Code terminal

# Use the skill
/deep-review src/
```

## Contributing

When adding new prompts to Bob AI CLI:
1. Add command with inline prompt in `src/commands/`
2. Optionally create matching skill template here
3. Update this README
