# Git Workflow & Version Control Guardrails

## Core Invariant
- **NEVER** run `git add`, `git commit`, or `git push` autonomously.
- Staging, committing, and pushing must always be explicitly performed or requested by the developer.
- You may use read-only diagnostic commands like `git status`, `git diff`, and `git log` to inspect code state when relevant.
