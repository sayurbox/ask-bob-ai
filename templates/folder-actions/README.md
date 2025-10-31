# Folder Action Templates

This directory contains default prompt templates for folder/file operations in Bob AI CLI.

## Template Format

Templates use Markdown with YAML frontmatter:

```markdown
---
label: 📖 Explain This
kind: info
enabled: true
---
Explain the purpose and structure of this {{type}}: {{path}}
```

## Available Variables

- `{{type}}` - "module" (for folders) or "file" (for files)
- `{{path}}` - Relative path to the file/folder
- Folders automatically get a trailing `/` in the path

## Template Fields

- **label** (required): Display name shown in quick pick menu (can include emojis)
- **kind** (optional): Template category - `info`, `review`, or `refactor` (default: `info`)
- **enabled** (optional): Show in menu? `true` or `false` (default: `true`)

## Customization

To customize these templates:

1. Copy templates to `.askbob/folder-actions/` in your workspace
2. Edit the copied files (they will override defaults)
3. Changes are automatically detected and reloaded

Example:
```bash
mkdir -p .askbob/folder-actions/
cp templates/folder-actions/explain.md .askbob/folder-actions/
# Edit .askbob/folder-actions/explain.md
```

## Creating New Templates

1. Create a new `.md` file in `.askbob/folder-actions/`
2. Use the frontmatter format above
3. Add your custom prompt with variables
4. Template will appear in the Quick Actions menu

Example custom template (`.askbob/folder-actions/security-audit.md`):
```markdown
---
label: 🔒 Security Audit
kind: review
enabled: true
---
Perform a comprehensive security audit on {{path}}

Check for:
- Input validation issues
- Authentication/authorization flaws
- SQL injection vulnerabilities
- XSS vulnerabilities
- Sensitive data exposure
- CSRF protection
```

## Default Templates

- **explain.md** - Explain purpose and structure
- **review.md** - Review code quality
- **deep-review.md** - Deep code review with confidence scoring
- **find-bugs.md** - Find potential bugs
- **generate-tests.md** - Generate test files
- **add-docs.md** - Add documentation
- **refactor.md** - Suggest refactoring
- **show-structure.md** - Show file/folder structure

## Notes

- Templates in `.askbob/folder-actions/` override templates with the same filename
- README.md files are ignored
- Invalid templates are skipped (check console for errors)
- File watcher automatically reloads templates on changes
