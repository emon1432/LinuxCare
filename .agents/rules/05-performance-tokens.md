# ECC Performance & Surgical Editing Discipline

## 1. Large File Handling (>200 Lines)
- **NEVER** inspect or rewrite an entire file exceeding 200 lines to modify a single function.
- Always use line-range viewing (`StartLine` / `EndLine`) or targeted searches to inspect only the required context.
- Use surgical diffs/replacements for editing. Never dump or rewrite unchanged portions of a file.

## 2. Zero Silent Failures
- Never write empty catch blocks (`catch (e) {}` with no logging or recovery).
- Log errors meaningfully with contextual metadata.

## 3. Production Cleanliness
- Never leave behind debugging statements (`console.log`, `debugger`).
- Remove dead or commented-out code.

## 4. Verification Before Declaring Done
- Always verify that `npm run build` succeeds before declaring any task complete.
- Verify API endpoints respond cleanly without runtime exceptions.
