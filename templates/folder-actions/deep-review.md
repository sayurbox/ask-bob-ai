---
label: 🔬 Deep Code Review
kind: review
enabled: true
---
Perform expert code review on {{path}}

Review against CLAUDE.md project guidelines for: imports, conventions, error handling, testing, naming.

Identify bugs: logic errors, null handling, race conditions, security issues, performance problems.

Assess quality: duplication, missing error handling, test coverage.

CONFIDENCE SCORING (report only ≥80):
- 80-89: High confidence - verified real issue, impacts functionality or violates explicit guidelines
- 90-100: Certain - confirmed critical issue, happens frequently

OUTPUT FORMAT:
1. State review scope
2. Group by severity (Critical/Important)
3. Per issue: confidence score, file:line, guideline reference/bug explanation, concrete fix

If no ≥80 issues found, confirm code meets standards.